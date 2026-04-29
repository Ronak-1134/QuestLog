import { Router }  from 'express';
import mongoose    from 'mongoose';

const router = Router();

// ── LibraryEntry Schema ────────────────────────────────────────────
let LibraryEntry;
try {
  LibraryEntry = mongoose.model('LibraryEntry');
} catch {
  LibraryEntry = mongoose.model('LibraryEntry',
    new mongoose.Schema({
      userId:          { type: String, required: true, index: true },
      igdbId:          { type: Number, required: true },
      status:          { type: String, default: 'backlog' },
      playtimeHours:   { type: Number, default: 0 },
      progressPercent: { type: Number, default: 0 },
      rating:          { type: Number, default: null },
      isFavorite:      { type: Boolean, default: false },
      fromSteam:       { type: Boolean, default: false },
      gameData: {
        name:        String,
        slug:        String,
        cover:       String,
        coverThumb:  String,
        releaseYear: Number,
        genres:      [String],
      },
    }, { timestamps: true })
  );
}

const fmt = (item) => ({
  _id:             item._id,
  status:          item.status,
  playtimeHours:   item.playtimeHours   ?? 0,
  progressPercent: item.progressPercent ?? 0,
  rating:          item.rating,
  isFavorite:      item.isFavorite,
  fromSteam:       item.fromSteam,
  updatedAt:       item.updatedAt,
  createdAt:       item.createdAt,
  igdbId:          item.igdbId,
  gameId: {
    igdbId:      item.igdbId,
    name:        item.gameData?.name        ?? '',
    slug:        item.gameData?.slug        ?? '',
    cover:       item.gameData?.cover       ?? null,
    coverThumb:  item.gameData?.coverThumb  ?? null,
    releaseYear: item.gameData?.releaseYear ?? null,
    genres:      item.gameData?.genres      ?? [],
    playtimeStats: {
      mainStory:     { mean:null, median:null, min:null, max:null, count:0 },
      sideContent:   { mean:null, median:null, min:null, max:null, count:0 },
      completionist: { mean:null, median:null, min:null, max:null, count:0 },
    },
  },
});

// GET /:id/library
router.get('/:id/library', async (req, res) => {
  try {
    const { status, limit = 50 } = req.query;
    const query = { userId: req.params.id };
    if (status) query.status = status;
    const items = await LibraryEntry
      .find(query)
      .sort({ updatedAt: -1 })
      .limit(Number(limit))
      .lean();
    res.json({ status: 'success', meta: { total: items.length }, data: items.map(fmt) });
  } catch (err) {
    console.error('GET library error:', err.message);
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// POST /library
router.post('/library', async (req, res) => {
  try {
    const { igdbId, userId, status = 'backlog', gameData } = req.body;
    if (!userId || !igdbId) {
      return res.status(400).json({ status: 'error', message: 'userId and igdbId required' });
    }
    const entry = await LibraryEntry.findOneAndUpdate(
      { userId, igdbId: Number(igdbId) },
      { $setOnInsert: { userId, igdbId: Number(igdbId), status, gameData: gameData ?? {} } },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    ).lean();
    res.status(201).json({ status: 'success', data: fmt(entry) });
  } catch (err) {
    console.error('POST library error:', err.message);
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// GET /:id/backlog
router.get('/:id/backlog', async (req, res) => {
  try {
    const items = await LibraryEntry
      .find({ userId: req.params.id, status: 'backlog' })
      .sort({ createdAt: -1 })
      .lean();
    res.json({ status: 'success', data: items.map(fmt) });
  } catch (err) {
    console.error('GET backlog error:', err.message);
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// GET /:id/stats
router.get('/:id/stats', async (req, res) => {
  try {
    const all  = await LibraryEntry.find({ userId: req.params.id }).lean();
    const done = all.filter((g) => g.status === 'completed').length;
    const hrs  = all.reduce((s, g) => s + (g.playtimeHours ?? 0), 0);
    res.json({
      status: 'success',
      data: {
        totals: {
          totalGames:     all.length,
          completedGames: done,
          totalHours:     Math.round(hrs * 10) / 10,
          completionRate: all.length ? Math.round((done / all.length) * 100) : 0,
          avgRating:      null,
        },
        statusCounts: {
          playing:   all.filter((g) => g.status === 'playing').length,
          completed: done,
          backlog:   all.filter((g) => g.status === 'backlog').length,
          dropped:   all.filter((g) => g.status === 'dropped').length,
          wishlist:  all.filter((g) => g.status === 'wishlist').length,
        },
        statusBreakdown: [],
        genreBreakdown:  [],
        monthlyActivity: [],
      },
    });
  } catch (err) {
    console.error('GET stats error:', err.message);
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// PATCH /:id/game/:gameId
router.patch('/:id/game/:gameId', async (req, res) => {
  try {
    const entry = await LibraryEntry
      .findByIdAndUpdate(req.params.gameId, { $set: req.body }, { new: true })
      .lean();
    if (!entry) return res.status(404).json({ status: 'error', message: 'Not found' });
    res.json({ status: 'success', data: fmt(entry) });
  } catch (err) {
    console.error('PATCH library error:', err.message);
    res.status(500).json({ status: 'error', message: err.message });
  }
});

export default router;