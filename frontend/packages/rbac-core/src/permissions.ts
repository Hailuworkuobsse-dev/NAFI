/**
 * Permission string convention:
 *   <resource>:<action>[:<scope>]
 *
 * Resources: contract, escrow, investment, input, settlement,
 *            collateral, dispute, report, user, system, audit, tax
 * Actions:   create, read, update, delete, approve, reject,
 *            submit, execute, export, freeze, unfreeze
 * Scopes:    own, institution, region, national, all
 */
export const PERMISSIONS = {
  // Contracts
  CONTRACT_CREATE: 'contract:create',
  CONTRACT_READ_OWN: 'contract:read:own',
  CONTRACT_READ_ALL: 'contract:read:all',
  CONTRACT_UPDATE: 'contract:update',
  CONTRACT_APPROVE: 'contract:approve',
  CONTRACT_FREEZE: 'contract:freeze',

  // Escrow
  ESCROW_READ_OWN: 'escrow:read:own',
  ESCROW_FUND: 'escrow:fund',
  ESCROW_RELEASE: 'escrow:release',
  ESCROW_FREEZE: 'escrow:freeze',

  // Investment
  INVESTMENT_CREATE: 'investment:create',
  INVESTMENT_READ_OWN: 'investment:read:own',
  INVESTMENT_READ_ALL: 'investment:read:all',

  // Input supply
  INPUT_CREATE: 'input:create',
  INPUT_VERIFY: 'input:verify',
  INPUT_DISBURSE: 'input:disburse',

  // Settlement
  SETTLEMENT_SIMULATE: 'settlement:simulate',
  SETTLEMENT_EXECUTE: 'settlement:execute',
  SETTLEMENT_READ: 'settlement:read',

  // Collateral
  COLLATERAL_REGISTER: 'collateral:register',
  COLLATERAL_LIQUIDATE: 'collateral:liquidate',

  // Disputes
  DISPUTE_FLAG: 'dispute:flag',
  DISPUTE_ARBITRATE: 'dispute:arbitrate',

  // Reports
  REPORT_READ_OWN: 'report:read:own',
  REPORT_GENERATE: 'report:generate',
  REPORT_EXPORT: 'report:export',

  // Users
  USER_INVITE: 'user:invite',
  USER_MANAGE_OWN: 'user:manage:own',
  USER_MANAGE_ALL: 'user:manage:all',

  // System
  SYSTEM_CONFIGURE: 'system:configure',

  // Audit
  AUDIT_READ: 'audit:read',

  // Tax
  TAX_READ: 'tax:read',
} as const;

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

export const ALL_PERMISSIONS = Object.values(PERMISSIONS) as Permission[];
