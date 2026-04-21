import axios        from 'axios';
import * as igdb    from './igdb.service.js';
import Game         from '../models/Game.model.js';
import UserGame     from '../models/UserGame.model.js';
import User         from '../models/User.model.js';
import { cacheGet, cacheSet } from '../config/redis.js';
import ApiError     from '../utils/ApiError.js';
import logger       from '../utils/logger.js';

const STEAM_API = 'https://api.steampowered.com';
const KEY       = () => process.env.STEAM_API_KEY;

// ── Resolve vanity URL → steamId64 ────────────────────────────────────────
export const resolveSteamId = async (input) => {
  // Already a 64-bit ID
  if (/^\d{17}$/.test(input.trim())) return input.trim();

  // Extract from profile URL
  const vanity = input.includes('steamcommunity.com/id/')
    ? input.split('/id/')[1].replace(/\/$/, '')
    : input.trim();

  const CK = `steam:vanity:${vanity}`;
  const cached = await cacheGet(CK);
  if (cached) return cached;

  const { data } = await axios.get(`${STEAM_API}/ISteamUser/ResolveVanityURL/v1/`, {
    params: { key: KEY(), vanityurl: vanity },
  });

  if (data.response.success !== 1) {
    throw new ApiError(404, `Steam profile "${vanity}" not found`);
  }

  await cacheSet(CK, data.response.steamid, 60 * 60 * 24);
  return data.response.steamid;
};

// ── Fetch owned games ──────────────────────────────────────────────────────
export const getOwnedGames = async (steamId) => {
  const CK = `steam:owned:${steamId}`;
  const cached = await cacheGet(CK);
  if (cached) { logger.debug(`Cache HIT: ${CK}`); return cached; }

  const { data } = await axios.get(
    `${STEAM_API}/IPlayerService/GetOwnedGames/v1/`, {
      params: {
        key:                    KEY(),
        steamid:                steamId,
        include_appinfo:        true,
        include_played_free_games: true,
      },
    }
  );

  const games = data.response?.games ?? [];
  await cacheSet(CK, games, 60 * 30); // 30 min TTL
  return games;
};

// ── Fetch Steam player summary ─────────────────────────────────────────────
export const getPlayerSummary = async (steamId) => {
  const CK = `steam:profile:${steamId}`;
  const cached = await cacheGet(CK);
  if (cached) return cached;

  const { data } = await axios.get(
    `${STEAM_API}/ISteamUser/GetPlayerSummaries/v2/`, {
      params: { key: KEY(), steamids: steamId },
    }
  );

  const profile = data.response?.players?.[0] ?? null;
  if (profile) await cacheSet(CK, profile, 60 * 60);
  return profile;
};

// ── Core sync engine ───────────────────────────────────────────────────────
export const syncSteamLibrary = async (userId, rawInput) => {
  // 1. Resolve Steam ID
  const steamId = await resolveSteamId(rawInput);

  // 2. Fetch owned games + profile in parallel
  const [steamGames, profile] = await Promise.all([
    getOwnedGames(steamId),
    getPlayerSummary(steamId),
  ]);

  if (!steamGames.length) {
    throw new ApiError(400, 'Steam library is empty or private');
  }

  logger.info(`Steam sync: ${steamGames.length} games for ${steamId}`);

  // 3. Match Steam → IGDB in batches
  const matched  = await matchSteamToIgdb(steamGames);

  // 4. Upsert into DB
  const { synced, skipped } = await upsertUserGames(userId, matched);

  // 5. Update user steam metadata
  await User.findByIdAndUpdate(userId, {
    'steam.steamId':    steamId,
    'steam.profileUrl': profile?.profileurl ?? null,
    'steam.lastSync':   new Date(),
    'steam.gameCount':  steamGames.length,
  });

  return {
    steamId,
    total:   steamGames.length,
    matched: matched.length,
    synced,
    skipped,
    profile: profile
      ? { name: profile.personaname, avatar: profile.avatarmedium }
      : null,
  };
};

// ── Match Steam games → IGDB (with caching per appId) ─────────────────────
const matchSteamToIgdb = async (steamGames) => {
  const BATCH  = 5;          // concurrent IGDB requests
  const results = [];

  const chunks = chunk(steamGames, BATCH);

  for (const batch of chunks) {
    const resolved = await Promise.allSettled(
      batch.map((sg) => matchOne(sg))
    );

    for (const r of resolved) {
      if (r.status === 'fulfilled' && r.value) results.push(r.value);
    }

    // Respectful delay between batches
    await sleep(200);
  }

  return results;
};

const matchOne = async (steamGame) => {
  const CK = `steam:match:${steamGame.appid}`;
  const cached = await cacheGet(CK);
  if (cached) return { ...cached, steamGame };

  try {
    const results = await igdb.searchByName(steamGame.name);
    if (!results.length) return null;

    // Pick closest name match
    const match = pickBestMatch(steamGame.name, results);
    if (!match) return null;

    await cacheSet(CK, match, 60 * 60 * 24 * 7); // 7d
    return { ...match, steamGame };
  } catch (err) {
    logger.warn(`IGDB match failed for "${steamGame.name}": ${err.message}`);
    return null;
  }
};

const pickBestMatch = (steamName, igdbResults) => {
  const norm = (s) => s.toLowerCase().replace(/[^a-z0-9]/g, '');
  const target = norm(steamName);

  // Exact match first
  const exact = igdbResults.find((g) => norm(g.name) === target);
  if (exact) return exact;

  // Substring match
  const sub = igdbResults.find(
    (g) => norm(g.name).includes(target) || target.includes(norm(g.name))
  );
  return sub ?? igdbResults[0];
};

// ── Upsert UserGame entries ────────────────────────────────────────────────
const upsertUserGames = async (userId, matched) => {
  let synced = 0, skipped = 0;

  for (const item of matched) {
    try {
      // Ensure game exists in local DB
      const dbGame = await Game.findOrCreateFromIgdb(item);

      const playtimeMins = item.steamGame.playtime_forever ?? 0;

      await UserGame.findOneAndUpdate(
        { userId, gameId: dbGame._id },
        {
          $setOnInsert: {
            userId,
            gameId:  dbGame._id,
            igdbId:  item.igdbId,
            status:  playtimeMins > 0 ? 'playing' : 'backlog',
            fromSteam: true,
          },
          $set: {
            'steam.appId':           item.steamGame.appid,
            'steam.playtimeForever': playtimeMins,
            'steam.lastPlayedSteam': item.steamGame.rtime_last_played
              ? new Date(item.steamGame.rtime_last_played * 1000)
              : null,
            playtimeHours: Math.round((playtimeMins / 60) * 10) / 10,
          },
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );

      synced++;
    } catch (err) {
      logger.warn(`Upsert failed for igdbId ${item.igdbId}: ${err.message}`);
      skipped++;
    }
  }

  return { synced, skipped };
};

// ── Utilities ──────────────────────────────────────────────────────────────
const chunk = (arr, n) =>
  Array.from({ length: Math.ceil(arr.length / n) }, (_, i) =>
    arr.slice(i * n, i * n + n)
  );

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));