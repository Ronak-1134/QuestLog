import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  onAuthStateChanged,
} from 'firebase/auth';
import { auth, googleProvider } from '../lib/firebase.js';
import api from '../lib/axios.js';

const check = () => {
  if (!auth) throw new Error('Firebase not configured. Add real keys to client/.env');
};

export const registerWithEmail = async ({ email, password, username }) => {
  check();
  const { user } = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(user, { displayName: username });
  const profile = await syncBackend({ uid: user.uid, email, username });
  return { firebaseUser: user, profile };
};

export const loginWithEmail = async ({ email, password }) => {
  check();
  const { user } = await signInWithEmailAndPassword(auth, email, password);
  const profile  = await syncBackend({ uid: user.uid, email });
  return { firebaseUser: user, profile };
};

export const loginWithGoogle = async () => {
  check();
  const { user } = await signInWithPopup(auth, googleProvider);
  const profile  = await syncBackend({
    uid:      user.uid,
    email:    user.email,
    username: user.displayName?.replace(/\s+/g, '_').toLowerCase()
                ?? user.email?.split('@')[0],
    avatar:   user.photoURL,
  });
  return { firebaseUser: user, profile };
};

export const logout = () => (auth ? signOut(auth) : Promise.resolve());

export const resetPassword = (email) => { check(); return sendPasswordResetEmail(auth, email); };

const syncBackend = async (payload) => {
  try {
    const { data } = await api.post('/auth/register', payload);
    return data.data;
  } catch { return null; }
};

export const subscribeToAuthState = (cb) => {
  if (!auth) { cb(null); return () => {}; }
  return onAuthStateChanged(auth, cb);
};