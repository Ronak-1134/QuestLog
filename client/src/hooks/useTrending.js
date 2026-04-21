import { useQuery } from '@tanstack/react-query';
import api          from '@/lib/axios.js';

export const useTrending = (limit = 20) =>
  useQuery({
    queryKey: ['trending', limit],
    queryFn:  async () => {
      const { data } = await api.get('/games/trending', { params: { limit } });
      return data.data;
    },
    staleTime: 1000 * 60 * 30,
  });