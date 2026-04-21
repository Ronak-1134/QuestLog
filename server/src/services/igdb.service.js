import { igdbClient } from '../config/igdb.js';
import { cacheGet, cacheSet } from '../config/redis.js';
import ApiError from '../utils/ApiError.js';
import logger from '../utils/logger.js';

// ── Field Sets ──────────────────────────────────────────────────────────────
const GAME_FIELDS_SUMMARY = `
  fields id, name, slug, cover.image_id, first_release_date,
         genres.name, platforms.name, total_rating, total_rating_count;
`.trim();

const GAME_FIELDS_FULL = `
  fields id, name, slug, summary, storyline,
         cover.image_id,
         screenshots.image_id,
         artworks.image_id,
         videos.video_id, videos.name,
         genres.name,
         platforms.name, platforms.abbreviation,
         involved_companies.company.name, involved_companies.developer,
         first_release_date, status,
         total_rating, total_rating_count,
         aggregated_rating, aggregated_rating_count,
         game_modes.name,
         themes.name,
         similar_games.id, similar_games.name, similar_games.cover.image_id;
`.trim();

// ── Image URL Builder ───────────────────────────────────────────────────────
export const igdbImageUrl = (imageId, size = 'cover_big') =>
  `https://images.igdb.com/igdb/image/upload/t_${size}/${imageId}.jpg`;

// ── Cache Key Factory ───────────────────────────────────────────────────────
const CK = {
  search:    (q)  => `igdb:search:${q.toLowerCase().trim()}`,
  game:      (id) => `igdb:game:${id}`,
  trending:  ()   => 'igdb:trending',
  bySlug:    (s)  => `igdb:slug:${s}`,
  similar:   (id) => `igdb:similar:${id}`,
};

// ── TTLs (seconds) ──────────────────────────────────────────────────────────
const TTL = {
  search:  60 * 60,        // 1 hr
  game:    60 * 60 * 24,   // 24 hrs
  trending:60 * 30,        // 30 min
  similar: 60 * 60 * 12,   // 12 hrs
};

// ─────────────────────────────────────────────────────────────────────────────
// searchGames
// ─────────────────────────────────────────────────────────────────────────────
export const searchGames = async (query, limit = 12) => {
  if (!query?.trim()) return [];

  const cacheKey = CK.search(query);
  const cached = await cacheGet(cacheKey);
  if (cached) { logger.debug(`Cache HIT: ${cacheKey}`); return cached; }

  const body = `
    ${GAME_FIELDS_SUMMARY}
    search "${query.trim()}";
    where version_parent = null & category = 0;
    limit ${limit};
  `;

  const raw = await igdbClient('games', body);
  const games = raw.map(normalizeGameSummary);

  await cacheSet(cacheKey, games, TTL.search);
  return games;
};

// ─────────────────────────────────────────────────────────────────────────────
// getGameById
// ─────────────────────────────────────────────────────────────────────────────
export const getGameById = async (igdbId) => {
  const cacheKey = CK.game(igdbId);
  const cached = await cacheGet(cacheKey);
  if (cached) { logger.debug(`Cache HIT: ${cacheKey}`); return cached; }

  const body = `
    ${GAME_FIELDS_FULL}
    where id = ${igdbId};
    limit 1;
  `;

  const raw = await igdbClient('games', body);
  if (!raw.length) throw new ApiError(404, `Game with IGDB id ${igdbId} not found`);

  const game = normalizeGameFull(raw[0]);
  await cacheSet(cacheKey, game, TTL.game);
  return game;
};

// ─────────────────────────────────────────────────────────────────────────────
// getGameBySlug
// ─────────────────────────────────────────────────────────────────────────────
export const getGameBySlug = async (slug) => {
  const cacheKey = CK.bySlug(slug);
  const cached = await cacheGet(cacheKey);
  if (cached) { logger.debug(`Cache HIT: ${cacheKey}`); return cached; }

  const body = `
    ${GAME_FIELDS_FULL}
    where slug = "${slug}";
    limit 1;
  `;

  const raw = await igdbClient('games', body);
  if (!raw.length) throw new ApiError(404, `Game "${slug}" not found`);

  const game = normalizeGameFull(raw[0]);
  await cacheSet(cacheKey, game, TTL.game);
  return game;
};

// ─────────────────────────────────────────────────────────────────────────────
// getTrendingGames
// ─────────────────────────────────────────────────────────────────────────────
export const getTrendingGames = async (limit = 20) => {
  const cacheKey = CK.trending();
  const cached = await cacheGet(cacheKey);
  if (cached) { logger.debug(`Cache HIT: ${cacheKey}`); return cached; }

  const ninetyDaysAgo = Math.floor(Date.now() / 1000) - 90 * 24 * 60 * 60;

  const body = `
    ${GAME_FIELDS_SUMMARY}
    where first_release_date > ${ninetyDaysAgo}
      & total_rating_count > 5
      & version_parent = null
      & category = 0;
    sort total_rating_count desc;
    limit ${limit};
  `;

  const raw = await igdbClient('games', body);
  const games = raw.map(normalizeGameSummary);

  await cacheSet(cacheKey, games, TTL.trending);
  return games;
};

