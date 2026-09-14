import { http } from '../client';
import type { PublicOpportunity } from '../types/opportunity';

export const opportunitiesApi = {
  list() {
    return http.get<PublicOpportunity[]>('/opportunities');
  },

  detail(id: string) {
    return http.get<PublicOpportunity>(`/opportunities/${id}`);
  },
};
