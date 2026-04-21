/**
 * Run: node src/services/igdb.test.js
 * (requires .env loaded + Redis + valid IGDB credentials)
 */
import 'dotenv/config';
import { connectRedis } from '../config/redis.js';
import {
  searchGames,
  getGameById,
  getTrendingGames,
  getSimilarGames,
} from './igdb.service.js';

await connectRedis();

console.log('\n── search: "elden ring" ──');
const results = await searchGames('elden ring', 3);
console.dir(results, { depth: null });

console.log('\n── getGameById: 119171 (Elden Ring) ──');
const game = await getGameById(119171);
console.dir(game, { depth: null });

console.log('\n── trending ──');
const trending = await getTrendingGames(5);
trending.forEach((g) => console.log(` • ${g.name} (${g.releaseYear})`));

console.log('\n── similar to Elden Ring ──');
const similar = await getSimilarGames(119171);
similar.forEach((g) => console.log(` • ${g.name}`));

process.exit(0);