import { PERMISSIONS } from '@nafi/rbac-core';
import { Router } from 'express';

import { asyncHandler } from '@/utils/asyncHandler';
import { authenticate } from '@/middleware/authenticate';
import { authorize } from '@/middleware/authorize';
import { auditMiddleware } from '@/middleware/auditLog';

import * as controller from './contracts.controller';

export const contractsRouter = Router();

contractsRouter.use(authenticate);

contractsRouter.get(
  '/',
  authorize(PERMISSIONS.CONTRACT_READ_OWN),
  asyncHandler(controller.list),
);

contractsRouter.get(
  '/:id',
  authorize(PERMISSIONS.CONTRACT_READ_OWN),
  asyncHandler(controller.detail),
);

contractsRouter.get('/:id/timeline', asyncHandler(controller.timeline));
contractsRouter.get('/:id/signatures', asyncHandler(controller.signatures));

contractsRouter.post(
  '/',
  authorize(PERMISSIONS.CONTRACT_CREATE),
  auditMiddleware('create', 'contract'),
  asyncHandler(controller.create),
);

contractsRouter.patch(
  '/:id',
  authorize(PERMISSIONS.CONTRACT_UPDATE),
  auditMiddleware('update', 'contract'),
  asyncHandler(controller.update),
);

contractsRouter.post(
  '/:id/sign',
  authorize(PERMISSIONS.CONTRACT_UPDATE),
  auditMiddleware('sign', 'contract'),
  asyncHandler(controller.sign),
);

contractsRouter.post(
  '/:id/freeze',
  authorize(PERMISSIONS.CONTRACT_FREEZE),
  auditMiddleware('freeze', 'contract'),
  asyncHandler(controller.freeze),
);
