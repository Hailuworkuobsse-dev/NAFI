import { useQuery } from '@tanstack/react-query';

import { contractsApi } from '@/api/domains/contracts';
import type { NormalizedApiError } from '@/api/errors';
import type { ListResponse } from '@/api/types/common';
import type { ContractFilters, ContractSummary } from '@/api/types/contract';
import { useAuth } from '@/auth/useAuth';
import { cacheContracts, readCachedContracts } from '@/offline/cache';
import { useOffline } from '@/offline/OfflineProvider';

/**
 * Fetches contracts; caches them; falls back to cache when offline.
 * Server errors while online are surfaced so pages can render error states;
 * only offline/network failures degrade to the cached copy.
 */
export function useOfflineContracts(filters: ContractFilters = {}) {
  const { user } = useAuth();
  const { isOnline } = useOffline();

  return useQuery<ListResponse<ContractSummary>>({
    queryKey: ['contracts', 'offline', filters],
    queryFn: async () => {
      if (isOnline && user) {
        try {
          const result = await contractsApi.list(filters);
          await cacheContracts(user.id, result.items);
          return result;
        } catch (err) {
          const normalized = err as NormalizedApiError | null;
          const networkish = !isOnline || normalized?.kind === 'network';
          if (!networkish) throw err;
          // fall through to cache
        }
      }
      if (!user) throw new Error('Not authenticated');
      const cached = (await readCachedContracts(user.id)) as ContractSummary[];
      return {
        items: cached,
        page: 1,
        pageSize: cached.length,
        total: cached.length,
      };
    },
    staleTime: isOnline ? 30_000 : Infinity,
    networkMode: 'offlineFirst',
  });
}
