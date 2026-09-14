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
