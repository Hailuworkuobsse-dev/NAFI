import { Router } from 'express';

import { authenticate } from '@/middleware/authenticate';
import { authLimiter, registerLimiter } from '@/middleware/rateLimiter';
import { asyncHandler } from '@/utils/asyncHandler';

import * as controller from './auth.controller';

export const authRouter = Router();

authRouter.post('/login', authLimiter, asyncHandler(controller.login));
authRouter.post('/register', registerLimiter, asyncHandler(controller.register));
authRouter.post('/refresh', asyncHandler(controller.refresh));
authRouter.post('/logout', asyncHandler(controller.logout));
authRouter.get('/me', authenticate, asyncHandler(controller.me));
authRouter.post('/password/forgot', authLimiter, asyncHandler(controller.forgotPassword));
authRouter.post('/password/reset', authLimiter, asyncHandler(controller.resetPassword));
