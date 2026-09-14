import { Request, Response } from 'express';
import { healthService } from './health.service';
import { asyncHandler } from '../../utils/asyncHandler';
import { ok, created, list } from '../../utils/apiResponse';

export class HealthController {
  findAll = asyncHandler(async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const items = await healthService.findAll(req.user!.userId, req.user!.institutionId, req.tenantScope);
    ok(res, items);
  });

  findById = asyncHandler(async (req: Request, res: Response) => {
    const item = await healthService.findById(req.params.id);
    ok(res, item);
  });

  create = asyncHandler(async (req: Request, res: Response) => {
    const item = await healthService.create(req.body, req.user!.userId);
    created(res, item, 'Health created successfully');
  });

  update = asyncHandler(async (req: Request, res: Response) => {
    const item = await healthService.update(req.params.id, req.body);
    ok(res, item, 'Health updated successfully');
  });

  delete = asyncHandler(async (req: Request, res: Response) => {
    await healthService.delete(req.params.id);
    res.status(204).send();
  });
}

export const healthController = new HealthController();
