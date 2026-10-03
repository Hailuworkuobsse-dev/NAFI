import { Router } from 'express';
import { publicController } from './public.controller';

const router = Router();

// Public routes (no auth required)
router.get('/stats', publicController.stats);
router.get('/opportunities', publicController.opportunities);

export default router;
