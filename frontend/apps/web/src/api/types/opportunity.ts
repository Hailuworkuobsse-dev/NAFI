import type { Decimal, ID, ISODate } from './common';

export interface PublicOpportunity {
  id: ID;
  targetCrop: string;
  region: string;
  regionCode: string;
  targetAmountEtb: Decimal;
  committedAmountEtb: Decimal;
  investorCount: number;
  targetYieldKg: Decimal;
  floorPriceEtb: Decimal;
  maturityDate: ISODate;
  fundedPercent: number;
}
