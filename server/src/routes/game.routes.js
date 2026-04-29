import { Router }       from 'express';
import * as igdbService from '../services/igdb.service.js';
import ApiError         from '../utils/ApiError.js';
import mongoose         from 'mongoose';

const router = Router();

// ── In-memory playtime store ───────────────────────────────────────
let PlaytimeStore;
try {
  PlaytimeStore = mongoose.model('PlaytimeStore');
} catch {
  PlaytimeStore = mongoose.model('PlaytimeStore',
    new mongoose.Schema({
      igdbId:        { type: Number, required: true, index: true },
      mainStory:     { type: Number, default: null },
      sideContent:   { type: Number, default: null },
      completionist: { type: Number, default: null },
      platform:      { type: String, default: null },
      userId:        { type: String, default: null },
    }, { timestamps: true })
  );
}

const ok = (res, data) => res.json({ status: 'success', data });

const computeStats = (entries) => {
  const calc = (key) => {
    const vals = entries.map((e) => e[key]).filter((v) => v != null && v > 0);
    if (!vals.length) return { mean:null, median:null, min:null, max:null, count:0 };
    const sorted = [...vals].sort((a, b) => a - b);
    const sum    = vals.reduce((s, v) => s + v, 0);
    const mid    = Math.floor(sorted.length / 2);
    const median = sorted.length % 2
      ? sorted[mid]
      : (sorted[mid - 1] + sorted[mid]) / 2;
    return {
      mean:   Math.round((sum / vals.length) * 10) / 10,
      median: Math.round(median * 10) / 10,
      min:    sorted[0],
      max:    sorted[sorted.length - 1],
      count:  vals.length,
      p25:    sorted[Math.floor(sorted.length * 0.25)] ?? sorted[0],
      p75:    sorted[Math.floor(sorted.length * 0.75)] ?? sorted[sorted.length - 1],
    };
  };
  return {
    mainStory:     calc('mainStory'),
    sideContent:   calc('sideContent'),
    completionist: calc('completionist'),
  };
};

const emptyStats = () => ({
  mainStory:     { mean:null, median:null, min:null, max:null, count:0 },
  sideContent:   { mean:null, median:null, min:null, max:null, count:0 },
  completionist: { mean:null, median:null, min:null, max:null, count:0 },
});

// GET /search
router.get('/search', async (req, res) => {
  try {
    const { q, limit } = req.query;
    if (!q?.trim()) return res.status(400).json({ status:'error', message:'"q" required' });
    console.log(`[IGDB] Searching: "${q}"`);
    const games = await igdbService.searchGames(q, Number(limit) || 12);
    console.log(`[IGDB] Found: ${games.length}`);
    ok(res, games);
  } catch (err) {
    console.error('Search error:', err.message);
    res.status(500).json({ status:'error', message: err.message });
  }
});

// GET /trending
router.get('/trending', async (_req, res) => {
  try {
    const games = await igdbService.getTrendingGames(20);
    ok(res, games);
  } catch (err) {
    console.error('Trending error:', err.message);
    res.status(500).json({ status:'error', message: err.message });
  }
});

// GET /slug/:slug
router.get('/slug/:slug', async (req, res) => {
  try {
    const game    = await igdbService.getGameBySlug(req.params.slug);
    const entries = await PlaytimeStore.find({ igdbId: game.igdbId }).lean();
    game.playtimeStats = computeStats(entries);
    ok(res, game);
  } catch (err) {
    console.error('Slug error:', err.message);
    res.status(500).json({ status:'error', message: err.message });
  }
});

// GET /:id/similar
router.get('/:id/similar', async (req, res) => {
  try {
    const games = await igdbService.getSimilarGames(Number(req.params.id));
    ok(res, games);
  } catch (err) {
    console.error('Similar error:', err.message);
    res.status(500).json({ status:'error', message: err.message });
  }
});

// GET /:id/stats
router.get('/:id/stats', async (req, res) => {
  try {
    const entries = await PlaytimeStore.find({
      igdbId: Number(req.params.id),
    }).lean();
    ok(res, computeStats(entries));
  } catch (err) {
    console.error('Stats error:', err.message);
    ok(res, emptyStats());
  }
});

// GET /:id
router.get('/:id', async (req, res) => {
  try {
    const game    = await igdbService.getGameById(Number(req.params.id));
    const entries = await PlaytimeStore.find({ igdbId: game.igdbId }).lean();
    game.playtimeStats = computeStats(entries);
    ok(res, game);
  } catch (err) {
    console.error('Game by id error:', err.message);
    res.status(500).json({ status:'error', message: err.message });
  }
});

// POST /:id/playtime
router.post('/:id/playtime', async (req, res) => {
  try {
    const igdbId = Number(req.params.id);
    const { mainStory, sideContent, completionist, platform, userId } = req.body;

    if (!mainStory && !sideContent && !completionist) {
      return res.status(400).json({
        status:'error', message:'Submit at least one time'
      });
    }

    const entry = await PlaytimeStore.create({
      igdbId,
      mainStory:     mainStory     ? Number(mainStory)     : null,
      sideContent:   sideContent   ? Number(sideContent)   : null,
      completionist: completionist ? Number(completionist) : null,
      platform:      platform ?? null,
      userId:        userId   ?? null,
    });

    const allEntries = await PlaytimeStore.find({ igdbId }).lean();
    const stats      = computeStats(allEntries);

    console.log(`✅ Playtime saved for igdbId=${igdbId}`);
    res.status(201).json({ status:'success', data: { entry, stats } });
  } catch (err) {
    console.error('Playtime submit error:', err.message);
    res.status(500).json({ status:'error', message: err.message });
  }
});

export default router;