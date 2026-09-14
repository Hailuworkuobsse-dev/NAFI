import { Router } from 'express';
import { healthController } from './health.controller';

const router = Router();

// Public routes (no auth required)
router.get('/liveness', healthController.liveness);
router.get('/readiness', healthController.readiness);
router.get('/db', healthController.dbHealth);

export default router;
