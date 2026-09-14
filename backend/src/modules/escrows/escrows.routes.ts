import { Router } from 'express';
import { escrowsController } from './escrows.controller';
import { authenticate } from '../../middleware/authenticate';
import { tenantScope } from '../../middleware/tenantScope';

const router = Router();

router.use(authenticate);
router.use(tenantScope('OWN'));

router.get('/', escrowsController.findAll);
router.post('/', escrowsController.create);
router.get('/:id', escrowsController.findById);
router.put('/:id', escrowsController.update);
router.delete('/:id', escrowsController.delete);

export default router;
