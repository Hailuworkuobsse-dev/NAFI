import { useQuery, type UseQueryOptions } from '@tanstack/react-query';

import { collateralApi } from '@/api/domains/collateral';
import type { ListResponse } from '@/api/types/common';
import type { CollateralFilters, CollateralSummary } from '@/api/types/collateral';
import { qk } from '@/lib/queryKeys';

export function useCollateral(
  filters: CollateralFilters = {},
  options?: Omit<UseQueryOptions<ListResponse<CollateralSummary>>, 'queryKey' | 'queryFn'>,
) {
  return useQuery({
    queryKey: qk.collateral.list(filters),
    queryFn: () => collateralApi.list(filters),
    placeholderData: (prev) => prev,
    ...options,
  });
}

export function useCollateralItem(id: string) {
  return useQuery({
    queryKey: qk.collateral.detail(id),
    queryFn: () => collateralApi.detail(id),
    enabled: Boolean(id),
  });
}
