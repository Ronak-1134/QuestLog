import mongoose          from 'mongoose';
import Game              from '../models/Game.model.js';
import PlaytimeEntry     from '../models/PlaytimeEntry.model.js';
import User              from '../models/User.model.js';
import UserGame          from '../models/UserGame.model.js';
import { cacheDel, cacheGet, cacheSet } from '../config/redis.js';
import logger            from '../utils/logger.js';

import EventEmitter from 'events';
export const statsBus = new EventEmitter();

// ── Constants ──────────────────────────────────────────────────────────────
const OUTLIER_ZSCORE = 2.5;   // entries beyond this z-score are excluded
const MIN_ENTRIES    = 3;     // minimum submissions before outlier removal

// ─────────────────────────────────────────────────────────────────────────────
// Core stat builders
// ─────────────────────────────────────────────────────────────────────────────
const mean   = (arr) => arr.reduce((s, v) => s + v, 0) / arr.length;
const median = (sorted) => {
  const m = Math.floor(sorted.length / 2);
  return sorted.length % 2
    ? sorted[m]
    : (sorted[m - 1] + sorted[m]) / 2;
};

const removeOutliers = (values) => {
  if (values.length < MIN_ENTRIES) return values;
  const mu  = mean(values);
  const sd  = Math.sqrt(values.reduce((s, v) => s + (v - mu) ** 2, 0) / values.length);
  if (sd === 0) return values;
  return values.filter((v) => Math.abs((v - mu) / sd) <= OUTLIER_ZSCORE);
};

const buildStatBlock = (rawValues) => {
  const valid = rawValues.filter((v) => v != null && v > 0);
  if (!valid.length) return { mean: null, median: null, min: null, max: null, count: 0 };

  const clean  = removeOutliers(valid);
  const sorted = [...clean].sort((a, b) => a - b);
  const avg    = mean(clean);
  const med    = median(sorted);

  const round = (v) => Math.round(v * 10) / 10;

  return {
    mean:   round(avg),
    median: round(med),
    min:    round(sorted[0]),
    max:    round(sorted[sorted.length - 1]),
    count:  valid.length,           // raw count (before outlier removal)
    p25:    round(sorted[Math.floor(sorted.length * 0.25)]),
    p75:    round(sorted[Math.floor(sorted.length * 0.75)]),
  };
};

// ─────────────────────────────────────────────────────────────────────────────
// recalculateGameStats
// ─────────────────────────────────────────────────────────────────────────────
export const recalculateGameStats = async (gameId) => {
  const entries = await PlaytimeEntry.find({
    gameId:    new mongoose.Types.ObjectId(gameId),
    isFlagged: false,
  }).lean();

  const extract = (key) => entries.map((e) => e[key]).filter((v) => v != null);

  const stats = {
    mainStory:     buildStatBlock(extract('mainStory')),
    sideContent:   buildStatBlock(extract('sideContent')),
    completionist: buildStatBlock(extract('completionist')),
  };

  await Game.findByIdAndUpdate(gameId, {
    playtimeStats:   stats,
    submissionCount: Math.max(
      stats.mainStory.count,
      stats.sideContent.count,
      stats.completionist.count,
    ),
  });

  const game = await Game.findById(gameId).select('igdbId slug').lean();
  if (game) {
    await Promise.allSettled([
      cacheDel(`games:${game.igdbId}`),
      cacheDel(`games:${game.igdbId}:stats`),
      cacheDel(`games:slug:${game.slug}`),
    ]);
    statsBus.emit('game:stats:updated', { gameId, igdbId: game.igdbId, stats });
  }

  logger.debug(`Stats recalculated for game ${gameId}`);
  return stats;
};

