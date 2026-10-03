import { Request, Response } from 'express';
import { opportunitiesService } from './opportunities.service';
import { asyncHandler } from '../../utils/asyncHandler';
import { ok, created, list } from '../../utils/apiResponse';

export class OpportunitiesController {
  findAll = asyncHandler(async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const result = await opportunitiesService.findAll(req.user!.userId, req.user!.institutionId, req.tenantScope);
    list(res, result);
  });

  findById = asyncHandler(async (req: Request, res: Response) => {
    const item = await opportunitiesService.findById(req.params.id);
    ok(res, item);
  });

  create = asyncHandler(async (req: Request, res: Response) => {
    const item = await opportunitiesService.create(req.body, req.user!.userId);
    created(res, item, 'Opportunities created successfully');
  });

  update = asyncHandler(async (req: Request, res: Response) => {
    const item = await opportunitiesService.update(req.params.id, req.body);
    ok(res, item, 'Opportunities updated successfully');
  });

  delete = asyncHandler(async (req: Request, res: Response) => {
    await opportunitiesService.delete(req.params.id);
    res.status(204).send();
  });
}

export const opportunitiesController = new OpportunitiesController();
