import * as igdbService from '../services/igdb.service.js';
import catchAsync       from '../utils/catchAsync.js';
import ApiError         from '../utils/ApiError.js';

const ok  = (res, data, code = 200) => res.status(code).json({ status: 'success', data });

// ── In-memory playtime store (works without full DB setup) ─────────
// Key: igdbId, Value: array of entries
const playtimeStore = new Map();

export const searchGames = catchAsync(async (req, res) => {
  const { q, limit } = req.query;
  if (!q?.trim()) throw new ApiError(400, '"q" is required');
  console.log(`Searching IGDB for: "${q}"`);
  const games = await igdbService.searchGames(q, Number(limit) || 12);
  console.log(`Found ${games.length} games`);
  ok(res, games);
});

export const getTrending = catchAsync(async (req, res) => {
  const games = await igdbService.getTrendingGames(Number(req.query.limit) || 20);
  ok(res, games);
});

export const getGameBySlug = catchAsync(async (req, res) => {
  const game = await igdbService.getGameBySlug(req.params.slug);
  // Attach playtime stats
  const entries = playtimeStore.get(String(game.igdbId)) ?? [];
  game.playtimeStats = computeStats(entries);
  ok(res, game);
});

export const getGame = catchAsync(async (req, res) => {
  const game = await igdbService.getGameById(Number(req.params.id));
  const entries = playtimeStore.get(String(game.igdbId)) ?? [];
  game.playtimeStats = computeStats(entries);
  ok(res, game);
});

export const getSimilarGames = catchAsync(async (req, res) => {
  const games = await igdbService.getSimilarGames(Number(req.params.id));
  ok(res, games);
});

export const getGameStats = catchAsync(async (req, res) => {
  const entries = playtimeStore.get(String(req.params.id)) ?? [];
  ok(res, computeStats(entries));
});

export const submitPlaytime = catchAsync(async (req, res) => {
  const igdbId = String(req.params.id);
  const { mainStory, sideContent, completionist, platform } = req.body;

  if (!mainStory && !sideContent && !completionist) {
    throw new ApiError(400, 'Submit at least one time value');
  }

  const entry = {
    id:            Date.now(),
    igdbId,
    mainStory:     mainStory     ? Number(mainStory)     : null,
    sideContent:   sideContent   ? Number(sideContent)   : null,
    completionist: completionist ? Number(completionist) : null,
    platform:      platform ?? null,
    createdAt:     new Date().toISOString(),
  };

  const existing = playtimeStore.get(igdbId) ?? [];
  playtimeStore.set(igdbId, [...existing, entry]);

  console.log(`✅ Playtime submitted for game ${igdbId}:`, entry);

  ok(res, {
    entry,
    stats: computeStats(playtimeStore.get(igdbId)),
  }, 201);
});

// ── Compute stats from array of entries ───────────────────────────
const computeStats = (entries) => {
  const calc = (key) => {
    const vals = entries
      .map((e) => e[key])
      .filter((v) => v != null && v > 0);

    if (!vals.length) {
      return { mean: null, median: null, min: null, max: null, count: 0 };
    }

    const sorted = [...vals].sort((a, b) => a - b);
    const sum    = vals.reduce((s, v) => s + v, 0);
    const mid    = Math.floor(sorted.length / 2);
    const median = sorted.length % 2
      ? sorted[mid]
      : (sorted[mid - 1] + sorted[mid]) / 2;

    return {
      mean:   Math.round((sum / vals.length) * 10) / 10,
      median: Math.round(median * 10) / 10,
      min:    sorted[0],
      max:    sorted[sorted.length - 1],
      count:  vals.length,
    };
  };

  return {
    mainStory:     calc('mainStory'),
    sideContent:   calc('sideContent'),
    completionist: calc('completionist'),
  };
};