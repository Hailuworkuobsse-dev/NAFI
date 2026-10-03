import { Router } from 'express';
import { notificationsController } from './notifications.controller';
import { authenticate } from '../../middleware/authenticate';

const router = Router();

router.use(authenticate);

router.get('/', notificationsController.findAll);
router.post('/', notificationsController.create);
router.get('/unread-count', notificationsController.unreadCount);
router.get('/:id', notificationsController.findById);
router.patch('/:id/read', notificationsController.markAsRead);
router.post('/read-all', notificationsController.markAllAsRead);

export default router;
