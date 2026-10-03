import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/ApiError';
import { can } from '../constants/rolePermissions';

/**
 * Middleware to authorize based on RBAC permissions
 */
export function authorize(permission: string | string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      if (!req.user) {
        throw ApiError.unauthorized('Authentication required');
      }

      const userRole = req.user.role;
      const requiredPermissions = Array.isArray(permission) ? permission : [permission];

      // Check if user has any of the required permissions (can() accepts string roles)
      const hasPermission = requiredPermissions.some((p: string) => can(userRole, p));

      if (!hasPermission) {
        throw ApiError.forbidden(`Missing required permission: ${requiredPermissions.join(' or ')}`);
      }

      next();
    } catch (error) {
      next(error);
    }
  };
}

/**
 * Middleware to authorize based on role only
 */
export function authorizeRole(...roles: string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      if (!req.user) {
        throw ApiError.unauthorized('Authentication required');
      }

      if (!roles.includes(req.user.role)) {
        throw ApiError.forbidden(`Access denied. Required roles: ${roles.join(', ')}`);
      }

      next();
    } catch (error) {
      next(error);
    }
  };
}
