#!/usr/bin/env bash
# ============================================================
# NAFI Frontend — Step 5 Scaffolding Script
# Creates the complete data layer for apps/web:
#   - Typed API modules (12 domains)
#   - Query hooks (12 families)
#   - Mutation hooks (8 families)
#   - Error normalization + boundaries
#   - useTableState, useDebounce, useTenantScope
#   - QueryKey factory
#   - QueryBoundary, ErrorBoundary, RouteErrorBoundary
# ============================================================
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "▶ NAFI Step 5 scaffolding → $SCRIPT_DIR"

mkfile() {
  local path="$1"
  mkdir -p "$(dirname "$path")"
  cat > "$path"
  echo "  ✓ $path"
}

APP="apps/web"
mkdir -p "$APP/src/api/domains"
mkdir -p "$APP/src/api/types"
mkdir -p "$APP/src/hooks/queries"
mkdir -p "$APP/src/hooks/mutations"
mkdir -p "$APP/src/hooks/__tests__"
mkdir -p "$APP/src/components"
mkdir -p "$APP/src/lib"

# ============================================================
# API TYPES
# ============================================================

mkfile "$APP/src/api/types/common.ts" <<'EOF'
export interface Paginated<T> {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
}

export interface PageParams {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
  q?: string;
}

export interface ApiMeta {
  requestId: string;
}

export interface ListResponse<T> {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
}

export type ID = string;
export type ISODate = string;
export type Decimal = string;
EOF

mkfile "$APP/src/api/types/contract.ts" <<'EOF'
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
EOF

mkfile "$APP/src/api/types/escrow.ts" <<'EOF'
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
EOF

mkfile "$APP/src/api/types/investment.ts" <<'EOF'
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
EOF

mkfile "$APP/src/api/types/opportunity.ts" <<'EOF'
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
EOF

mkfile "$APP/src/api/types/input.ts" <<'EOF'
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
EOF

mkfile "$APP/src/api/types/settlement.ts" <<'EOF'
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
EOF

mkfile "$APP/src/api/types/collateral.ts" <<'EOF'
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
EOF

mkfile "$APP/src/api/types/dispute.ts" <<'EOF'
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
EOF

mkfile "$APP/src/api/types/report.ts" <<'EOF'
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
EOF

mkfile "$APP/src/api/types/user.ts" <<'EOF'
import type { Permission, Role } from '@nafi/rbac-core';

import type { ID, ISODate, PageParams } from './common';

export interface UserSummary {
  id: ID;
  nafiId: string;
  fullName: string;
  email: string;
  role: Role;
  institutionId?: ID;
  institutionName?: string;
  isActive: boolean;
  lastLoginAt?: ISODate;
  createdAt: ISODate;
}

export interface UserFilters extends PageParams {
  role?: Role;
  institutionId?: ID;
  isActive?: boolean;
}

export interface InviteUserInput {
  email: string;
  fullName: string;
  role: Role;
  permissions?: Permission[];
}
EOF

mkfile "$APP/src/api/types/index.ts" <<'EOF'
export * from './common';
export * from './contract';
export * from './escrow';
export * from './investment';
export * from './opportunity';
export * from './input';
export * from './settlement';
export * from './collateral';
export * from './dispute';
export * from './report';
export * from './user';
EOF

# ============================================================
# ERROR NORMALIZATION
# ============================================================

mkfile "$APP/src/api/errors.ts" <<'EOF'
import { AxiosError } from 'axios';

export type ApiErrorKind =
  | 'network'
  | 'unauthorized'
  | 'forbidden'
  | 'notFound'
  | 'validation'
  | 'conflict'
  | 'rateLimit'
  | 'server'
  | 'unknown';

export interface NormalizedApiError {
  kind: ApiErrorKind;
  status: number | null;
  code: string;
  message: string;
  details?: Record<string, string[]>;
  requestId?: string;
  raw: unknown;
}

const DEFAULT_MESSAGES: Record<ApiErrorKind, string> = {
  network: 'Network error. Please check your connection and try again.',
  unauthorized: 'Your session has expired. Please sign in again.',
  forbidden: 'You do not have permission to perform this action.',
  notFound: 'The requested resource was not found.',
  validation: 'Some fields need your attention.',
  conflict: 'This action conflicts with the current state.',
  rateLimit: 'Too many requests. Please slow down and try again shortly.',
  server: 'Something went wrong on our side. Please try again.',
  unknown: 'An unexpected error occurred.',
};

export function normalizeApiError(err: unknown): NormalizedApiError {
  if (err instanceof AxiosError) {
    const status = err.response?.status ?? null;
    const body = err.response?.data as
      | {
          error?: {
            code?: string;
            message?: string;
            details?: Record<string, string[]>;
            requestId?: string;
          };
        }
      | undefined;

    const kind = classify(status);
    return {
      kind,
      status,
      code: body?.error?.code ?? kind,
      message: body?.error?.message ?? DEFAULT_MESSAGES[kind],
      details: body?.error?.details,
      requestId: body?.error?.requestId,
      raw: err,
    };
  }

  if (err instanceof Error) {
    return {
      kind: 'unknown',
      status: null,
      code: 'unknown',
      message: err.message || DEFAULT_MESSAGES.unknown,
      raw: err,
    };
  }

  return {
    kind: 'unknown',
    status: null,
    code: 'unknown',
    message: DEFAULT_MESSAGES.unknown,
    raw: err,
  };
}

function classify(status: number | null): ApiErrorKind {
  if (status === null) return 'network';
  if (status === 401) return 'unauthorized';
  if (status === 403) return 'forbidden';
  if (status === 404) return 'notFound';
  if (status === 409) return 'conflict';
  if (status === 422 || status === 400) return 'validation';
  if (status === 429) return 'rateLimit';
  if (status >= 500) return 'server';
  return 'unknown';
}
EOF

# ============================================================
# API CLIENT WRAPPER
# ============================================================

mkfile "$APP/src/api/client.ts" <<'EOF'
import type { AxiosInstance, AxiosRequestConfig } from 'axios';

import { apiClient as baseClient } from '@/auth/api';

import { normalizeApiError } from './errors';

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '/api/v1';

/**
 * Domain-facing wrapper around the auth API client.
 *  - Normalizes errors via throwing NormalizedApiError
 *  - Unwraps the { data } envelope
 */
class HttpClient {
  constructor(private readonly client: AxiosInstance) {}

  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    try {
      const res = await this.client.get<{ data: T }>(url, config);
      return res.data.data;
    } catch (err) {
      throw normalizeApiError(err);
    }
  }

  async post<T>(url: string, body?: unknown, config?: AxiosRequestConfig): Promise<T> {
    try {
      const res = await this.client.post<{ data: T }>(url, body, config);
      return res.data.data;
    } catch (err) {
      throw normalizeApiError(err);
    }
  }

  async put<T>(url: string, body?: unknown, config?: AxiosRequestConfig): Promise<T> {
    try {
      const res = await this.client.put<{ data: T }>(url, body, config);
      return res.data.data;
    } catch (err) {
      throw normalizeApiError(err);
    }
  }

  async patch<T>(url: string, body?: unknown, config?: AxiosRequestConfig): Promise<T> {
    try {
      const res = await this.client.patch<{ data: T }>(url, body, config);
      return res.data.data;
    } catch (err) {
      throw normalizeApiError(err);
    }
  }

  async delete<T = void>(url: string, config?: AxiosRequestConfig): Promise<T> {
    try {
      const res = await this.client.delete<{ data: T }>(url, config);
      return res.data.data;
    } catch (err) {
      throw normalizeApiError(err);
    }
  }
}

export const http = new HttpClient(baseClient);

/**
 * Build query strings safely, dropping undefined/null values.
 */
export function buildQuery(params: Record<string, unknown>): string {
  const usp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v === undefined || v === null || v === '') continue;
    if (Array.isArray(v)) {
      v.forEach((item) => usp.append(k, String(item)));
    } else {
      usp.append(k, String(v));
    }
  }
  const qs = usp.toString();
  return qs ? `?${qs}` : '';
}

export { BASE_URL };
EOF

