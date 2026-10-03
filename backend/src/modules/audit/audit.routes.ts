import { Router } from 'express';
import { auditController } from './audit.controller';
import { authenticate } from '../../middleware/authenticate';
import { tenantScope } from '../../middleware/tenantScope';

const router = Router();

router.use(authenticate);
router.use(tenantScope('OWN'));

router.get('/', auditController.findAll);
router.get('/verify-chain', auditController.verifyChain);
router.get('/:id', auditController.findById);

export default router;
