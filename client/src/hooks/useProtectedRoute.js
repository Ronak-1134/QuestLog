import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/auth.store.js';

export const useProtectedRoute = (redirectTo = '/auth/login') => {
  const { firebaseUser, isLoading } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !firebaseUser) {
      navigate(redirectTo, { replace: true });
    }
  }, [firebaseUser, isLoading]);

  return { isLoading, isAuthenticated: Boolean(firebaseUser) };
};