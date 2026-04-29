import { igdbClient } from '../config/igdb.js';

// ── Image URL builder ──────────────────────────────────────────────
export const igdbImageUrl = (imageId, size = 'cover_big') =>
  `https://images.igdb.com/igdb/image/upload/t_${size}/${imageId}.jpg`;

// ── Search games ───────────────────────────────────────────────────
export const searchGames = async (query, limit = 12) => {
  if (!query?.trim()) return [];

  const body = `
    fields id, name, slug, cover.image_id, first_release_date,
           genres.name, platforms.name, total_rating, total_rating_count;
    search "${query.trim()}";
    limit ${limit};
  `;

  const raw = await igdbClient('games', body);
  console.log('Raw IGDB results:', raw.length, raw.map(g => g.name));
  return raw.map(normalizeGame);
};

// ── Get by ID ──────────────────────────────────────────────────────
export const getGameById = async (igdbId) => {
  const body = `
    fields id, name, slug, summary, cover.image_id,
           screenshots.image_id, artworks.image_id,
           genres.name, platforms.name, platforms.abbreviation,
           involved_companies.company.name, involved_companies.developer,
           first_release_date, total_rating, total_rating_count,
           game_modes.name, themes.name,
           similar_games.id, similar_games.name, similar_games.cover.image_id;
    where id = ${igdbId};
    limit 1;
  `;

  const raw = await igdbClient('games', body);
  if (!raw.length) throw new Error(`Game ${igdbId} not found`);
  return normalizeGameFull(raw[0]);
};

// ── Get by slug ────────────────────────────────────────────────────
export const getGameBySlug = async (slug) => {
  const body = `
    fields id, name, slug, summary, cover.image_id,
           screenshots.image_id, artworks.image_id,
           genres.name, platforms.name,
           involved_companies.company.name, involved_companies.developer,
           first_release_date, total_rating, total_rating_count,
           game_modes.name, themes.name,
           similar_games.id, similar_games.name, similar_games.cover.image_id;
    where slug = "${slug}";
    limit 1;
  `;

  const raw = await igdbClient('games', body);
  if (!raw.length) throw new Error(`Game "${slug}" not found`);
  return normalizeGameFull(raw[0]);
};

// ── Trending games ─────────────────────────────────────────────────
export const getTrendingGames = async (limit = 20) => {
  const ninetyDaysAgo = Math.floor(Date.now() / 1000) - 90 * 24 * 60 * 60;

  const body = `
    fields id, name, slug, cover.image_id, first_release_date,
           genres.name, platforms.name, total_rating, total_rating_count;
    where first_release_date > ${ninetyDaysAgo}
      & total_rating_count > 5;
    sort total_rating_count desc;
    limit ${limit};
  `;

  const raw = await igdbClient('games', body);
  return raw.map(normalizeGame);
};

// ── Similar games ──────────────────────────────────────────────────
export const getSimilarGames = async (igdbId) => {
  const body = `
    fields id, name, slug, cover.image_id, first_release_date,
           genres.name, total_rating;
    where similar_games = (${igdbId}) & version_parent = null;
    limit 6;
  `;

  const raw = await igdbClient('games', body);
  return raw.map(normalizeGame);
};

// ── Search by name (for Steam matching) ───────────────────────────
export const searchByName = async (name) => {
  const body = `
    fields id, name, slug, cover.image_id, first_release_date, platforms.name;
    search "${name.replace(/"/g, '')}";
    where version_parent = null & category = 0;
    limit 3;
  `;

  const raw = await igdbClient('games', body);
  return raw.map(normalizeGame);
};

// ── Normalizers ────────────────────────────────────────────────────
const normalizeGame = (g) => ({
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
  genres:      g.genres?.map((x) => x.name)    ?? [],
  platforms:   g.platforms?.map((x) => x.name) ?? [],
  rating:      g.total_rating
                 ? Math.round(g.total_rating)
                 : null,
  ratingCount: g.total_rating_count ?? 0,
});

const normalizeGameFull = (g) => ({
  ...normalizeGame(g),
  summary:    g.summary    ?? null,
  storyline:  g.storyline  ?? null,
  screenshots: (g.screenshots ?? []).map((s) =>
    igdbImageUrl(s.image_id, 'screenshot_big')
  ),
  artworks: (g.artworks ?? []).map((a) =>
    igdbImageUrl(a.image_id, '1080p')
  ),
  developers: (g.involved_companies ?? [])
    .filter((c) => c.developer)
    .map((c) => c.company?.name)
    .filter(Boolean),
  gameModes: (g.game_modes ?? []).map((m) => m.name),
  themes:    (g.themes     ?? []).map((t) => t.name),
  similarGames: (g.similar_games ?? []).map(normalizeGame),
});