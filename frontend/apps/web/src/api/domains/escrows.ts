import { buildQuery, http } from '../client';
import type { ListResponse } from '../types/common';
import type {
  EscrowFilters,
  EscrowLedgerEntry,
  EscrowSummary,
  FreezeEscrowInput,
  ReleaseEscrowInput,
} from '../types/escrow';

export const escrowsApi = {
  list(filters: EscrowFilters = {}) {
    return http.get<ListResponse<EscrowSummary>>(`/escrows${buildQuery(filters)}`);
  },

  detail(id: string) {
    return http.get<EscrowSummary>(`/escrows/${id}`);
  },

  ledger(id: string) {
    return http.get<EscrowLedgerEntry[]>(`/escrows/${id}/ledger`);
  },

  release(input: ReleaseEscrowInput) {
    return http.post<EscrowLedgerEntry>(`/escrows/${input.escrowId}/release`, input);
  },

  freeze(input: FreezeEscrowInput) {
    return http.post<EscrowSummary>(`/escrows/${input.escrowId}/freeze`, {
      reason: input.reason,
    });
  },

  unfreeze(id: string) {
    return http.post<EscrowSummary>(`/escrows/${id}/unfreeze`);
  },

  close(id: string) {
    return http.post<EscrowSummary>(`/escrows/${id}/close`);
  },
};
