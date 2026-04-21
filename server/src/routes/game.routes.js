import { Router } from 'express';
import {
  searchGames,
  getTrending,
  getGame,
  getGameBySlug,
  getSimilarGames,
  getGameStats,
  submitPlaytime,
} from '../controllers/game.controller.js';

const router = Router();

router.get('/search',       searchGames);
router.get('/trending',     getTrending);
router.get('/slug/:slug',   getGameBySlug);
router.get('/:id/similar',  getSimilarGames);
router.get('/:id/stats',    getGameStats);
router.get('/:id',          getGame);
router.post('/:id/playtime', submitPlaytime);

export default router;