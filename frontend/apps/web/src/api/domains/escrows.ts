import { buildQuery, http } from '../client';
import type { ListResponse } from '../types/common';
import type {
  EscrowFilters,
  EscrowLedgerEntry,
  EscrowSummary,
  FreezeEscrowInput,
  ReleaseEscrowInput,
} from '../types/escrow';

/**
 * The live backend may omit or null `balances` on escrow payloads while its
 * schema converges with the frontend contract. Coerce to an array at the
 * boundary so no consumer can crash on `undefined.find/map`.
 */
function withBalances<T extends { balances?: unknown }>(escrow: T): T {
  return Array.isArray(escrow.balances) ? escrow : { ...escrow, balances: [] };
}

function withBalancesList(res: ListResponse<EscrowSummary>): ListResponse<EscrowSummary> {
  return { ...res, items: res.items.map((e) => withBalances(e)) };
}

export const escrowsApi = {
  list(filters: EscrowFilters = {}) {
    return http.get<ListResponse<EscrowSummary>>(`/escrows${buildQuery(filters)}`).then(withBalancesList);
  },

  detail(id: string) {
    return http.get<EscrowSummary>(`/escrows/${id}`).then(withBalances);
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
    }).then(withBalances);
  },

  unfreeze(id: string) {
    return http.post<EscrowSummary>(`/escrows/${id}/unfreeze`).then(withBalances);
  },

  close(id: string) {
    return http.post<EscrowSummary>(`/escrows/${id}/close`).then(withBalances);
  },
};
