import { Router } from 'express';
import { usersController } from './users.controller';
import { authenticate } from '../../middleware/authenticate';
import { tenantScope } from '../../middleware/tenantScope';

const router = Router();

router.use(authenticate);
router.use(tenantScope('OWN'));

router.get('/', usersController.findAll);
router.post('/', usersController.create);
router.get('/:id', usersController.findById);
router.put('/:id', usersController.update);
router.delete('/:id', usersController.delete);

export default router;
