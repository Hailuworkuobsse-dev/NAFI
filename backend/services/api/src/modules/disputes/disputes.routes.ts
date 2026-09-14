import { PERMISSIONS } from '@nafi/rbac-core';
import { Router } from 'express';

import { asyncHandler } from '@/utils/asyncHandler';
import { authenticate } from '@/middleware/authenticate';
import { authorize } from '@/middleware/authorize';
import { auditMiddleware } from '@/middleware/auditLog';

import * as controller from './disputes.controller';

export const disputesRouter = Router();

disputesRouter.use(authenticate);

disputesRouter.get('/', authorize(PERMISSIONS.CONTRACT_READ_OWN), asyncHandler(controller.list));
disputesRouter.get('/:id', authorize(PERMISSIONS.CONTRACT_READ_OWN), asyncHandler(controller.detail));
disputesRouter.post(
  '/',
  authorize(PERMISSIONS.DISPUTE_FLAG),
  auditMiddleware('file', 'dispute'),
  asyncHandler(controller.file),
);
disputesRouter.post(
  '/:id/schedule',
  authorize(PERMISSIONS.DISPUTE_ARBITRATE),
  asyncHandler(controller.schedule),
);
disputesRouter.post(
  '/:id/decide',
  authorize(PERMISSIONS.DISPUTE_ARBITRATE),
  auditMiddleware('decide', 'dispute'),
  asyncHandler(controller.decide),
);
