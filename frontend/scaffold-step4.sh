#!/usr/bin/env bash
# ============================================================
# NAFI Frontend — Step 4 Scaffolding Script
# Creates apps/web — the authenticated application shell:
#   - Vite + React + Router + TanStack Query setup
#   - Auth flow: login, register, forgot/reset password
#   - Secure token handling (memory + httpOnly refresh cookie)
#   - Role-aware routing for all 12 roles
#   - DashboardLayout with sidebar
#   - Placeholder pages for every route
#   - Toast system
# ============================================================
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "▶ NAFI Step 4 scaffolding → $SCRIPT_DIR"

mkfile() {
  local path="$1"
  mkdir -p "$(dirname "$path")"
  cat > "$path"
  echo "  ✓ $path"
}

APP="apps/web"
mkdir -p "$APP/src"
mkdir -p "$APP/public"

# ============================================================
# APP SETUP
# ============================================================

mkfile "$APP/package.json" <<'EOF'
{
  "name": "@nafi/web",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite --port 3000",
    "build": "tsc -b && vite build",
    "preview": "vite preview --port 3000",
    "typecheck": "tsc --noEmit",
    "lint": "eslint src --ext .ts,.tsx"
  },
  "dependencies": {
    "@hookform/resolvers": "^3.9.0",
    "@nafi/api-client": "workspace:*",
    "@nafi/design-tokens": "workspace:*",
    "@nafi/formatters": "workspace:*",
    "@nafi/i18n": "workspace:*",
    "@nafi/rbac-core": "workspace:*",
    "@nafi/ui-react": "workspace:*",
    "@nafi/validators": "workspace:*",
    "@tanstack/react-query": "^5.59.15",
    "@tanstack/react-query-devtools": "^5.59.15",
    "axios": "^1.7.7",
    "i18next": "^23.16.0",
    "i18next-browser-languagedetector": "^8.0.0",
    "lucide-react": "^0.453.0",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "react-helmet-async": "^2.0.5",
    "react-hook-form": "^7.53.1",
    "react-i18next": "^15.1.0",
    "react-router-dom": "^6.27.0",
    "zod": "^3.23.8",
    "zustand": "^5.0.1"
  },
  "devDependencies": {
    "@types/react": "^18.3.11",
    "@types/react-dom": "^18.3.1",
    "@vitejs/plugin-react": "^4.3.2",
    "autoprefixer": "^10.4.20",
    "postcss": "^8.4.47",
    "tailwindcss": "^3.4.14",
    "typescript": "^5.6.3",
    "vite": "^5.4.10"
  }
}
EOF

mkfile "$APP/vite.config.ts" <<'EOF'
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import path from 'node:path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: process.env.VITE_API_PROXY ?? 'http://localhost:4000',
        changeOrigin: true,
      },
    },
  },
  build: {
    target: 'es2022',
    sourcemap: false,
    minify: 'esbuild',
    rollupOptions: {
      output: {
        manualChunks: {
          react: ['react', 'react-dom', 'react-router-dom'],
          query: ['@tanstack/react-query', 'axios'],
          i18n: ['i18next', 'react-i18next', 'i18next-browser-languagedetector'],
          form: ['react-hook-form', '@hookform/resolvers', 'zod'],
          icons: ['lucide-react'],
        },
      },
    },
    chunkSizeWarningLimit: 250,
  },
});
EOF

mkfile "$APP/tailwind.config.js" <<'EOF'
import preset from '@nafi/config/tailwind';

export default {
  presets: [preset],
  content: [
    './index.html',
    './src/**/*.{ts,tsx}',
    '../../packages/ui-react/src/**/*.{ts,tsx}',
  ],
};
EOF

mkfile "$APP/postcss.config.js" <<'EOF'
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
EOF

mkfile "$APP/tsconfig.json" <<'EOF'
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "jsx": "react-jsx",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "types": ["vite/client"],
    "baseUrl": ".",
    "paths": { "@/*": ["./src/*"] },
    "noEmit": true
  },
  "include": ["src/**/*"]
}
EOF

mkfile "$APP/index.html" <<'EOF'
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="theme-color" content="#16A34A" />
    <meta name="robots" content="noindex,nofollow" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Noto+Sans+Ethiopic:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap"
      rel="stylesheet"
    />
    <title>NAFI</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
EOF

mkfile "$APP/.env.example" <<'EOF'
VITE_API_BASE_URL=/api/v1
VITE_APP_ENV=development
VITE_APP_VERSION=1.0.0
VITE_LANDING_URL=http://localhost:3001
VITE_ENABLE_QUERY_DEVTOOLS=true
EOF

mkfile "$APP/public/favicon.svg" <<'EOF'
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" fill="none">
  <rect width="32" height="32" rx="6" fill="#16A34A"/>
  <path d="M9 24V8h3.2l7.6 10.4V8H23v16h-3.2L12.2 13.6V24H9z" fill="white"/>
</svg>
EOF

# ============================================================
# STYLES
# ============================================================

mkfile "$APP/src/styles/globals.css" <<'EOF'
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  html {
    font-family: theme('fontFamily.sans');
    -webkit-font-smoothing: antialiased;
  }

  body {
    @apply bg-neutral-50 text-neutral-900;
  }

  *:focus-visible {
    @apply outline-none ring-2 ring-brand-500 ring-offset-2;
  }
}

@layer utilities {
  .container-app {
    @apply mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8;
  }
}
EOF

# ============================================================
# i18n
# ============================================================

mkfile "$APP/src/i18n/index.ts" <<'EOF'
import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { initReactI18next } from 'react-i18next';

import amAuth from '@nafi/i18n/locales/am/auth.json';
import amCommon from '@nafi/i18n/locales/am/common.json';
import amNav from '@nafi/i18n/locales/am/nav.json';
import enAuth from '@nafi/i18n/locales/en/auth.json';
import enCommon from '@nafi/i18n/locales/en/common.json';
import enNav from '@nafi/i18n/locales/en/nav.json';
import omAuth from '@nafi/i18n/locales/om/auth.json';
import omCommon from '@nafi/i18n/locales/om/common.json';
import omNav from '@nafi/i18n/locales/om/nav.json';
import tiAuth from '@nafi/i18n/locales/ti/auth.json';
import tiCommon from '@nafi/i18n/locales/ti/common.json';
import tiNav from '@nafi/i18n/locales/ti/nav.json';
import { DEFAULT_LOCALE, SUPPORTED_LOCALES } from '@nafi/i18n';

void i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { common: enCommon, auth: enAuth, nav: enNav },
      am: { common: amCommon, auth: amAuth, nav: amNav },
      om: { common: omCommon, auth: omAuth, nav: omNav },
      ti: { common: tiCommon, auth: tiAuth, nav: tiNav },
    },
    fallbackLng: DEFAULT_LOCALE,
    supportedLngs: SUPPORTED_LOCALES as unknown as string[],
    defaultNS: 'common',
    ns: ['common', 'auth', 'nav'],
    interpolation: { escapeValue: false },
    detection: {
      order: ['localStorage', 'navigator'],
      lookupLocalStorage: 'nafi.locale',
      caches: ['localStorage'],
    },
  });

export default i18n;
EOF

# ============================================================
# AUTH LAYER
# ============================================================

mkfile "$APP/src/auth/tokenStore.ts" <<'EOF'
/**
 * Access token is kept ONLY in memory — never in localStorage or sessionStorage.
 * Refresh token lives in an httpOnly cookie set by the API.
 * This file is the single source of truth for the access token at runtime.
 */

let accessToken: string | null = null;

export const tokenStore = {
  get: () => accessToken,
  set: (token: string | null) => {
    accessToken = token;
  },
  clear: () => {
    accessToken = null;
  },
};
EOF

mkfile "$APP/src/auth/authStore.ts" <<'EOF'
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import type { Permission, Role } from '@nafi/rbac-core';

