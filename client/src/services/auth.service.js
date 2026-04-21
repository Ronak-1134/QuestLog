import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  onAuthStateChanged,
} from 'firebase/auth';
import { auth, googleProvider, githubProvider } from '../lib/firebase.js';
import api from '../lib/axios.js';

// Guard — if Firebase is not configured, return friendly error
const requireAuth = () => {
  if (!auth) throw new Error('Firebase not configured yet. Add your keys to client/.env');
};

export const registerWithEmail = async ({ email, password, username }) => {
  requireAuth();
  const { user } = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(user, { displayName: username });
  const profile = await syncUserWithBackend({ uid: user.uid, email, username });
  return { firebaseUser: user, profile };
};

export const loginWithEmail = async ({ email, password }) => {
  requireAuth();
  const { user } = await signInWithEmailAndPassword(auth, email, password);
  const profile  = await syncUserWithBackend({ uid: user.uid, email });
  return { firebaseUser: user, profile };
};

export const loginWithGoogle = async () => {
  requireAuth();
  const { user } = await signInWithPopup(auth, googleProvider);
  const profile  = await syncUserWithBackend({
    uid:      user.uid,
    email:    user.email,
    username: user.displayName?.replace(/\s+/g, '_').toLowerCase(),
    avatar:   user.photoURL,
  });
  return { firebaseUser: user, profile };
};

export const loginWithGithub = async () => {
  requireAuth();
  const { user } = await signInWithPopup(auth, githubProvider);
  const profile  = await syncUserWithBackend({
    uid:      user.uid,
    email:    user.email,
    username: user.displayName?.replace(/\s+/g, '_').toLowerCase(),
    avatar:   user.photoURL,
  });
  return { firebaseUser: user, profile };
};

export const logout = () => {
  if (!auth) return Promise.resolve();
  return signOut(auth);
};

export const resetPassword = (email) => {
  requireAuth();
  return sendPasswordResetEmail(auth, email);
};

const syncUserWithBackend = async (payload) => {
  try {
    const { data } = await api.post('/auth/register', payload);
    return data.data;
  } catch {
    return null;
  }
};

export const subscribeToAuthState = (callback) => {
  if (!auth) {
    // No Firebase — immediately call with null user, return no-op unsubscribe
    callback(null);
    return () => {};
  }
  return onAuthStateChanged(auth, callback);
};