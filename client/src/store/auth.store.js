import { create }   from 'zustand';
import { persist, devtools } from 'zustand/middleware';

export const useAuthStore = create(
  devtools(
    persist(
      (set, get) => ({
        user:         null,
        firebaseUser: null,
        isLoading:    true,
        isHydrated:   false,

        setFirebaseUser: (firebaseUser) => set({ firebaseUser }),
        setUser:         (user)         => set({ user }),
        setLoading:      (isLoading)    => set({ isLoading }),

        clearAuth: () =>
          set({ user: null, firebaseUser: null, isLoading: false }),

        isAuthenticated: () => Boolean(get().firebaseUser),
      }),
      {
        name: 'questlog-auth',
        partialize: (state) => ({ user: state.user }),
        onRehydrateStorage: () => (state) => {
          if (state) {
            state.isLoading  = false;
            state.isHydrated = true;
          }
        },
      }
    ),
    { name: 'AuthStore' }
  )
);