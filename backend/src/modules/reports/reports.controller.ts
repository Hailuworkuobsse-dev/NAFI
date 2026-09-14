import { Request, Response } from 'express';
import { reportsService } from './reports.service';
import { asyncHandler } from '../../utils/asyncHandler';
import { ok, created, list } from '../../utils/apiResponse';

export class ReportsController {
  findAll = asyncHandler(async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const items = await reportsService.findAll(req.user!.userId, req.user!.institutionId, req.tenantScope);
    ok(res, items);
  });

  findById = asyncHandler(async (req: Request, res: Response) => {
    const item = await reportsService.findById(req.params.id);
    ok(res, item);
  });

  create = asyncHandler(async (req: Request, res: Response) => {
    const item = await reportsService.create(req.body, req.user!.userId);
    created(res, item, 'Reports created successfully');
  });

  update = asyncHandler(async (req: Request, res: Response) => {
    const item = await reportsService.update(req.params.id, req.body);
    ok(res, item, 'Reports updated successfully');
  });

  delete = asyncHandler(async (req: Request, res: Response) => {
    await reportsService.delete(req.params.id);
    res.status(204).send();
  });
}

export const reportsController = new ReportsController();
