import { Request, Response } from 'express';
import { settlementsService } from './settlements.service';
import { asyncHandler } from '../../utils/asyncHandler';
import { ok, created, list, idParam } from '../../utils/apiResponse';

export class SettlementsController {
  findAll = asyncHandler(async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || parseInt(req.query.pageSize as string) || 20;
    const result = await settlementsService.findAll(
      req.user!.userId,
      req.user!.institutionId ?? null,
      req.tenantScope!,
      { status: req.query.status as string | undefined },
      page,
      limit
    );
    list(res, result);
  });

  findById = asyncHandler(async (req: Request, res: Response) => {
    const item = await settlementsService.findById(idParam(req.params.id));
    ok(res, item);
  });

  create = asyncHandler(async (req: Request, res: Response) => {
    const item = await settlementsService.create(req.body, req.user!.userId);
    created(res, item, 'Settlement created successfully');
  });

  update = asyncHandler(async (req: Request, res: Response) => {
    const item = await settlementsService.update(idParam(req.params.id), req.body);
    ok(res, item, 'Settlement updated successfully');
  });
}

export const settlementsController = new SettlementsController();
