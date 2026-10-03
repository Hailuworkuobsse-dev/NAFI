import { Router } from 'express';
import { settlementsController } from './settlements.controller';
import { authenticate } from '../../middleware/authenticate';
import { tenantScope } from '../../middleware/tenantScope';

const router = Router();

router.use(authenticate);
router.use(tenantScope('OWN'));

router.get('/', settlementsController.findAll);
router.post('/', settlementsController.create);
router.get('/:id', settlementsController.findById);
router.put('/:id', settlementsController.update);

export default router;
