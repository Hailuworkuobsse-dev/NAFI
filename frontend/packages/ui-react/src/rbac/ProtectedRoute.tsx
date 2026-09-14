import { ROLE_HOME, type Permission, type Role } from '@nafi/rbac-core';
import type { ReactNode } from 'react';
import { Navigate, Outlet } from 'react-router-dom';

import { Spinner } from '../primitives/Spinner/Spinner';

import { useAuth } from './AuthContext';
import { usePermission } from './usePermission';

export interface ProtectedRouteProps {
  permission: Permission;
  scope?: string;
  roles?: Role[];
  loginPath?: string;
  children?: ReactNode;
}

export function ProtectedRoute({
  permission,
  scope,
  roles,
  loginPath = '/login',
  children,
}: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();
  const { can } = usePermission();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!user) return <Navigate to={loginPath} replace />;

  if (roles && roles.length > 0 && !roles.includes(user.role)) {
    return <Navigate to={ROLE_HOME[user.role]} replace />;
  }

  if (!can(permission, scope)) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 text-center">
        <p className="text-lg font-semibold text-neutral-900">Access denied</p>
        <p className="text-sm text-neutral-500">You do not have permission to view this page.</p>
      </div>
    );
  }

  return <>{children ?? <Outlet />}</>;
}
