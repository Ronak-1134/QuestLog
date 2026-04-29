import { useEffect }   from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/auth.store.js';
import { Loader }       from '@/components/ui/Loader.jsx';

export const AuthGuard = ({ children }) => {
  const { firebaseUser, isLoading } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !firebaseUser) navigate('/auth/login', { replace: true });
  }, [firebaseUser, isLoading]);

  if (isLoading) return <Loader fullscreen />;
  if (!firebaseUser) return null;
  return children;
};