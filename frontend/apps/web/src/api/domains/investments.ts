import { buildQuery, http } from '../client';
import type { ListResponse } from '../types/common';
import type {
  CreateInvestmentInput,
  InvestmentFilters,
  InvestmentSummary,
} from '../types/investment';

export const investmentsApi = {
  mine(filters: InvestmentFilters = {}) {
    return http.get<ListResponse<InvestmentSummary>>(
      `/investments/mine${buildQuery(filters)}`,
    );
  },

  list(filters: InvestmentFilters = {}) {
    return http.get<ListResponse<InvestmentSummary>>(`/investments${buildQuery(filters)}`);
  },

  detail(id: string) {
    return http.get<InvestmentSummary>(`/investments/${id}`);
  },

  create(input: CreateInvestmentInput) {
    return http.post<InvestmentSummary>('/investments', input);
  },
};
