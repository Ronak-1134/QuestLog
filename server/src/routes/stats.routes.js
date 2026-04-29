import { Router } from 'express';

const router = Router();

router.get('/global', (_req, res) => {
  res.json({
    status: 'success',
    data: {
      games: { total: 0, totalSubmissions: 0, avgMainStoryHours: null },
      users: { total: 1, totalHours: 0 },
      topGames: [],
    },
  });
});

router.get('/shame', (_req, res) => {
  res.json({
    status: 'success',
    data: {
      count: 0, totalEstimatedHours: 0,
      daysAtCasualPace: 0, yearsAtCasualPace: 0,
      games: [],
    },
  });
});

router.get('/breakdown', (_req, res) => {
  res.json({
    status: 'success',
    data: {
      totals: {
        totalGames: 0, completedGames: 0,
        totalHours: 0, completionRate: 0, avgRating: null,
      },
      statusBreakdown: [],
      genreBreakdown:  [],
      monthlyActivity: [],
    },
  });
});

router.get('/predict/:id', (_req, res) => {
  res.json({
    status: 'success',
    data: {
      source: 'prediction', mainStory: 20,
      sideContent: 30, completionist: 50, confidence: 'low',
    },
  });
});

export default router;