import { useEffect, useRef } from 'react';
import { useAuthStore }      from '@/store/auth.store.js';
import { subscribeToAuthState } from '@/services/auth.service.js';

export const AuthProvider = ({ children }) => {
  const { setFirebaseUser, setUser, setLoading, clearAuth } = useAuthStore();
  const didInit = useRef(false);

  useEffect(() => {
    if (didInit.current) return;
    didInit.current = true;

    const unsubscribe = subscribeToAuthState(async (firebaseUser) => {
      if (firebaseUser) {
        setFirebaseUser(firebaseUser);
        try {
          const api = (await import('@/lib/axios.js')).default;
          const { data } = await api.get('/auth/me');
          setUser(data.data);
        } catch {
          // backend not running yet — that's ok
          setUser(null);
        }
      } else {
        clearAuth();
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return children;
};