# ============================================================
# DOMAIN API MODULES
# ============================================================

mkfile "$APP/src/api/domains/contracts.ts" <<'EOF'
import { buildQuery, http } from '../client';
import type { ListResponse } from '../types/common';
import type {
  ContractDetail,
  ContractFilters,
  ContractSignature,
  ContractSummary,
  ContractTimelineEvent,
  CreateContractInput,
  SignContractInput,
} from '../types/contract';

export const contractsApi = {
  list(filters: ContractFilters = {}) {
    return http.get<ListResponse<ContractSummary>>(`/contracts${buildQuery(filters)}`);
  },

  detail(id: string) {
    return http.get<ContractDetail>(`/contracts/${id}`);
  },

  timeline(id: string) {
    return http.get<ContractTimelineEvent[]>(`/contracts/${id}/timeline`);
  },

  signatures(id: string) {
    return http.get<ContractSignature[]>(`/contracts/${id}/signatures`);
  },

  create(input: CreateContractInput) {
    return http.post<ContractDetail>('/contracts', input);
  },

  update(id: string, input: Partial<CreateContractInput>) {
    return http.patch<ContractDetail>(`/contracts/${id}`, input);
  },

  sign(input: SignContractInput) {
    return http.post<ContractSignature>(`/contracts/${input.contractId}/sign`, {
      role: input.role,
      signatureHash: input.signatureHash,
    });
  },

  freeze(id: string, reason: string) {
    return http.post<ContractDetail>(`/contracts/${id}/freeze`, { reason });
  },

  unfreeze(id: string) {
    return http.post<ContractDetail>(`/contracts/${id}/unfreeze`);
  },

  archive(id: string) {
    return http.delete<void>(`/contracts/${id}`);
  },
};
EOF

mkfile "$APP/src/api/domains/escrows.ts" <<'EOF'
import { buildQuery, http } from '../client';
import type { ListResponse } from '../types/common';
import type {
  EscrowFilters,
  EscrowLedgerEntry,
  EscrowSummary,
  FreezeEscrowInput,
  ReleaseEscrowInput,
} from '../types/escrow';

export const escrowsApi = {
  list(filters: EscrowFilters = {}) {
    return http.get<ListResponse<EscrowSummary>>(`/escrows${buildQuery(filters)}`);
  },

  detail(id: string) {
    return http.get<EscrowSummary>(`/escrows/${id}`);
  },

  ledger(id: string) {
    return http.get<EscrowLedgerEntry[]>(`/escrows/${id}/ledger`);
  },

  release(input: ReleaseEscrowInput) {
    return http.post<EscrowLedgerEntry>(`/escrows/${input.escrowId}/release`, input);
  },

  freeze(input: FreezeEscrowInput) {
    return http.post<EscrowSummary>(`/escrows/${input.escrowId}/freeze`, {
      reason: input.reason,
    });
  },

  unfreeze(id: string) {
    return http.post<EscrowSummary>(`/escrows/${id}/unfreeze`);
  },

  close(id: string) {
    return http.post<EscrowSummary>(`/escrows/${id}/close`);
  },
};
EOF

mkfile "$APP/src/api/domains/investments.ts" <<'EOF'
import { buildQuery, http } from '../client';
import type { ListResponse } from '../types/common';
import type {
  CreateInvestmentInput,
  InvestmentFilters,
  InvestmentSummary,
} from '../types/investment';

export const investmentsApi = {
  mine(filters: InvestmentFilters = {}) {
    return http.get<ListResponse<InvestmentSummary>>(
      `/investments/mine${buildQuery(filters)}`,
    );
  },

  list(filters: InvestmentFilters = {}) {
    return http.get<ListResponse<InvestmentSummary>>(`/investments${buildQuery(filters)}`);
  },

  detail(id: string) {
    return http.get<InvestmentSummary>(`/investments/${id}`);
  },

  create(input: CreateInvestmentInput) {
    return http.post<InvestmentSummary>('/investments', input);
  },
};
EOF

mkfile "$APP/src/api/domains/opportunities.ts" <<'EOF'
import { http } from '../client';
import type { PublicOpportunity } from '../types/opportunity';

export const opportunitiesApi = {
  list() {
    return http.get<PublicOpportunity[]>('/opportunities');
  },

  detail(id: string) {
    return http.get<PublicOpportunity>(`/opportunities/${id}`);
  },
};
EOF

mkfile "$APP/src/api/domains/inputs.ts" <<'EOF'
import { buildQuery, http } from '../client';
import type { ListResponse } from '../types/common';
import type {
  CreateInputOrderInput,
  InputFilters,
  InputPurchaseSummary,
  VerifyDeliveryInput,
} from '../types/input';

export const inputsApi = {
  list(filters: InputFilters = {}) {
    return http.get<ListResponse<InputPurchaseSummary>>(`/inputs${buildQuery(filters)}`);
  },

  detail(id: string) {
    return http.get<InputPurchaseSummary>(`/inputs/${id}`);
  },

  create(input: CreateInputOrderInput) {
    return http.post<InputPurchaseSummary>('/inputs', input);
  },

  verifyDelivery(input: VerifyDeliveryInput) {
    return http.post<InputPurchaseSummary>(`/inputs/${input.purchaseId}/verify`, {
      photoHash: input.photoHash,
      latitude: input.latitude,
      longitude: input.longitude,
      qrCode: input.qrCode,
      notes: input.notes,
    });
  },
};
EOF

mkfile "$APP/src/api/domains/settlements.ts" <<'EOF'
import { buildQuery, http } from '../client';
import type { ListResponse } from '../types/common';
import type {
  ExecuteSettlementInput,
  SettlementDetail,
  SettlementFilters,
  SettlementSummary,
  SimulateSettlementInput,
} from '../types/settlement';

export const settlementsApi = {
  list(filters: SettlementFilters = {}) {
    return http.get<ListResponse<SettlementSummary>>(`/settlements${buildQuery(filters)}`);
  },

  detail(id: string) {
    return http.get<SettlementDetail>(`/settlements/${id}`);
  },

  simulate(input: SimulateSettlementInput) {
    return http.post<SettlementDetail>('/settlements/simulate', input);
  },

  execute(input: ExecuteSettlementInput) {
    return http.post<SettlementDetail>(`/settlements/${input.settlementId}/execute`, {
      approvalToken: input.approvalToken,
    });
  },

  reverse(id: string, reason: string) {
    return http.post<SettlementDetail>(`/settlements/${id}/reverse`, { reason });
  },
};
EOF

mkfile "$APP/src/api/domains/collateral.ts" <<'EOF'
import { buildQuery, http } from '../client';
import type { ListResponse } from '../types/common';
import type {
  CollateralFilters,
  CollateralSummary,
  RegisterCollateralInput,
} from '../types/collateral';

export const collateralApi = {
  list(filters: CollateralFilters = {}) {
    return http.get<ListResponse<CollateralSummary>>(`/collateral${buildQuery(filters)}`);
  },

  detail(id: string) {
    return http.get<CollateralSummary>(`/collateral/${id}`);
  },

  register(input: RegisterCollateralInput) {
    return http.post<CollateralSummary>('/collateral', input);
  },

  registerLien(id: string, lienHolderId: string, amount: string) {
    return http.post<CollateralSummary>(`/collateral/${id}/lien`, { lienHolderId, amount });
  },

  releaseLien(id: string) {
    return http.post<CollateralSummary>(`/collateral/${id}/release`);
  },

  liquidate(id: string, reason: string) {
    return http.post<CollateralSummary>(`/collateral/${id}/liquidate`, { reason });
  },
};
EOF

mkfile "$APP/src/api/domains/disputes.ts" <<'EOF'
import { buildQuery, http } from '../client';
import type { ListResponse } from '../types/common';
import type {
  DecideDisputeInput,
  DisputeDetail,
  DisputeFilters,
  DisputeSummary,
  FileDisputeInput,
} from '../types/dispute';

