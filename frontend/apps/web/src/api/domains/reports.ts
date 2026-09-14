import { buildQuery, http } from '../client';
import type { ListResponse } from '../types/common';
import type { GenerateReportInput, ReportFilters, ReportSummary } from '../types/report';

export const reportsApi = {
  list(filters: ReportFilters = {}) {
    return http.get<ListResponse<ReportSummary>>(`/reports${buildQuery(filters)}`);
  },

  detail(id: string) {
    return http.get<ReportSummary>(`/reports/${id}`);
  },

  generate(input: GenerateReportInput) {
    return http.post<ReportSummary>('/reports', input);
  },

  download(id: string) {
    return http.get<{ url: string }>(`/reports/${id}/download`);
  },
};
