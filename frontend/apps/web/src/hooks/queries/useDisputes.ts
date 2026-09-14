import { useQuery, type UseQueryOptions } from '@tanstack/react-query';

import { disputesApi } from '@/api/domains/disputes';
import type { ListResponse } from '@/api/types/common';
import type { DisputeDetail, DisputeFilters, DisputeSummary } from '@/api/types/dispute';
import { qk } from '@/lib/queryKeys';

export function useDisputes(
  filters: DisputeFilters = {},
  options?: Omit<UseQueryOptions<ListResponse<DisputeSummary>>, 'queryKey' | 'queryFn'>,
) {
  return useQuery({
    queryKey: qk.disputes.list(filters),
    queryFn: () => disputesApi.list(filters),
    placeholderData: (prev) => prev,
    ...options,
  });
}

export function useDispute(id: string) {
  return useQuery<DisputeDetail>({
    queryKey: qk.disputes.detail(id),
    queryFn: () => disputesApi.detail(id),
    enabled: Boolean(id),
  });
}
