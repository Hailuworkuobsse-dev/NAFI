import type { ID, ISODate, PageParams } from './common';

export type DisputeStatus =
  | 'FLAGGED'
  | 'UNDER_REVIEW'
  | 'HEARING_SCHEDULED'
  | 'DECIDED'
  | 'APPEALED'
  | 'CLOSED';

export type DisputeCategory =
  | 'CONTRACT_BREACH'
  | 'QUALITY'
  | 'PAYMENT'
  | 'DELIVERY'
  | 'OTHER';

export interface DisputeSummary {
  id: ID;
  contractId: ID;
  contractCrop: string;
  category: DisputeCategory;
  status: DisputeStatus;
  filedById: ID;
  filedByName: string;
  summary: string;
  arbitratorId?: ID;
  arbitratorName?: string;
  filedAt: ISODate;
  resolvedAt?: ISODate;
}

export interface DisputeDetail extends DisputeSummary {
  evidence: { id: ID; label: string; fileUrl: string; uploadedAt: ISODate }[];
  hearingAt?: ISODate;
  decision?: string;
  decisionAt?: ISODate;
}

export interface DisputeFilters extends PageParams {
  contractId?: ID;
  status?: DisputeStatus;
  category?: DisputeCategory;
}

export interface FileDisputeInput {
  contractId: ID;
  category: DisputeCategory;
  summary: string;
  evidenceUrls?: string[];
}

export interface DecideDisputeInput {
  disputeId: ID;
  decision: string;
  outcome: 'UPHOLD' | 'REJECT' | 'PARTIAL';
}
