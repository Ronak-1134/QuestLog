import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore }     from '@/store/auth.store.js';
import { useDashboardStore } from '@/store/dashboard.store.js';
import api                  from '@/lib/axios.js';

export const useLibrary = (filters = {}) => {
  const { user }          = useAuthStore();
  const { optimisticUpdates } = useDashboardStore();

  const query = useQuery({
    queryKey: ['library', user?._id, filters],
    queryFn:  async () => {
      const params = new URLSearchParams(filters).toString();
      const { data } = await api.get(`/users/${user._id}/library?${params}`);
      return data;
    },
    enabled:   Boolean(user?._id),
    staleTime: 1000 * 60 * 2,
    select: (raw) => ({
      ...raw,
      // Merge optimistic updates into each item
      data: raw.data?.map((item) =>
        optimisticUpdates[item._id]
          ? { ...item, ...optimisticUpdates[item._id] }
          : item
      ),
    }),
  });

  return query;
};

export const useUpdateGame = () => {
  const { user }          = useAuthStore();
  const queryClient       = useQueryClient();
  const { applyOptimistic, clearOptimistic, addNotification } =
    useDashboardStore();

  return useMutation({
    // Optimistic update fires immediately
    onMutate: async ({ userGameId, updates }) => {
      await queryClient.cancelQueries(['library', user?._id]);
      applyOptimistic(userGameId, updates);
      return { userGameId };
    },

    mutationFn: async ({ userGameId, updates }) => {
      const { data } = await api.patch(
        `/users/${user._id}/game/${userGameId}`,
        updates
      );
      return data.data;
    },

    onSuccess: (data, { userGameId }) => {
      clearOptimistic(userGameId);
      queryClient.invalidateQueries(['library',   user?._id]);
      queryClient.invalidateQueries(['backlog',   user?._id]);
      queryClient.invalidateQueries(['userStats', user?._id]);
      queryClient.invalidateQueries(['pileOfShame', user?._id]);
    },

    onError: (_err, { userGameId }) => {
      clearOptimistic(userGameId);
      addNotification({ type: 'error', message: 'Update failed — please try again.' });
    },
  });
};