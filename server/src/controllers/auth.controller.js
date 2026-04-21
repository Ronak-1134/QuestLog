import User      from '../models/User.model.js';
import catchAsync from '../utils/catchAsync.js';
import * as ApiResponse from '../utils/ApiResponse.js';

// POST /api/auth/register
// Called after every Firebase signup/OAuth — idempotent upsert
export const register = catchAsync(async (req, res) => {
  const { uid, email, username, avatar } = req.body;

  const user = await User.findOneAndUpdate(
    { uid },
    {
      $setOnInsert: {
        uid,
        email,
        username: username ?? `user_${uid.slice(0, 8)}`,
        avatar:   avatar ?? null,
      },
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  ApiResponse.success(res, sanitizeUser(user), 201);
});

// GET /api/auth/me
export const getMe = catchAsync(async (req, res) => {
  const user = await User.findByUid(req.user.uid);
  if (!user) return ApiResponse.success(res, null, 404);
  ApiResponse.success(res, sanitizeUser(user));
});

// ── Strip internal fields before sending to client ─────────────────────────
const sanitizeUser = (user) => ({
  id:          user._id,
  uid:         user.uid,
  email:       user.email,
  username:    user.username,
  avatar:      user.avatar,
  bio:         user.bio,
  steam:       user.steam,
  preferences: user.preferences,
  stats:       user.stats,
  role:        user.role,
  createdAt:   user.createdAt,
});