export const disputesApi = {
  list(filters: DisputeFilters = {}) {
    return http.get<ListResponse<DisputeSummary>>(`/disputes${buildQuery(filters)}`);
  },

  detail(id: string) {
    return http.get<DisputeDetail>(`/disputes/${id}`);
  },

  file(input: FileDisputeInput) {
    return http.post<DisputeSummary>('/disputes', input);
  },

  scheduleHearing(id: string, hearingAt: string, arbitratorId: string) {
    return http.post<DisputeDetail>(`/disputes/${id}/schedule`, { hearingAt, arbitratorId });
  },

  decide(input: DecideDisputeInput) {
    return http.post<DisputeDetail>(`/disputes/${input.disputeId}/decide`, {
      decision: input.decision,
      outcome: input.outcome,
    });
  },
};
EOF

mkfile "$APP/src/api/domains/reports.ts" <<'EOF'
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
EOF

mkfile "$APP/src/api/domains/users.ts" <<'EOF'
import { buildQuery, http } from '../client';
import type { ListResponse } from '../types/common';
import type { InviteUserInput, UserFilters, UserSummary } from '../types/user';

export const usersApi = {
  list(filters: UserFilters = {}) {
    return http.get<ListResponse<UserSummary>>(`/users${buildQuery(filters)}`);
  },

  detail(id: string) {
    return http.get<UserSummary>(`/users/${id}`);
  },

  invite(input: InviteUserInput) {
    return http.post<UserSummary>('/users/invite', input);
  },

  deactivate(id: string) {
    return http.post<UserSummary>(`/users/${id}/deactivate`);
  },

  reactivate(id: string) {
    return http.post<UserSummary>(`/users/${id}/reactivate`);
  },
};
EOF

mkfile "$APP/src/api/domains/notifications.ts" <<'EOF'
import { http } from '../client';

export interface NotificationItem {
  id: string;
  title: string;
  body: string;
  isRead: boolean;
  createdAt: string;
  deepLink?: string;
}

export const notificationsApi = {
  list() {
    return http.get<NotificationItem[]>('/notifications');
  },

  unreadCount() {
    return http.get<{ count: number }>('/notifications/unread-count');
  },

  markRead(id: string) {
    return http.post<void>(`/notifications/${id}/read`);
  },

  markAllRead() {
    return http.post<void>('/notifications/read-all');
  },
};
EOF

mkfile "$APP/src/api/domains/audit.ts" <<'EOF'
import { buildQuery, http } from '../client';
import type { ListResponse } from '../types/common';

export interface AuditLogEntry {
  id: string;
  actorId: string;
  actorName: string;
  action: string;
  resource: string;
  resourceId: string;
  ip: string;
  createdAt: string;
  metadata?: Record<string, unknown>;
}

export interface AuditFilters {
  actorId?: string;
  resource?: string;
  resourceId?: string;
  from?: string;
  to?: string;
  page?: number;
  pageSize?: number;
}

export const auditApi = {
  list(filters: AuditFilters = {}) {
    return http.get<ListResponse<AuditLogEntry>>(`/audit${buildQuery(filters)}`);
  },
};
EOF

mkfile "$APP/src/api/domains/index.ts" <<'EOF'
export * from './audit';
export * from './collateral';
export * from './contracts';
export * from './disputes';
export * from './escrows';
export * from './inputs';
export * from './investments';
export * from './notifications';
export * from './opportunities';
export * from './reports';
export * from './settlements';
export * from './users';
EOF

mkfile "$APP/src/api/index.ts" <<'EOF'
export * from './client';
export * from './errors';
export * from './types';
export * from './domains';
EOF

# ============================================================
# QUERY KEYS
# ============================================================

mkfile "$APP/src/lib/queryKeys.ts" <<'EOF'
import type {
  CollateralFilters,
  ContractFilters,
  DisputeFilters,
  EscrowFilters,
  InputFilters,
  InvestmentFilters,
  ReportFilters,
  SettlementFilters,
  UserFilters,
} from '@/api/types';

/**
 * Single source of truth for TanStack Query keys.
 * Naming: [domain, scope, ...identifiers]
 */
export const qk = {
  contracts: {
    root: ['contracts'] as const,
    list: (f: ContractFilters = {}) => ['contracts', 'list', f] as const,
    detail: (id: string) => ['contracts', 'detail', id] as const,
    timeline: (id: string) => ['contracts', 'timeline', id] as const,
    signatures: (id: string) => ['contracts', 'signatures', id] as const,
  },

  escrows: {
    root: ['escrows'] as const,
    list: (f: EscrowFilters = {}) => ['escrows', 'list', f] as const,
    detail: (id: string) => ['escrows', 'detail', id] as const,
    ledger: (id: string) => ['escrows', 'ledger', id] as const,
  },

  investments: {
    root: ['investments'] as const,
    mine: (f: InvestmentFilters = {}) => ['investments', 'mine', f] as const,
    list: (f: InvestmentFilters = {}) => ['investments', 'list', f] as const,
    detail: (id: string) => ['investments', 'detail', id] as const,
  },

  opportunities: {
    root: ['opportunities'] as const,
    list: () => ['opportunities', 'list'] as const,
    detail: (id: string) => ['opportunities', 'detail', id] as const,
  },

  inputs: {
    root: ['inputs'] as const,
    list: (f: InputFilters = {}) => ['inputs', 'list', f] as const,
    detail: (id: string) => ['inputs', 'detail', id] as const,
  },

  settlements: {
    root: ['settlements'] as const,
    list: (f: SettlementFilters = {}) => ['settlements', 'list', f] as const,
    detail: (id: string) => ['settlements', 'detail', id] as const,
  },

  collateral: {
    root: ['collateral'] as const,
    list: (f: CollateralFilters = {}) => ['collateral', 'list', f] as const,
    detail: (id: string) => ['collateral', 'detail', id] as const,
  },

  disputes: {
    root: ['disputes'] as const,
    list: (f: DisputeFilters = {}) => ['disputes', 'list', f] as const,
    detail: (id: string) => ['disputes', 'detail', id] as const,
  },

  reports: {
    root: ['reports'] as const,
    list: (f: ReportFilters = {}) => ['reports', 'list', f] as const,
    detail: (id: string) => ['reports', 'detail', id] as const,
  },

  users: {
    root: ['users'] as const,
    list: (f: UserFilters = {}) => ['users', 'list', f] as const,
    detail: (id: string) => ['users', 'detail', id] as const,
    me: ['users', 'me'] as const,
  },

  notifications: {
    root: ['notifications'] as const,
    list: () => ['notifications', 'list'] as const,
    unreadCount: ['notifications', 'unreadCount'] as const,
  },

  audit: {
    root: ['audit'] as const,
    list: (f: { from?: string; to?: string; actorId?: string }) => ['audit', 'list', f] as const,
  },

  publicStats: ['public', 'stats'] as const,
  publicOpportunities: ['public', 'opportunities'] as const,
} as const;
EOF

# ============================================================
# QUERY HOOKS
# ============================================================

mkfile "$APP/src/hooks/queries/useContracts.ts" <<'EOF'
import { useQuery, type UseQueryOptions } from '@tanstack/react-query';

import { contractsApi } from '@/api/domains/contracts';
import type { ListResponse } from '@/api/types/common';
import type {
  ContractDetail,
  ContractFilters,
  ContractSignature,
  ContractSummary,
  ContractTimelineEvent,
} from '@/api/types/contract';
import { qk } from '@/lib/queryKeys';

export function useContracts(
  filters: ContractFilters = {},
  options?: Omit<UseQueryOptions<ListResponse<ContractSummary>>, 'queryKey' | 'queryFn'>,
) {
  return useQuery({
    queryKey: qk.contracts.list(filters),
    queryFn: () => contractsApi.list(filters),
    placeholderData: (prev) => prev,
    ...options,
  });
}

export function useContract(
  id: string,
  options?: Omit<UseQueryOptions<ContractDetail>, 'queryKey' | 'queryFn'>,
) {
  return useQuery({
    queryKey: qk.contracts.detail(id),
    queryFn: () => contractsApi.detail(id),
    enabled: Boolean(id),
    ...options,
  });
}

export function useContractTimeline(id: string) {
  return useQuery<ContractTimelineEvent[]>({
    queryKey: qk.contracts.timeline(id),
    queryFn: () => contractsApi.timeline(id),
    enabled: Boolean(id),
  });
}

