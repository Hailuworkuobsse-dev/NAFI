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
