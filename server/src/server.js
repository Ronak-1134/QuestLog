import 'dotenv/config';
import { createServer } from 'http'; // Required for Sockets
import { Server } from 'socket.io';   // Required for Sockets
import app from './app.js';
import { connectDB } from './config/db.js';
import logger from './utils/logger.js';

const PORT = process.env.PORT || 5000;
const httpServer = createServer(app); // Wrap the app

// Re-integrate Socket.io logic
export const io = new Server(httpServer, {
  cors: { 
    origin: process.env.CLIENT_URL || "http://localhost:5173", 
    credentials: true 
  },
  transports: ['websocket', 'polling'],
});

io.on('connection', (socket) => {
  logger.debug(`WS: ${socket.id} connected`);
  socket.on('join:user', (uid) => socket.join(`user:${uid}`));
  socket.on('disconnect', () => logger.debug(`WS: ${socket.id} disconnected`));
});

// Dynamic Redis loading
let connectRedis = async () => {
  console.log('Redis skipped — add REDIS_HOST to .env to enable caching');
};

try {
  const redisModule = await import('./config/redis.js');
  connectRedis = redisModule.connectRedis;
} catch {}

const boot = async () => {
  await connectDB();
  try {
    await connectRedis();
  } catch (err) {
    console.warn('Redis unavailable — continuing without cache:', err.message);
  }

  // Use httpServer.listen, NOT app.listen
  httpServer.listen(PORT, () => {
    logger.info(`🚀 QuestLog server running on port ${PORT} [${process.env.NODE_ENV}]`);
  });
};

boot().catch((err) => {
  logger.error('Fatal boot error:', err);
  process.exit(1);
});