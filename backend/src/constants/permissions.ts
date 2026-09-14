/**
 * Permission strings for RBAC system
 */

// User permissions
export const USER_CREATE = 'user:create';
export const USER_READ = 'user:read';
export const USER_UPDATE = 'user:update';
export const USER_DELETE = 'user:delete';
export const USER_LIST = 'user:list';

// Contract permissions
export const CONTRACT_CREATE = 'contract:create';
export const CONTRACT_READ = 'contract:read';
export const CONTRACT_UPDATE = 'contract:update';
export const CONTRACT_DELETE = 'contract:delete';
export const CONTRACT_LIST = 'contract:list';
export const CONTRACT_APPROVE = 'contract:approve';
export const CONTRACT_REJECT = 'contract:reject';

// Investment permissions
export const INVESTMENT_CREATE = 'investment:create';
export const INVESTMENT_READ = 'investment:read';
export const INVESTMENT_UPDATE = 'investment:update';
export const INVESTMENT_DELETE = 'investment:delete';
export const INVESTMENT_LIST = 'investment:list';

// Escrow permissions
export const ESCROW_CREATE = 'escrow:create';
export const ESCROW_READ = 'escrow:read';
export const ESCROW_UPDATE = 'escrow:update';
export const ESCROW_DELETE = 'escrow:delete';
export const ESCROW_FUND = 'escrow:fund';
export const ESCROW_DISBURSE = 'escrow:disburse';

// Opportunity permissions
export const OPPORTUNITY_CREATE = 'opportunity:create';
export const OPPORTUNITY_READ = 'opportunity:read';
export const OPPORTUNITY_UPDATE = 'opportunity:update';
export const OPPORTUNITY_DELETE = 'opportunity:delete';
export const OPPORTUNITY_PUBLISH = 'opportunity:publish';

// Settlement permissions
export const SETTLEMENT_CREATE = 'settlement:create';
export const SETTLEMENT_READ = 'settlement:read';
export const SETTLEMENT_UPDATE = 'settlement:update';
export const SETTLEMENT_DELETE = 'settlement:delete';
export const SETTLEMENT_PROCESS = 'settlement:process';

// Collateral permissions
export const COLLATERAL_CREATE = 'collateral:create';
export const COLLATERAL_READ = 'collateral:read';
export const COLLATERAL_UPDATE = 'collateral:update';
export const COLLATERAL_DELETE = 'collateral:delete';
export const COLLATERAL_VERIFY = 'collateral:verify';

// Dispute permissions
export const DISPUTE_CREATE = 'dispute:create';
export const DISPUTE_READ = 'dispute:read';
export const DISPUTE_UPDATE = 'dispute:update';
export const DISPUTE_DELETE = 'dispute:delete';
export const DISPUTE_RESOLVE = 'dispute:resolve';

// Input permissions
export const INPUT_CREATE = 'input:create';
export const INPUT_READ = 'input:read';
export const INPUT_UPDATE = 'input:update';
export const INPUT_DELETE = 'input:delete';
export const INPUT_VERIFY = 'input:verify';

// Report permissions
export const REPORT_CREATE = 'report:create';
export const REPORT_READ = 'report:read';
export const REPORT_DELETE = 'report:delete';
export const REPORT_EXPORT = 'report:export';

// Audit permissions
export const AUDIT_READ = 'audit:read';
export const AUDIT_EXPORT = 'audit:export';

// Notification permissions
export const NOTIFICATION_READ = 'notification:read';
export const NOTIFICATION_SEND = 'notification:send';
export const NOTIFICATION_DELETE = 'notification:delete';

// Admin permissions
export const ADMIN_SETTINGS = 'admin:settings';
export const ADMIN_ROLES = 'admin:roles';
export const ADMIN_AUDIT = 'admin:audit';
export const ADMIN_SYSTEM = 'admin:system';

export const ALL_PERMISSIONS = [
  // User
  USER_CREATE, USER_READ, USER_UPDATE, USER_DELETE, USER_LIST,
  // Contract
  CONTRACT_CREATE, CONTRACT_READ, CONTRACT_UPDATE, CONTRACT_DELETE, CONTRACT_LIST, CONTRACT_APPROVE, CONTRACT_REJECT,
  // Investment
  INVESTMENT_CREATE, INVESTMENT_READ, INVESTMENT_UPDATE, INVESTMENT_DELETE, INVESTMENT_LIST,
  // Escrow
  ESCROW_CREATE, ESCROW_READ, ESCROW_UPDATE, ESCROW_DELETE, ESCROW_FUND, ESCROW_DISBURSE,
  // Opportunity
  OPPORTUNITY_CREATE, OPPORTUNITY_READ, OPPORTUNITY_UPDATE, OPPORTUNITY_DELETE, OPPORTUNITY_PUBLISH,
  // Settlement
  SETTLEMENT_CREATE, SETTLEMENT_READ, SETTLEMENT_UPDATE, SETTLEMENT_DELETE, SETTLEMENT_PROCESS,
  // Collateral
  COLLATERAL_CREATE, COLLATERAL_READ, COLLATERAL_UPDATE, COLLATERAL_DELETE, COLLATERAL_VERIFY,
  // Dispute
  DISPUTE_CREATE, DISPUTE_READ, DISPUTE_UPDATE, DISPUTE_DELETE, DISPUTE_RESOLVE,
  // Input
  INPUT_CREATE, INPUT_READ, INPUT_UPDATE, INPUT_DELETE, INPUT_VERIFY,
  // Report
  REPORT_CREATE, REPORT_READ, REPORT_DELETE, REPORT_EXPORT,
  // Audit
  AUDIT_READ, AUDIT_EXPORT,
  // Notification
  NOTIFICATION_READ, NOTIFICATION_SEND, NOTIFICATION_DELETE,
  // Admin
  ADMIN_SETTINGS, ADMIN_ROLES, ADMIN_AUDIT, ADMIN_SYSTEM,
];
