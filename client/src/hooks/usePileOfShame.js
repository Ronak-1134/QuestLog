import { useQuery }    from '@tanstack/react-query';
import { useAuthStore } from '@/store/auth.store.js';
import api              from '@/lib/axios.js';

export const usePileOfShame = () => {
  const { user } = useAuthStore();
  return useQuery({
    queryKey: ['pileOfShame', user?._id],
    queryFn:  async () => {
      const { data } = await api.get('/stats/shame');
      return data.data;
    },
    enabled:   Boolean(user?._id),
    staleTime: 1000 * 60 * 10,
  });
};