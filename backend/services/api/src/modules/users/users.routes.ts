import { PERMISSIONS } from '@nafi/rbac-core';
import { Router } from 'express';

import { asyncHandler } from '@/utils/asyncHandler';
import { authenticate } from '@/middleware/authenticate';
import { authorize } from '@/middleware/authorize';
import { auditMiddleware } from '@/middleware/auditLog';

import * as controller from './users.controller';

export const usersRouter = Router();

usersRouter.use(authenticate);

usersRouter.get('/', authorize(PERMISSIONS.USER_MANAGE_ALL), asyncHandler(controller.list));
usersRouter.get('/:id', authorize(PERMISSIONS.USER_MANAGE_ALL), asyncHandler(controller.detail));
usersRouter.post(
  '/invite',
  authorize(PERMISSIONS.USER_INVITE),
  auditMiddleware('invite', 'user'),
  asyncHandler(controller.invite),
);
usersRouter.post(
  '/:id/deactivate',
  authorize(PERMISSIONS.USER_MANAGE_ALL),
  auditMiddleware('deactivate', 'user'),
  asyncHandler(controller.deactivate),
);
usersRouter.post(
  '/:id/reactivate',
  authorize(PERMISSIONS.USER_MANAGE_ALL),
  auditMiddleware('reactivate', 'user'),
  asyncHandler(controller.reactivate),
);
