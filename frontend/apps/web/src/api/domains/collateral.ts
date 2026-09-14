import { buildQuery, http } from '../client';
import type { ListResponse } from '../types/common';
import type {
  CollateralFilters,
  CollateralSummary,
  RegisterCollateralInput,
} from '../types/collateral';

export const collateralApi = {
  list(filters: CollateralFilters = {}) {
    return http.get<ListResponse<CollateralSummary>>(`/collateral${buildQuery(filters)}`);
  },

  detail(id: string) {
    return http.get<CollateralSummary>(`/collateral/${id}`);
  },

  register(input: RegisterCollateralInput) {
    return http.post<CollateralSummary>('/collateral', input);
  },

  registerLien(id: string, lienHolderId: string, amount: string) {
    return http.post<CollateralSummary>(`/collateral/${id}/lien`, { lienHolderId, amount });
  },

  releaseLien(id: string) {
    return http.post<CollateralSummary>(`/collateral/${id}/release`);
  },

  liquidate(id: string, reason: string) {
    return http.post<CollateralSummary>(`/collateral/${id}/liquidate`, { reason });
  },
};