export interface AuthUser {
  id: string;
  nafiId: string;
  email: string;
  fullName: string;
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
EOF

mkfile "$APP/src/auth/api.ts" <<'EOF'
import { createApiClient } from '@nafi/api-client';

import { tokenStore } from './tokenStore';

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '/api/v1';

/**
 * Single shared API client.
 *  - Attaches access token from memory
 *  - On 401, attempts refresh via httpOnly cookie, then retries once
 *  - On refresh failure, dispatches a global logout event
 */
export const apiClient = createApiClient({
  baseURL: BASE_URL,
  clientVersion: import.meta.env.VITE_APP_VERSION ?? '1.0.0',
  getAccessToken: () => tokenStore.get(),
  onUnauthorized: () => {
    tokenStore.clear();
    window.dispatchEvent(new CustomEvent('nafi:logout'));
  },
  onRefreshToken: async () => {
    const res = await fetch(`${BASE_URL}/auth/refresh`, {
      method: 'POST',
      credentials: 'include',
      headers: { Accept: 'application/json' },
    });
    if (!res.ok) throw new Error('Refresh failed');
    const json = (await res.json()) as { data: { accessToken: string } };
    tokenStore.set(json.data.accessToken);
    return json.data.accessToken;
  },
});

export interface LoginRequest {
  email: string;
  password: string;
  mfaCode?: string;
}

export interface LoginResponse {
  accessToken: string;
  user: import('./authStore').AuthUser;
  mfaRequired?: boolean;
}

export interface RegisterRequest {
  role: string;
  fullName: string;
  email: string;
  phone: string;
  password: string;
  locale: 'en' | 'am' | 'om' | 'ti';
  acceptTerms: true;
}

export const authApi = {
  async login(payload: LoginRequest): Promise<LoginResponse> {
    const res = await apiClient.post<{ data: LoginResponse }>('/auth/login', payload);
    return res.data.data;
  },

  async register(payload: RegisterRequest): Promise<{ userId: string }> {
    const res = await apiClient.post<{ data: { userId: string } }>('/auth/register', payload);
    return res.data.data;
  },

  async me(): Promise<import('./authStore').AuthUser> {
    const res = await apiClient.get<{ data: import('./authStore').AuthUser }>('/auth/me');
    return res.data.data;
  },

  async logout(): Promise<void> {
    await apiClient.post('/auth/logout');
  },

  async requestPasswordReset(email: string): Promise<void> {
    await apiClient.post('/auth/password/forgot', { email });
  },

  async confirmPasswordReset(token: string, password: string): Promise<void> {
    await apiClient.post('/auth/password/reset', { token, password });
  },

  async verifyMfa(code: string): Promise<{ accessToken: string }> {
    const res = await apiClient.post<{ data: { accessToken: string } }>('/auth/mfa/verify', {
      code,
    });
    return res.data.data;
  },
};
EOF

mkfile "$APP/src/auth/AuthProvider.tsx" <<'EOF'
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
EOF

mkfile "$APP/src/auth/useAuth.ts" <<'EOF'
import { useAuth as useUIAuth } from '@nafi/ui-react';

export const useAuth = useUIAuth;

export function useRequiredUser() {
  const { user } = useUIAuth();
  if (!user) throw new Error('useRequiredUser called outside authenticated route');
  return user;
}
EOF

# ============================================================
# QUERY CLIENT
# ============================================================

mkfile "$APP/src/app/queryClient.ts" <<'EOF'
import { QueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      gcTime: 5 * 60_000,
      refetchOnWindowFocus: false,
      retry: (failureCount, error) => {
        if (error instanceof AxiosError && error.response) {
          const status = error.response.status;
          if (status >= 400 && status < 500) return false;
        }
        return failureCount < 2;
      },
    },
    mutations: {
      retry: 0,
    },
  },
});
EOF

# ============================================================
# PROVIDERS
# ============================================================

mkfile "$APP/src/app/providers/AppProviders.tsx" <<'EOF'
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { HelmetProvider } from 'react-helmet-async';
import type { ReactNode } from 'react';
import { I18nextProvider } from 'react-i18next';

import { ToastProvider } from '@/components/ToastProvider';
import i18n from '@/i18n';

import { AuthProvider } from '../../auth/AuthProvider';
import { queryClient } from '../queryClient';

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <HelmetProvider>
      <I18nextProvider i18n={i18n}>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <ToastProvider>{children}</ToastProvider>
          </AuthProvider>
          {import.meta.env.VITE_ENABLE_QUERY_DEVTOOLS === 'true' && (
            <ReactQueryDevtools initialIsOpen={false} position="bottom" />
          )}
        </QueryClientProvider>
      </I18nextProvider>
    </HelmetProvider>
  );
}
EOF

mkfile "$APP/src/components/ToastProvider.tsx" <<'EOF'
import * as RadixToast from '@radix-ui/react-toast';
import { X } from 'lucide-react';
import { createContext, useCallback, useContext, useState, type ReactNode } from 'react';

import { cn } from '@nafi/ui-react';

export interface ToastMessage {
  id: string;
  title: string;
  description?: string;
  variant?: 'default' | 'success' | 'error' | 'warning' | 'info';
}

interface ToastContextValue {
  toast: (message: Omit<ToastMessage, 'id'>) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const variantStyles = {
  default: 'border-neutral-200 bg-white text-neutral-900',
  success: 'border-success/30 bg-success-light text-success-dark',
  error: 'border-danger/30 bg-danger-light text-danger-dark',
  warning: 'border-warning/30 bg-warning-light text-warning-dark',
  info: 'border-info/30 bg-info-light text-info-dark',
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [messages, setMessages] = useState<ToastMessage[]>([]);

  const toast = useCallback((message: Omit<ToastMessage, 'id'>) => {
    const id = Math.random().toString(36).slice(2);
    setMessages((prev) => [...prev, { id, ...message }]);
  }, []);

  const dismiss = (id: string) => setMessages((prev) => prev.filter((m) => m.id !== id));

  return (
    <ToastContext.Provider value={{ toast }}>
      <RadixToast.Provider swipeDirection="right">
        {children}

        {messages.map((m) => (
          <RadixToast.Root
            key={m.id}
            open
            onOpenChange={(open) => !open && dismiss(m.id)}
            duration={5000}
            className={cn(
              'flex items-start gap-3 rounded-md border p-4 shadow-dropdown',
              variantStyles[m.variant ?? 'default'],
            )}
          >
            <div className="flex-1">
              <RadixToast.Title className="text-sm font-medium">{m.title}</RadixToast.Title>
              {m.description && (
                <RadixToast.Description className="mt-0.5 text-xs opacity-80">
                  {m.description}
                </RadixToast.Description>
              )}
            </div>
            <RadixToast.Close aria-label="Dismiss">
              <X className="h-4 w-4 opacity-60 hover:opacity-100" />
            </RadixToast.Close>
          </RadixToast.Root>
        ))}

        <RadixToast.Viewport className="fixed bottom-4 right-4 z-toast flex w-96 max-w-[calc(100vw-2rem)] flex-col gap-2 outline-none" />
      </RadixToast.Provider>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within <ToastProvider>');
  return ctx;
}
EOF

# ============================================================
# AUTH PAGES
# ============================================================

mkfile "$APP/src/features/auth/layouts/AuthLayout.tsx" <<'EOF'
import { Outlet, Link } from 'react-router-dom';

export function AuthLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-brand-50 via-white to-accent-50">
      <header className="container-app flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded bg-brand-500 text-white">
            <span className="font-bold">N</span>
          </div>
          <span className="text-lg font-bold tracking-tight text-neutral-900">NAFI</span>
        </Link>
      </header>

      <main className="flex flex-1 items-center justify-center px-4 py-8">
        <Outlet />
      </main>

      <footer className="container-app py-6 text-center text-xs text-neutral-500">
        © {new Date().getFullYear()} NAFI. All rights reserved.
      </footer>
    </div>
  );
}
EOF

