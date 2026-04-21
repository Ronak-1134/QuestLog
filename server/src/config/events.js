import { statsBus } from '../services/stats.service.js';

export const wireEvents = (io) => {
  statsBus.on('game:stats:updated', ({ igdbId, stats }) => {
    io.emit(`game:${igdbId}:stats`, stats);
  });
};