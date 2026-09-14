import { AuthProvider as UIAuthProvider, type AuthContextValue } from '@nafi/ui-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useMemo, type ReactNode } from 'react';

import { authApi } from './api';
import { useAuthStore } from './authStore';
import { tokenStore } from './tokenStore';

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const queryClient = useQueryClient();
  const { user, setUser, isLoading, setLoading } = useAuthStore();

  useQuery({
    queryKey: ['auth', 'me'],
    queryFn: async () => {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_BASE_URL ?? '/api/v1'}/auth/refresh`,
          {
            method: 'POST',
            credentials: 'include',
            headers: { Accept: 'application/json' },
          },
        );
        if (res.ok) {
          const json = (await res.json()) as { data: { accessToken: string } };
          tokenStore.set(json.data.accessToken);
        }
      } catch {
        /* ignore — user just isn't logged in */
      }

      const me = await authApi.me();
      setUser(me);
      return me;
    },
    retry: false,
    staleTime: Infinity,
    enabled: !user,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    const handler = () => {
      tokenStore.clear();
      setUser(null);
      queryClient.clear();
      window.location.href = '/login';
    };
    window.addEventListener('nafi:logout', handler);
    return () => window.removeEventListener('nafi:logout', handler);
  }, [queryClient, setUser]);

  useEffect(() => {
    setLoading(false);
  }, [setLoading]);

  const value: AuthContextValue = useMemo(
    () => ({
      user,
      isLoading,
      isAuthenticated: Boolean(user),
    }),
    [user, isLoading],
  );

  return <UIAuthProvider value={value}>{children}</UIAuthProvider>;
}

export function useAuthActions() {
  const queryClient = useQueryClient();
  const { setUser } = useAuthStore();

  return {
    async login(payload: Parameters<typeof authApi.login>[0]) {
      const result = await authApi.login(payload);
      tokenStore.set(result.accessToken);
      setUser(result.user);
      await queryClient.invalidateQueries();
      return result;
    },

    async logout() {
      try {
        await authApi.logout();
      } catch {
        /* best-effort */
      }
      tokenStore.clear();
      setUser(null);
      queryClient.clear();
    },

    async register(payload: Parameters<typeof authApi.register>[0]) {
      return authApi.register(payload);
    },
  };
}
