import { useEffect, useRef } from 'react';
import { useAuthStore }      from '@/store/auth.store.js';
import { subscribeToAuthState } from '@/services/auth.service.js';

const buildProfile = (fu) => ({
  uid:      fu.uid,
  email:    fu.email,
  username: fu.displayName ?? fu.email?.split('@')[0] ?? 'player',
  avatar:   fu.photoURL ?? null,
  stats:    { totalGames: 0, completedGames: 0, totalHours: 0, avgCompletion: 0 },
});

export const AuthProvider = ({ children }) => {
  const { setFirebaseUser, setUser, setLoading, clearAuth } = useAuthStore();
  const init = useRef(false);

  useEffect(() => {
    if (init.current) return;
    init.current = true;

    const unsub = subscribeToAuthState(async (fu) => {
      if (fu) {
        setFirebaseUser(fu);
        const basic = buildProfile(fu);
        try {
          const api = (await import('@/lib/axios.js')).default;
          const { data } = await api.post('/auth/register', {
            uid: fu.uid, email: fu.email,
            username: basic.username, avatar: basic.avatar,
          });
          setUser(data.data ?? basic);
        } catch { setUser(basic); }
      } else {
        clearAuth();
      }
      setLoading(false);
    });

    return () => unsub();
  }, []);

  return children;
};