import { create } from 'zustand';
import { persist, devtools } from 'zustand/middleware';

export const useAuthStore = create(
  devtools(
    persist(
      (set, get) => ({
        user:         null,
        firebaseUser: null,
        isLoading:    true,
        isHydrated:   false,

        setFirebaseUser: (fu)  => set({ firebaseUser: fu }),
        setUser:         (u)   => set({ user: u }),
        setLoading:      (v)   => set({ isLoading: v }),
        clearAuth:       ()    => set({ user: null, firebaseUser: null, isLoading: false }),
        isAuthenticated: ()    => Boolean(get().firebaseUser),
      }),
      {
        name: 'questlog-auth',
        partialize: (s) => ({ user: s.user }),
        onRehydrateStorage: () => (s) => {
          if (s) { s.isLoading = false; s.isHydrated = true; }
        },
      }
    ),
    { name: 'AuthStore' }
  )
);