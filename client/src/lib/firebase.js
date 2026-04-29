import { initializeApp }   from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

const cfg = {
  apiKey:            import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId:             import.meta.env.VITE_FIREBASE_APP_ID,
};

const isReal = cfg.apiKey && cfg.apiKey !== 'placeholder' && cfg.apiKey.startsWith('AIza');

let app, auth, googleProvider;

if (isReal) {
  app            = initializeApp(cfg);
  auth           = getAuth(app);
  googleProvider = new GoogleAuthProvider();
  googleProvider.setCustomParameters({ prompt: 'select_account' });
} else {
  console.warn('[QuestLog] Firebase not configured — add real keys to client/.env');
  auth           = null;
  googleProvider = null;
}

export { auth, googleProvider };
export default app;