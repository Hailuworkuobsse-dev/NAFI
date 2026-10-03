import { Request, Response } from 'express';
import { reportsService } from './reports.service';
import { asyncHandler } from '../../utils/asyncHandler';
import { ok, created, list } from '../../utils/apiResponse';

export class ReportsController {
  findAll = asyncHandler(async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || parseInt(req.query.pageSize as string) || 20;
    const result = await reportsService.findAll(
      req.user!.userId,
      req.user!.institutionId ?? null,
      req.tenantScope!,
      {},
      page,
      limit
    );
    list(res, result);
  });

  generate = asyncHandler(async (req: Request, res: Response) => {
    const item = await reportsService.create(req.body, req.user!.userId);
    created(res, item, 'Report generated successfully');
  });
}

export const reportsController = new ReportsController();
