import express  from 'express';
import cors     from 'cors';
import helmet   from 'helmet';
import morgan   from 'morgan';

const app = express();

/**
 * HELMET CONFIGURATION
 * We adjust security headers to allow Firebase popups and IGDB game covers.
 */
app.use(helmet({
  // Allows the Firebase login popup to communicate with the main window
  crossOriginOpenerPolicy: { policy: "same-origin-allow-popups" },
  // Allows loading images (like game covers) from external domains like IGDB
  crossOriginResourcePolicy: { policy: "cross-origin" },
  // Disabling CSP in development ensures external scripts/images aren't blocked
  contentSecurityPolicy: false, 
}));

app.use(cors({ 
  origin: process.env.CLIENT_URL || 'http://localhost:5173', 
  credentials: true 
}));

app.use(express.json({ limit: '10kb' }));
app.use(morgan('dev'));

// Health check
app.get('/health', (_req, res) => res.json({ status: 'ok', ts: Date.now() }));

/**
 * DYNAMIC ROUTE LOADING
 * Ensures the server doesn't crash if a specific route file is missing.
 */
const loadRoutes = async () => {
  try {
    const { default: authRoutes }  = await import('./routes/auth.routes.js');
    const { default: gameRoutes }  = await import('./routes/game.routes.js');
    const { default: userRoutes }  = await import('./routes/user.routes.js');
    const { default: steamRoutes } = await import('./routes/steam.routes.js');
    const { default: statsRoutes } = await import('./routes/stats.routes.js');

    app.use('/api/auth',  authRoutes);
    app.use('/api/games', gameRoutes);
    app.use('/api/users', userRoutes);
    app.use('/api/steam', steamRoutes);
    app.use('/api/stats', statsRoutes);
  } catch (err) {
    console.error('Route load error:', err.message);
  }
};

await loadRoutes();

// 404 Handler
app.all('*', (req, res) => {
  res.status(404).json({ status: 'error', message: `Route ${req.originalUrl} not found` });
});

// Global Error Handler
app.use((err, req, res, _next) => {
  console.error(err.message);
  res.status(err.statusCode || 500).json({
    status:  'error',
    message: err.message || 'Internal server error',
  });
});

export default app;