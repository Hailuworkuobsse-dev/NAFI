import type { NextFunction, Request, Response } from 'express';

import type { Role } from '@nafi/rbac-core';

export type TenantScope = 'own' | 'institution' | 'national' | 'all';

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

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      tenantScope?: TenantScope;
    }
  }
}

export function tenantScope(req: Request, _res: Response, next: NextFunction): void {
  if (!req.user) return next();
  req.tenantScope = ROLE_SCOPE[req.user.role as Role] ?? 'own';
  next();
}
