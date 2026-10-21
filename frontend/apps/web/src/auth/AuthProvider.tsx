import { AuthProvider as UIAuthProvider, type AuthContextValue } from '@nafi/ui-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useMemo, useRef, type ReactNode } from 'react';

import { clearUser, identifyUser } from '@/observability/sentry';
import { clearOfflineData } from '@/offline/db';
import { authApi } from './api';
import { useAuthStore } from './authStore';
import { tokenStore } from './tokenStore';

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const queryClient = useQueryClient();
  const { user, setUser, isLoading, setLoading } = useAuthStore();
  const hasAttemptedRefresh = useRef(false);

  useQuery({
    queryKey: ['auth', 'me'],
    queryFn: async () => {
      // Only attempt refresh once on initial load if no access token exists
      const hasAccessToken = tokenStore.get() !== null;
      
      if (!hasAccessToken && !hasAttemptedRefresh.current) {
        hasAttemptedRefresh.current = true;
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
          } else if (res.status === 429) {
            // Rate limited - wait and retry once
            await new Promise(resolve => setTimeout(resolve, 2000));
            const retryRes = await fetch(
              `${import.meta.env.VITE_API_BASE_URL ?? '/api/v1'}/auth/refresh`,
              {
                method: 'POST',
                credentials: 'include',
                headers: { Accept: 'application/json' },
              },
            );
            if (retryRes.ok) {
              const json = (await retryRes.json()) as { data: { accessToken: string } };
              tokenStore.set(json.data.accessToken);
            }
          }
        } catch {
          /* ignore — user just isn't logged in */
        }
      }

      // If still no token after refresh attempt, return null (not authenticated)
      if (!tokenStore.get()) {
        return null;
      }

      try {
        const me = await authApi.me();
        const userWithFullName = {
          ...me,
          fullName: me.fullName ?? `${me.firstName ?? ''} ${me.lastName ?? ''}`.trim(),
        };
        setUser(userWithFullName);
        return userWithFullName;
      } catch (error: any) {
        // Handle 429 specifically
        if (error?.response?.status === 429) {
          console.warn('Rate limited when fetching user profile. Please wait.');
          return null;
        }
        // For auth errors (401/403), clear tokens and return null
        if (error?.response?.status === 401 || error?.response?.status === 403) {
          tokenStore.clear();
          return null;
        }
        throw error;
      }
    },
    retry: (failureCount, error: any) => {
      // Don't retry on auth errors or rate limits
      if (error?.response?.status === 401 || error?.response?.status === 403) {
        return false;
      }
      if (error?.response?.status === 429) {
        return false;
      }
      return failureCount < 2;
    },
    staleTime: Infinity,
    enabled: !user && !isLoading,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
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

  useEffect(() => {
    if (user) {
      identifyUser({ id: user.id, role: user.role, institutionId: user.institutionId });
    } else {
      clearUser();
    }
  }, [user]);

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
      const userWithFullName = {
        ...result.user,
        fullName: result.user.fullName ?? `${result.user.firstName ?? ''} ${result.user.lastName ?? ''}`.trim(),
      };
      tokenStore.set(result.accessToken);
      setUser(userWithFullName);
      await queryClient.invalidateQueries();
      return { ...result, user: userWithFullName };
    },

    async logout() {
      const userId = useAuthStore.getState().user?.id;
      try {
        await authApi.logout();
      } catch {
        /* best-effort */
      }
      if (userId) {
        try {
          await clearOfflineData(userId);
        } catch {
          /* best-effort */
        }
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
