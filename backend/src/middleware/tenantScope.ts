import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/ApiError';
import prisma from '../config/prisma';

export enum TenantScope {
  OWN = 'OWN',
  INSTITUTION = 'INSTITUTION',
  NATIONAL = 'NATIONAL',
  ALL = 'ALL',
}

declare module 'express' {
  interface Request {
    tenantScope?: TenantScope;
  }
}

/**
 * Middleware to enforce tenant scope filtering
 */
export function tenantScope(requiredScope: TenantScope | 'OWN' | 'INSTITUTION' | 'NATIONAL' | 'ALL') {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        throw ApiError.unauthorized('Authentication required');
      }

      const user = req.user;
      const requestedScope = req.headers['x-tenant-scope'] as string | undefined;

      // Determine effective scope based on role hierarchy
      let effectiveScope: TenantScope;

      // Role names must match the Role enum in prisma/schema.prisma & constants/roles.ts
      switch (user.role) {
        case 'NAFI_ADMIN':
          effectiveScope = TenantScope.ALL;
          break;
        case 'GOVERNMENT_REGULATOR':
        case 'DBE_OFFICER':
        case 'NAFA_OFFICER':
        case 'COMPLIANCE_OFFICER':
        case 'ARBITRATOR':
          effectiveScope = TenantScope.NATIONAL;
          break;
        case 'COMMERCIAL_BANK':
        case 'DONOR':
        case 'OFF_TAKER':
        case 'INPUT_SUPPLIER':
          effectiveScope = user.institutionId
            ? TenantScope.INSTITUTION
            : TenantScope.OWN;
          break;
        default:
          effectiveScope = TenantScope.OWN;
      }

      // Check if requested scope is allowed
      if (requestedScope) {
        if (!isValidScopeTransition(effectiveScope, requestedScope as TenantScope)) {
          throw ApiError.forbidden(`Scope ${requestedScope} not allowed for your role`);
        }
        req.tenantScope = requestedScope as TenantScope;
      } else {
        req.tenantScope = effectiveScope;
      }

      next();
    } catch (error) {
      next(error);
    }
  };
}

/**
 * Check if a scope transition is valid (can only narrow, not broaden)
 */
function isValidScopeTransition(current: TenantScope, requested: TenantScope): boolean {
  const scopeHierarchy: Record<TenantScope, number> = {
    [TenantScope.OWN]: 0,
    [TenantScope.INSTITUTION]: 1,
    [TenantScope.NATIONAL]: 2,
    [TenantScope.ALL]: 3,
  };

  return scopeHierarchy[requested] <= scopeHierarchy[current];
}

/**
 * Build a where clause based on tenant scope
 */
export function buildTenantWhereClause(
  scope: TenantScope,
  userId: string,
  institutionId?: string | null,
  ownerField: string = 'borrowerId'
): Record<string, unknown> {
  switch (scope) {
    case TenantScope.OWN:
      // Callers pass an explicit ownerField; default to borrowerId (Contract)
      return { [ownerField]: userId };
    
    case TenantScope.INSTITUTION:
      if (!institutionId) {
        return { id: 'impossible-id' }; // Return empty result
      }
      return { institutionId };
    
    case TenantScope.NATIONAL:
      return {}; // All within country (add country filter if needed)
    
    case TenantScope.ALL:
    default:
      return {};
  }
}
