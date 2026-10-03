import { Request, Response } from 'express';
import { settlementsService } from './settlements.service';
import { asyncHandler } from '../../utils/asyncHandler';
import { ok, created, list } from '../../utils/apiResponse';

export class SettlementsController {
  findAll = asyncHandler(async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const result = await settlementsService.findAll(req.user!.userId, req.user!.institutionId, req.tenantScope);
    list(res, result);
  });

  findById = asyncHandler(async (req: Request, res: Response) => {
    const item = await settlementsService.findById(req.params.id);
    ok(res, item);
  });

  create = asyncHandler(async (req: Request, res: Response) => {
    const item = await settlementsService.create(req.body, req.user!.userId);
    created(res, item, 'Settlements created successfully');
  });

  update = asyncHandler(async (req: Request, res: Response) => {
    const item = await settlementsService.update(req.params.id, req.body);
    ok(res, item, 'Settlements updated successfully');
  });

  delete = asyncHandler(async (req: Request, res: Response) => {
    await settlementsService.delete(req.params.id);
    res.status(204).send();
  });
}

export const settlementsController = new SettlementsController();
