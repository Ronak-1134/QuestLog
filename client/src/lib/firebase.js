import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, GithubAuthProvider } from 'firebase/auth';

const firebaseConfig = {
  apiKey:            import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId:             import.meta.env.VITE_FIREBASE_APP_ID,
};

// Only initialize Firebase if real credentials exist
const hasRealConfig = firebaseConfig.apiKey &&
  firebaseConfig.apiKey !== 'placeholder' &&
  firebaseConfig.apiKey.startsWith('AIza');

let app, auth, googleProvider, githubProvider;

if (hasRealConfig) {
  app            = initializeApp(firebaseConfig);
  auth           = getAuth(app);
  googleProvider = new GoogleAuthProvider();
  githubProvider = new GithubAuthProvider();
  googleProvider.setCustomParameters({ prompt: 'select_account' });
} else {
  console.warn('Firebase not configured — auth disabled. Add real keys to client/.env');
  // Export dummy objects so imports dont crash
  auth           = null;
  googleProvider = null;
  githubProvider = null;
}

export { auth, googleProvider, githubProvider };
export default app;