// ─────────────────────────────────────────────────────────────────────────────
// getUserPlaytimeBreakdown  — for profile/dashboard charts
// ─────────────────────────────────────────────────────────────────────────────
export const getUserPlaytimeBreakdown = async (userId) => {
  const uid = new mongoose.Types.ObjectId(userId);

  const [statusBreakdown, genreBreakdown, monthlyActivity, totalAgg] =
    await Promise.all([

      // Status counts
      UserGame.aggregate([
        { $match: { userId: uid } },
        { $group: { _id: '$status', count: { $sum: 1 }, hours: { $sum: '$playtimeHours' } } },
        { $sort: { count: -1 } },
      ]),

      // Hours by genre (via game lookup)
      UserGame.aggregate([
        { $match: { userId: uid, playtimeHours: { $gt: 0 } } },
        { $lookup: { from: 'games', localField: 'gameId', foreignField: '_id', as: 'game' } },
        { $unwind: '$game' },
        { $unwind: '$game.genres' },
        { $group: { _id: '$game.genres', hours: { $sum: '$playtimeHours' }, count: { $sum: 1 } } },
        { $sort: { hours: -1 } },
        { $limit: 8 },
      ]),

      // Monthly activity (last 12 months)
      UserGame.aggregate([
        {
          $match: {
            userId:    uid,
            updatedAt: { $gte: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000) },
          },
        },
        {
          $group: {
            _id: {
              year:  { $year: '$updatedAt' },
              month: { $month: '$updatedAt' },
            },
            games: { $sum: 1 },
            hours: { $sum: '$playtimeHours' },
          },
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } },
      ]),

      // Total aggregate
      UserGame.aggregate([
        { $match: { userId: uid } },
        {
          $group: {
            _id:            null,
            totalGames:     { $sum: 1 },
            completedGames: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } },
            totalHours:     { $sum: '$playtimeHours' },
            avgRating:      { $avg: '$rating' },
          },
        },
      ]),
    ]);

  const totals = totalAgg[0] ?? {
    totalGames: 0, completedGames: 0, totalHours: 0, avgRating: null,
  };

  return {
    totals: {
      totalGames:     totals.totalGames,
      completedGames: totals.completedGames,
      totalHours:     Math.round(totals.totalHours * 10) / 10,
      avgRating:      totals.avgRating ? Math.round(totals.avgRating * 10) / 10 : null,
      completionRate: totals.totalGames
        ? Math.round((totals.completedGames / totals.totalGames) * 100)
        : 0,
    },
    statusBreakdown: statusBreakdown.map((s) => ({
      status: s._id,
      count:  s.count,
      hours:  Math.round(s.hours * 10) / 10,
    })),
    genreBreakdown: genreBreakdown.map((g) => ({
      genre: g._id,
      hours: Math.round(g.hours * 10) / 10,
      count: g.count,
    })),
    monthlyActivity: monthlyActivity.map((m) => ({
      label: `${m._id.year}-${String(m._id.month).padStart(2, '0')}`,
      games: m.games,
      hours: Math.round(m.hours * 10) / 10,
    })),
  };
};

// ─────────────────────────────────────────────────────────────────────────────
// getGlobalStats
// ─────────────────────────────────────────────────────────────────────────────
export const getGlobalStats = async () => {
  const CK = 'stats:global';
  const cached = await cacheGet(CK);
  if (cached) return cached;

  const [gameAgg, userAgg, topGames] = await Promise.all([
    Game.aggregate([
      { $match: { submissionCount: { $gt: 0 } } },
      {
        $group: {
          _id:              null,
          totalGames:       { $sum: 1 },
          totalSubmissions: { $sum: '$submissionCount' },
          avgMainStory:     { $avg: '$playtimeStats.mainStory.median' },
        },
      },
    ]),

    User.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id:        null,
          totalUsers: { $sum: 1 },
          totalHours: { $sum: '$stats.totalHours' },
        },
      },
    ]),

    Game.find({ submissionCount: { $gt: 0 } })
      .sort({ submissionCount: -1 })
      .limit(5)
      .select('name slug cover playtimeStats submissionCount')
      .lean(),
  ]);

  const result = {
    games: {
      total:             gameAgg[0]?.totalGames       ?? 0,
      totalSubmissions:  gameAgg[0]?.totalSubmissions ?? 0,
      avgMainStoryHours: gameAgg[0]?.avgMainStory
        ? Math.round(gameAgg[0].avgMainStory * 10) / 10
        : null,
    },
    users: {
      total:      userAgg[0]?.totalUsers ?? 0,
      totalHours: Math.round((userAgg[0]?.totalHours ?? 0)),
    },
    topGames,
  };

  await cacheSet(CK, result, 300);
  return result;
};

