import type { Decimal, ID, ISODate, PageParams } from './common';

export interface InputPurchaseSummary {
  id: ID;
  contractId: ID;
  contractCrop: string;
  supplierId: ID;
  supplierName: string;
  itemDescription: string;
  quantity: Decimal;
  unit: string;
  unitCostEtb: Decimal;
  totalCostEtb: Decimal;
  isDelivered: boolean;
  isDisbursed: boolean;
  deliveredAt?: ISODate;
  verifiedAt?: ISODate;
  createdAt: ISODate;
}

export interface InputFilters extends PageParams {
  contractId?: ID;
  supplierId?: ID;
  isDelivered?: boolean;
  isDisbursed?: boolean;
}

export interface CreateInputOrderInput {
  contractId: ID;
  itemDescription: string;
  quantity: Decimal;
  unit: string;
  unitCostEtb: Decimal;
}

export interface VerifyDeliveryInput {
  purchaseId: ID;
  photoHash: string;
  latitude: number;
  longitude: number;
  qrCode?: string;
  notes?: string;
}
