import rateLimit from 'express-rate-limit';
import { cacheIncr } from '../config/redis.js';

export const globalRateLimiter = rateLimit({
  windowMs:        15 * 60 * 1000,
  max:             300,
  standardHeaders: true,
  legacyHeaders:   false,
  keyGenerator:    (req) =>
    req.headers['x-forwarded-for']?.split(',')[0] ?? req.ip,
  message: { status: 'error', message: 'Too many requests.' },
});

export const strictRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max:      10,
  message:  { status: 'error', message: 'Rate limit exceeded.' },
});

export const steamSyncLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,   // 1 hour
  max:      3,
  message:  { status: 'error', message: 'Steam sync limited to 3/hour.' },
});

// ── Redis-backed sliding window (bypasses in-memory reset on restart) ──────
export const redisRateLimiter = (key, limit, windowSecs) =>
  async (req, res, next) => {
    const id  = `rl:${key}:${req.ip}`;
    const cnt = await cacheIncr(id, windowSecs);
    if (cnt > limit) {
      return res.status(429).json({
        status: 'error',
        message: `Rate limit: ${limit} requests per ${windowSecs}s`,
      });
    }
    next();
  };