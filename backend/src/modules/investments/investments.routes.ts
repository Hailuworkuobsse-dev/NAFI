import { Router } from 'express';
import { investmentsController } from './investments.controller';
import { authenticate } from '../../middleware/authenticate';
import { tenantScope } from '../../middleware/tenantScope';

const router = Router();

router.use(authenticate);
router.use(tenantScope('OWN'));

router.get('/', investmentsController.findAll);
router.post('/', investmentsController.create);
router.get('/:id', investmentsController.findById);
router.put('/:id', investmentsController.update);
router.delete('/:id', investmentsController.delete);

export default router;
