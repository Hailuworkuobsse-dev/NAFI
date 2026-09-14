import { useQuery, type UseQueryOptions } from '@tanstack/react-query';

import { auditApi, type AuditFilters, type AuditLogEntry } from '@/api/domains/audit';
import type { ListResponse } from '@/api/types/common';
import { qk } from '@/lib/queryKeys';

export function useAuditLog(
  filters: AuditFilters = {},
  options?: Omit<UseQueryOptions<ListResponse<AuditLogEntry>>, 'queryKey' | 'queryFn'>,
) {
  return useQuery({
    queryKey: qk.audit.list(filters),
    queryFn: () => auditApi.list(filters),
    placeholderData: (prev) => prev,
    ...options,
  });
}
