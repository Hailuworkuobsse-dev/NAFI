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
