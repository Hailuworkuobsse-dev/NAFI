import { buildQuery, http } from '../client';
import type { ListResponse } from '../types/common';
import type {
  ExecuteSettlementInput,
  SettlementDetail,
  SettlementFilters,
  SettlementSummary,
  SimulateSettlementInput,
} from '../types/settlement';

export const settlementsApi = {
  list(filters: SettlementFilters = {}) {
    return http.get<ListResponse<SettlementSummary>>(`/settlements${buildQuery(filters)}`);
  },

  detail(id: string) {
    return http.get<SettlementDetail>(`/settlements/${id}`);
  },

  simulate(input: SimulateSettlementInput) {
    return http.post<SettlementDetail>('/settlements/simulate', input);
  },

  execute(input: ExecuteSettlementInput) {
    return http.post<SettlementDetail>(`/settlements/${input.settlementId}/execute`, {
      approvalToken: input.approvalToken,
    });
  },

  reverse(id: string, reason: string) {
    return http.post<SettlementDetail>(`/settlements/${id}/reverse`, { reason });
  },
};
