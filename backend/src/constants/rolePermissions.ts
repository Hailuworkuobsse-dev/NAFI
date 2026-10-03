import { Role } from './roles';
import * as permissions from './permissions';

/**
 * Complete permission matrix per role.
 * '*' is a super-permission granted only to NAFI_ADMIN.
 * Aligned with frontend rbac-core package
 */
export const rolePermissions: Record<Role, readonly string[] | readonly ['*']> = {
  [Role.DIASPORA_INVESTOR]: [
    permissions.CONTRACT_READ_OWN,
    permissions.ESCROW_READ_OWN,
    permissions.ESCROW_FUND,
    permissions.INVESTMENT_CREATE,
    permissions.INVESTMENT_READ_OWN,
    permissions.SETTLEMENT_READ,
    permissions.DISPUTE_FLAG,
    permissions.REPORT_READ_OWN,
    permissions.REPORT_EXPORT,
    permissions.USER_MANAGE_OWN,
  ],

  [Role.COMMERCIAL_BANK]: [
    permissions.CONTRACT_READ_OWN,
    permissions.CONTRACT_READ_ALL,
    permissions.CONTRACT_APPROVE,
    permissions.ESCROW_READ_OWN,
    permissions.ESCROW_FUND,
    permissions.ESCROW_RELEASE,
    permissions.ESCROW_FREEZE,
    permissions.INPUT_DISBURSE,
    permissions.SETTLEMENT_SIMULATE,
    permissions.SETTLEMENT_EXECUTE,
    permissions.SETTLEMENT_READ,
    permissions.COLLATERAL_REGISTER,
    permissions.COLLATERAL_LIQUIDATE,
    permissions.DISPUTE_FLAG,
    permissions.REPORT_READ_OWN,
    permissions.REPORT_GENERATE,
    permissions.REPORT_EXPORT,
    permissions.USER_INVITE,
    permissions.USER_MANAGE_OWN,
    permissions.TAX_READ,
  ],

  [Role.DBE_OFFICER]: [
    permissions.CONTRACT_READ_OWN,
    permissions.CONTRACT_READ_ALL,
    permissions.CONTRACT_APPROVE,
    permissions.ESCROW_READ_OWN,
    permissions.ESCROW_FUND,
    permissions.ESCROW_RELEASE,
    permissions.ESCROW_FREEZE,
    permissions.INPUT_DISBURSE,
    permissions.SETTLEMENT_SIMULATE,
    permissions.SETTLEMENT_EXECUTE,
    permissions.SETTLEMENT_READ,
    permissions.COLLATERAL_REGISTER,
    permissions.COLLATERAL_LIQUIDATE,
    permissions.DISPUTE_FLAG,
    permissions.REPORT_READ_OWN,
    permissions.REPORT_GENERATE,
    permissions.REPORT_EXPORT,
    permissions.USER_MANAGE_OWN,
    permissions.TAX_READ,
  ],

  [Role.NAFA_OFFICER]: [
    permissions.CONTRACT_READ_OWN,
    permissions.CONTRACT_READ_ALL,
    permissions.CONTRACT_APPROVE,
    permissions.ESCROW_READ_OWN,
    permissions.ESCROW_FUND,
    permissions.SETTLEMENT_SIMULATE,
    permissions.SETTLEMENT_READ,
    permissions.DISPUTE_FLAG,
    permissions.REPORT_READ_OWN,
    permissions.REPORT_GENERATE,
    permissions.REPORT_EXPORT,
    permissions.USER_MANAGE_OWN,
  ],

  [Role.INPUT_SUPPLIER]: [
    permissions.CONTRACT_READ_OWN,
    permissions.INPUT_CREATE,
    permissions.ESCROW_READ_OWN,
    permissions.SETTLEMENT_READ,
    permissions.DISPUTE_FLAG,
    permissions.REPORT_READ_OWN,
    permissions.REPORT_EXPORT,
    permissions.USER_MANAGE_OWN,
    permissions.TAX_READ,
  ],

  [Role.COMMERCIAL_FARMER]: [
    permissions.CONTRACT_CREATE,
    permissions.CONTRACT_READ_OWN,
    permissions.CONTRACT_UPDATE,
    permissions.ESCROW_READ_OWN,
    permissions.INPUT_VERIFY,
    permissions.SETTLEMENT_READ,
    permissions.COLLATERAL_REGISTER,
    permissions.DISPUTE_FLAG,
    permissions.REPORT_READ_OWN,
    permissions.REPORT_EXPORT,
    permissions.USER_MANAGE_OWN,
    permissions.TAX_READ,
  ],

  [Role.OFF_TAKER]: [
    permissions.CONTRACT_READ_OWN,
    permissions.ESCROW_READ_OWN,
    permissions.INPUT_VERIFY,
    permissions.SETTLEMENT_READ,
    permissions.DISPUTE_FLAG,
    permissions.REPORT_READ_OWN,
    permissions.REPORT_EXPORT,
    permissions.USER_MANAGE_OWN,
    permissions.TAX_READ,
  ],

  [Role.GOVERNMENT_REGULATOR]: [
    permissions.CONTRACT_READ_OWN,
    permissions.CONTRACT_READ_ALL,
    permissions.CONTRACT_APPROVE,
    permissions.CONTRACT_FREEZE,
    permissions.ESCROW_FREEZE,
    permissions.COLLATERAL_LIQUIDATE,
    permissions.DISPUTE_FLAG,
    permissions.REPORT_READ_OWN,
    permissions.REPORT_GENERATE,
    permissions.REPORT_EXPORT,
    permissions.AUDIT_READ,
    permissions.USER_MANAGE_OWN,
    permissions.TAX_READ,
  ],

  [Role.DONOR]: [
    permissions.CONTRACT_READ_OWN,
    permissions.ESCROW_FUND,
    permissions.INVESTMENT_READ_ALL,
    permissions.SETTLEMENT_READ,
    permissions.REPORT_READ_OWN,
    permissions.REPORT_GENERATE,
    permissions.REPORT_EXPORT,
    permissions.AUDIT_READ,
    permissions.USER_MANAGE_OWN,
  ],

  [Role.NAFI_ADMIN]: ['*'],

  [Role.COMPLIANCE_OFFICER]: [
    permissions.CONTRACT_READ_OWN,
    permissions.CONTRACT_READ_ALL,
    permissions.CONTRACT_APPROVE,
    permissions.CONTRACT_FREEZE,
    permissions.ESCROW_READ_OWN,
    permissions.ESCROW_FREEZE,
    permissions.INVESTMENT_READ_ALL,
    permissions.SETTLEMENT_READ,
    permissions.DISPUTE_FLAG,
    permissions.REPORT_READ_OWN,
    permissions.REPORT_GENERATE,
    permissions.REPORT_EXPORT,
    permissions.AUDIT_READ,
    permissions.TAX_READ,
  ],

  [Role.ARBITRATOR]: [
    permissions.CONTRACT_READ_OWN,
    permissions.CONTRACT_READ_ALL,
    permissions.CONTRACT_FREEZE,
    permissions.ESCROW_READ_OWN,
    permissions.ESCROW_FREEZE,
    permissions.SETTLEMENT_READ,
    permissions.DISPUTE_FLAG,
    permissions.DISPUTE_ARBITRATE,
    permissions.REPORT_READ_OWN,
    permissions.REPORT_EXPORT,
    permissions.AUDIT_READ,
  ],
};

/**
 * Check if a role has a specific permission
 */
export function can(role: Role | string, permission: string): boolean {
  const rolePerms: readonly string[] | undefined = rolePermissions[role as Role];
  if (!rolePerms) return false;
  // Super admin has all permissions
  const perms: readonly string[] = rolePerms;
  if (perms.includes('*')) return true;
  return perms.includes(permission);
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
