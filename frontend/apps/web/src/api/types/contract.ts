import type { Decimal, ID, ISODate, PageParams } from './common';

export type ContractStatus = 'DRAFT' | 'ACTIVE' | 'FULFILLED' | 'DEFAULTED' | 'DISPUTED';

export interface ContractSummary {
  id: ID;
  targetCrop: string;
  region: string;
  regionCode: string;
  farmerId: ID;
  farmerName: string;
  totalTargetYieldKg: Decimal;
  guaranteedFloorPriceEtb: Decimal;
  contractValueEtb: Decimal;
  committedAmountEtb: Decimal;
  status: ContractStatus;
  maturityDate: ISODate;
  createdAt: ISODate;
  updatedAt: ISODate;
}

export interface ContractDetail extends ContractSummary {
  governmentWitnessId: ID;
  governmentWitnessName: string;
  bankId?: ID;
  bankName?: string;
  escrowId?: ID;
  investorCount: number;
  committedAmountEtb: Decimal;
  fundedPercent: number;
  onChainHash: string;
  signatures: ContractSignature[];
  timeline: ContractTimelineEvent[];
}

export interface ContractSignature {
  role: 'FARMER' | 'BANK' | 'GOVERNMENT_WITNESS' | 'SUPPLIER' | 'OFF_TAKER';
  signerId: ID;
  signerName: string;
  signatureHash: string;
  signedAt: ISODate;
}

export interface ContractTimelineEvent {
  id: ID;
  type: string;
  label: string;
  description?: string;
  timestamp: ISODate;
}

export interface ContractFilters extends PageParams {
  status?: ContractStatus;
  regionCode?: string;
  crop?: string;
  farmerId?: ID;
  from?: ISODate;
  to?: ISODate;
}

export interface CreateContractInput {
  commercialFarmerId: ID;
  targetCrop: string;
  totalTargetYieldKg: Decimal;
  guaranteedFloorPriceEtb: Decimal;
  maturityDate: ISODate;
  governmentWitnessId: ID;
  regionCode: string;
}

export interface SignContractInput {
  contractId: ID;
  role: ContractSignature['role'];
  signatureHash: string;
}
