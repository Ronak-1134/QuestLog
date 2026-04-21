import User         from '../models/User.model.js';
import UserGame     from '../models/UserGame.model.js';
import * as ApiResponse from '../utils/ApiResponse.js';
import ApiError     from '../utils/ApiError.js';
import catchAsync   from '../utils/catchAsync.js';
import { getUserPlaytimeBreakdown } from '../services/stats.service.js';

// GET /api/users/:id/library
export const getLibrary = catchAsync(async (req, res) => {
  const { status, limit = 20, page = 1 } = req.query;
  const user = await resolveUser(req);

  const filter = status ? { status } : {};
  const skip   = (Number(page) - 1) * Number(limit);

  const [items, total] = await Promise.all([
    UserGame.getLibrary(user._id, filter)
      .skip(skip)
      .limit(Number(limit)),
    UserGame.countDocuments({ userId: user._id, isHidden: false, ...filter }),
  ]);

  ApiResponse.paginated(res, items, total, Number(page), Number(limit));
});

// GET /api/users/:id/backlog
export const getBacklog = catchAsync(async (req, res) => {
  const user  = await resolveUser(req);
  const items = await UserGame.getBacklog(user._id);
  ApiResponse.success(res, items);
});

// GET /api/users/:id/stats
export const getUserStats = catchAsync(async (req, res) => {
  const user = await resolveUser(req);
  const [breakdown, statusCounts] = await Promise.all([
    getUserPlaytimeBreakdown(user._id),
    UserGame.getStatusCounts(user._id),
  ]);
  ApiResponse.success(res, { ...breakdown, statusCounts });
});

// POST /api/users/library ✅ ADD THIS
export const addToLibrary = catchAsync(async (req, res) => {
  const { igdbId, gameData, status = 'backlog' } = req.body;
  const user = await resolveUser(req);

  // Import Game model dynamically
  const GameModel = (await import('../models/Game.model.js')).default;

  // Create or find game in DB
  const dbGame = await GameModel.findOrCreateFromIgdb({
    igdbId,
    ...gameData,
  });

  const entry = await UserGame.findOneAndUpdate(
    { userId: user._id, gameId: dbGame._id },
    {
      $setOnInsert: {
        userId: user._id,
        gameId: dbGame._id,
        igdbId,
        status,
      },
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  ).populate('gameId', 'name slug cover');

  // Recalculate stats (non-blocking)
  user.recalcStats().catch(() => {});

  ApiResponse.success(res, entry, 201);
});

// PATCH /api/users/:id/game/:gameId
export const updateUserGame = catchAsync(async (req, res) => {
  const user = await resolveUser(req);
  const {
    status, platform, playtimeHours,
    progressPercent, rating, review,
    isFavorite, startedAt, completedAt, notes,
  } = req.body;

  const updates = {};
  if (status          !== undefined) updates.status          = status;
  if (platform        !== undefined) updates.platform        = platform;
  if (playtimeHours   !== undefined) updates.playtimeHours   = playtimeHours;
  if (progressPercent !== undefined) updates.progressPercent = progressPercent;
  if (rating          !== undefined) updates.rating          = rating;
  if (review          !== undefined) updates.review          = review;
  if (isFavorite      !== undefined) updates.isFavorite      = isFavorite;
  if (startedAt       !== undefined) updates.startedAt       = startedAt;
  if (completedAt     !== undefined) updates.completedAt     = completedAt;
  if (notes           !== undefined) updates.notes           = notes;

  if (status === 'completed' && !completedAt) {
    updates.completedAt = new Date();
  }

  const doc = await UserGame.findOneAndUpdate(
    { userId: user._id, _id: req.params.gameId },
    updates,
    { new: true, runValidators: true }
  ).populate('gameId', 'name slug cover');

  if (!doc) throw new ApiError(404, 'Game entry not found');

  user.recalcStats().catch(() => {});

  ApiResponse.success(res, doc);
});

// ── Helper ─────────────────────────────────────────────────
const resolveUser = async (req) => {
  const user = await User.findByUid(req.user.uid);
  if (!user) throw new ApiError(404, 'User not found');
  return user;
};