mkfile "$APP/src/features/auth/pages/LoginPage.tsx" <<'EOF'
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Link, useLocation, useNavigate } from 'react-router-dom';

import { ROLE_HOME } from '@nafi/rbac-core';
import { Button, Card, CardBody, Input } from '@nafi/ui-react';
import { loginSchema, type LoginInput } from '@nafi/validators';

import { useAuthActions } from '@/auth/AuthProvider';

export function LoginPage() {
  const { t } = useTranslation('auth');
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuthActions();
  const [mfaRequired, setMfaRequired] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    setServerError(null);
    try {
      const result = await login(values);
      if (result.mfaRequired) {
        setMfaRequired(true);
        return;
      }
      const redirect = (location.state as { from?: string } | null)?.from;
      const home = ROLE_HOME[result.user.role];
      navigate(redirect ?? home, { replace: true });
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { error?: { message?: string } } } })?.response?.data?.error
          ?.message ?? 'Unable to sign in. Please try again.';
      setServerError(message);
    }
  });

  return (
    <Card className="w-full max-w-md">
      <CardBody className="flex flex-col gap-6 p-8">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-900">{t('login.title')}</h1>
          <p className="mt-1 text-sm text-neutral-500">{t('login.subtitle')}</p>
        </div>

        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          <Input
            label={t('login.email')}
            type="email"
            autoComplete="email"
            error={form.formState.errors.email?.message}
            {...form.register('email')}
          />

          <Input
            label={t('login.password')}
            type="password"
            autoComplete="current-password"
            error={form.formState.errors.password?.message}
            {...form.register('password')}
          />

          {mfaRequired && (
            <Input
              label={t('login.mfaCode')}
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              {...form.register('mfaCode')}
            />
          )}

          {serverError && (
            <p
              className="rounded border border-danger/30 bg-danger-light/40 px-3 py-2 text-xs text-danger-dark"
              role="alert"
            >
              {serverError}
            </p>
          )}

          <div className="flex items-center justify-between text-xs">
            <Link to="/forgot-password" className="text-brand-600 hover:underline">
              {t('login.forgotPassword')}
            </Link>
          </div>

          <Button type="submit" loading={form.formState.isSubmitting} fullWidth>
            {t('login.submit')}
          </Button>
        </form>

        <p className="text-center text-xs text-neutral-500">
          {t('login.noAccount')}{' '}
          <Link to="/register" className="font-medium text-brand-600 hover:underline">
            {t('login.createAccount')}
          </Link>
        </p>
      </CardBody>
    </Card>
  );
}
EOF

mkfile "$APP/src/features/auth/pages/RegisterPage.tsx" <<'EOF'
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';

import { LOCALE_LABELS, SUPPORTED_LOCALES } from '@nafi/i18n';
import type { Role } from '@nafi/rbac-core';
import { Button, Card, CardBody, Checkbox, Input, Select } from '@nafi/ui-react';
import { registerSchema, type RegisterInput } from '@nafi/validators';

import { useAuthActions } from '@/auth/AuthProvider';

const ROLE_LABELS: Record<Role, string> = {
  DIASPORA_INVESTOR: 'Diaspora Investor',
  COMMERCIAL_BANK: 'Commercial Bank',
  DBE_OFFICER: 'Development Bank of Ethiopia',
  NAFA_OFFICER: 'NAFA Officer',
  INPUT_SUPPLIER: 'Input Supplier',
  COMMERCIAL_FARMER: 'Commercial Farmer',
  OFF_TAKER: 'Off-Taker / Buyer',
  GOVERNMENT_REGULATOR: 'Government Regulator',
  DONOR: 'Donor / Development Partner',
  NAFI_ADMIN: 'NAFI Administrator',
  COMPLIANCE_OFFICER: 'Compliance Officer',
  ARBITRATOR: 'Arbitrator',
};

const SELF_REGISTERABLE_ROLES: Role[] = [
  'DIASPORA_INVESTOR',
  'COMMERCIAL_FARMER',
  'INPUT_SUPPLIER',
  'OFF_TAKER',
  'COMMERCIAL_BANK',
];

export function RegisterPage() {
  const { t } = useTranslation('auth');
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { register: registerUser } = useAuthActions();
  const [serverError, setServerError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const initialRole = (params.get('role') as Role | null) ?? 'DIASPORA_INVESTOR';

  const form = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      role: initialRole,
      fullName: '',
      email: '',
      phone: '',
      password: '',
      locale: 'en',
      acceptTerms: true,
    },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    setServerError(null);
    try {
      await registerUser(values);
      setSuccess(true);
      setTimeout(() => navigate('/login'), 2500);
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { error?: { message?: string } } } })?.response?.data?.error
          ?.message ?? 'Unable to register. Please try again.';
      setServerError(message);
    }
  });

  if (success) {
    return (
      <Card className="w-full max-w-md">
        <CardBody className="flex flex-col items-center gap-3 p-8 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-success-light text-success-dark">
            ✓
          </div>
          <h1 className="text-xl font-semibold text-neutral-900">Check your email</h1>
          <p className="text-sm text-neutral-600">
            We sent a verification link to <strong>{form.getValues('email')}</strong>.
            Please verify your email to continue.
          </p>
          <Link to="/login" className="text-sm text-brand-600 hover:underline">
            Back to sign in
          </Link>
        </CardBody>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-lg">
      <CardBody className="flex flex-col gap-6 p-8">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-900">{t('register.title')}</h1>
        </div>

        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          <Controller
            control={form.control}
            name="role"
            render={({ field, fieldState }) => (
              <Select
                label={t('register.selectRole')}
                value={field.value}
                onValueChange={field.onChange}
                error={fieldState.error?.message}
                options={SELF_REGISTERABLE_ROLES.map((r) => ({
                  value: r,
                  label: ROLE_LABELS[r],
                }))}
              />
            )}
          />

          <Input
            label={t('register.fullName')}
            autoComplete="name"
            error={form.formState.errors.fullName?.message}
            {...form.register('fullName')}
          />

          <Input
            label={t('register.email')}
            type="email"
            autoComplete="email"
            error={form.formState.errors.email?.message}
            {...form.register('email')}
          />

          <Input
            label={t('register.phone')}
            autoComplete="tel"
            placeholder="+251 9..."
            error={form.formState.errors.phone?.message}
            {...form.register('phone')}
          />

          <Input
            label={t('register.password')}
            type="password"
            autoComplete="new-password"
            error={form.formState.errors.password?.message}
            {...form.register('password')}
          />

          <Controller
            control={form.control}
            name="locale"
            render={({ field }) => (
              <Select
                label={t('register.locale')}
                value={field.value}
                onValueChange={field.onChange}
                options={SUPPORTED_LOCALES.map((l) => ({
                  value: l,
                  label: LOCALE_LABELS[l],
                }))}
              />
            )}
          />

          <Controller
            control={form.control}
            name="acceptTerms"
            render={({ field, fieldState }) => (
              <Checkbox
                checked={field.value}
                onCheckedChange={(v) => field.onChange(Boolean(v))}
                label={t('register.acceptTerms')}
                error={fieldState.error?.message}
              />
            )}
          />

          {serverError && (
            <p
              className="rounded border border-danger/30 bg-danger-light/40 px-3 py-2 text-xs text-danger-dark"
              role="alert"
            >
              {serverError}
            </p>
          )}

          <Button type="submit" loading={form.formState.isSubmitting} fullWidth>
            {t('register.submit')}
          </Button>
        </form>

        <p className="text-center text-xs text-neutral-500">
          {t('register.haveAccount')}{' '}
          <Link to="/login" className="font-medium text-brand-600 hover:underline">
            {t('register.signIn')}
          </Link>
        </p>
      </CardBody>
    </Card>
  );
}
EOF

