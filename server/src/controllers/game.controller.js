import * as igdbService from '../services/igdb.service.js';
import ApiError         from '../utils/ApiError.js';
import catchAsync       from '../utils/catchAsync.js';

const ok = (res, data) => res.json({ status: 'success', data });

export const searchGames = catchAsync(async (req, res) => {
  const { q, limit } = req.query;
  if (!q?.trim()) throw new ApiError(400, '"q" is required');
  const games = await igdbService.searchGames(q, Number(limit) || 12);
  ok(res, games);
});

export const getTrending = catchAsync(async (req, res) => {
  const games = await igdbService.getTrendingGames(Number(req.query.limit) || 20);
  ok(res, games);
});

export const getGameBySlug = catchAsync(async (req, res) => {
  const game = await igdbService.getGameBySlug(req.params.slug);
  ok(res, game);
});

export const getGame = catchAsync(async (req, res) => {
  const game = await igdbService.getGameById(Number(req.params.id));
  ok(res, game);
});

export const getSimilarGames = catchAsync(async (req, res) => {
  const games = await igdbService.getSimilarGames(Number(req.params.id));
  ok(res, games);
});

export const getGameStats = catchAsync(async (_req, res) => {
  ok(res, {
    mainStory:     { mean: null, median: null, min: null, max: null, count: 0 },
    sideContent:   { mean: null, median: null, min: null, max: null, count: 0 },
    completionist: { mean: null, median: null, min: null, max: null, count: 0 },
  });
});

export const submitPlaytime = catchAsync(async (_req, res) => {
  res.status(201).json({ status: 'success', data: {} });
});