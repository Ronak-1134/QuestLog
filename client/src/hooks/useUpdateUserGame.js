import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore }  from '@/store/auth.store.js';
import api               from '@/lib/axios.js';

export const useUpdateUserGame = () => {
  const { user }    = useAuthStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userGameId, updates }) => {
      const { data } = await api.patch(
        `/users/${user._id}/game/${userGameId}`,
        updates
      );
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['library',  user?._id]);
      queryClient.invalidateQueries(['backlog',  user?._id]);
      queryClient.invalidateQueries(['userStats', user?._id]);
    },
  });
};