import type { Decimal, ID, ISODate, PageParams } from './common';

export type EscrowStatus = 'OPEN' | 'LOCKED' | 'RELEASED' | 'FROZEN' | 'CLOSED';

export interface EscrowBalance {
  currency: 'ETB' | 'USD' | 'EUR';
  amount: Decimal;
}

export interface EscrowSummary {
  id: ID;
  contractId: ID;
  contractCrop: string;
  managingBankId: ID;
  managingBankName: string;
  status: EscrowStatus;
  isLocked: boolean;
  balances: EscrowBalance[];
  totalDepositedEtb: Decimal;
  createdAt: ISODate;
}

export interface EscrowLedgerEntry {
  id: ID;
  escrowId: ID;
  direction: 'CREDIT' | 'DEBIT' | 'HOLD' | 'RELEASE';
  amount: Decimal;
  currency: string;
  purpose: string;
  referenceId?: ID;
  createdAt: ISODate;
  actorId: ID;
  actorName: string;
}

export interface EscrowFilters extends PageParams {
  status?: EscrowStatus;
  bankId?: ID;
  contractId?: ID;
}

export interface ReleaseEscrowInput {
  escrowId: ID;
  amount: Decimal;
  currency: string;
  recipientId: ID;
  purpose: string;
  approvalToken?: string;
}

export interface FreezeEscrowInput {
  escrowId: ID;
  reason: string;
}
