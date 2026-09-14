import { Router } from 'express';
import { publicController } from './public.controller';

const router = Router();

// Public routes (no auth required)
router.get('/', publicController.findAll);
router.get('/:id', publicController.findById);

export default router;
