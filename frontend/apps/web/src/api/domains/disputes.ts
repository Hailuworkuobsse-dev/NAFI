import { buildQuery, http } from '../client';
import type { ListResponse } from '../types/common';
import type {
  DecideDisputeInput,
  DisputeDetail,
  DisputeFilters,
  DisputeSummary,
  FileDisputeInput,
} from '../types/dispute';

export const disputesApi = {
  list(filters: DisputeFilters = {}) {
    return http.get<ListResponse<DisputeSummary>>(`/disputes${buildQuery(filters)}`);
  },

  detail(id: string) {
    return http.get<DisputeDetail>(`/disputes/${id}`);
  },

  file(input: FileDisputeInput) {
    return http.post<DisputeSummary>('/disputes', input);
  },

  scheduleHearing(id: string, hearingAt: string, arbitratorId: string) {
    return http.post<DisputeDetail>(`/disputes/${id}/schedule`, { hearingAt, arbitratorId });
  },

  decide(input: DecideDisputeInput) {
    return http.post<DisputeDetail>(`/disputes/${input.disputeId}/decide`, {
      decision: input.decision,
      outcome: input.outcome,
    });
  },
};
