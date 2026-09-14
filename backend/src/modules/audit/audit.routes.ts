import { Router } from 'express';
import { auditController } from './audit.controller';
import { authenticate } from '../../middleware/authenticate';
import { tenantScope } from '../../middleware/tenantScope';

const router = Router();

router.use(authenticate);
router.use(tenantScope('OWN'));

router.get('/', auditController.findAll);
router.post('/', auditController.create);
router.get('/:id', auditController.findById);
router.put('/:id', auditController.update);
router.delete('/:id', auditController.delete);

export default router;
