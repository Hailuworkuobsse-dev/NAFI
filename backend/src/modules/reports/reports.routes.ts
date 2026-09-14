import { Router } from 'express';
import { reportsController } from './reports.controller';
import { authenticate } from '../../middleware/authenticate';
import { tenantScope } from '../../middleware/tenantScope';

const router = Router();

router.use(authenticate);
router.use(tenantScope('OWN'));

router.get('/', reportsController.findAll);
router.post('/', reportsController.create);
router.get('/:id', reportsController.findById);
router.put('/:id', reportsController.update);
router.delete('/:id', reportsController.delete);

export default router;
