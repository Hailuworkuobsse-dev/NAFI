import { useQuery, type UseQueryOptions } from '@tanstack/react-query';

import { inputsApi } from '@/api/domains/inputs';
import type { ListResponse } from '@/api/types/common';
import type { InputFilters, InputPurchaseSummary } from '@/api/types/input';
import { qk } from '@/lib/queryKeys';

export function useInputs(
  filters: InputFilters = {},
  options?: Omit<UseQueryOptions<ListResponse<InputPurchaseSummary>>, 'queryKey' | 'queryFn'>,
) {
  return useQuery({
    queryKey: qk.inputs.list(filters),
    queryFn: () => inputsApi.list(filters),
    placeholderData: (prev) => prev,
    ...options,
  });
}

export function useInput(id: string) {
  return useQuery({
    queryKey: qk.inputs.detail(id),
    queryFn: () => inputsApi.detail(id),
    enabled: Boolean(id),
  });
}
