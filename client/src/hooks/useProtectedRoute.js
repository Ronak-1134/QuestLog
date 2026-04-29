import { useEffect }    from 'react';
import { useNavigate }  from 'react-router-dom';
import { useAuthStore } from '@/store/auth.store.js';

export const useProtectedRoute = (redirectTo = '/auth/login') => {
  const { firebaseUser, isLoading } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    // Only redirect if BOTH loading is done AND no firebase user
    if (!isLoading && !firebaseUser) {
      navigate(redirectTo, { replace: true });
    }
  }, [firebaseUser, isLoading, redirectTo]);

  return { isLoading, isAuthenticated: Boolean(firebaseUser) };
};