export function useContractSignatures(id: string) {
  return useQuery<ContractSignature[]>({
    queryKey: qk.contracts.signatures(id),
    queryFn: () => contractsApi.signatures(id),
    enabled: Boolean(id),
  });
}
EOF

mkfile "$APP/src/hooks/queries/useEscrows.ts" <<'EOF'
import { useQuery, type UseQueryOptions } from '@tanstack/react-query';

import { escrowsApi } from '@/api/domains/escrows';
import type { ListResponse } from '@/api/types/common';
import type { EscrowFilters, EscrowLedgerEntry, EscrowSummary } from '@/api/types/escrow';
import { qk } from '@/lib/queryKeys';

export function useEscrows(
  filters: EscrowFilters = {},
  options?: Omit<UseQueryOptions<ListResponse<EscrowSummary>>, 'queryKey' | 'queryFn'>,
) {
  return useQuery({
    queryKey: qk.escrows.list(filters),
    queryFn: () => escrowsApi.list(filters),
    placeholderData: (prev) => prev,
    ...options,
  });
}

export function useEscrow(
  id: string,
  options?: Omit<UseQueryOptions<EscrowSummary>, 'queryKey' | 'queryFn'>,
) {
  return useQuery({
    queryKey: qk.escrows.detail(id),
    queryFn: () => escrowsApi.detail(id),
    enabled: Boolean(id),
    ...options,
  });
}

export function useEscrowLedger(id: string) {
  return useQuery<EscrowLedgerEntry[]>({
    queryKey: qk.escrows.ledger(id),
    queryFn: () => escrowsApi.ledger(id),
    enabled: Boolean(id),
  });
}
EOF

mkfile "$APP/src/hooks/queries/useInvestments.ts" <<'EOF'
import { useQuery, type UseQueryOptions } from '@tanstack/react-query';

import { investmentsApi } from '@/api/domains/investments';
import type { ListResponse } from '@/api/types/common';
import type { InvestmentFilters, InvestmentSummary } from '@/api/types/investment';
import { qk } from '@/lib/queryKeys';

export function useMyInvestments(
  filters: InvestmentFilters = {},
  options?: Omit<UseQueryOptions<ListResponse<InvestmentSummary>>, 'queryKey' | 'queryFn'>,
) {
  return useQuery({
    queryKey: qk.investments.mine(filters),
    queryFn: () => investmentsApi.mine(filters),
    placeholderData: (prev) => prev,
    ...options,
  });
}

export function useInvestments(
  filters: InvestmentFilters = {},
  options?: Omit<UseQueryOptions<ListResponse<InvestmentSummary>>, 'queryKey' | 'queryFn'>,
) {
  return useQuery({
    queryKey: qk.investments.list(filters),
    queryFn: () => investmentsApi.list(filters),
    placeholderData: (prev) => prev,
    ...options,
  });
}

export function useInvestment(id: string) {
  return useQuery({
    queryKey: qk.investments.detail(id),
    queryFn: () => investmentsApi.detail(id),
    enabled: Boolean(id),
  });
}
EOF

mkfile "$APP/src/hooks/queries/useOpportunities.ts" <<'EOF'
import { useQuery } from '@tanstack/react-query';

import { opportunitiesApi } from '@/api/domains/opportunities';
import type { PublicOpportunity } from '@/api/types/opportunity';
import { qk } from '@/lib/queryKeys';

export function useOpportunities() {
  return useQuery<PublicOpportunity[]>({
    queryKey: qk.opportunities.list(),
    queryFn: () => opportunitiesApi.list(),
    staleTime: 60_000,
  });
}

export function useOpportunity(id: string) {
  return useQuery<PublicOpportunity>({
    queryKey: qk.opportunities.detail(id),
    queryFn: () => opportunitiesApi.detail(id),
    enabled: Boolean(id),
  });
}
EOF

mkfile "$APP/src/hooks/queries/useInputs.ts" <<'EOF'
import { useQuery, type UseQueryOptions } from '@tanstack/react-query';

import { inputsApi } from '@/api/domains/inputs';
import type { ListResponse } from '@/api/types/common';
import type { InputFilters, InputPurchaseSummary } from '@/api/types/input';
import { qk } from '@/lib/queryKeys';

export function useInputs(
  filters: InputFilters = {},
  options?: Omit<UseQueryOptions<ListResponse<InputPurchaseSummary>>, 'queryKey' | 'queryFn'>,
) {
  return useQuery({
    queryKey: qk.inputs.list(filters),
    queryFn: () => inputsApi.list(filters),
    placeholderData: (prev) => prev,
    ...options,
  });
}

export function useInput(id: string) {
  return useQuery({
    queryKey: qk.inputs.detail(id),
    queryFn: () => inputsApi.detail(id),
    enabled: Boolean(id),
  });
}
EOF

mkfile "$APP/src/hooks/queries/useSettlements.ts" <<'EOF'
import { useQuery, type UseQueryOptions } from '@tanstack/react-query';

import { settlementsApi } from '@/api/domains/settlements';
import type { ListResponse } from '@/api/types/common';
import type {
  SettlementDetail,
  SettlementFilters,
  SettlementSummary,
} from '@/api/types/settlement';
import { qk } from '@/lib/queryKeys';

export function useSettlements(
  filters: SettlementFilters = {},
  options?: Omit<UseQueryOptions<ListResponse<SettlementSummary>>, 'queryKey' | 'queryFn'>,
) {
  return useQuery({
    queryKey: qk.settlements.list(filters),
    queryFn: () => settlementsApi.list(filters),
    placeholderData: (prev) => prev,
    ...options,
  });
}

export function useSettlement(id: string) {
  return useQuery<SettlementDetail>({
    queryKey: qk.settlements.detail(id),
    queryFn: () => settlementsApi.detail(id),
    enabled: Boolean(id),
  });
}
EOF

mkfile "$APP/src/hooks/queries/useCollateral.ts" <<'EOF'
import { useQuery, type UseQueryOptions } from '@tanstack/react-query';

import { collateralApi } from '@/api/domains/collateral';
import type { ListResponse } from '@/api/types/common';
import type { CollateralFilters, CollateralSummary } from '@/api/types/collateral';
import { qk } from '@/lib/queryKeys';

export function useCollateral(
  filters: CollateralFilters = {},
  options?: Omit<UseQueryOptions<ListResponse<CollateralSummary>>, 'queryKey' | 'queryFn'>,
) {
  return useQuery({
    queryKey: qk.collateral.list(filters),
    queryFn: () => collateralApi.list(filters),
    placeholderData: (prev) => prev,
    ...options,
  });
}

export function useCollateralItem(id: string) {
  return useQuery({
    queryKey: qk.collateral.detail(id),
    queryFn: () => collateralApi.detail(id),
    enabled: Boolean(id),
  });
}
EOF

mkfile "$APP/src/hooks/queries/useDisputes.ts" <<'EOF'
import { useQuery, type UseQueryOptions } from '@tanstack/react-query';

import { disputesApi } from '@/api/domains/disputes';
import type { ListResponse } from '@/api/types/common';
import type { DisputeDetail, DisputeFilters, DisputeSummary } from '@/api/types/dispute';
import { qk } from '@/lib/queryKeys';

export function useDisputes(
  filters: DisputeFilters = {},
  options?: Omit<UseQueryOptions<ListResponse<DisputeSummary>>, 'queryKey' | 'queryFn'>,
) {
  return useQuery({
    queryKey: qk.disputes.list(filters),
    queryFn: () => disputesApi.list(filters),
    placeholderData: (prev) => prev,
    ...options,
  });
}

export function useDispute(id: string) {
  return useQuery<DisputeDetail>({
    queryKey: qk.disputes.detail(id),
    queryFn: () => disputesApi.detail(id),
    enabled: Boolean(id),
  });
}
EOF

mkfile "$APP/src/hooks/queries/useReports.ts" <<'EOF'
import { useQuery, type UseQueryOptions } from '@tanstack/react-query';

