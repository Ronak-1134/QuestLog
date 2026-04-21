const REQUIRED = [
  'MONGODB_URI',
  'IGDB_CLIENT_ID',
  'IGDB_CLIENT_SECRET',
  'FIREBASE_PROJECT_ID',
  'FIREBASE_PRIVATE_KEY',
  'FIREBASE_CLIENT_EMAIL',
];

export const validateEnv = () => {
  const missing = REQUIRED.filter((k) => !process.env[k]);

  if (missing.length) {
    console.error(`\n❌ Missing environment variables:\n${missing.map((k) => `   • ${k}`).join('\n')}\n`);
    process.exit(1);
  }

  if (!process.env.STEAM_API_KEY) {
    console.warn('⚠️  STEAM_API_KEY not set — Steam sync disabled');
  }

  if (!process.env.REDIS_HOST) {
    console.warn('⚠️  REDIS_HOST not set — caching disabled (falling through)');
  }
};