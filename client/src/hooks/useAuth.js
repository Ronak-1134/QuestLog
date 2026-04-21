import { useCallback }    from 'react';
import { useNavigate }    from 'react-router-dom';
import { useAuthStore }   from '../store/auth.store.js';
import {
  registerWithEmail,
  loginWithEmail,
  loginWithGoogle,
  loginWithGithub,
  logout,
  resetPassword,
} from '../services/auth.service.js';

export const useAuth = () => {
  const { user, firebaseUser, isLoading, setUser, setFirebaseUser, clearAuth } =
    useAuthStore();
  const navigate = useNavigate();

  const handleSuccess = useCallback(({ firebaseUser, profile }) => {
    setFirebaseUser(firebaseUser);
    setUser(profile);
    navigate('/dashboard');
  }, []);

  const handleError = useCallback((err) => {
    throw new Error(parseFirebaseError(err.message));
  }, []);

  const register = useCallback(
    (payload) => registerWithEmail(payload).then(handleSuccess).catch(handleError),
    []
  );

  const loginEmail = useCallback(
    (payload) => loginWithEmail(payload).then(handleSuccess).catch(handleError),
    []
  );

  const loginGoogle = useCallback(
    () => loginWithGoogle().then(handleSuccess).catch(handleError),
    []
  );

  const loginGithub = useCallback(
    () => loginWithGithub().then(handleSuccess).catch(handleError),
    []
  );

  const signOut = useCallback(async () => {
    await logout();
    clearAuth();
    navigate('/');
  }, []);

  return {
    user,
    firebaseUser,
    isLoading,
    isAuthenticated: Boolean(firebaseUser),
    register,
    loginEmail,
    loginGoogle,
    loginGithub,
    signOut,
    resetPassword,
  };
};

// ── Map Firebase error codes → human messages ──────────────────────────────
const parseFirebaseError = (message) => {
  if (message.includes('email-already-in-use')) return 'This email is already registered.';
  if (message.includes('user-not-found'))        return 'No account found with this email.';
  if (message.includes('wrong-password'))        return 'Incorrect password.';
  if (message.includes('weak-password'))         return 'Password must be at least 6 characters.';
  if (message.includes('invalid-email'))         return 'Please enter a valid email address.';
  if (message.includes('popup-closed-by-user'))  return 'Sign-in cancelled.';
  if (message.includes('too-many-requests'))     return 'Too many attempts. Please try again later.';
  return 'Authentication failed. Please try again.';
};