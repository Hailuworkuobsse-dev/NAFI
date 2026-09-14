import { PERMISSIONS } from '@nafi/rbac-core';
import { Router } from 'express';

import { asyncHandler } from '@/utils/asyncHandler';
import { authenticate } from '@/middleware/authenticate';
import { authorize } from '@/middleware/authorize';
import { auditMiddleware } from '@/middleware/auditLog';

import * as controller from './collateral.controller';

export const collateralRouter = Router();

collateralRouter.use(authenticate);

collateralRouter.get('/', authorize(PERMISSIONS.COLLATERAL_REGISTER), asyncHandler(controller.list));
collateralRouter.get('/:id', authorize(PERMISSIONS.COLLATERAL_REGISTER), asyncHandler(controller.detail));
collateralRouter.post(
  '/',
  authorize(PERMISSIONS.COLLATERAL_REGISTER),
  auditMiddleware('register', 'collateral'),
  asyncHandler(controller.register),
);
collateralRouter.post('/:id/lien', authorize(PERMISSIONS.COLLATERAL_REGISTER), asyncHandler(controller.lien));
collateralRouter.post('/:id/release', authorize(PERMISSIONS.COLLATERAL_REGISTER), asyncHandler(controller.release));
collateralRouter.post(
  '/:id/liquidate',
  authorize(PERMISSIONS.COLLATERAL_LIQUIDATE),
  auditMiddleware('liquidate', 'collateral'),
  asyncHandler(controller.liquidate),
);
