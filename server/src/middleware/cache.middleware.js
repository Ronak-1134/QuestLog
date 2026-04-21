import { cacheGet, cacheSet } from '../config/redis.js';
import logger                 from '../utils/logger.js';

// ── Standard cache middleware ──────────────────────────────────────────────
export const withCache = (keyFn, ttl = 3600) =>
  async (req, res, next) => {
    const key = keyFn(req);

    try {
      const cached = await cacheGet(key);
      if (cached) {
        logger.debug(`Cache HIT: ${key}`);
        return res.json({ status: 'success', cached: true, data: cached });
      }
    } catch (_) {}

    // Intercept outgoing JSON to cache it
    const _json = res.json.bind(res);
    res.json = async (body) => {
      if (body?.status === 'success' && body?.data != null) {
        cacheSet(key, body.data, ttl).catch(() => {});
      }
      return _json(body);
    };

    next();
  };

// ── Stale-while-revalidate ─────────────────────────────────────────────────
// Returns stale data immediately, triggers background refresh
export const withSWR = (keyFn, ttl = 3600, staleTtl = 60) =>
  async (req, res, next) => {
    const key      = keyFn(req);
    const staleKey = `${key}:stale`;

    try {
      const fresh = await cacheGet(key);
      if (fresh) {
        return res.json({ status: 'success', cached: true, data: fresh });
      }

      const stale = await cacheGet(staleKey);
      if (stale) {
        // Respond immediately with stale, revalidate in background
        res.json({ status: 'success', cached: true, stale: true, data: stale });

        // Background revalidation
        const _json = res.json.bind(res);
        res.json = async (body) => {
          if (body?.status === 'success' && body?.data != null) {
            await cacheSet(key,      body.data, ttl);
            await cacheSet(staleKey, body.data, ttl + staleTtl);
          }
        };
        next();
        return;
      }
    } catch (_) {}

    // No cache at all — normal flow
    const _json = res.json.bind(res);
    res.json = async (body) => {
      if (body?.status === 'success' && body?.data != null) {
        cacheSet(key,      body.data, ttl).catch(() => {});
        cacheSet(staleKey, body.data, ttl + staleTtl).catch(() => {});
      }
      return _json(body);
    };

    next();
  };