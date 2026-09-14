import { Router } from 'express';

import { asyncHandler } from '@/utils/asyncHandler';

import * as controller from './public.controller';

export const publicRouter = Router();

publicRouter.get('/stats', asyncHandler(controller.stats));
