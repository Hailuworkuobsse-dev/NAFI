import { useQuery, type UseQueryOptions } from '@tanstack/react-query';

import { settlementsApi } from '@/api/domains/settlements';
import type { ListResponse } from '@/api/types/common';
import type {
  SettlementDetail,
  SettlementFilters,
  SettlementSummary,
} from '@/api/types/settlement';
import { qk } from '@/lib/queryKeys';

export function useSettlements(
  filters: SettlementFilters = {},
  options?: Omit<UseQueryOptions<ListResponse<SettlementSummary>>, 'queryKey' | 'queryFn'>,
) {
  return useQuery({
    queryKey: qk.settlements.list(filters),
    queryFn: () => settlementsApi.list(filters),
    placeholderData: (prev) => prev,
    ...options,
  });
}

export function useSettlement(id: string) {
  return useQuery<SettlementDetail>({
    queryKey: qk.settlements.detail(id),
    queryFn: () => settlementsApi.detail(id),
    enabled: Boolean(id),
  });
}
