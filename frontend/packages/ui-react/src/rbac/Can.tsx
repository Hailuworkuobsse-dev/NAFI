import type { Permission } from '@nafi/rbac-core';
import type { ReactNode } from 'react';

import { usePermission } from './usePermission';

export interface CanProps {
  /** Permission required */
  I: Permission;
  /** Optional scope (e.g. 'region:addis') */
  scope?: string;
  /** Rendered when permission denied */
  fallback?: ReactNode;
  children: ReactNode;
}

export function Can({ I, scope, fallback = null, children }: CanProps) {
  const { can } = usePermission();
  return can(I, scope) ? <>{children}</> : <>{fallback}</>;
}
