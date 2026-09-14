export interface ContractFilters {
  status?: string;
  crop?: string;
  region?: string;
  farmerId?: string;
  page?: number;
  pageSize?: number;
}

export interface EscrowFilters {
  status?: string;
  bankId?: string;
  contractId?: string;
  page?: number;
  pageSize?: number;
}

export const queryKeys = {
  auth: {
    me: ['auth', 'me'] as const,
  },
  contracts: {
    all: ['contracts'] as const,
    list: (filters: ContractFilters = {}) => ['contracts', 'list', filters] as const,
    detail: (id: string) => ['contracts', 'detail', id] as const,
    timeline: (id: string) => ['contracts', 'timeline', id] as const,
  },
  escrows: {
    all: ['escrows'] as const,
    list: (filters: EscrowFilters = {}) => ['escrows', 'list', filters] as const,
    detail: (id: string) => ['escrows', 'detail', id] as const,
    ledger: (id: string) => ['escrows', 'ledger', id] as const,
  },
  investments: {
    all: ['investments'] as const,
    mine: ['investments', 'mine'] as const,
    detail: (id: string) => ['investments', 'detail', id] as const,
  },
  inputs: {
    all: ['inputs'] as const,
    list: (contractId: string) => ['inputs', 'list', contractId] as const,
  },
  settlements: {
    all: ['settlements'] as const,
    detail: (id: string) => ['settlements', 'detail', id] as const,
  },
  collateral: {
    all: ['collateral'] as const,
    list: ['collateral', 'list'] as const,
    detail: (id: string) => ['collateral', 'detail', id] as const,
  },
  disputes: {
    all: ['disputes'] as const,
    list: ['disputes', 'list'] as const,
    detail: (id: string) => ['disputes', 'detail', id] as const,
  },
  reports: {
    all: ['reports'] as const,
    list: ['reports', 'list'] as const,
  },
  publicStats: ['public', 'stats'] as const,
} as const;
