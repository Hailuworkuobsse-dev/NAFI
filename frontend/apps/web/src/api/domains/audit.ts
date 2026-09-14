import { buildQuery, http } from '../client';
import type { ListResponse } from '../types/common';

export interface AuditLogEntry {
  id: string;
  actorId: string;
  actorName: string;
  action: string;
  resource: string;
  resourceId: string;
  ip: string;
  createdAt: string;
  metadata?: Record<string, unknown>;
}

export interface AuditFilters {
  actorId?: string;
  resource?: string;
  resourceId?: string;
  from?: string;
  to?: string;
  page?: number;
  pageSize?: number;
}

export const auditApi = {
  list(filters: AuditFilters = {}) {
    return http.get<ListResponse<AuditLogEntry>>(`/audit${buildQuery(filters)}`);
  },
};
