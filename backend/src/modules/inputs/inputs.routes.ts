import { Router } from 'express';
import { inputsController } from './inputs.controller';
import { authenticate } from '../../middleware/authenticate';
import { tenantScope } from '../../middleware/tenantScope';

const router = Router();

router.use(authenticate);
router.use(tenantScope('OWN'));

router.get('/', inputsController.findAll);
router.post('/', inputsController.create);
router.get('/:id', inputsController.findById);
router.put('/:id', inputsController.update);
router.delete('/:id', inputsController.delete);

export default router;
