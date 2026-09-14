import { PERMISSIONS } from '@nafi/rbac-core';
import { Router } from 'express';

import { asyncHandler } from '@/utils/asyncHandler';
import { authenticate } from '@/middleware/authenticate';
import { authorize } from '@/middleware/authorize';
import { auditMiddleware } from '@/middleware/auditLog';

import * as controller from './investments.controller';

export const investmentsRouter = Router();

investmentsRouter.use(authenticate);

investmentsRouter.get('/mine', authorize(PERMISSIONS.INVESTMENT_READ_OWN), asyncHandler(controller.mine));
investmentsRouter.get('/', authorize(PERMISSIONS.INVESTMENT_READ_ALL), asyncHandler(controller.list));
investmentsRouter.get('/:id', authorize(PERMISSIONS.INVESTMENT_READ_OWN), asyncHandler(controller.detail));
investmentsRouter.post(
  '/',
  authorize(PERMISSIONS.INVESTMENT_CREATE),
  auditMiddleware('create', 'investment'),
  asyncHandler(controller.create),
);
