import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import type { Permission, Role } from '@nafi/rbac-core';

export interface AuthUser {
  id: string;
  nafiId: string;
  email: string;
  fullName: string;
  firstName?: string;
  lastName?: string;
  role: Role;
  institutionId?: string;
  institutionName?: string;
  permissions: Permission[];
  scopes?: Record<string, string[]>;
  locale: 'en' | 'am' | 'om' | 'ti';
  mfaEnabled: boolean;
  avatarUrl?: string;
}

interface AuthState {
  user: AuthUser | null;
  isLoading: boolean;
  hydrated: boolean;
  setUser: (user: AuthUser | null) => void;
  setLoading: (loading: boolean) => void;
  setHydrated: (hydrated: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isLoading: true,
      hydrated: false,
      setUser: (user) => set({ user }),
      setLoading: (isLoading) => set({ isLoading }),
      setHydrated: (hydrated) => set({ hydrated }),
      logout: () => set({ user: null }),
    }),
    {
      name: 'nafi.auth',
      partialize: (state) => ({ user: state.user }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
      },
    },
  ),
);
