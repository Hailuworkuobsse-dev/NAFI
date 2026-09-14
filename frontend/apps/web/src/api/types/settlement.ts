import type { Decimal, ID, ISODate, PageParams } from './common';

export type SettlementStatus = 'PENDING' | 'SIMULATED' | 'APPROVED' | 'EXECUTED' | 'REVERSED';

export interface SettlementDistribution {
  recipientId: ID;
  recipientName: string;
  role:
    | 'DIASPORA_INVESTOR'
    | 'INPUT_SUPPLIER'
    | 'COMMERCIAL_BANK'
    | 'DBE_OFFICER'
    | 'NAFA_OFFICER'
    | 'COMMERCIAL_FARMER'
    | 'TAX_AUTHORITY';
  payoutAmountEtb: Decimal;
  notes?: string;
}

export interface SettlementSummary {
  id: ID;
  contractId: ID;
  contractCrop: string;
  status: SettlementStatus;
  grossRevenueEtb: Decimal;
  actualYieldKg: Decimal;
  totalDistributedEtb: Decimal;
  executedAt?: ISODate;
  createdAt: ISODate;
}

export interface SettlementDetail extends SettlementSummary {
  distributions: SettlementDistribution[];
  waterfallOrder: string[];
  approvalChain: { actorId: ID; actorName: string; approvedAt: ISODate }[];
  reversalReason?: string;
}

export interface SettlementFilters extends PageParams {
  contractId?: ID;
  status?: SettlementStatus;
}

export interface SimulateSettlementInput {
  contractId: ID;
  actualYieldKg: Decimal;
  grossRevenueEtb: Decimal;
}

export interface ExecuteSettlementInput {
  settlementId: ID;
  approvalToken: string;
}
