import { useQuery, type UseQueryOptions } from '@tanstack/react-query';

import { investmentsApi } from '@/api/domains/investments';
import type { ListResponse } from '@/api/types/common';
import type { InvestmentFilters, InvestmentSummary } from '@/api/types/investment';
import { qk } from '@/lib/queryKeys';

export function useMyInvestments(
  filters: InvestmentFilters = {},
  options?: Omit<UseQueryOptions<ListResponse<InvestmentSummary>>, 'queryKey' | 'queryFn'>,
) {
  return useQuery({
    queryKey: qk.investments.mine(filters),
    queryFn: () => investmentsApi.mine(filters),
    placeholderData: (prev) => prev,
    ...options,
  });
}

export function useInvestments(
  filters: InvestmentFilters = {},
  options?: Omit<UseQueryOptions<ListResponse<InvestmentSummary>>, 'queryKey' | 'queryFn'>,
) {
  return useQuery({
    queryKey: qk.investments.list(filters),
    queryFn: () => investmentsApi.list(filters),
    placeholderData: (prev) => prev,
    ...options,
  });
}

export function useInvestment(id: string) {
  return useQuery({
    queryKey: qk.investments.detail(id),
    queryFn: () => investmentsApi.detail(id),
    enabled: Boolean(id),
  });
}
