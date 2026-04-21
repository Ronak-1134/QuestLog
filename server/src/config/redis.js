import Redis   from 'ioredis';
import logger  from '../utils/logger.js';

let redis;

export const connectRedis = async () => {
  redis = new Redis({
    host:          process.env.REDIS_HOST     || 'localhost',
    port:          Number(process.env.REDIS_PORT) || 6379,
    password:      process.env.REDIS_PASSWORD || undefined,
    lazyConnect:   true,
    retryStrategy: (times) => Math.min(times * 200, 5000),
    maxRetriesPerRequest: 3,
  });

  redis.on('connect',      ()    => logger.info('Redis connected'));
  redis.on('ready',        ()    => logger.info('Redis ready'));
  redis.on('error',        (err) => logger.warn('Redis error:', err.message));
  redis.on('reconnecting', ()    => logger.info('Redis reconnecting…'));

  await redis.connect();
};

export const getRedis = () => {
  if (!redis) throw new Error('Redis not initialized');
  return redis;
};

// ── Get ────────────────────────────────────────────────────────────────────
export const cacheGet = async (key) => {
  try {
    const raw = await getRedis().get(key);
    return raw ? JSON.parse(raw) : null;
  } catch (err) {
    logger.warn(`cacheGet failed [${key}]:`, err.message);
    return null;
  }
};

// ── Set ────────────────────────────────────────────────────────────────────
export const cacheSet = async (key, value, ttlSeconds = 3600) => {
  try {
    await getRedis().setex(key, ttlSeconds, JSON.stringify(value));
  } catch (err) {
    logger.warn(`cacheSet failed [${key}]:`, err.message);
  }
};

// ── Delete ─────────────────────────────────────────────────────────────────
export const cacheDel = async (key) => {
  try {
    await getRedis().del(key);
  } catch (err) {
    logger.warn(`cacheDel failed [${key}]:`, err.message);
  }
};

// ── Delete by pattern ──────────────────────────────────────────────────────
export const cacheDelPattern = async (pattern) => {
  try {
    const keys = await getRedis().keys(pattern);
    if (keys.length) await getRedis().del(...keys);
    return keys.length;
  } catch (err) {
    logger.warn(`cacheDelPattern failed [${pattern}]:`, err.message);
    return 0;
  }
};

// ── Get or set ─────────────────────────────────────────────────────────────
export const cacheGetOrSet = async (key, fn, ttlSeconds = 3600) => {
  const cached = await cacheGet(key);
  if (cached !== null) return cached;

  const value = await fn();
  await cacheSet(key, value, ttlSeconds);
  return value;
};

// ── Increment counter (for rate limiting / analytics) ─────────────────────
export const cacheIncr = async (key, ttlSeconds = 60) => {
  try {
    const r   = getRedis();
    const val = await r.incr(key);
    if (val === 1) await r.expire(key, ttlSeconds);
    return val;
  } catch {
    return 0;
  }
};

// ── Cache health check ─────────────────────────────────────────────────────
export const cacheHealth = async () => {
  try {
    await getRedis().ping();
    return true;
  } catch {
    return false;
  }
};