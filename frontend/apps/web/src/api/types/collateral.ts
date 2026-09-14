import type { Decimal, ID, ISODate, PageParams } from './common';

export type CollateralType =
  | 'WAREHOUSE_RECEIPT'
  | 'MOVABLE_PROPERTY'
  | 'FUTURE_HARVEST'
  | 'MACHINERY';

export type LienStatus = 'FREE' | 'LIEN_REGISTERED' | 'LIQUIDATED' | 'RELEASED';

export interface CollateralSummary {
  id: ID;
  type: CollateralType;
  ownerId: ID;
  ownerName: string;
  description: string;
  estimatedValueEtb: Decimal;
  lienStatus: LienStatus;
  lienHolderId?: ID;
  lienHolderName?: string;
  registeredAt: ISODate;
  expiresAt?: ISODate;
}

export interface WarehouseReceiptData extends CollateralSummary {
  type: 'WAREHOUSE_RECEIPT';
  quantityKg: Decimal;
  grade: string;
  warehouseId: ID;
  warehouseName: string;
  emcrRegistrationId?: string;
  qrPayload: string;
}

export interface CollateralFilters extends PageParams {
  type?: CollateralType;
  lienStatus?: LienStatus;
  ownerId?: ID;
  lienHolderId?: ID;
}

export interface RegisterCollateralInput {
  type: CollateralType;
  description: string;
  estimatedValueEtb: Decimal;
  quantityKg?: Decimal;
  grade?: string;
  warehouseId?: ID;
  expiresAt?: ISODate;
}