// ─────────────────────────────────────────────────────────────────────────────
// getSimilarGames
// ─────────────────────────────────────────────────────────────────────────────
export const getSimilarGames = async (igdbId) => {
  const cacheKey = CK.similar(igdbId);
  const cached = await cacheGet(cacheKey);
  if (cached) { logger.debug(`Cache HIT: ${cacheKey}`); return cached; }

  const body = `
    fields id, name, slug, cover.image_id, first_release_date,
           genres.name, total_rating;
    where similar_games = (${igdbId}) & version_parent = null;
    limit 6;
  `;

  const raw = await igdbClient('games', body);
  const games = raw.map(normalizeGameSummary);

  await cacheSet(cacheKey, games, TTL.similar);
  return games;
};

// ─────────────────────────────────────────────────────────────────────────────
// getGamesByIds  — used for Steam library matching
// ─────────────────────────────────────────────────────────────────────────────
export const getGamesByIds = async (ids = []) => {
  if (!ids.length) return [];

  // Split into batches of 10 (IGDB rate-friendly)
  const batches = chunk(ids, 10);
  const results = [];

  for (const batch of batches) {
    const body = `
      ${GAME_FIELDS_SUMMARY}
      where id = (${batch.join(',')});
      limit ${batch.length};
    `;
    const raw = await igdbClient('games', body);
    results.push(...raw.map(normalizeGameSummary));
  }

  return results;
};

// ─────────────────────────────────────────────────────────────────────────────
// searchByName — fuzzy name match for Steam sync
// ─────────────────────────────────────────────────────────────────────────────
export const searchByName = async (name) => {
  const body = `
    fields id, name, slug, cover.image_id, first_release_date, platforms.name;
    search "${name.replace(/"/g, '')}";
    where version_parent = null & category = 0;
    limit 3;
  `;

  const raw = await igdbClient('games', body);
  return raw.map(normalizeGameSummary);
};

// ─────────────────────────────────────────────────────────────────────────────
// Normalizers — enforce consistent shape throughout the app
// ─────────────────────────────────────────────────────────────────────────────
const normalizeGameSummary = (g) => ({
  igdbId:      g.id,
  name:        g.name,
  slug:        g.slug,
  cover:       g.cover?.image_id
                 ? igdbImageUrl(g.cover.image_id, 'cover_big')
                 : null,
  coverThumb:  g.cover?.image_id
                 ? igdbImageUrl(g.cover.image_id, 'thumb')
                 : null,
  releaseYear: g.first_release_date
                 ? new Date(g.first_release_date * 1000).getFullYear()
                 : null,
  genres:      g.genres?.map((x) => x.name) ?? [],
  platforms:   g.platforms?.map((x) => x.name) ?? [],
  rating:      g.total_rating ? Math.round(g.total_rating) : null,
  ratingCount: g.total_rating_count ?? 0,
});

const normalizeGameFull = (g) => ({
  ...normalizeGameSummary(g),
  summary:    g.summary ?? null,
  storyline:  g.storyline ?? null,
  status:     g.status ?? null,
  screenshots: (g.screenshots ?? []).map((s) =>
    igdbImageUrl(s.image_id, 'screenshot_big')
  ),
  artworks: (g.artworks ?? []).map((a) =>
    igdbImageUrl(a.image_id, '1080p')
  ),
  videos: (g.videos ?? []).map((v) => ({
    name:  v.name,
    ytUrl: `https://www.youtube.com/watch?v=${v.video_id}`,
  })),
  developers: (g.involved_companies ?? [])
    .filter((c) => c.developer)
    .map((c) => c.company?.name)
    .filter(Boolean),
  gameModes:  (g.game_modes  ?? []).map((m) => m.name),
  themes:     (g.themes      ?? []).map((t) => t.name),
  aggregatedRating:      g.aggregated_rating      ?? null,
  aggregatedRatingCount: g.aggregated_rating_count ?? 0,
  similarGames: (g.similar_games ?? []).map(normalizeGameSummary),
});

// ─────────────────────────────────────────────────────────────────────────────
// Utility
// ─────────────────────────────────────────────────────────────────────────────
const chunk = (arr, size) =>
  Array.from({ length: Math.ceil(arr.length / size) }, (_, i) =>
    arr.slice(i * size, i * size + size)
  );