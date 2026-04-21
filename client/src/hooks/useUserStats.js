import { useQuery }    from '@tanstack/react-query';
import { useAuthStore } from '@/store/auth.store.js';
import api              from '@/lib/axios.js';

export const useUserStats = () => {
  const { user } = useAuthStore();
  return useQuery({
    queryKey: ['userStats', user?._id],
    queryFn:  async () => {
      const { data } = await api.get('/stats/breakdown');
      return data.data;
    },
    enabled:   Boolean(user?._id),
    staleTime: 1000 * 60 * 5,
  });
};