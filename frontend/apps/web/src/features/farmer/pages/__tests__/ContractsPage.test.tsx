import 'fake-indexeddb/auto';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';

import { AuthProvider } from '@nafi/ui-react';

import { ToastProvider } from '@/components/ToastProvider';
import { OfflineProvider } from '@/offline/OfflineProvider';
import { server } from '@/test/msw/server';
import { errorHandlers } from '@/test/msw/handlers';

import { FarmContractsPage } from '../ContractsPage';

function renderPage(user: { role: string } | null) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });

  return render(
    <QueryClientProvider client={qc}>
      <AuthProvider
        value={{
          user: user
            ? {
                id: 'user-1',
                nafiId: 'NAFI-ABC12345',
                email: 'farmer@nafi.et',
                fullName: 'Abebe Bekele',
                role: user.role as never,
                permissions: ['contract:read:own'],
                locale: 'en',
                mfaEnabled: false,
              }
            : null,
          isLoading: false,
          isAuthenticated: Boolean(user),
        }}
      >
        <OfflineProvider>
          <ToastProvider>
            <MemoryRouter>
              <FarmContractsPage />
            </MemoryRouter>
          </ToastProvider>
        </OfflineProvider>
      </AuthProvider>
    </QueryClientProvider>,
  );
}

describe('FarmContractsPage', () => {
  it('renders list of contracts', async () => {
    renderPage({ role: 'COMMERCIAL_FARMER' });
    await waitFor(() => {
      expect(screen.getByText('Sesame')).toBeInTheDocument();
    });
    expect(screen.getByText(/Amhara/)).toBeInTheDocument();
  });

  it('shows empty state when no contracts', async () => {
    server.use(
      http.get('/api/v1/contracts', () =>
        HttpResponse.json({
          success: true,
          data: { items: [], page: 1, pageSize: 20, total: 0 },
        }),
      ),
    );
    renderPage({ role: 'COMMERCIAL_FARMER' });
    await waitFor(() => {
      expect(screen.getByText(/no contracts yet/i)).toBeInTheDocument();
    });
  });

  it('shows error state on 500', async () => {
    server.use(...errorHandlers.serverError);
    renderPage({ role: 'COMMERCIAL_FARMER' });
    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });
  });
});
