import * as steamService from '../services/steam.service.js';
import User              from '../models/User.model.js';
import * as ApiResponse  from '../utils/ApiResponse.js';
import ApiError          from '../utils/ApiError.js';
import catchAsync        from '../utils/catchAsync.js';

// POST /api/steam/sync
export const syncLibrary = catchAsync(async (req, res) => {
  const { steamId } = req.body;
  if (!steamId?.trim()) throw new ApiError(400, 'steamId is required');

  const user = await User.findByUid(req.user.uid);
  if (!user) throw new ApiError(404, 'User not found');

  const result = await steamService.syncSteamLibrary(user._id, steamId);

  // Recalculate user stats after large import
  user.recalcStats().catch(() => {});

  ApiResponse.success(res, result);
});

// GET /api/steam/status
export const getSyncStatus = catchAsync(async (req, res) => {
  const user = await User.findByUid(req.user.uid);
  if (!user) throw new ApiError(404, 'User not found');

  ApiResponse.success(res, {
    steamId:    user.steam?.steamId    ?? null,
    profileUrl: user.steam?.profileUrl ?? null,
    lastSync:   user.steam?.lastSync   ?? null,
    gameCount:  user.steam?.gameCount  ?? 0,
  });
});