import { reportsApi } from '@/api/domains/reports';
import type { ListResponse } from '@/api/types/common';
import type { ReportFilters, ReportSummary } from '@/api/types/report';
import { qk } from '@/lib/queryKeys';

export function useReports(
  filters: ReportFilters = {},
  options?: Omit<UseQueryOptions<ListResponse<ReportSummary>>, 'queryKey' | 'queryFn'>,
) {
  return useQuery({
    queryKey: qk.reports.list(filters),
    queryFn: () => reportsApi.list(filters),
    placeholderData: (prev) => prev,
    ...options,
  });
}

export function useReport(id: string) {
  return useQuery({
    queryKey: qk.reports.detail(id),
    queryFn: () => reportsApi.detail(id),
    enabled: Boolean(id),
  });
}
EOF

mkfile "$APP/src/hooks/queries/useUsers.ts" <<'EOF'
import { useQuery, type UseQueryOptions } from '@tanstack/react-query';

import { usersApi } from '@/api/domains/users';
import type { ListResponse } from '@/api/types/common';
import type { UserFilters, UserSummary } from '@/api/types/user';
import { qk } from '@/lib/queryKeys';

export function useUsers(
  filters: UserFilters = {},
  options?: Omit<UseQueryOptions<ListResponse<UserSummary>>, 'queryKey' | 'queryFn'>,
) {
  return useQuery({
    queryKey: qk.users.list(filters),
    queryFn: () => usersApi.list(filters),
    placeholderData: (prev) => prev,
    ...options,
  });
}

export function useUser(id: string) {
  return useQuery({
    queryKey: qk.users.detail(id),
    queryFn: () => usersApi.detail(id),
    enabled: Boolean(id),
  });
}
EOF

mkfile "$APP/src/hooks/queries/useNotifications.ts" <<'EOF'
import { useQuery, useQueryClient } from '@tanstack/react-query';

import { notificationsApi } from '@/api/domains/notifications';
import { qk } from '@/lib/queryKeys';

export function useNotifications() {
  return useQuery({
    queryKey: qk.notifications.list(),
    queryFn: () => notificationsApi.list(),
    staleTime: 30_000,
  });
}

export function useUnreadCount() {
  return useQuery({
    queryKey: qk.notifications.unreadCount,
    queryFn: () => notificationsApi.unreadCount(),
    refetchInterval: 60_000,
  });
}

export function useMarkNotificationRead() {
  const qc = useQueryClient();
  return async (id: string) => {
    await notificationsApi.markRead(id);
    await qc.invalidateQueries({ queryKey: qk.notifications.root });
  };
}
EOF

mkfile "$APP/src/hooks/queries/useAuditLog.ts" <<'EOF'
import { useQuery, type UseQueryOptions } from '@tanstack/react-query';

import { auditApi, type AuditFilters, type AuditLogEntry } from '@/api/domains/audit';
import type { ListResponse } from '@/api/types/common';
import { qk } from '@/lib/queryKeys';

export function useAuditLog(
  filters: AuditFilters = {},
  options?: Omit<UseQueryOptions<ListResponse<AuditLogEntry>>, 'queryKey' | 'queryFn'>,
) {
  return useQuery({
    queryKey: qk.audit.list(filters),
    queryFn: () => auditApi.list(filters),
    placeholderData: (prev) => prev,
    ...options,
  });
}
EOF

# ============================================================
# MUTATION HOOKS
# ============================================================

mkfile "$APP/src/hooks/mutations/useContractMutations.ts" <<'EOF'
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { contractsApi } from '@/api/domains/contracts';
import type { NormalizedApiError } from '@/api/errors';
import type { ContractDetail, CreateContractInput, SignContractInput } from '@/api/types/contract';
import { useToast } from '@/components/ToastProvider';
import { qk } from '@/lib/queryKeys';

export function useCreateContract() {
  const qc = useQueryClient();
  const { toast } = useToast();

  return useMutation<ContractDetail, NormalizedApiError, CreateContractInput>({
    mutationFn: (input) => contractsApi.create(input),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: qk.contracts.root });
      toast({ title: 'Contract created', variant: 'success' });
    },
    onError: (err) => {
      toast({ title: 'Could not create contract', description: err.message, variant: 'error' });
    },
  });
}

export function useUpdateContract(id: string) {
  const qc = useQueryClient();
  const { toast } = useToast();

  return useMutation<ContractDetail, NormalizedApiError, Partial<CreateContractInput>>({
    mutationFn: (input) => contractsApi.update(id, input),
    onSuccess: (updated) => {
      qc.setQueryData(qk.contracts.detail(id), updated);
      void qc.invalidateQueries({ queryKey: qk.contracts.root });
      toast({ title: 'Contract updated', variant: 'success' });
    },
    onError: (err) => {
      toast({ title: 'Update failed', description: err.message, variant: 'error' });
    },
  });
}

export function useSignContract() {
  const qc = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (input: SignContractInput) => contractsApi.sign(input),
    onSuccess: (_data, vars) => {
      void qc.invalidateQueries({ queryKey: qk.contracts.signatures(vars.contractId) });
      void qc.invalidateQueries({ queryKey: qk.contracts.detail(vars.contractId) });
      toast({ title: 'Contract signed', variant: 'success' });
    },
    onError: (err: NormalizedApiError) => {
      toast({ title: 'Signing failed', description: err.message, variant: 'error' });
    },
  });
}

export function useFreezeContract() {
  const qc = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      contractsApi.freeze(id, reason),
    onSuccess: (_data, vars) => {
      void qc.invalidateQueries({ queryKey: qk.contracts.root });
      void qc.invalidateQueries({ queryKey: qk.contracts.detail(vars.id) });
      toast({ title: 'Contract frozen', variant: 'warning' });
    },
    onError: (err: NormalizedApiError) => {
      toast({ title: 'Freeze failed', description: err.message, variant: 'error' });
    },
  });
}
EOF

mkfile "$APP/src/hooks/mutations/useEscrowMutations.ts" <<'EOF'
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { escrowsApi } from '@/api/domains/escrows';
import type { NormalizedApiError } from '@/api/errors';
import type { EscrowSummary, FreezeEscrowInput, ReleaseEscrowInput } from '@/api/types/escrow';
import { useToast } from '@/components/ToastProvider';
import { qk } from '@/lib/queryKeys';

export function useReleaseEscrow() {
  const qc = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (input: ReleaseEscrowInput) => escrowsApi.release(input),
    onSuccess: (_data, vars) => {
      void qc.invalidateQueries({ queryKey: qk.escrows.root });
      void qc.invalidateQueries({ queryKey: qk.escrows.detail(vars.escrowId) });
      void qc.invalidateQueries({ queryKey: qk.escrows.ledger(vars.escrowId) });
      toast({ title: 'Escrow released', variant: 'success' });
    },
    onError: (err: NormalizedApiError) => {
      toast({ title: 'Release failed', description: err.message, variant: 'error' });
    },
  });
}

export function useFreezeEscrow() {
  const qc = useQueryClient();
  const { toast } = useToast();

  return useMutation<EscrowSummary, NormalizedApiError, FreezeEscrowInput>({
    mutationFn: (input) => escrowsApi.freeze(input),
    onSuccess: (_data, vars) => {
      void qc.invalidateQueries({ queryKey: qk.escrows.detail(vars.escrowId) });
      toast({ title: 'Escrow frozen', variant: 'warning' });
    },
    onError: (err) => {
      toast({ title: 'Freeze failed', description: err.message, variant: 'error' });
    },
  });
}

export function useCloseEscrow() {
  const qc = useQueryClient();
  const { toast } = useToast();

  return useMutation<EscrowSummary, NormalizedApiError, string>({
    mutationFn: (id) => escrowsApi.close(id),
    onSuccess: (_data, id) => {
      void qc.invalidateQueries({ queryKey: qk.escrows.detail(id) });
      void qc.invalidateQueries({ queryKey: qk.escrows.root });
      toast({ title: 'Escrow closed', variant: 'success' });
    },
  });
}
EOF

