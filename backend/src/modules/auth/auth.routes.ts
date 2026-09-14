import { Router } from 'express';
import { authController } from './auth.controller';
import { authenticate } from '../../middleware/authenticate';
import { authLimiter, sensitiveLimiter } from '../../middleware/rateLimiter';

const router = Router();

// Public routes (rate limited)
router.post('/login', authLimiter, authController.login);
router.post('/register', authLimiter, authController.register);
router.post('/refresh', authController.refresh);
router.post('/password/reset/request', sensitiveLimiter, authController.requestPasswordReset);
router.post('/password/reset/confirm', sensitiveLimiter, authController.confirmPasswordReset);

// Protected routes
router.post('/logout', authenticate, authController.logout);
router.get('/me', authenticate, authController.me);
router.put('/password/change', authenticate, authController.changePassword);

export default router;
