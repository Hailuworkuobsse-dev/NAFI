import { useQuery, type UseQueryOptions } from '@tanstack/react-query';

import { escrowsApi } from '@/api/domains/escrows';
import type { ListResponse } from '@/api/types/common';
import type { EscrowFilters, EscrowLedgerEntry, EscrowSummary } from '@/api/types/escrow';
import { qk } from '@/lib/queryKeys';

export function useEscrows(
  filters: EscrowFilters = {},
  options?: Omit<UseQueryOptions<ListResponse<EscrowSummary>>, 'queryKey' | 'queryFn'>,
) {
  return useQuery({
    queryKey: qk.escrows.list(filters),
    queryFn: () => escrowsApi.list(filters),
    placeholderData: (prev) => prev,
    ...options,
  });
}

export function useEscrow(
  id: string,
  options?: Omit<UseQueryOptions<EscrowSummary>, 'queryKey' | 'queryFn'>,
) {
  return useQuery({
    queryKey: qk.escrows.detail(id),
    queryFn: () => escrowsApi.detail(id),
    enabled: Boolean(id),
    ...options,
  });
}

export function useEscrowLedger(id: string) {
  return useQuery<EscrowLedgerEntry[]>({
    queryKey: qk.escrows.ledger(id),
    queryFn: () => escrowsApi.ledger(id),
    enabled: Boolean(id),
  });
}
