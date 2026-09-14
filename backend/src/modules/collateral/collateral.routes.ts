import { Router } from 'express';
import { collateralController } from './collateral.controller';
import { authenticate } from '../../middleware/authenticate';
import { tenantScope } from '../../middleware/tenantScope';

const router = Router();

router.use(authenticate);
router.use(tenantScope('OWN'));

router.get('/', collateralController.findAll);
router.post('/', collateralController.create);
router.get('/:id', collateralController.findById);
router.put('/:id', collateralController.update);
router.delete('/:id', collateralController.delete);

export default router;