// ─────────────────────────────────────────────────────────────────────────────
// getPileOfShame  — unplayed games with estimated total time cost
// ─────────────────────────────────────────────────────────────────────────────
export const getPileOfShame = async (userId) => {
  const uid  = new mongoose.Types.ObjectId(userId);
  const games = await UserGame.find({
    userId:        uid,
    status:        { $in: ['backlog', 'dropped'] },
    playtimeHours: 0,
  })
    .populate('gameId', 'name slug cover playtimeStats releaseYear')
    .lean();

  let totalEstimatedHours = 0;
  const enriched = games.map((ug) => {
    const median = ug.gameId?.playtimeStats?.mainStory?.median ?? null;
    if (median) totalEstimatedHours += median;
    return {
      _id:            ug._id,
      status:         ug.status,
      fromSteam:      ug.fromSteam,
      addedAt:        ug.createdAt,
      game: {
        name:        ug.gameId?.name,
        slug:        ug.gameId?.slug,
        cover:       ug.gameId?.cover,
        releaseYear: ug.gameId?.releaseYear,
        estimatedHours: median,
      },
    };
  });

  const daysNeeded = totalEstimatedHours / 3;     // 3h/day casual pace
  const yearsNeeded = daysNeeded / 365;

  return {
    count:               enriched.length,
    totalEstimatedHours: Math.round(totalEstimatedHours),
    daysAtCasualPace:    Math.round(daysNeeded),
    yearsAtCasualPace:   Math.round(yearsNeeded * 10) / 10,
    games:               enriched,
  };
};

// ─────────────────────────────────────────────────────────────────────────────
// AI playtime predictor  — weighted heuristic model
// ─────────────────────────────────────────────────────────────────────────────
export const predictPlaytime = async (igdbId) => {
  const CK = `stats:predict:${igdbId}`;
  const cached = await cacheGet(CK);
  if (cached) return cached;

  const game = await Game.findOne({ igdbId }).lean();

  // If we already have real data, use median directly
  if (game?.playtimeStats?.mainStory?.count >= 5) {
    const result = {
      source:        'community',
      mainStory:     game.playtimeStats.mainStory.median,
      sideContent:   game.playtimeStats.sideContent.median,
      completionist: game.playtimeStats.completionist.median,
      confidence:    'high',
    };
    await cacheSet(CK, result, 86400);
    return result;
  }

  // Heuristic prediction from genre + platform signals
  const genres    = game?.genres    ?? [];
  const gameModes = game?.gameModes ?? [];

  const BASE_HOURS = {
    RPG:              45, 'Role-playing (RPG)': 45,
    Strategy:         25,
    Adventure:        12,
    'Hack and slash': 15,
    Shooter:          10,
    Platformer:        8,
    Fighting:          6,
    Racing:            6,
    Sports:            8,
    Puzzle:            6,
    Indie:             8,
    Simulator:        20,
    'Real Time Strategy (RTS)': 25,
    'Turn-based strategy (TBS)': 30,
  };

  const MODE_MULTIPLIER = {
    'Single player':    1.0,
    'Multiplayer':      0.7,
    'Co-operative':     0.8,
    'Battle Royale':    0.5,
  };

  // Pick highest base from matching genres
  let base = 12;
  for (const g of genres) {
    if (BASE_HOURS[g] && BASE_HOURS[g] > base) base = BASE_HOURS[g];
  }

  // Apply mode multiplier
  let mult = 1.0;
  for (const m of gameModes) {
    if (MODE_MULTIPLIER[m]) { mult = MODE_MULTIPLIER[m]; break; }
  }

  const mainStory     = Math.round(base * mult);
  const sideContent   = Math.round(mainStory * 1.6);
  const completionist = Math.round(mainStory * 2.5);

  const result = {
    source:        'prediction',
    mainStory,
    sideContent,
    completionist,
    confidence:    game?.playtimeStats?.mainStory?.count >= 1 ? 'medium' : 'low',
    basedOn:       genres.slice(0, 3),
  };

  await cacheSet(CK, result, 86400);
  return result;
};