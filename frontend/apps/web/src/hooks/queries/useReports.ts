import { useQuery, type UseQueryOptions } from '@tanstack/react-query';

import { reportsApi } from '@/api/domains/reports';
import type { ListResponse } from '@/api/types/common';
import type { ReportFilters, ReportSummary } from '@/api/types/report';
import { qk } from '@/lib/queryKeys';

export function useReports(
  filters: ReportFilters = {},
  options?: Omit<UseQueryOptions<ListResponse<ReportSummary>>, 'queryKey' | 'queryFn'>,
) {
  return useQuery({
    queryKey: qk.reports.list(filters),
    queryFn: () => reportsApi.list(filters),
    placeholderData: (prev) => prev,
    ...options,
  });
}

export function useReport(id: string) {
  return useQuery({
    queryKey: qk.reports.detail(id),
    queryFn: () => reportsApi.detail(id),
    enabled: Boolean(id),
  });
}