mkfile "$APP/src/hooks/mutations/useInvestmentMutations.ts" <<'EOF'
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { investmentsApi } from '@/api/domains/investments';
import type { NormalizedApiError } from '@/api/errors';
import type { CreateInvestmentInput, InvestmentSummary } from '@/api/types/investment';
import { useToast } from '@/components/ToastProvider';
import { qk } from '@/lib/queryKeys';

export function useCreateInvestment() {
  const qc = useQueryClient();
  const { toast } = useToast();

  return useMutation<InvestmentSummary, NormalizedApiError, CreateInvestmentInput>({
    mutationFn: (input) => investmentsApi.create(input),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: qk.investments.root });
      void qc.invalidateQueries({ queryKey: qk.opportunities.root });
      toast({ title: 'Investment committed', variant: 'success' });
    },
    onError: (err) => {
      toast({ title: 'Investment failed', description: err.message, variant: 'error' });
    },
  });
}
EOF

mkfile "$APP/src/hooks/mutations/useInputMutations.ts" <<'EOF'
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { inputsApi } from '@/api/domains/inputs';
import type { NormalizedApiError } from '@/api/errors';
import type {
  CreateInputOrderInput,
  InputPurchaseSummary,
  VerifyDeliveryInput,
} from '@/api/types/input';
import { useToast } from '@/components/ToastProvider';
import { qk } from '@/lib/queryKeys';

export function useCreateInputOrder() {
  const qc = useQueryClient();
  const { toast } = useToast();

  return useMutation<InputPurchaseSummary, NormalizedApiError, CreateInputOrderInput>({
    mutationFn: (input) => inputsApi.create(input),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: qk.inputs.root });
      toast({ title: 'Purchase order created', variant: 'success' });
    },
    onError: (err) => {
      toast({ title: 'Order failed', description: err.message, variant: 'error' });
    },
  });
}

export function useVerifyDelivery() {
  const qc = useQueryClient();
  const { toast } = useToast();

  return useMutation<InputPurchaseSummary, NormalizedApiError, VerifyDeliveryInput>({
    mutationFn: (input) => inputsApi.verifyDelivery(input),
    onSuccess: (_data, vars) => {
      void qc.invalidateQueries({ queryKey: qk.inputs.detail(vars.purchaseId) });
      void qc.invalidateQueries({ queryKey: qk.inputs.root });
      void qc.invalidateQueries({ queryKey: qk.escrows.root });
      toast({
        title: 'Delivery verified',
        description: 'Escrow funds will be released to the supplier.',
        variant: 'success',
      });
    },
    onError: (err) => {
      toast({ title: 'Verification failed', description: err.message, variant: 'error' });
    },
  });
}
EOF

mkfile "$APP/src/hooks/mutations/useSettlementMutations.ts" <<'EOF'
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { settlementsApi } from '@/api/domains/settlements';
import type { NormalizedApiError } from '@/api/errors';
import type {
  ExecuteSettlementInput,
  SettlementDetail,
  SimulateSettlementInput,
} from '@/api/types/settlement';
import { useToast } from '@/components/ToastProvider';
import { qk } from '@/lib/queryKeys';

export function useSimulateSettlement() {
  const { toast } = useToast();

  return useMutation<SettlementDetail, NormalizedApiError, SimulateSettlementInput>({
    mutationFn: (input) => settlementsApi.simulate(input),
    onSuccess: () => {
      toast({ title: 'Settlement simulated', variant: 'success' });
    },
    onError: (err) => {
      toast({ title: 'Simulation failed', description: err.message, variant: 'error' });
    },
  });
}

export function useExecuteSettlement() {
  const qc = useQueryClient();
  const { toast } = useToast();

  return useMutation<SettlementDetail, NormalizedApiError, ExecuteSettlementInput>({
    mutationFn: (input) => settlementsApi.execute(input),
    onSuccess: (_data, vars) => {
      void qc.invalidateQueries({ queryKey: qk.settlements.detail(vars.settlementId) });
      void qc.invalidateQueries({ queryKey: qk.settlements.root });
      void qc.invalidateQueries({ queryKey: qk.contracts.root });
      void qc.invalidateQueries({ queryKey: qk.escrows.root });
      toast({ title: 'Settlement executed', variant: 'success' });
    },
    onError: (err) => {
      toast({ title: 'Execution failed', description: err.message, variant: 'error' });
    },
  });
}
EOF

mkfile "$APP/src/hooks/mutations/useCollateralMutations.ts" <<'EOF'
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { collateralApi } from '@/api/domains/collateral';
import type { NormalizedApiError } from '@/api/errors';
import type { CollateralSummary, RegisterCollateralInput } from '@/api/types/collateral';
import { useToast } from '@/components/ToastProvider';
import { qk } from '@/lib/queryKeys';

export function useRegisterCollateral() {
  const qc = useQueryClient();
  const { toast } = useToast();

  return useMutation<CollateralSummary, NormalizedApiError, RegisterCollateralInput>({
    mutationFn: (input) => collateralApi.register(input),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: qk.collateral.root });
      toast({ title: 'Collateral registered', variant: 'success' });
    },
    onError: (err) => {
      toast({ title: 'Registration failed', description: err.message, variant: 'error' });
    },
  });
}

export function useRegisterLien() {
  const qc = useQueryClient();
  const { toast } = useToast();

  return useMutation<
    CollateralSummary,
    NormalizedApiError,
    { id: string; lienHolderId: string; amount: string }
  >({
    mutationFn: ({ id, lienHolderId, amount }) =>
      collateralApi.registerLien(id, lienHolderId, amount),
    onSuccess: (_data, vars) => {
      void qc.invalidateQueries({ queryKey: qk.collateral.detail(vars.id) });
      toast({ title: 'Lien registered', variant: 'success' });
    },
    onError: (err) => {
      toast({ title: 'Lien failed', description: err.message, variant: 'error' });
    },
  });
}

export function useLiquidateCollateral() {
  const qc = useQueryClient();
  const { toast } = useToast();

  return useMutation<CollateralSummary, NormalizedApiError, { id: string; reason: string }>({
    mutationFn: ({ id, reason }) => collateralApi.liquidate(id, reason),
    onSuccess: (_data, vars) => {
      void qc.invalidateQueries({ queryKey: qk.collateral.detail(vars.id) });
      void qc.invalidateQueries({ queryKey: qk.collateral.root });
      toast({ title: 'Collateral liquidated', variant: 'warning' });
    },
    onError: (err) => {
      toast({ title: 'Liquidation failed', description: err.message, variant: 'error' });
    },
  });
}
EOF

mkfile "$APP/src/hooks/mutations/useDisputeMutations.ts" <<'EOF'
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { disputesApi } from '@/api/domains/disputes';
import type { NormalizedApiError } from '@/api/errors';
import type {
  DecideDisputeInput,
  DisputeDetail,
  FileDisputeInput,
} from '@/api/types/dispute';
import { useToast } from '@/components/ToastProvider';
import { qk } from '@/lib/queryKeys';

export function useFileDispute() {
  const qc = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (input: FileDisputeInput) => disputesApi.file(input),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: qk.disputes.root });
      void qc.invalidateQueries({ queryKey: qk.escrows.root });
      toast({
        title: 'Dispute filed',
        description: 'Escrow funds have been frozen pending review.',
        variant: 'warning',
      });
    },
    onError: (err: NormalizedApiError) => {
      toast({ title: 'Filing failed', description: err.message, variant: 'error' });
    },
  });
}

export function useScheduleHearing() {
  const qc = useQueryClient();
  const { toast } = useToast();

  return useMutation<
    DisputeDetail,
    NormalizedApiError,
    { id: string; hearingAt: string; arbitratorId: string }
  >({
    mutationFn: ({ id, hearingAt, arbitratorId }) =>
      disputesApi.scheduleHearing(id, hearingAt, arbitratorId),
    onSuccess: (_data, vars) => {
      void qc.invalidateQueries({ queryKey: qk.disputes.detail(vars.id) });
      toast({ title: 'Hearing scheduled', variant: 'success' });
    },
  });
}

