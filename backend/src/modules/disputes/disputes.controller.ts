import { Request, Response } from 'express';
import { disputesService } from './disputes.service';
import { asyncHandler } from '../../utils/asyncHandler';
import { ok, created, list } from '../../utils/apiResponse';

export class DisputesController {
  findAll = asyncHandler(async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const result = await disputesService.findAll(req.user!.userId, req.user!.institutionId, req.tenantScope);
    list(res, result);
  });

  findById = asyncHandler(async (req: Request, res: Response) => {
    const item = await disputesService.findById(req.params.id);
    ok(res, item);
  });

  create = asyncHandler(async (req: Request, res: Response) => {
    const item = await disputesService.create(req.body, req.user!.userId);
    created(res, item, 'Disputes created successfully');
  });

  update = asyncHandler(async (req: Request, res: Response) => {
    const item = await disputesService.update(req.params.id, req.body);
    ok(res, item, 'Disputes updated successfully');
  });

  delete = asyncHandler(async (req: Request, res: Response) => {
    await disputesService.delete(req.params.id);
    res.status(204).send();
  });
}

export const disputesController = new DisputesController();
