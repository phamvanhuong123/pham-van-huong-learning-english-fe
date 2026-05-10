import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

type Role = 'STANDARD' | 'VIP' | 'ADMIN';

interface User {
  id: string;
  email: string;
  name?: string | null;
  role: Role;
  avatarUrl?: string | null;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  setAuth: (user: User, accessToken: string) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null, // Không persist token này vào storage
      setAuth: (user, accessToken) => set({ user, accessToken }),
      clearAuth: () => set({ user: null, accessToken: null }),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ user: state.user }), // Chỉ persist thông tin user
    }
  )
);
