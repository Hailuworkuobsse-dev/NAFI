import { Router } from 'express';

import { asyncHandler } from '@/utils/asyncHandler';

import * as controller from './health.controller';

export const healthRouter = Router();

healthRouter.get('/', controller.liveness);
healthRouter.get('/ready', asyncHandler(controller.readiness));
healthRouter.get('/db', asyncHandler(controller.db));
