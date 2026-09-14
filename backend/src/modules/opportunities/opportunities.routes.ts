import { Router } from 'express';
import { opportunitiesController } from './opportunities.controller';

const router = Router();

// Public routes (no auth required)
router.get('/', opportunitiesController.findAll);
router.get('/:id', opportunitiesController.findById);

export default router;
