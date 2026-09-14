import { Router } from 'express';
import { healthController } from './health.controller';

const router = Router();

// Public routes (no auth required)
router.get('/', healthController.findAll);
router.get('/:id', healthController.findById);

export default router;
