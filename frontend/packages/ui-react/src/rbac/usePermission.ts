import { can, type Permission } from '@nafi/rbac-core';

import { useAuth } from './AuthContext';

export function usePermission() {
  const { user } = useAuth();

  const check = (permission: Permission, scope?: string): boolean => {
    if (!user) return false;
    return can(
      { role: user.role, permissions: user.permissions, scopes: user.scopes },
      permission,
      scope,
    );
  };

  return { can: check, user };
}