mkfile "$APP/src/features/auth/pages/ForgotPasswordPage.tsx" <<'EOF'
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { z } from 'zod';

import { Button, Card, CardBody, Input } from '@nafi/ui-react';

import { authApi } from '@/auth/api';

const schema = z.object({ email: z.string().email() });
type Input = z.infer<typeof schema>;

export function ForgotPasswordPage() {
  const form = useForm<Input>({ resolver: zodResolver(schema), defaultValues: { email: '' } });
  const [sent, setSent] = useState(false);

  const onSubmit = form.handleSubmit(async ({ email }) => {
    try {
      await authApi.requestPasswordReset(email);
    } catch {
      /* swallow — don't leak existence */
    }
    setSent(true);
  });

  return (
    <Card className="w-full max-w-md">
      <CardBody className="flex flex-col gap-5 p-8">
        <h1 className="text-2xl font-semibold text-neutral-900">Reset password</h1>

        {sent ? (
          <p className="text-sm text-neutral-600">
            If an account exists for that email, we sent a password reset link.
          </p>
        ) : (
          <form onSubmit={onSubmit} className="flex flex-col gap-4">
            <Input
              label="Email"
              type="email"
              autoComplete="email"
              error={form.formState.errors.email?.message}
              {...form.register('email')}
            />
            <Button type="submit" loading={form.formState.isSubmitting} fullWidth>
              Send reset link
            </Button>
          </form>
        )}

        <Link to="/login" className="text-center text-xs text-brand-600 hover:underline">
          Back to sign in
        </Link>
      </CardBody>
    </Card>
  );
}
EOF

mkfile "$APP/src/features/auth/pages/ResetPasswordPage.tsx" <<'EOF'
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { z } from 'zod';

import { Button, Card, CardBody, Input } from '@nafi/ui-react';

import { authApi } from '@/auth/api';

const schema = z
  .object({
    password: z.string().min(8).regex(/[A-Z]/).regex(/[a-z]/).regex(/\d/),
    confirm: z.string(),
  })
  .refine((v) => v.password === v.confirm, {
    path: ['confirm'],
    message: 'Passwords do not match',
  });

type Input = z.infer<typeof schema>;

export function ResetPasswordPage() {
  const { token = '' } = useParams();
  const navigate = useNavigate();
  const form = useForm<Input>({
    resolver: zodResolver(schema),
    defaultValues: { password: '', confirm: '' },
  });
  const [error, setError] = useState<string | null>(null);

  const onSubmit = form.handleSubmit(async ({ password }) => {
    try {
      await authApi.confirmPasswordReset(token, password);
      navigate('/login', { replace: true });
    } catch {
      setError('Reset link is invalid or expired.');
    }
  });

  return (
    <Card className="w-full max-w-md">
      <CardBody className="flex flex-col gap-5 p-8">
        <h1 className="text-2xl font-semibold text-neutral-900">Choose a new password</h1>
        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          <Input
            label="New password"
            type="password"
            autoComplete="new-password"
            error={form.formState.errors.password?.message}
            {...form.register('password')}
          />
          <Input
            label="Confirm password"
            type="password"
            autoComplete="new-password"
            error={form.formState.errors.confirm?.message}
            {...form.register('confirm')}
          />
          {error && <p className="text-xs text-danger">{error}</p>}
          <Button type="submit" loading={form.formState.isSubmitting} fullWidth>
            Reset password
          </Button>
        </form>
        <Link to="/login" className="text-center text-xs text-brand-600 hover:underline">
          Back to sign in
        </Link>
      </CardBody>
    </Card>
  );
}
EOF

# ============================================================
# DASHBOARD LAYOUT
# ============================================================

mkfile "$APP/src/layouts/navConfig.ts" <<'EOF'
import { PERMISSIONS, type Permission, type Role } from '@nafi/rbac-core';

export interface NavItem {
  labelKey: string;
  path: string;
  icon: string;
  permission: Permission;
  scope?: string;
}

export interface NavSection {
  labelKey: string;
  items: NavItem[];
}

