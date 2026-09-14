import { useQuery, type UseQueryOptions } from '@tanstack/react-query';

import { contractsApi } from '@/api/domains/contracts';
import type { ListResponse } from '@/api/types/common';
import type {
  ContractDetail,
  ContractFilters,
  ContractSignature,
  ContractSummary,
  ContractTimelineEvent,
} from '@/api/types/contract';
import { qk } from '@/lib/queryKeys';

export function useContracts(
  filters: ContractFilters = {},
  options?: Omit<UseQueryOptions<ListResponse<ContractSummary>>, 'queryKey' | 'queryFn'>,
) {
  return useQuery({
    queryKey: qk.contracts.list(filters),
    queryFn: () => contractsApi.list(filters),
    placeholderData: (prev) => prev,
    ...options,
  });
}

export function useContract(
  id: string,
  options?: Omit<UseQueryOptions<ContractDetail>, 'queryKey' | 'queryFn'>,
) {
  return useQuery({
    queryKey: qk.contracts.detail(id),
    queryFn: () => contractsApi.detail(id),
    enabled: Boolean(id),
    ...options,
  });
}

export function useContractTimeline(id: string) {
  return useQuery<ContractTimelineEvent[]>({
    queryKey: qk.contracts.timeline(id),
    queryFn: () => contractsApi.timeline(id),
    enabled: Boolean(id),
  });
}

export function useContractSignatures(id: string) {
  return useQuery<ContractSignature[]>({
    queryKey: qk.contracts.signatures(id),
    queryFn: () => contractsApi.signatures(id),
    enabled: Boolean(id),
  });
}
