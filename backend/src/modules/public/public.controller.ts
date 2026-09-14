import { Request, Response } from 'express';
import { publicService } from './public.service';
import { asyncHandler } from '../../utils/asyncHandler';
import { ok, created, list } from '../../utils/apiResponse';

export class PublicController {
  findAll = asyncHandler(async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const items = await publicService.findAll(req.user!.userId, req.user!.institutionId, req.tenantScope);
    ok(res, items);
  });

  findById = asyncHandler(async (req: Request, res: Response) => {
    const item = await publicService.findById(req.params.id);
    ok(res, item);
  });

  create = asyncHandler(async (req: Request, res: Response) => {
    const item = await publicService.create(req.body, req.user!.userId);
    created(res, item, 'Public created successfully');
  });

  update = asyncHandler(async (req: Request, res: Response) => {
    const item = await publicService.update(req.params.id, req.body);
    ok(res, item, 'Public updated successfully');
  });

  delete = asyncHandler(async (req: Request, res: Response) => {
    await publicService.delete(req.params.id);
    res.status(204).send();
  });
}

export const publicController = new PublicController();
