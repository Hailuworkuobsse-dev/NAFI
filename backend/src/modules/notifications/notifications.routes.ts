import { Router } from 'express';
import { notificationsController } from './notifications.controller';
import { authenticate } from '../../middleware/authenticate';
import { tenantScope } from '../../middleware/tenantScope';

const router = Router();

router.use(authenticate);
router.use(tenantScope('OWN'));

router.get('/', notificationsController.findAll);
router.post('/', notificationsController.create);
router.get('/:id', notificationsController.findById);
router.put('/:id', notificationsController.update);
router.delete('/:id', notificationsController.delete);

export default router;
