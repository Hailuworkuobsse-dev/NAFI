import { PERMISSIONS } from '@nafi/rbac-core';
import { Router } from 'express';

import { asyncHandler } from '@/utils/asyncHandler';
import { authenticate } from '@/middleware/authenticate';
import { authorize } from '@/middleware/authorize';
import { auditMiddleware } from '@/middleware/auditLog';

import * as controller from './inputs.controller';

export const inputsRouter = Router();

inputsRouter.use(authenticate);

inputsRouter.get('/', authorize(PERMISSIONS.CONTRACT_READ_OWN), asyncHandler(controller.list));
inputsRouter.get('/:id', authorize(PERMISSIONS.CONTRACT_READ_OWN), asyncHandler(controller.detail));
inputsRouter.post(
  '/',
  authorize(PERMISSIONS.INPUT_CREATE),
  auditMiddleware('create', 'input_purchase'),
  asyncHandler(controller.create),
);
inputsRouter.post(
  '/:id/verify',
  authorize(PERMISSIONS.INPUT_VERIFY),
  auditMiddleware('verify_delivery', 'input_purchase'),
  asyncHandler(controller.verify),
);
