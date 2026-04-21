import * as statsService from '../services/stats.service.js';
import User              from '../models/User.model.js';
import * as ApiResponse  from '../utils/ApiResponse.js';
import ApiError          from '../utils/ApiError.js';
import catchAsync        from '../utils/catchAsync.js';

// GET /api/stats/global
export const getGlobalStats = catchAsync(async (_req, res) => {
  const stats = await statsService.getGlobalStats();
  ApiResponse.success(res, stats);
});

// GET /api/stats/shame  (protected)
export const getPileOfShame = catchAsync(async (req, res) => {
  const user = await User.findByUid(req.user.uid);
  if (!user) throw new ApiError(404, 'User not found');
  const data = await statsService.getPileOfShame(user._id);
  ApiResponse.success(res, data);
});

// GET /api/stats/predict/:igdbId
export const getPrediction = catchAsync(async (req, res) => {
  const data = await statsService.predictPlaytime(Number(req.params.id));
  ApiResponse.success(res, data);
});

// GET /api/stats/user/:userId/breakdown (protected)
export const getUserBreakdown = catchAsync(async (req, res) => {
  const user = await User.findByUid(req.user.uid);
  if (!user) throw new ApiError(404, 'User not found');
  const data = await statsService.getUserPlaytimeBreakdown(user._id);
  ApiResponse.success(res, data);
});