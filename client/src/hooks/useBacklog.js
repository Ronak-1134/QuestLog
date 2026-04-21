import { useQuery }    from '@tanstack/react-query';
import { useAuthStore } from '@/store/auth.store.js';
import api              from '@/lib/axios.js';

export const useBacklog = () => {
  const { user } = useAuthStore();
  return useQuery({
    queryKey: ['backlog', user?._id],
    queryFn:  async () => {
      const { data } = await api.get(`/users/${user._id}/backlog`);
      return data.data;
    },
    enabled:   Boolean(user?._id),
    staleTime: 1000 * 60 * 2,
  });
};