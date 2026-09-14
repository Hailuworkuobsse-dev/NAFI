import { PERMISSIONS } from '@nafi/rbac-core';
import { Router } from 'express';

import { asyncHandler } from '@/utils/asyncHandler';
import { authenticate } from '@/middleware/authenticate';
import { authorize } from '@/middleware/authorize';

import * as controller from './reports.controller';

export const reportsRouter = Router();

reportsRouter.use(authenticate);

reportsRouter.get('/', authorize(PERMISSIONS.REPORT_READ_OWN), asyncHandler(controller.list));
reportsRouter.get('/:id', authorize(PERMISSIONS.REPORT_READ_OWN), asyncHandler(controller.detail));
reportsRouter.post('/', authorize(PERMISSIONS.REPORT_GENERATE), asyncHandler(controller.generate));