export const NAV_BY_ROLE: Record<Role, NavSection[]> = {
  DIASPORA_INVESTOR: [
    {
      labelKey: 'nav.portfolio.title',
      items: [
        { labelKey: 'nav.portfolio.overview', path: '/portfolio', icon: 'LayoutDashboard', permission: PERMISSIONS.INVESTMENT_READ_OWN },
        { labelKey: 'nav.portfolio.investments', path: '/portfolio/investments', icon: 'TrendingUp', permission: PERMISSIONS.INVESTMENT_READ_OWN },
        { labelKey: 'nav.portfolio.bonds', path: '/portfolio/bonds', icon: 'Certificate', permission: PERMISSIONS.INVESTMENT_READ_OWN },
        { labelKey: 'nav.portfolio.returns', path: '/portfolio/returns', icon: 'Coins', permission: PERMISSIONS.INVESTMENT_READ_OWN },
        { labelKey: 'nav.portfolio.statements', path: '/portfolio/statements', icon: 'FileText', permission: PERMISSIONS.REPORT_READ_OWN },
      ],
    },
    {
      labelKey: 'nav.opportunities.title',
      items: [
        { labelKey: 'nav.opportunities.browse', path: '/opportunities', icon: 'Search', permission: PERMISSIONS.CONTRACT_READ_OWN },
      ],
    },
  ],

  COMMERCIAL_BANK: [
    {
      labelKey: 'nav.bank.title',
      items: [
        { labelKey: 'nav.bank.overview', path: '/bank/overview', icon: 'LayoutDashboard', permission: PERMISSIONS.ESCROW_READ_OWN },
        { labelKey: 'nav.bank.escrows', path: '/bank/escrows', icon: 'Lock', permission: PERMISSIONS.ESCROW_READ_OWN },
        { labelKey: 'nav.bank.loans', path: '/bank/loans', icon: 'Banknote', permission: PERMISSIONS.CONTRACT_READ_ALL },
        { labelKey: 'nav.bank.collateral', path: '/bank/collateral', icon: 'Shield', permission: PERMISSIONS.COLLATERAL_REGISTER },
        { labelKey: 'nav.bank.settlements', path: '/bank/settlements', icon: 'ArrowLeftRight', permission: PERMISSIONS.SETTLEMENT_READ },
        { labelKey: 'nav.bank.npl', path: '/bank/npl', icon: 'AlertTriangle', permission: PERMISSIONS.REPORT_GENERATE },
      ],
    },
  ],

  DBE_OFFICER: [
    {
      labelKey: 'nav.bank.title',
      items: [
        { labelKey: 'nav.bank.overview', path: '/dbe/portfolio', icon: 'LayoutDashboard', permission: PERMISSIONS.CONTRACT_READ_ALL },
        { labelKey: 'nav.bank.loans', path: '/dbe/co-financing', icon: 'HandCoins', permission: PERMISSIONS.CONTRACT_READ_ALL },
        { labelKey: 'nav.bank.settlements', path: '/dbe/on-lending', icon: 'ArrowLeftRight', permission: PERMISSIONS.CONTRACT_READ_ALL },
        { labelKey: 'nav.bank.collateral', path: '/dbe/ta-tracking', icon: 'GraduationCap', permission: PERMISSIONS.REPORT_GENERATE },
        { labelKey: 'nav.bank.npl', path: '/dbe/reports', icon: 'FileText', permission: PERMISSIONS.REPORT_GENERATE },
      ],
    },
  ],

  NAFA_OFFICER: [
    {
      labelKey: 'nav.bank.title',
      items: [
        { labelKey: 'nav.bank.escrows', path: '/nafa/guarantees', icon: 'ShieldCheck', permission: PERMISSIONS.CONTRACT_READ_ALL },
        { labelKey: 'nav.bank.settlements', path: '/nafa/claims', icon: 'ClipboardList', permission: PERMISSIONS.SETTLEMENT_READ },
        { labelKey: 'nav.bank.overview', path: '/nafa/risk-sharing', icon: 'PieChart', permission: PERMISSIONS.REPORT_GENERATE },
        { labelKey: 'nav.bank.loans', path: '/nafa/refinancing', icon: 'RefreshCw', permission: PERMISSIONS.CONTRACT_APPROVE },
        { labelKey: 'nav.bank.npl', path: '/nafa/reports', icon: 'FileText', permission: PERMISSIONS.REPORT_GENERATE },
      ],
    },
  ],

  INPUT_SUPPLIER: [
    {
      labelKey: 'nav.farm.title',
      items: [
        { labelKey: 'nav.farm.inputs', path: '/supplier/orders', icon: 'Package', permission: PERMISSIONS.INPUT_CREATE },
        { labelKey: 'nav.farm.harvest', path: '/supplier/deliveries', icon: 'Truck', permission: PERMISSIONS.INPUT_CREATE },
        { labelKey: 'nav.farm.payments', path: '/supplier/payments', icon: 'Wallet', permission: PERMISSIONS.SETTLEMENT_READ },
        { labelKey: 'nav.farm.contracts', path: '/supplier/profile', icon: 'User', permission: PERMISSIONS.USER_MANAGE_OWN },
      ],
    },
  ],

  COMMERCIAL_FARMER: [
    {
      labelKey: 'nav.farm.title',
      items: [
        { labelKey: 'nav.farm.contracts', path: '/farm/contracts', icon: 'FileText', permission: PERMISSIONS.CONTRACT_READ_OWN },
        { labelKey: 'nav.farm.inputs', path: '/farm/inputs', icon: 'Package', permission: PERMISSIONS.INPUT_VERIFY },
        { labelKey: 'nav.farm.escrow', path: '/farm/escrow', icon: 'Lock', permission: PERMISSIONS.ESCROW_READ_OWN },
        { labelKey: 'nav.farm.harvest', path: '/farm/harvest', icon: 'Wheat', permission: PERMISSIONS.CONTRACT_READ_OWN },
        { labelKey: 'nav.farm.collateral', path: '/farm/collateral', icon: 'Shield', permission: PERMISSIONS.COLLATERAL_REGISTER },
        { labelKey: 'nav.farm.payments', path: '/farm/payments', icon: 'Wallet', permission: PERMISSIONS.SETTLEMENT_READ },
      ],
    },
  ],

  OFF_TAKER: [
    {
      labelKey: 'nav.farm.title',
      items: [
        { labelKey: 'nav.farm.contracts', path: '/buyer/purchases', icon: 'ShoppingCart', permission: PERMISSIONS.CONTRACT_READ_OWN },
        { labelKey: 'nav.farm.payments', path: '/buyer/settlements', icon: 'ArrowLeftRight', permission: PERMISSIONS.SETTLEMENT_READ },
      ],
    },
  ],

  GOVERNMENT_REGULATOR: [
    {
      labelKey: 'nav.gov.title',
      items: [
        { labelKey: 'nav.gov.dashboard', path: '/gov/dashboard', icon: 'LayoutDashboard', permission: PERMISSIONS.REPORT_READ_OWN },
        { labelKey: 'nav.gov.contracts', path: '/gov/contracts', icon: 'FileText', permission: PERMISSIONS.CONTRACT_READ_ALL },
        { labelKey: 'nav.gov.forex', path: '/gov/forex', icon: 'DollarSign', permission: PERMISSIONS.REPORT_GENERATE },
        { labelKey: 'nav.gov.credit', path: '/gov/credit', icon: 'Banknote', permission: PERMISSIONS.REPORT_GENERATE },
        { labelKey: 'nav.gov.inputs', path: '/gov/inputs', icon: 'Package', permission: PERMISSIONS.REPORT_GENERATE },
        { labelKey: 'nav.gov.tax', path: '/gov/tax', icon: 'Receipt', permission: PERMISSIONS.TAX_READ },
        { labelKey: 'nav.gov.incentives', path: '/gov/incentives', icon: 'Award', permission: PERMISSIONS.REPORT_GENERATE },
        { labelKey: 'nav.gov.audit', path: '/gov/audit', icon: 'Eye', permission: PERMISSIONS.AUDIT_READ },
        { labelKey: 'nav.gov.reports', path: '/gov/reports', icon: 'FileText', permission: PERMISSIONS.REPORT_GENERATE },
      ],
    },
  ],

  DONOR: [
    {
      labelKey: 'nav.donor.title',
      items: [
        { labelKey: 'nav.donor.grants', path: '/donor/grants', icon: 'HandCoins', permission: PERMISSIONS.REPORT_READ_OWN },
        { labelKey: 'nav.donor.disbursements', path: '/donor/disbursements', icon: 'ArrowLeftRight', permission: PERMISSIONS.REPORT_READ_OWN },
        { labelKey: 'nav.donor.impact', path: '/donor/impact', icon: 'TrendingUp', permission: PERMISSIONS.REPORT_READ_OWN },
        { labelKey: 'nav.donor.reports', path: '/donor/reports', icon: 'FileText', permission: PERMISSIONS.REPORT_GENERATE },
        { labelKey: 'nav.donor.audit', path: '/donor/audit', icon: 'Eye', permission: PERMISSIONS.AUDIT_READ },
      ],
    },
  ],

  NAFI_ADMIN: [
    {
      labelKey: 'nav.admin.title',
      items: [
        { labelKey: 'nav.admin.overview', path: '/admin/overview', icon: 'LayoutDashboard', permission: PERMISSIONS.SYSTEM_CONFIGURE },
        { labelKey: 'nav.admin.users', path: '/admin/users', icon: 'Users', permission: PERMISSIONS.USER_MANAGE_ALL },
        { labelKey: 'nav.admin.contracts', path: '/admin/contracts', icon: 'FileText', permission: PERMISSIONS.CONTRACT_READ_ALL },
        { labelKey: 'nav.admin.escrows', path: '/admin/escrows', icon: 'Lock', permission: PERMISSIONS.ESCROW_READ_OWN },
        { labelKey: 'nav.admin.settlements', path: '/admin/settlements', icon: 'ArrowLeftRight', permission: PERMISSIONS.SETTLEMENT_READ },
        { labelKey: 'nav.admin.disputes', path: '/admin/disputes', icon: 'AlertTriangle', permission: PERMISSIONS.DISPUTE_FLAG },
        { labelKey: 'nav.admin.config', path: '/admin/config', icon: 'Settings', permission: PERMISSIONS.SYSTEM_CONFIGURE },
        { labelKey: 'nav.admin.audit', path: '/admin/audit', icon: 'Eye', permission: PERMISSIONS.AUDIT_READ },
        { labelKey: 'nav.admin.health', path: '/admin/health', icon: 'Activity', permission: PERMISSIONS.SYSTEM_CONFIGURE },
      ],
    },
  ],

  COMPLIANCE_OFFICER: [
    {
      labelKey: 'nav.compliance.title',
      items: [
        { labelKey: 'nav.compliance.queue', path: '/compliance/queue', icon: 'ClipboardList', permission: PERMISSIONS.CONTRACT_APPROVE },
        { labelKey: 'nav.compliance.kyc', path: '/compliance/kyc', icon: 'UserCheck', permission: PERMISSIONS.CONTRACT_APPROVE },
        { labelKey: 'nav.compliance.aml', path: '/compliance/aml', icon: 'AlertTriangle', permission: PERMISSIONS.AUDIT_READ },
        { labelKey: 'nav.compliance.sar', path: '/compliance/sar', icon: 'FileText', permission: PERMISSIONS.AUDIT_READ },
      ],
    },
  ],

  ARBITRATOR: [
    {
      labelKey: 'nav.arbitration.title',
      items: [
        { labelKey: 'nav.arbitration.cases', path: '/arbitration/cases', icon: 'Gavel', permission: PERMISSIONS.DISPUTE_ARBITRATE },
      ],
    },
  ],
};
EOF

