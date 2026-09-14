import { Request, Response } from 'express';
import { healthService } from './health.service';
import { asyncHandler } from '../../utils/asyncHandler';
import { ok } from '../../utils/apiResponse';

export class HealthController {
  liveness = asyncHandler(async (req: Request, res: Response) => {
    const status = await healthService.liveness();
    ok(res, status);
  });

  readiness = asyncHandler(async (req: Request, res: Response) => {
    const status = await healthService.readiness();
    ok(res, status);
  });

  dbHealth = asyncHandler(async (req: Request, res: Response) => {
    const status = await healthService.dbHealth();
    ok(res, status);
  });
}

export const healthController = new HealthController();
