import { create }   from 'zustand';
import { devtools } from 'zustand/middleware';

export const useDashboardStore = create(
  devtools(
    (set, get) => ({
      // Live stat updates pushed from socket
      liveStats: {},      // { [igdbId]: statsObject }

      // Optimistic library mutations
      optimisticUpdates: {},   // { [userGameId]: partialUpdate }

      setLiveStats: (igdbId, stats) =>
        set((s) => ({ liveStats: { ...s.liveStats, [igdbId]: stats } })),

      applyOptimistic: (userGameId, update) =>
        set((s) => ({
          optimisticUpdates: {
            ...s.optimisticUpdates,
            [userGameId]: { ...s.optimisticUpdates[userGameId], ...update },
          },
        })),

      clearOptimistic: (userGameId) =>
        set((s) => {
          const next = { ...s.optimisticUpdates };
          delete next[userGameId];
          return { optimisticUpdates: next };
        }),

      // Notification queue for in-app toasts
      notifications: [],
      addNotification: (msg) =>
        set((s) => ({
          notifications: [
            ...s.notifications,
            { id: Date.now(), ...msg },
          ],
        })),
      dismissNotification: (id) =>
        set((s) => ({
          notifications: s.notifications.filter((n) => n.id !== id),
        })),
    }),
    { name: 'DashboardStore' }
  )
);