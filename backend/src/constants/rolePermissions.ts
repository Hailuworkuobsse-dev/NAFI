import { Role } from './roles';
import * as permissions from './permissions';

/**
 * Role → Permissions matrix
 */
export const rolePermissions: Record<Role, string[]> = {
  [Role.SUPER_ADMIN]: Object.values(permissions).filter(p => typeof p === 'string'),
  
  [Role.NATIONAL_ADMIN]: [
    permissions.USER_READ, permissions.USER_LIST,
    permissions.CONTRACT_READ, permissions.CONTRACT_LIST, permissions.CONTRACT_APPROVE, permissions.CONTRACT_REJECT,
    permissions.INVESTMENT_READ, permissions.INVESTMENT_LIST,
    permissions.OPPORTUNITY_READ, permissions.OPPORTUNITY_PUBLISH,
    permissions.REPORT_READ, permissions.REPORT_EXPORT,
    permissions.AUDIT_READ, permissions.AUDIT_EXPORT,
    permissions.ADMIN_SETTINGS,
  ],
  
  [Role.INSTITUTION_ADMIN]: [
    permissions.USER_CREATE, permissions.USER_READ, permissions.USER_UPDATE, permissions.USER_LIST,
    permissions.CONTRACT_CREATE, permissions.CONTRACT_READ, permissions.CONTRACT_UPDATE, permissions.CONTRACT_LIST,
    permissions.INVESTMENT_READ, permissions.INVESTMENT_LIST,
    permissions.OPPORTUNITY_CREATE, permissions.OPPORTUNITY_READ, permissions.OPPORTUNITY_UPDATE, permissions.OPPORTUNITY_PUBLISH,
    permissions.ESCROW_READ, permissions.ESCROW_FUND, permissions.ESCROW_DISBURSE,
    permissions.SETTLEMENT_READ, permissions.SETTLEMENT_PROCESS,
    permissions.COLLATERAL_READ, permissions.COLLATERAL_VERIFY,
    permissions.INPUT_READ, permissions.INPUT_VERIFY,
    permissions.REPORT_READ, permissions.REPORT_CREATE,
    permissions.NOTIFICATION_READ, permissions.NOTIFICATION_SEND,
  ],
  
  [Role.COMPLIANCE_OFFICER]: [
    permissions.USER_READ, permissions.USER_LIST,
    permissions.CONTRACT_READ, permissions.CONTRACT_LIST, permissions.CONTRACT_APPROVE, permissions.CONTRACT_REJECT,
    permissions.INVESTMENT_READ, permissions.INVESTMENT_LIST,
    permissions.ESCROW_READ,
    permissions.COLLATERAL_READ, permissions.COLLATERAL_VERIFY,
    permissions.DISPUTE_READ, permissions.DISPUTE_RESOLVE,
    permissions.AUDIT_READ, permissions.AUDIT_EXPORT,
    permissions.REPORT_READ,
  ],
  
  [Role.RISK_MANAGER]: [
    permissions.CONTRACT_READ, permissions.CONTRACT_LIST, permissions.CONTRACT_APPROVE, permissions.CONTRACT_REJECT,
    permissions.INVESTMENT_READ, permissions.INVESTMENT_LIST,
    permissions.ESCROW_READ,
    permissions.COLLATERAL_READ, permissions.COLLATERAL_VERIFY,
    permissions.DISPUTE_READ,
    permissions.REPORT_READ, permissions.REPORT_CREATE,
  ],
  
  [Role.INVESTOR_RELATIONS]: [
    permissions.USER_READ,
    permissions.INVESTMENT_READ, permissions.INVESTMENT_LIST,
    permissions.OPPORTUNITY_READ, permissions.OPPORTUNITY_PUBLISH,
    permissions.NOTIFICATION_READ, permissions.NOTIFICATION_SEND,
    permissions.REPORT_READ,
  ],
  
  [Role.FIELD_AGENT]: [
    permissions.USER_READ,
    permissions.CONTRACT_READ, permissions.CONTRACT_CREATE, permissions.CONTRACT_UPDATE,
    permissions.INPUT_CREATE, permissions.INPUT_READ, permissions.INPUT_UPDATE, permissions.INPUT_VERIFY,
    permissions.COLLATERAL_CREATE, permissions.COLLATERAL_READ, permissions.COLLATERAL_UPDATE,
    permissions.DISPUTE_CREATE, permissions.DISPUTE_READ,
    permissions.NOTIFICATION_READ,
  ],
  
  [Role.BORROWER]: [
    permissions.CONTRACT_READ, permissions.CONTRACT_CREATE,
    permissions.INPUT_READ,
    permissions.SETTLEMENT_READ,
    permissions.COLLATERAL_READ, permissions.COLLATERAL_CREATE,
    permissions.DISPUTE_CREATE, permissions.DISPUTE_READ,
    permissions.NOTIFICATION_READ,
  ],
  
  [Role.INVESTOR]: [
    permissions.OPPORTUNITY_READ, permissions.OPPORTUNITY_LIST,
    permissions.INVESTMENT_CREATE, permissions.INVESTMENT_READ, permissions.INVESTMENT_LIST,
    permissions.CONTRACT_READ,
    permissions.NOTIFICATION_READ,
    permissions.REPORT_READ,
  ],
  
  [Role.GUARANTOR]: [
    permissions.CONTRACT_READ,
    permissions.COLLATERAL_READ, permissions.COLLATERAL_CREATE,
    permissions.DISPUTE_READ,
    permissions.NOTIFICATION_READ,
  ],
  
  [Role.AUDITOR]: [
    permissions.USER_READ, permissions.USER_LIST,
    permissions.CONTRACT_READ, permissions.CONTRACT_LIST,
    permissions.INVESTMENT_READ, permissions.INVESTMENT_LIST,
    permissions.ESCROW_READ,
    permissions.SETTLEMENT_READ,
    permissions.AUDIT_READ, permissions.AUDIT_EXPORT,
    permissions.REPORT_READ, permissions.REPORT_EXPORT,
  ],
  
  [Role.SYSTEM]: [
    permissions.ADMIN_SYSTEM,
    permissions.AUDIT_READ, permissions.AUDIT_EXPORT,
    permissions.NOTIFICATION_SEND,
  ],
};

/**
 * Check if a role has a specific permission
 */
export function can(role: Role, permission: string): boolean {
  const rolePerms = rolePermissions[role];
  if (!rolePerms) return false;
  return rolePerms.includes(permission);
}

/**
 * Check if a role has any of the specified permissions
 */
export function canAny(role: Role, perms: string[]): boolean {
  return perms.some(p => can(role, p));
}

/**
 * Check if a role has all of the specified permissions
 */
export function canAll(role: Role, perms: string[]): boolean {
  return perms.every(p => can(role, p));
}
