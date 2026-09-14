import type { ID, ISODate, PageParams } from './common';

export type ReportType =
  | 'REGULATORY_NBE'
  | 'REGULATORY_MOA'
  | 'REGULATORY_MOR'
  | 'DONOR_EIB'
  | 'DONOR_IFAD'
  | 'PORTFOLIO'
  | 'TAX'
  | 'AUDIT';

export type ReportFormat = 'PDF' | 'CSV' | 'XLSX';

export interface ReportSummary {
  id: ID;
  type: ReportType;
  title: string;
  periodStart: ISODate;
  periodEnd: ISODate;
  format: ReportFormat;
  fileUrl: string;
  generatedById: ID;
  generatedByName: string;
  generatedAt: ISODate;
}

export interface ReportFilters extends PageParams {
  type?: ReportType;
  from?: ISODate;
  to?: ISODate;
}

export interface GenerateReportInput {
  type: ReportType;
  periodStart: ISODate;
  periodEnd: ISODate;
  format: ReportFormat;
  filters?: Record<string, string>;
}
