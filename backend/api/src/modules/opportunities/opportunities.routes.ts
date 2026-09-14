import { Router } from 'express';

import { asyncHandler } from '@/utils/asyncHandler';

import * as controller from './opportunities.controller';

export const opportunitiesRouter = Router();

opportunitiesRouter.get('/', asyncHandler(controller.list));
opportunitiesRouter.get('/:id', asyncHandler(controller.detail));
