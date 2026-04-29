import express from 'express';
import cors    from 'cors';
import helmet  from 'helmet';
import morgan  from 'morgan';

const app = express();

app.use(helmet());
app.use(cors({
  origin:      process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json({ limit: '10kb' }));
app.use(morgan('dev'));

app.get('/health', (_req, res) =>
  res.json({ status: 'ok', ts: Date.now() })
);

// Load each route separately so errors are visible
try {
  const { default: r } = await import('./routes/auth.routes.js');
  app.use('/api/auth', r);
  console.log('✅ auth routes loaded');
} catch (e) { console.error('❌ auth routes FAILED:', e.message); }

try {
  const { default: r } = await import('./routes/game.routes.js');
  app.use('/api/games', r);
  console.log('✅ game routes loaded');
} catch (e) { console.error('❌ game routes FAILED:', e.message); }

try {
  const { default: r } = await import('./routes/user.routes.js');
  app.use('/api/users', r);
  console.log('✅ user routes loaded');
} catch (e) { console.error('❌ user routes FAILED:', e.message); }

try {
  const { default: r } = await import('./routes/steam.routes.js');
  app.use('/api/steam', r);
  console.log('✅ steam routes loaded');
} catch (e) { console.error('❌ steam routes FAILED:', e.message); }

try {
  const { default: r } = await import('./routes/stats.routes.js');
  app.use('/api/stats', r);
  console.log('✅ stats routes loaded');
} catch (e) { console.error('❌ stats routes FAILED:', e.message); }

try {
  const { default: r } = await import('./routes/missions.routes.js');
  app.use('/api/missions', r);
  console.log('✅ missions routes loaded');
} catch (e) { console.error('❌ missions routes FAILED:', e.message); }

app.all('*', (req, res) =>
  res.status(404).json({ status: 'error', message: `${req.originalUrl} not found` })
);

app.use((err, _req, res, _next) => {
  console.error('Global error:', err.message);
  res.status(err.statusCode || 500).json({
    status:  'error',
    message: err.message || 'Internal server error',
  });
});

export default app;