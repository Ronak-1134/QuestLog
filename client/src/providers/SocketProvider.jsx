import { useEffect }     from 'react';
import { useAuthStore }  from '@/store/auth.store.js';

export const SocketProvider = ({ children }) => {
  const { firebaseUser } = useAuthStore();

  useEffect(() => {
    if (!firebaseUser?.uid) return;

    // Lazy import so socket doesn't initialize until needed
    let cleanup = () => {};

    import('@/lib/socket.js').then(({ connectSocket, disconnectSocket }) => {
      connectSocket(firebaseUser.uid);
      cleanup = disconnectSocket;
    });

    return () => cleanup();
  }, [firebaseUser?.uid]);

  return children;
};