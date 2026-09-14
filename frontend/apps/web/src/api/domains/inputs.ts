import { buildQuery, http } from '../client';
import type { ListResponse } from '../types/common';
import type {
  CreateInputOrderInput,
  InputFilters,
  InputPurchaseSummary,
  VerifyDeliveryInput,
} from '../types/input';

export const inputsApi = {
  list(filters: InputFilters = {}) {
    return http.get<ListResponse<InputPurchaseSummary>>(`/inputs${buildQuery(filters)}`);
  },

  detail(id: string) {
    return http.get<InputPurchaseSummary>(`/inputs/${id}`);
  },

  create(input: CreateInputOrderInput) {
    return http.post<InputPurchaseSummary>('/inputs', input);
  },

  verifyDelivery(input: VerifyDeliveryInput) {
    return http.post<InputPurchaseSummary>(`/inputs/${input.purchaseId}/verify`, {
      photoHash: input.photoHash,
      latitude: input.latitude,
      longitude: input.longitude,
      qrCode: input.qrCode,
      notes: input.notes,
    });
  },
};
