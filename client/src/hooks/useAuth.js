import { useCallback }  from 'react';
import { useNavigate }  from 'react-router-dom';
import { useAuthStore } from '@/store/auth.store.js';
import {
  registerWithEmail,
  loginWithEmail,
  loginWithGoogle,
  logout,
  resetPassword,
} from '@/services/auth.service.js';

export const useAuth = () => {
  const store    = useAuthStore();
  const navigate = useNavigate();

  const onSuccess = ({ firebaseUser, profile }) => {
    const basic = {
      uid:      firebaseUser.uid,
      email:    firebaseUser.email,
      username: firebaseUser.displayName
                  ?? firebaseUser.email?.split('@')[0]
                  ?? 'player',
      avatar:   firebaseUser.photoURL ?? null,
      stats:    { totalGames:0, completedGames:0, totalHours:0, avgCompletion:0 },
    };
    useAuthStore.setState({
      firebaseUser,
      user:      profile ?? basic,
      isLoading: false,
    });
    navigate('/dashboard', { replace: true });
  };

  const onErr = (e) => {
    throw new Error(ERR(e?.message ?? e?.code ?? ''));
  };

  return {
    user:            store.user,
    firebaseUser:    store.firebaseUser,
    isLoading:       store.isLoading,
    isAuthenticated: Boolean(store.firebaseUser),

    register:    (p) => registerWithEmail(p).then(onSuccess).catch(onErr),
    loginEmail:  (p) => loginWithEmail(p).then(onSuccess).catch(onErr),
    loginGoogle: ()  => loginWithGoogle().then(onSuccess).catch(onErr),
    signOut: async () => {
      await logout();
      useAuthStore.setState({ user: null, firebaseUser: null, isLoading: false });
      navigate('/', { replace: true });
    },
    resetPassword,
  };
};

const ERR = (msg = '') => {
  if (msg.includes('email-already-in-use')) return 'Email already registered.';
  if (msg.includes('user-not-found'))       return 'No account with this email.';
  if (msg.includes('wrong-password'))       return 'Wrong password.';
  if (msg.includes('invalid-credential'))   return 'Wrong email or password.';
  if (msg.includes('weak-password'))        return 'Password needs 6+ characters.';
  if (msg.includes('invalid-email'))        return 'Invalid email address.';
  if (msg.includes('popup-closed'))         return 'Sign-in cancelled.';
  if (msg.includes('popup-blocked'))        return 'Allow popups for this site.';
  if (msg.includes('too-many-requests'))    return 'Too many attempts. Try later.';
  if (msg.includes('cancelled-popup'))      return 'Sign-in cancelled.';
  return msg || 'Authentication failed.';
};