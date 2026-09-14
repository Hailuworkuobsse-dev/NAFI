import { Router } from 'express';
import { contractsController } from './contracts.controller';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../middleware/authorize';
import { tenantScope } from '../../middleware/tenantScope';
import { auditLog } from '../../middleware/auditLog';

const router = Router();

router.use(authenticate);
router.use(tenantScope('OWN'));

router.get('/', contractsController.findAll);
router.post('/', authorize('contract:create'), auditLog('Contract', 'CREATE'), contractsController.create);
router.get('/:id', contractsController.findById);
router.put('/:id', authorize('contract:update'), auditLog('Contract', 'UPDATE'), contractsController.update);
router.post('/:id/approve', authorize('contract:approve'), auditLog('Contract', 'APPROVE'), contractsController.approve);
router.post('/:id/reject', authorize('contract:reject'), auditLog('Contract', 'REJECT'), contractsController.reject);
router.delete('/:id', authorize('contract:delete'), auditLog('Contract', 'DELETE'), contractsController.delete);

export default router;
