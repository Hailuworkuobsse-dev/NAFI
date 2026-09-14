/**
 * Role Enum - 12 roles for NAFI RBAC system
 */
export enum Role {
  SUPER_ADMIN = 'SUPER_ADMIN',
  NATIONAL_ADMIN = 'NATIONAL_ADMIN',
  INSTITUTION_ADMIN = 'INSTITUTION_ADMIN',
  COMPLIANCE_OFFICER = 'COMPLIANCE_OFFICER',
  RISK_MANAGER = 'RISK_MANAGER',
  INVESTOR_RELATIONS = 'INVESTOR_RELATIONS',
  FIELD_AGENT = 'FIELD_AGENT',
  BORROWER = 'BORROWER',
  INVESTOR = 'INVESTOR',
  GUARANTOR = 'GUARANTOR',
  AUDITOR = 'AUDITOR',
  SYSTEM = 'SYSTEM',
}

export const ALL_ROLES: Role[] = Object.values(Role);

export function isValidRole(role: string): role is Role {
  return ALL_ROLES.includes(role as Role);
}
