/**
 * Permission string convention for NAFI RBAC system
 * Aligned with frontend rbac-core package
 * 
 * Format: <resource>:<action>[:<scope>]
 * Resources: contract, escrow, investment, input, settlement,
 *            collateral, dispute, report, user, system, audit, tax
 * Actions:   create, read, update, delete, approve, reject,
 *            submit, execute, export, freeze, unfreeze
 * Scopes:    own, institution, region, national, all
 */

// Contracts
export const CONTRACT_CREATE = 'contract:create';
export const CONTRACT_READ_OWN = 'contract:read:own';
export const CONTRACT_READ_ALL = 'contract:read:all';
export const CONTRACT_UPDATE = 'contract:update';
export const CONTRACT_APPROVE = 'contract:approve';
export const CONTRACT_FREEZE = 'contract:freeze';

// Escrow
export const ESCROW_READ_OWN = 'escrow:read:own';
export const ESCROW_FUND = 'escrow:fund';
export const ESCROW_RELEASE = 'escrow:release';
export const ESCROW_FREEZE = 'escrow:freeze';

// Investment
export const INVESTMENT_CREATE = 'investment:create';
export const INVESTMENT_READ_OWN = 'investment:read:own';
export const INVESTMENT_READ_ALL = 'investment:read:all';

// Input supply
export const INPUT_CREATE = 'input:create';
export const INPUT_VERIFY = 'input:verify';
export const INPUT_DISBURSE = 'input:disburse';

// Settlement
export const SETTLEMENT_SIMULATE = 'settlement:simulate';
export const SETTLEMENT_EXECUTE = 'settlement:execute';
export const SETTLEMENT_READ = 'settlement:read';

// Collateral
export const COLLATERAL_REGISTER = 'collateral:register';
export const COLLATERAL_LIQUIDATE = 'collateral:liquidate';

// Disputes
export const DISPUTE_FLAG = 'dispute:flag';
export const DISPUTE_ARBITRATE = 'dispute:arbitrate';

// Reports
export const REPORT_READ_OWN = 'report:read:own';
export const REPORT_GENERATE = 'report:generate';
export const REPORT_EXPORT = 'report:export';

// Users
export const USER_INVITE = 'user:invite';
export const USER_MANAGE_OWN = 'user:manage:own';
export const USER_MANAGE_ALL = 'user:manage:all';

// System
export const SYSTEM_CONFIGURE = 'system:configure';

// Audit
export const AUDIT_READ = 'audit:read';

// Tax
export const TAX_READ = 'tax:read';

export const ALL_PERMISSIONS = [
  // Contracts
  CONTRACT_CREATE, CONTRACT_READ_OWN, CONTRACT_READ_ALL, CONTRACT_UPDATE, CONTRACT_APPROVE, CONTRACT_FREEZE,
  // Escrow
  ESCROW_READ_OWN, ESCROW_FUND, ESCROW_RELEASE, ESCROW_FREEZE,
  // Investment
  INVESTMENT_CREATE, INVESTMENT_READ_OWN, INVESTMENT_READ_ALL,
  // Input supply
  INPUT_CREATE, INPUT_VERIFY, INPUT_DISBURSE,
  // Settlement
  SETTLEMENT_SIMULATE, SETTLEMENT_EXECUTE, SETTLEMENT_READ,
  // Collateral
  COLLATERAL_REGISTER, COLLATERAL_LIQUIDATE,
  // Disputes
  DISPUTE_FLAG, DISPUTE_ARBITRATE,
  // Reports
  REPORT_READ_OWN, REPORT_GENERATE, REPORT_EXPORT,
  // Users
  USER_INVITE, USER_MANAGE_OWN, USER_MANAGE_ALL,
  // System
  SYSTEM_CONFIGURE,
  // Audit
  AUDIT_READ,
  // Tax
  TAX_READ,
];
