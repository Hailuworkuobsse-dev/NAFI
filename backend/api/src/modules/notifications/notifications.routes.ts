import { Router } from 'express';

import { asyncHandler } from '@/utils/asyncHandler';
import { authenticate } from '@/middleware/authenticate';

import * as controller from './notifications.controller';

export const notificationsRouter = Router();

notificationsRouter.get('/push/vapid-public-key', asyncHandler(controller.vapidPublicKey));

notificationsRouter.use(authenticate);

notificationsRouter.get('/', asyncHandler(controller.list));
notificationsRouter.get('/unread-count', asyncHandler(controller.unreadCount));
notificationsRouter.post('/:id/read', asyncHandler(controller.markRead));
notificationsRouter.post('/read-all', asyncHandler(controller.markAllRead));
notificationsRouter.post('/push/subscribe', asyncHandler(controller.pushSubscribe));
notificationsRouter.post('/push/unsubscribe', asyncHandler(controller.pushUnsubscribe));
