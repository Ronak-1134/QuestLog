import { useEffect }        from 'react';
import { useQueryClient }   from '@tanstack/react-query';
import socket               from '@/lib/socket.js';
import { useDashboardStore } from '@/store/dashboard.store.js';

export const useLiveStats = (igdbId) => {
  const queryClient = useQueryClient();
  const setLiveStats = useDashboardStore((s) => s.setLiveStats);

  useEffect(() => {
    if (!igdbId) return;

    const event = `game:${igdbId}:stats`;

    const handler = (stats) => {
      // 1. Push into Zustand for instant access
      setLiveStats(igdbId, stats);

      // 2. Invalidate React Query cache so any component
      //    subscribed to this query refetches
      queryClient.setQueryData(['gameStats', igdbId], stats);
    };

    socket.on(event, handler);
    return () => socket.off(event, handler);
  }, [igdbId, queryClient, setLiveStats]);
};