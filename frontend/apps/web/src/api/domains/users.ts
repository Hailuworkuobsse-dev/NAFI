import { buildQuery, http } from '../client';
import type { ListResponse } from '../types/common';
import type { InviteUserInput, UserFilters, UserSummary } from '../types/user';

export const usersApi = {
  list(filters: UserFilters = {}) {
    return http.get<ListResponse<UserSummary>>(`/users${buildQuery(filters)}`);
  },

  detail(id: string) {
    return http.get<UserSummary>(`/users/${id}`);
  },

  invite(input: InviteUserInput) {
    return http.post<UserSummary>('/users/invite', input);
  },

  deactivate(id: string) {
    return http.post<UserSummary>(`/users/${id}/deactivate`);
  },

  reactivate(id: string) {
    return http.post<UserSummary>(`/users/${id}/reactivate`);
  },
};