mkfile "$APP/src/layouts/DashboardLayout.tsx" <<'EOF'
import {
  Activity,
  AlertTriangle,
  ArrowLeftRight,
  Award,
  Banknote,
  Bell,
  Certificate,
  ClipboardList,
  Coins,
  DollarSign,
  Eye,
  FileText,
  Gavel,
  GraduationCap,
  HandCoins,
  LayoutDashboard,
  Lock,
  LogOut,
  Menu,
  Package,
  PieChart,
  Receipt,
  RefreshCw,
  Search,
  Settings,
  Shield,
  ShieldCheck,
  ShoppingCart,
  TrendingUp,
  Truck,
  User,
  UserCheck,
  Users,
  Wallet,
  Wheat,
  X,
} from 'lucide-react';
import { useMemo, useState, type ComponentType } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { Avatar, Button, Can, cn } from '@nafi/ui-react';

import { useAuth } from '@/auth/useAuth';
import { useAuthActions } from '@/auth/AuthProvider';

import { NAV_BY_ROLE } from './navConfig';

const ICONS: Record<string, ComponentType<{ className?: string }>> = {
  Activity, AlertTriangle, ArrowLeftRight, Award, Banknote, Certificate, ClipboardList,
  Coins, DollarSign, Eye, FileText, Gavel, GraduationCap, HandCoins, LayoutDashboard, Lock,
  Package, PieChart, Receipt, RefreshCw, Search, Settings, Shield, ShieldCheck, ShoppingCart,
  TrendingUp, Truck, User, UserCheck, Users, Wallet, Wheat,
};

