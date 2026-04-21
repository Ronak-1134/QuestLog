import { useState }          from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore }      from '@/store/auth.store.js';
import { useDashboardStore } from '@/store/dashboard.store.js';
import api                   from '@/lib/axios.js';

export const useSteamSync = () => {
  const { user, setUser }   = useAuthStore();
  const queryClient         = useQueryClient();
  const { addNotification } = useDashboardStore();
  const [progress, setProgress] = useState(null);

  const { mutate, isLoading, data, error, reset } = useMutation({
    mutationFn: async (steamId) => {
      setProgress('Resolving Steam ID…');
      const { data } = await api.post('/steam/sync', { steamId });
      return data.data;
    },
    onSuccess: async (result) => {
      setProgress(null);

      // Refresh user profile to get updated steam metadata
      const me = await api.get('/auth/me');
      setUser(me.data.data);

      // Invalidate all library/backlog queries
      queryClient.invalidateQueries(['library']);
      queryClient.invalidateQueries(['backlog']);
      queryClient.invalidateQueries(['userStats']);
      queryClient.invalidateQueries(['pileOfShame']);

      addNotification({
        type:    'success',
        message: `Synced ${result.synced} games from Steam.`,
      });
    },
    onError: (err) => {
      setProgress(null);
      addNotification({ type: 'error', message: err.message });
    },
  });

  return { sync: mutate, isLoading, progress, data, error, reset };
};