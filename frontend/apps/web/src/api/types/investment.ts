import type { Decimal, ID, ISODate, PageParams } from './common';

export type FundingType = 'DEBT_FIXED_RETURN' | 'EQUITY_PROFIT_SHARE';

export interface InvestmentSummary {
  id: ID;
  contractId: ID;
  contractCrop: string;
  contractRegion: string;
  investorId: ID;
  investorName: string;
  fundingType: FundingType;
  amountForeignCurrency: Decimal;
  currency: string;
  amountEtb: Decimal;
  agreedReturnRate: Decimal;
  expectedReturnEtb: Decimal;
  realizedReturnEtb?: Decimal;
  investedAt: ISODate;
  settledAt?: ISODate;
}

export interface InvestmentFilters extends PageParams {
  contractId?: ID;
  fundingType?: FundingType;
  currency?: string;
  from?: ISODate;
  to?: ISODate;
}

export interface CreateInvestmentInput {
  contractId: ID;
  fundingType: FundingType;
  amountForeignCurrency: Decimal;
  currency: string;
  agreedReturnRate: number;
  sourceOfFunds: string;
}
