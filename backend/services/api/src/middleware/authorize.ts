import type { NextFunction, Request, Response } from 'express';

import { can, ROLE_PERMISSIONS, type Permission, type Role } from '@nafi/rbac-core';

import { ApiError } from '@/utils/ApiError';

export function authorize(permission: Permission, scope?: string) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) return next(ApiError.unauthorized());

    const role = req.user.role as Role;
    const allowed = can({ role }, permission, scope);

    if (!allowed) {
      return next(
        ApiError.forbidden(
          `Missing permission: ${permission}${scope ? ` (scope: ${scope})` : ''}`,
        ),
      );
    }

    next();
  };
}

export function requireRole(...roles: Role[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) return next(ApiError.unauthorized());
    if (!roles.includes(req.user.role as Role)) {
      return next(ApiError.forbidden('Role not permitted'));
    }
    next();
  };
}

/**
 * Effective permissions for the current user, expanded from role.
 */
export function effectivePermissions(role: Role): readonly string[] {
  return ROLE_PERMISSIONS[role] as readonly string[];
}
