import { PERMISSIONS } from '@nafi/rbac-core';
import { Router } from 'express';

import { asyncHandler } from '@/utils/asyncHandler';
import { authenticate } from '@/middleware/authenticate';
import { authorize } from '@/middleware/authorize';
import { auditMiddleware } from '@/middleware/auditLog';

import * as controller from './settlements.controller';

export const settlementsRouter = Router();

settlementsRouter.use(authenticate);

settlementsRouter.get('/', authorize(PERMISSIONS.SETTLEMENT_READ), asyncHandler(controller.list));
settlementsRouter.get('/:id', authorize(PERMISSIONS.SETTLEMENT_READ), asyncHandler(controller.detail));
settlementsRouter.post(
  '/simulate',
  authorize(PERMISSIONS.SETTLEMENT_SIMULATE),
  asyncHandler(controller.simulate),
);
settlementsRouter.post(
  '/:id/execute',
  authorize(PERMISSIONS.SETTLEMENT_EXECUTE),
  auditMiddleware('execute', 'settlement'),
  asyncHandler(controller.execute),
);
settlementsRouter.post(
  '/:id/reverse',
  authorize(PERMISSIONS.SETTLEMENT_EXECUTE),
  auditMiddleware('reverse', 'settlement'),
  asyncHandler(controller.reverse),
);
