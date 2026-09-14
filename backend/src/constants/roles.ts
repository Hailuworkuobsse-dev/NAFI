/**
 * Role Enum - 12 roles for NAFI RBAC system
 * Aligned with frontend rbac-core package
 */
export enum Role {
  DIASPORA_INVESTOR = 'DIASPORA_INVESTOR',
  COMMERCIAL_BANK = 'COMMERCIAL_BANK',
  DBE_OFFICER = 'DBE_OFFICER',
  NAFA_OFFICER = 'NAFA_OFFICER',
  INPUT_SUPPLIER = 'INPUT_SUPPLIER',
  COMMERCIAL_FARMER = 'COMMERCIAL_FARMER',
  OFF_TAKER = 'OFF_TAKER',
  GOVERNMENT_REGULATOR = 'GOVERNMENT_REGULATOR',
  DONOR = 'DONOR',
  NAFI_ADMIN = 'NAFI_ADMIN',
  COMPLIANCE_OFFICER = 'COMPLIANCE_OFFICER',
  ARBITRATOR = 'ARBITRATOR',
}

export const ALL_ROLES: Role[] = Object.values(Role);

export function isValidRole(role: string): role is Role {
  return ALL_ROLES.includes(role as Role);
}