export function useDecideDispute() {
  const qc = useQueryClient();
  const { toast } = useToast();

  return useMutation<DisputeDetail, NormalizedApiError, DecideDisputeInput>({
    mutationFn: (input) => disputesApi.decide(input),
    onSuccess: (_data, vars) => {
      void qc.invalidateQueries({ queryKey: qk.disputes.detail(vars.disputeId) });
      void qc.invalidateQueries({ queryKey: qk.disputes.root });
      toast({ title: 'Decision recorded', variant: 'success' });
    },
    onError: (err) => {
      toast({ title: 'Decision failed', description: err.message, variant: 'error' });
    },
  });
}
EOF

mkfile "$APP/src/hooks/mutations/useUserMutations.ts" <<'EOF'
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { usersApi } from '@/api/domains/users';
import type { NormalizedApiError } from '@/api/errors';
import type { InviteUserInput, UserSummary } from '@/api/types/user';
import { useToast } from '@/components/ToastProvider';
import { qk } from '@/lib/queryKeys';

export function useInviteUser() {
  const qc = useQueryClient();
  const { toast } = useToast();

  return useMutation<UserSummary, NormalizedApiError, InviteUserInput>({
    mutationFn: (input) => usersApi.invite(input),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: qk.users.root });
      toast({ title: 'Invitation sent', variant: 'success' });
    },
    onError: (err) => {
      toast({ title: 'Invite failed', description: err.message, variant: 'error' });
    },
  });
}

export function useDeactivateUser() {
  const qc = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id: string) => usersApi.deactivate(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: qk.users.root });
      toast({ title: 'User deactivated', variant: 'success' });
    },
  });
}
EOF

# ============================================================
# UTILITY HOOKS
# ============================================================

mkfile "$APP/src/hooks/useDebounce.ts" <<'EOF'
import { useEffect, useState } from 'react';

export function useDebounce<T>(value: T, delayMs = 300): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(t);
  }, [value, delayMs]);

  return debounced;
}
EOF

mkfile "$APP/src/hooks/useTableState.ts" <<'EOF'
import { useCallback, useMemo, useState } from 'react';

import type { PageParams } from '@/api/types/common';

export interface TableState extends PageParams {
  setPage: (page: number) => void;
  setPageSize: (size: number) => void;
  setSearch: (q: string) => void;
  setSort: (field: string, dir: 'asc' | 'desc') => void;
  reset: () => void;
}

const DEFAULT_PAGE_SIZE = 20;

export function useTableState(initial?: Partial<PageParams>): TableState {
  const [state, setState] = useState<
    Required<Pick<PageParams, 'page' | 'pageSize'>> & PageParams
  >({
    page: initial?.page ?? 1,
    pageSize: initial?.pageSize ?? DEFAULT_PAGE_SIZE,
    q: initial?.q ?? '',
    sortBy: initial?.sortBy,
    sortDir: initial?.sortDir ?? 'asc',
  });

  const setPage = useCallback((page: number) => {
    setState((s) => ({ ...s, page }));
  }, []);

  const setPageSize = useCallback((pageSize: number) => {
    setState((s) => ({ ...s, pageSize, page: 1 }));
  }, []);

  const setSearch = useCallback((q: string) => {
    setState((s) => ({ ...s, q, page: 1 }));
  }, []);

  const setSort = useCallback((sortBy: string, sortDir: 'asc' | 'desc') => {
    setState((s) => ({ ...s, sortBy, sortDir, page: 1 }));
  }, []);

  const reset = useCallback(() => {
    setState({ page: 1, pageSize: DEFAULT_PAGE_SIZE, q: '', sortDir: 'asc' });
  }, []);

  return useMemo(
    () => ({ ...state, setPage, setPageSize, setSearch, setSort, reset }),
    [state, setPage, setPageSize, setSearch, setSort, reset],
  );
}
EOF

mkfile "$APP/src/hooks/usePermissionGuard.ts" <<'EOF'
import { useEffect } from 'react';

import type { NormalizedApiError } from '@/api/errors';
import { useToast } from '@/components/ToastProvider';

/**
 * Watches for 403 responses and emits a global toast once per unique error.
 */
export function usePermissionGuard(error: unknown) {
  const { toast } = useToast();

  useEffect(() => {
    const e = error as NormalizedApiError | null | undefined;
    if (e?.kind === 'forbidden') {
      toast({
        title: 'Access denied',
        description: e.message,
        variant: 'error',
      });
    }
  }, [error, toast]);
}
EOF

mkfile "$APP/src/hooks/useTenantScope.ts" <<'EOF'
import type { Role } from '@nafi/rbac-core';

import { useAuth } from '@/auth/useAuth';

export type TenantScope = 'own' | 'institution' | 'region' | 'national' | 'all';

export function useTenantScope(): {
  scope: TenantScope;
  institutionId?: string;
  regionCode?: string;
} {
  const { user } = useAuth();
  if (!user) return { scope: 'own' };

  const ROLE_SCOPE: Record<Role, TenantScope> = {
    DIASPORA_INVESTOR: 'own',
    COMMERCIAL_BANK: 'institution',
    DBE_OFFICER: 'national',
    NAFA_OFFICER: 'national',
    INPUT_SUPPLIER: 'institution',
    COMMERCIAL_FARMER: 'own',
    OFF_TAKER: 'institution',
    GOVERNMENT_REGULATOR: 'national',
    DONOR: 'national',
    NAFI_ADMIN: 'all',
    COMPLIANCE_OFFICER: 'all',
    ARBITRATOR: 'all',
  };

  return {
    scope: ROLE_SCOPE[user.role],
    institutionId: user.institutionId,
    regionCode: user.scopes?.['region']?.[0],
  };
}
EOF

mkfile "$APP/src/hooks/index.ts" <<'EOF'
// Queries
export * from './queries/useContracts';
export * from './queries/useEscrows';
export * from './queries/useInvestments';
export * from './queries/useOpportunities';
export * from './queries/useInputs';
export * from './queries/useSettlements';
export * from './queries/useCollateral';
export * from './queries/useDisputes';
export * from './queries/useReports';
export * from './queries/useUsers';
export * from './queries/useNotifications';
export * from './queries/useAuditLog';

// Mutations
export * from './mutations/useContractMutations';
export * from './mutations/useEscrowMutations';
export * from './mutations/useInvestmentMutations';
export * from './mutations/useInputMutations';
export * from './mutations/useSettlementMutations';
export * from './mutations/useCollateralMutations';
export * from './mutations/useDisputeMutations';
export * from './mutations/useUserMutations';

// Utilities
export * from './useDebounce';
export * from './useTableState';
export * from './usePermissionGuard';
export * from './useTenantScope';
EOF

# ============================================================
# HOOK TESTS
# ============================================================

mkfile "$APP/src/hooks/__tests__/useTableState.test.ts" <<'EOF'
import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { useTableState } from '../useTableState';

describe('useTableState', () => {
  it('initializes with defaults', () => {
    const { result } = renderHook(() => useTableState());
    expect(result.current.page).toBe(1);
    expect(result.current.pageSize).toBe(20);
    expect(result.current.q).toBe('');
    expect(result.current.sortDir).toBe('asc');
  });

  it('updates page', () => {
    const { result } = renderHook(() => useTableState());
    act(() => result.current.setPage(3));
    expect(result.current.page).toBe(3);
  });

  it('resets page to 1 when search changes', () => {
    const { result } = renderHook(() => useTableState());
    act(() => result.current.setPage(5));
    act(() => result.current.setSearch('sesame'));
    expect(result.current.page).toBe(1);
    expect(result.current.q).toBe('sesame');
  });

  it('resets page to 1 when page size changes', () => {
    const { result } = renderHook(() => useTableState());
    act(() => result.current.setPage(4));
    act(() => result.current.setPageSize(50));
    expect(result.current.page).toBe(1);
    expect(result.current.pageSize).toBe(50);
  });

  it('resets all state', () => {
    const { result } = renderHook(() => useTableState());
    act(() => {
      result.current.setPage(5);
      result.current.setSearch('x');
    });
    act(() => result.current.reset());
    expect(result.current.page).toBe(1);
    expect(result.current.q).toBe('');
  });
});
EOF

mkfile "$APP/src/hooks/__tests__/useDebounce.test.ts" <<'EOF'
import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useDebounce } from '../useDebounce';

