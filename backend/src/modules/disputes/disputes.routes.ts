import { Router } from 'express';
import { disputesController } from './disputes.controller';
import { authenticate } from '../../middleware/authenticate';
import { tenantScope } from '../../middleware/tenantScope';

const router = Router();

router.use(authenticate);
router.use(tenantScope('OWN'));

router.get('/', disputesController.findAll);
router.post('/', disputesController.create);
router.get('/:id', disputesController.findById);
router.put('/:id', disputesController.update);
router.delete('/:id', disputesController.delete);

export default router;
