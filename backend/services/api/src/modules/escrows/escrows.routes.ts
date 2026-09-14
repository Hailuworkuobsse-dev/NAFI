import { PERMISSIONS } from '@nafi/rbac-core';
import { Router } from 'express';

import { asyncHandler } from '@/utils/asyncHandler';
import { authenticate } from '@/middleware/authenticate';
import { authorize } from '@/middleware/authorize';
import { auditMiddleware } from '@/middleware/auditLog';

import * as controller from './escrows.controller';

export const escrowsRouter = Router();

escrowsRouter.use(authenticate);

escrowsRouter.get('/', authorize(PERMISSIONS.ESCROW_READ_OWN), asyncHandler(controller.list));
escrowsRouter.get('/:id', authorize(PERMISSIONS.ESCROW_READ_OWN), asyncHandler(controller.detail));
escrowsRouter.get('/:id/ledger', authorize(PERMISSIONS.ESCROW_READ_OWN), asyncHandler(controller.ledger));

escrowsRouter.post(
  '/:id/release',
  authorize(PERMISSIONS.ESCROW_RELEASE),
  auditMiddleware('release', 'escrow'),
  asyncHandler(controller.release),
);

escrowsRouter.post(
  '/:id/freeze',
  authorize(PERMISSIONS.ESCROW_FREEZE),
  auditMiddleware('freeze', 'escrow'),
  asyncHandler(controller.freeze),
);

escrowsRouter.post('/:id/close', authorize(PERMISSIONS.ESCROW_RELEASE), asyncHandler(controller.close));
