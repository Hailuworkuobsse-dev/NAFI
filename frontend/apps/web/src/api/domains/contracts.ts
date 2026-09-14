import { buildQuery, http } from '../client';
import type { ListResponse } from '../types/common';
import type {
  ContractDetail,
  ContractFilters,
  ContractSignature,
  ContractSummary,
  ContractTimelineEvent,
  CreateContractInput,
  SignContractInput,
} from '../types/contract';

export const contractsApi = {
  list(filters: ContractFilters = {}) {
    return http.get<ListResponse<ContractSummary>>(`/contracts${buildQuery(filters)}`);
  },

  detail(id: string) {
    return http.get<ContractDetail>(`/contracts/${id}`);
  },

  timeline(id: string) {
    return http.get<ContractTimelineEvent[]>(`/contracts/${id}/timeline`);
  },

  signatures(id: string) {
    return http.get<ContractSignature[]>(`/contracts/${id}/signatures`);
  },

  create(input: CreateContractInput) {
    return http.post<ContractDetail>('/contracts', input);
  },

  update(id: string, input: Partial<CreateContractInput>) {
    return http.patch<ContractDetail>(`/contracts/${id}`, input);
  },

  sign(input: SignContractInput) {
    return http.post<ContractSignature>(`/contracts/${input.contractId}/sign`, {
      role: input.role,
      signatureHash: input.signatureHash,
    });
  },

  freeze(id: string, reason: string) {
    return http.post<ContractDetail>(`/contracts/${id}/freeze`, { reason });
  },

  unfreeze(id: string) {
    return http.post<ContractDetail>(`/contracts/${id}/unfreeze`);
  },

  archive(id: string) {
    return http.delete<void>(`/contracts/${id}`);
  },
};