export function DashboardLayout() {
  const { t } = useTranslation('nav');
  const { user } = useAuth();
  const { logout } = useAuthActions();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const sections = useMemo(() => (user ? NAV_BY_ROLE[user.role] : []), [user]);

  if (!user) return null;

  const initials = user.fullName
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  const sidebar = (
    <div className="flex h-full flex-col">
      <div className="flex h-16 shrink-0 items-center justify-between border-b border-neutral-200 px-5">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded bg-brand-500 text-white">
            <span className="font-bold">N</span>
          </div>
          <span className="text-base font-bold tracking-tight">NAFI</span>
        </div>
        <button
          type="button"
          className="lg:hidden"
          onClick={() => setMobileOpen(false)}
          aria-label="Close menu"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4" aria-label="Sidebar">
        {sections.map((section) => (
          <div key={section.labelKey} className="mb-5">
            <p className="px-3 pb-2 text-xs font-semibold uppercase tracking-wide text-neutral-500">
              {t(section.labelKey)}
            </p>
            <ul className="flex flex-col gap-0.5">
              {section.items.map((item) => {
                const Icon = ICONS[item.icon] ?? Package;
                return (
                  <li key={item.path}>
                    <Can I={item.permission} scope={item.scope}>
                      <NavLink
                        to={item.path}
                        onClick={() => setMobileOpen(false)}
                        className={({ isActive }) =>
                          cn(
                            'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                            isActive
                              ? 'bg-brand-50 text-brand-700'
                              : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900',
                          )
                        }
                      >
                        <Icon className="h-4 w-4 shrink-0" />
                        <span className="truncate">{t(item.labelKey)}</span>
                      </NavLink>
                    </Can>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="border-t border-neutral-200 p-3">
        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900"
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-neutral-50">
      <aside className="hidden w-64 shrink-0 border-r border-neutral-200 bg-white lg:flex lg:flex-col">
        {sidebar}
      </aside>

      {mobileOpen && (
        <>
          <div
            className="fixed inset-0 z-modal-backdrop bg-neutral-900/50 lg:hidden"
            onClick={() => setMobileOpen(false)}
            aria-hidden="true"
          />
          <aside className="fixed left-0 top-0 z-modal h-full w-64 border-r border-neutral-200 bg-white lg:hidden">
            {sidebar}
          </aside>
        </>
      )}

      <div className="flex flex-1 flex-col">
        <header className="sticky top-0 z-sticky flex h-16 items-center justify-between border-b border-neutral-200 bg-white/95 px-4 backdrop-blur sm:px-6">
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="lg:hidden"
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div>
              <p className="text-xs uppercase tracking-wide text-neutral-500">
                {user.institutionName ?? user.role.replace(/_/g, ' ')}
              </p>
              <p className="text-sm font-semibold text-neutral-900">{user.fullName}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon-sm" aria-label="Notifications">
              <Bell className="h-4 w-4" />
            </Button>

            <div className="flex items-center gap-2 rounded-full border border-neutral-200 py-1 pl-1 pr-3">
              <Avatar fallback={initials} size="sm" />
              <span className="text-xs font-medium text-neutral-700">{user.nafiId}</span>
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
EOF

# ============================================================
# PLACEHOLDER PAGES
# ============================================================

mkfile "$APP/src/components/PagePlaceholder.tsx" <<'EOF'
import { Construction } from 'lucide-react';

import { Card, CardBody } from '@nafi/ui-react';

export interface PagePlaceholderProps {
  title: string;
  description?: string;
}

export function PagePlaceholder({ title, description }: PagePlaceholderProps) {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-neutral-900">{title}</h1>
        {description && <p className="mt-1 text-sm text-neutral-500">{description}</p>}
      </div>

      <Card>
        <CardBody className="flex flex-col items-center gap-3 py-16 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-50 text-brand-600">
            <Construction className="h-6 w-6" />
          </div>
          <p className="text-sm font-medium text-neutral-900">Coming in a later step</p>
          <p className="max-w-md text-xs text-neutral-500">
            This page is stubbed for now. It will be fully implemented in Steps 5–8 of the build.
          </p>
        </CardBody>
      </Card>
    </div>
  );
}
EOF

mkfile "$APP/src/pages/stubs.tsx" <<'EOF'
import { PagePlaceholder } from '@/components/PagePlaceholder';

export const InvestorOverview = () => <PagePlaceholder title="Portfolio Overview" />;
export const InvestorInvestments = () => <PagePlaceholder title="My Investments" />;
export const InvestorBonds = () => <PagePlaceholder title="My Bonds" />;
export const InvestorReturns = () => <PagePlaceholder title="Returns Tracker" />;
export const InvestorStatements = () => <PagePlaceholder title="Statements" />;
export const OpportunityBrowser = () => <PagePlaceholder title="Opportunities" />;

export const BankOverview = () => <PagePlaceholder title="Bank Overview" />;
export const BankEscrows = () => <PagePlaceholder title="Escrows" />;
export const BankLoans = () => <PagePlaceholder title="Loan Portfolio" />;
export const BankCollateral = () => <PagePlaceholder title="Collateral Registry" />;
export const BankSettlements = () => <PagePlaceholder title="Settlements" />;
export const BankNPL = () => <PagePlaceholder title="NPL Monitor" />;

export const DbePortfolio = () => <PagePlaceholder title="DBE Portfolio" />;
export const DbeCoFinancing = () => <PagePlaceholder title="Co-Financing" />;
export const DbeOnLending = () => <PagePlaceholder title="On-Lending" />;
export const DbeTaTracking = () => <PagePlaceholder title="Technical Assistance" />;
export const DbeReports = () => <PagePlaceholder title="Reports" />;

export const NafaGuarantees = () => <PagePlaceholder title="Guarantees" />;
export const NafaClaims = () => <PagePlaceholder title="Claims" />;
export const NafaRiskSharing = () => <PagePlaceholder title="Risk Sharing" />;
export const NafaRefinancing = () => <PagePlaceholder title="Refinancing" />;
export const NafaReports = () => <PagePlaceholder title="Reports" />;

export const SupplierOrders = () => <PagePlaceholder title="Purchase Orders" />;
export const SupplierDeliveries = () => <PagePlaceholder title="Deliveries" />;
export const SupplierPayments = () => <PagePlaceholder title="Payments" />;
export const SupplierProfile = () => <PagePlaceholder title="Profile" />;

export const FarmContracts = () => <PagePlaceholder title="My Contracts" />;
export const FarmInputs = () => <PagePlaceholder title="Input Orders" />;
export const FarmEscrow = () => <PagePlaceholder title="Escrow" />;
export const FarmHarvest = () => <PagePlaceholder title="Harvest" />;
export const FarmCollateral = () => <PagePlaceholder title="Collateral" />;
export const FarmPayments = () => <PagePlaceholder title="Payments" />;

export const BuyerPurchases = () => <PagePlaceholder title="Purchases" />;
export const BuyerSettlements = () => <PagePlaceholder title="Settlements" />;

export const GovDashboard = () => <PagePlaceholder title="National Dashboard" />;
export const GovContracts = () => <PagePlaceholder title="Contract Registry" />;
export const GovForex = () => <PagePlaceholder title="Forex Flows" />;
export const GovCredit = () => <PagePlaceholder title="Credit Deployment" />;
export const GovInputs = () => <PagePlaceholder title="Input Supply Chain" />;
export const GovTax = () => <PagePlaceholder title="Tax Compliance" />;
export const GovIncentives = () => <PagePlaceholder title="Incentive Utilization" />;
export const GovAudit = () => <PagePlaceholder title="Audit Log" />;
export const GovReports = () => <PagePlaceholder title="Regulatory Reports" />;

export const DonorGrants = () => <PagePlaceholder title="Grants" />;
export const DonorDisbursements = () => <PagePlaceholder title="Disbursements" />;
export const DonorImpact = () => <PagePlaceholder title="Impact Metrics" />;
export const DonorReports = () => <PagePlaceholder title="Reports" />;
export const DonorAudit = () => <PagePlaceholder title="Audit Access" />;

export const AdminOverview = () => <PagePlaceholder title="Admin Overview" />;
export const AdminUsers = () => <PagePlaceholder title="Users" />;
export const AdminContracts = () => <PagePlaceholder title="All Contracts" />;
export const AdminEscrows = () => <PagePlaceholder title="All Escrows" />;
export const AdminSettlements = () => <PagePlaceholder title="All Settlements" />;
export const AdminDisputes = () => <PagePlaceholder title="All Disputes" />;
export const AdminConfig = () => <PagePlaceholder title="System Config" />;
export const AdminAudit = () => <PagePlaceholder title="Audit Log" />;
export const AdminHealth = () => <PagePlaceholder title="System Health" />;

export const ComplianceQueue = () => <PagePlaceholder title="Compliance Queue" />;
export const ComplianceKyc = () => <PagePlaceholder title="KYC Queue" />;
export const ComplianceAml = () => <PagePlaceholder title="AML Alerts" />;
export const ComplianceSar = () => <PagePlaceholder title="SAR Filings" />;

export const ArbitrationCases = () => <PagePlaceholder title="Arbitration Cases" />;

export const ProfilePage = () => <PagePlaceholder title="Profile" />;
export const NotFound = () => (
  <PagePlaceholder title="Page not found" description="The page you were looking for does not exist." />
);
EOF

# ============================================================
# ROUTER
# ============================================================

mkfile "$APP/src/app/router.tsx" <<'EOF'
import { PERMISSIONS } from '@nafi/rbac-core';
import { ProtectedRoute } from '@nafi/ui-react';
import { createBrowserRouter, Navigate } from 'react-router-dom';

import { AuthLayout } from '@/features/auth/layouts/AuthLayout';
import { ForgotPasswordPage } from '@/features/auth/pages/ForgotPasswordPage';
import { LoginPage } from '@/features/auth/pages/LoginPage';
import { RegisterPage } from '@/features/auth/pages/RegisterPage';
import { ResetPasswordPage } from '@/features/auth/pages/ResetPasswordPage';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import {
  AdminAudit, AdminConfig, AdminContracts, AdminDisputes, AdminEscrows, AdminHealth,
  AdminOverview, AdminSettlements, AdminUsers,
  ArbitrationCases,
  BankCollateral, BankEscrows, BankLoans, BankNPL, BankOverview, BankSettlements,
  BuyerPurchases, BuyerSettlements,
  ComplianceAml, ComplianceKyc, ComplianceQueue, ComplianceSar,
  DbeCoFinancing, DbeOnLending, DbePortfolio, DbeReports, DbeTaTracking,
  DonorAudit, DonorDisbursements, DonorGrants, DonorImpact, DonorReports,
  FarmCollateral, FarmContracts, FarmEscrow, FarmHarvest, FarmInputs, FarmPayments,
  GovAudit, GovContracts, GovCredit, GovDashboard, GovForex, GovIncentives, GovInputs,
  GovReports, GovTax,
  InvestorBonds, InvestorInvestments, InvestorOverview, InvestorReturns, InvestorStatements,
  NafaClaims, NafaGuarantees, NafaRefinancing, NafaReports, NafaRiskSharing,
  NotFound, OpportunityBrowser, ProfilePage,
  SupplierDeliveries, SupplierOrders, SupplierPayments, SupplierProfile,
} from '@/pages/stubs';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AuthLayout />,
    children: [
      { index: true, element: <Navigate to="/login" replace /> },
      { path: 'login', element: <LoginPage /> },
      { path: 'register', element: <RegisterPage /> },
      { path: 'forgot-password', element: <ForgotPasswordPage /> },
      { path: 'reset-password/:token', element: <ResetPasswordPage /> },
    ],
  },

  {
    element: <ProtectedRoute permission={PERMISSIONS.CONTRACT_READ_OWN} />,
    children: [
      {
        element: <DashboardLayout />,
        children: [
          // -------- Diaspora Investor --------
          {
            element: (
              <ProtectedRoute
                permission={PERMISSIONS.INVESTMENT_READ_OWN}
                roles={['DIASPORA_INVESTOR']}
              />
            ),
            children: [
              { path: '/portfolio', element: <InvestorOverview /> },
              { path: '/portfolio/investments', element: <InvestorInvestments /> },
              { path: '/portfolio/bonds', element: <InvestorBonds /> },
              { path: '/portfolio/returns', element: <InvestorReturns /> },
              { path: '/portfolio/statements', element: <InvestorStatements /> },
              { path: '/opportunities', element: <OpportunityBrowser /> },
            ],
          },

          // -------- Commercial Bank --------
          {
            element: (
              <ProtectedRoute
                permission={PERMISSIONS.ESCROW_READ_OWN}
                roles={['COMMERCIAL_BANK']}
              />
            ),
            children: [
              { path: '/bank/overview', element: <BankOverview /> },
              { path: '/bank/escrows', element: <BankEscrows /> },
              { path: '/bank/loans', element: <BankLoans /> },
              { path: '/bank/collateral', element: <BankCollateral /> },
              { path: '/bank/settlements', element: <BankSettlements /> },
              { path: '/bank/npl', element: <BankNPL /> },
            ],
          },

          // -------- DBE --------
          {
            element: (
              <ProtectedRoute
                permission={PERMISSIONS.CONTRACT_READ_ALL}
                roles={['DBE_OFFICER']}
              />
            ),
            children: [
              { path: '/dbe/portfolio', element: <DbePortfolio /> },
              { path: '/dbe/co-financing', element: <DbeCoFinancing /> },
              { path: '/dbe/on-lending', element: <DbeOnLending /> },
              { path: '/dbe/ta-tracking', element: <DbeTaTracking /> },
              { path: '/dbe/reports', element: <DbeReports /> },
            ],
          },

          // -------- NAFA --------
          {
            element: (
              <ProtectedRoute
                permission={PERMISSIONS.CONTRACT_READ_ALL}
                roles={['NAFA_OFFICER']}
              />
            ),
            children: [
              { path: '/nafa/guarantees', element: <NafaGuarantees /> },
              { path: '/nafa/claims', element: <NafaClaims /> },
              { path: '/nafa/risk-sharing', element: <NafaRiskSharing /> },
              { path: '/nafa/refinancing', element: <NafaRefinancing /> },
              { path: '/nafa/reports', element: <NafaReports /> },
            ],
          },

          // -------- Input Supplier --------
          {
            element: (
              <ProtectedRoute
                permission={PERMISSIONS.INPUT_CREATE}
                roles={['INPUT_SUPPLIER']}
              />
            ),
            children: [
              { path: '/supplier/orders', element: <SupplierOrders /> },
              { path: '/supplier/deliveries', element: <SupplierDeliveries /> },
              { path: '/supplier/payments', element: <SupplierPayments /> },
              { path: '/supplier/profile', element: <SupplierProfile /> },
            ],
          },

          // -------- Commercial Farmer --------
          {
            element: (
              <ProtectedRoute
                permission={PERMISSIONS.CONTRACT_READ_OWN}
                roles={['COMMERCIAL_FARMER']}
              />
            ),
            children: [
              { path: '/farm/contracts', element: <FarmContracts /> },
              { path: '/farm/inputs', element: <FarmInputs /> },
              { path: '/farm/escrow', element: <FarmEscrow /> },
              { path: '/farm/harvest', element: <FarmHarvest /> },
              { path: '/farm/collateral', element: <FarmCollateral /> },
              { path: '/farm/payments', element: <FarmPayments /> },
            ],
          },

          // -------- Off-Taker --------
          {
            element: (
              <ProtectedRoute
                permission={PERMISSIONS.CONTRACT_READ_OWN}
                roles={['OFF_TAKER']}
              />
            ),
            children: [
              { path: '/buyer/purchases', element: <BuyerPurchases /> },
              { path: '/buyer/settlements', element: <BuyerSettlements /> },
            ],
          },

          // -------- Government --------
          {
            element: (
              <ProtectedRoute
                permission={PERMISSIONS.REPORT_READ_OWN}
                roles={['GOVERNMENT_REGULATOR']}
              />
            ),
            children: [
              { path: '/gov/dashboard', element: <GovDashboard /> },
              { path: '/gov/contracts', element: <GovContracts /> },
              { path: '/gov/forex', element: <GovForex /> },
              { path: '/gov/credit', element: <GovCredit /> },
              { path: '/gov/inputs', element: <GovInputs /> },
              { path: '/gov/tax', element: <GovTax /> },
              { path: '/gov/incentives', element: <GovIncentives /> },
              { path: '/gov/audit', element: <GovAudit /> },
              { path: '/gov/reports', element: <GovReports /> },
            ],
          },

          // -------- Donor --------
          {
            element: (
              <ProtectedRoute permission={PERMISSIONS.REPORT_READ_OWN} roles={['DONOR']} />
            ),
            children: [
              { path: '/donor/grants', element: <DonorGrants /> },
              { path: '/donor/disbursements', element: <DonorDisbursements /> },
              { path: '/donor/impact', element: <DonorImpact /> },
              { path: '/donor/reports', element: <DonorReports /> },
              { path: '/donor/audit', element: <DonorAudit /> },
            ],
          },

          // -------- Admin --------
          {
            element: (
              <ProtectedRoute
                permission={PERMISSIONS.SYSTEM_CONFIGURE}
                roles={['NAFI_ADMIN']}
              />
            ),
            children: [
              { path: '/admin/overview', element: <AdminOverview /> },
              { path: '/admin/users', element: <AdminUsers /> },
              { path: '/admin/contracts', element: <AdminContracts /> },
              { path: '/admin/escrows', element: <AdminEscrows /> },
              { path: '/admin/settlements', element: <AdminSettlements /> },
              { path: '/admin/disputes', element: <AdminDisputes /> },
              { path: '/admin/config', element: <AdminConfig /> },
              { path: '/admin/audit', element: <AdminAudit /> },
              { path: '/admin/health', element: <AdminHealth /> },
            ],
          },

          // -------- Compliance --------
          {
            element: (
              <ProtectedRoute
                permission={PERMISSIONS.CONTRACT_APPROVE}
                roles={['COMPLIANCE_OFFICER']}
              />
            ),
            children: [
              { path: '/compliance/queue', element: <ComplianceQueue /> },
              { path: '/compliance/kyc', element: <ComplianceKyc /> },
              { path: '/compliance/aml', element: <ComplianceAml /> },
              { path: '/compliance/sar', element: <ComplianceSar /> },
            ],
          },

          // -------- Arbitrator --------
          {
            element: (
              <ProtectedRoute
                permission={PERMISSIONS.DISPUTE_ARBITRATE}
                roles={['ARBITRATOR']}
              />
            ),
            children: [{ path: '/arbitration/cases', element: <ArbitrationCases /> }],
          },

          // -------- Shared --------
          { path: '/profile', element: <ProfilePage /> },
        ],
      },
    ],
  },

  { path: '*', element: <NotFound /> },
]);
EOF

# ============================================================
# ROOT COMPONENT & ENTRY
# ============================================================

mkfile "$APP/src/App.tsx" <<'EOF'
import { RouterProvider } from 'react-router-dom';

import { AppProviders } from './app/providers/AppProviders';
import { router } from './app/router';

export default function App() {
  return (
    <AppProviders>
      <RouterProvider router={router} />
    </AppProviders>
  );
}
EOF

mkfile "$APP/src/main.tsx" <<'EOF'
import React from 'react';
import ReactDOM from 'react-dom/client';

import App from './App';
import './i18n';
import './styles/globals.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
EOF

# ============================================================
# DONE
# ============================================================

echo ""
echo "============================================================"
echo "✅ NAFI Step 4 scaffolding complete"
echo "============================================================"
echo ""
echo "Created apps/web with:"
echo ""
echo "  Setup:"
echo "    package.json, vite.config.ts, tailwind.config.js,"
echo "    postcss.config.js, tsconfig.json, index.html, .env.example"
echo "    public/favicon.svg"
echo ""
echo "  Auth layer (secure):"
echo "    auth/tokenStore.ts       (memory only — no localStorage)"
echo "    auth/authStore.ts        (Zustand persist for user only)"
echo "    auth/api.ts              (axios + refresh interceptor)"
echo "    auth/AuthProvider.tsx    (session hydration + logout event)"
echo "    auth/useAuth.ts          (re-export + useRequiredUser)"
echo ""
echo "  Query client:"
echo "    app/queryClient.ts       (retry policy skips 4xx)"
echo ""
echo "  Providers:"
echo "    app/providers/AppProviders.tsx"
echo "    components/ToastProvider.tsx"
echo ""
echo "  Auth pages:"
echo "    features/auth/layouts/AuthLayout.tsx"
echo "    features/auth/pages/LoginPage.tsx"
echo "    features/auth/pages/RegisterPage.tsx"
echo "    features/auth/pages/ForgotPasswordPage.tsx"
echo "    features/auth/pages/ResetPasswordPage.tsx"
echo ""
echo "  Layout:"
echo "    layouts/navConfig.ts     (NAV_BY_ROLE for all 12 roles)"
echo "    layouts/DashboardLayout.tsx (sidebar + topbar + mobile drawer)"
echo ""
echo "  Stubs:"
echo "    components/PagePlaceholder.tsx"
echo "    pages/stubs.tsx          (~60 stub components)"
echo ""
echo "  Router:"
echo "    app/router.tsx           (12 role-scoped route groups + auth)"
echo ""
echo "  Entry:"
echo "    App.tsx, main.tsx, styles/globals.css, i18n/index.ts"
echo ""
echo "Next steps:"
echo "  pnpm install"
echo "  pnpm --filter @nafi/web typecheck"
echo "  pnpm --filter @nafi/web lint"
echo "  pnpm --filter @nafi/web dev   # → http://localhost:3000"
echo ""
echo "Then proceed to Step 5 (data layer)."
echo ""