describe('useDebounce', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('returns initial value immediately', () => {
    const { result } = renderHook(() => useDebounce('a', 300));
    expect(result.current).toBe('a');
  });

  it('debounces value changes', () => {
    const { result, rerender } = renderHook(({ v }) => useDebounce(v, 300), {
      initialProps: { v: 'a' },
    });

    rerender({ v: 'b' });
    expect(result.current).toBe('a');

    act(() => vi.advanceTimersByTime(300));
    expect(result.current).toBe('b');
  });
});
EOF

# ============================================================
# ERROR BOUNDARIES
# ============================================================

mkfile "$APP/src/components/ErrorBoundary.tsx" <<'EOF'
import { AlertTriangle } from 'lucide-react';
import { Component, type ErrorInfo, type ReactNode } from 'react';

import { Button, Card, CardBody } from '@nafi/ui-react';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: (error: Error, reset: () => void) => ReactNode;
  onError?: (error: Error, info: ErrorInfo) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    this.props.onError?.(error, info);
    // eslint-disable-next-line no-console
    console.error('[NAFI ErrorBoundary]', error, info);
  }

  reset = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (!this.state.hasError) return this.props.children;
    if (this.props.fallback && this.state.error) {
      return this.props.fallback(this.state.error, this.reset);
    }

    return (
      <div className="flex min-h-[60vh] items-center justify-center p-6">
        <Card className="max-w-md">
          <CardBody className="flex flex-col items-center gap-4 p-8 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-danger-light text-danger-dark">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <div>
              <p className="text-lg font-semibold text-neutral-900">Something went wrong</p>
              <p className="mt-1 text-sm text-neutral-600">
                {this.state.error?.message ?? 'An unexpected error occurred.'}
              </p>
            </div>
            <Button variant="outline" onClick={this.reset}>
              Try again
            </Button>
          </CardBody>
        </Card>
      </div>
    );
  }
}
EOF

mkfile "$APP/src/components/RouteErrorBoundary.tsx" <<'EOF'
import { isRouteErrorResponse, useRouteError } from 'react-router-dom';

import { ErrorState } from '@nafi/ui-react';

export function RouteErrorBoundary() {
  const error = useRouteError();

  if (isRouteErrorResponse(error)) {
    return (
      <div className="p-8">
        <ErrorState title={`${error.status}`} message={error.statusText} />
      </div>
    );
  }

  const message = error instanceof Error ? error.message : 'Unknown error';
  return (
    <div className="p-8">
      <ErrorState title="Something went wrong" message={message} />
    </div>
  );
}
EOF

mkfile "$APP/src/components/QueryBoundary.tsx" <<'EOF'
import type { ReactNode } from 'react';

import { EmptyState, ErrorState, Skeleton } from '@nafi/ui-react';

export interface QueryBoundaryProps {
  isLoading: boolean;
  isError: boolean;
  error?: unknown;
  isEmpty?: boolean;
  onRetry?: () => void;
  loadingFallback?: ReactNode;
  emptyFallback?: ReactNode;
  children: ReactNode;
}

export function QueryBoundary({
  isLoading,
  isError,
  error,
  isEmpty,
  onRetry,
  loadingFallback,
  emptyFallback,
  children,
}: QueryBoundaryProps) {
  if (isLoading) {
    return <>{loadingFallback ?? <Skeleton className="h-40 w-full" />}</>;
  }

  if (isError) {
    return <ErrorState error={error} onRetry={onRetry} />;
  }

  if (isEmpty) {
    return <>{emptyFallback ?? <EmptyState title="Nothing here yet" />}</>;
  }

  return <>{children}</>;
}
EOF

# ============================================================
# WIRE ERROR BOUNDARY INTO APP
# ============================================================

# Update App.tsx to wrap with ErrorBoundary (safe — check if exists, then rewrite)
if [ -f "$APP/src/App.tsx" ]; then
  cat > "$APP/src/App.tsx" <<'EOF'
import { RouterProvider } from 'react-router-dom';

import { ErrorBoundary } from '@/components/ErrorBoundary';

import { AppProviders } from './app/providers/AppProviders';
import { router } from './app/router';

export default function App() {
  return (
    <ErrorBoundary>
      <AppProviders>
        <RouterProvider router={router} />
      </AppProviders>
    </ErrorBoundary>
  );
}
EOF
  echo "  ✓ $APP/src/App.tsx (updated with ErrorBoundary wrapper)"
fi

# Add errorElement to root routes in router
if [ -f "$APP/src/app/router.tsx" ]; then
  # Insert import at the top if not present
  if ! grep -q "RouteErrorBoundary" "$APP/src/app/router.tsx"; then
    # Add the import line after the last import statement
    sed -i.tmp "/^import { DashboardLayout } from '@\/layouts\/DashboardLayout';/a\\
import { RouteErrorBoundary } from '@/components/RouteErrorBoundary';
" "$APP/src/app/router.tsx" 2>/dev/null || {
      # macOS-compatible sed fallback
      awk '/^import \{ DashboardLayout \} from .@\/layouts\/DashboardLayout.;$/ {
        print
        print "import { RouteErrorBoundary } from '\''@/components/RouteErrorBoundary'\'';"
        next
      }
      { print }' "$APP/src/app/router.tsx" > "$APP/src/app/router.tsx.tmp"
      mv "$APP/src/app/router.tsx.tmp" "$APP/src/app/router.tsx"
    }
    rm -f "$APP/src/app/router.tsx.tmp"
    echo "  ✓ $APP/src/app/router.tsx (RouteErrorBoundary import added)"
    echo "     ⚠ Manually add 'errorElement: <RouteErrorBoundary />' to root route groups"
  fi
fi

# ============================================================
# DONE
# ============================================================

echo ""
echo "============================================================"
echo "✅ NAFI Step 5 scaffolding complete"
echo "============================================================"
echo ""
echo "Created the complete data layer for apps/web:"
echo ""
echo "  API types (11 files):"
echo "    common, contract, escrow, investment, opportunity,"
echo "    input, settlement, collateral, dispute, report, user"
echo ""
echo "  API client:"
echo "    api/client.ts       (HttpClient wrapper + buildQuery)"
echo "    api/errors.ts       (normalizeApiError with 9 kinds)"
echo ""
echo "  API domains (12 modules):"
echo "    contracts, escrows, investments, opportunities, inputs,"
echo "    settlements, collateral, disputes, reports, users,"
echo "    notifications, audit"
echo ""
echo "  Query keys:"
echo "    lib/queryKeys.ts    (single source of truth)"
echo ""
echo "  Query hooks (12 families):"
echo "    useContracts, useEscrows, useInvestments, useOpportunities,"
echo "    useInputs, useSettlements, useCollateral, useDisputes,"
echo "    useReports, useUsers, useNotifications, useAuditLog"
echo ""
echo "  Mutation hooks (8 families):"
echo "    useContractMutations, useEscrowMutations,"
echo "    useInvestmentMutations, useInputMutations,"
echo "    useSettlementMutations, useCollateralMutations,"
echo "    useDisputeMutations, useUserMutations"
echo ""
echo "  Utility hooks:"
echo "    useDebounce, useTableState, usePermissionGuard, useTenantScope"
echo ""
echo "  Error boundaries:"
echo "    ErrorBoundary        (class-based, catches render errors)"
echo "    RouteErrorBoundary   (React Router errorElement)"
echo "    QueryBoundary        (loading/error/empty/content)"
echo ""
echo "  Tests:"
echo "    useTableState.test.ts (5 tests)"
echo "    useDebounce.test.ts   (2 tests)"
echo ""
echo "Next steps:"
echo "  1. Manually add 'errorElement: <RouteErrorBoundary />' to each"
echo "     root route group in apps/web/src/app/router.tsx"
echo "  2. Add a Vitest config to apps/web (see Step 9 for full setup)"
echo "  3. pnpm install"
echo "  4. pnpm --filter @nafi/web typecheck"
echo "  5. pnpm --filter @nafi/web lint"
echo ""
echo "Then proceed to Step 6 (three production role portals)."
echo ""
