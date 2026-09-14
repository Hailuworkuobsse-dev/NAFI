import { PERMISSIONS } from '@nafi/rbac-core';
import { Router } from 'express';

import { asyncHandler } from '@/utils/asyncHandler';
import { authenticate } from '@/middleware/authenticate';
import { authorize } from '@/middleware/authorize';

import * as controller from './audit.controller';

export const auditRouter = Router();

auditRouter.use(authenticate);
auditRouter.get('/', authorize(PERMISSIONS.AUDIT_READ), asyncHandler(controller.list));
