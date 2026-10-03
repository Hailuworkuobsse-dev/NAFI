import { Request, Response } from 'express';
import { disputesService } from './disputes.service';
import { asyncHandler } from '../../utils/asyncHandler';
import { ok, created, list, idParam } from '../../utils/apiResponse';

export class DisputesController {
  findAll = asyncHandler(async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || parseInt(req.query.pageSize as string) || 20;
    const result = await disputesService.findAll(
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
    const item = await disputesService.findById(idParam(req.params.id));
    ok(res, item);
  });

  create = asyncHandler(async (req: Request, res: Response) => {
    const item = await disputesService.create(req.body, req.user!.userId);
    created(res, item, 'Dispute created successfully');
  });

  update = asyncHandler(async (req: Request, res: Response) => {
    const item = await disputesService.update(idParam(req.params.id), req.body);
    ok(res, item, 'Dispute updated successfully');
  });

  resolve = asyncHandler(async (req: Request, res: Response) => {
    const item = await disputesService.resolve(idParam(req.params.id), req.body.resolution, req.user!.userId);
    ok(res, item, 'Dispute resolved');
  });
}

export const disputesController = new DisputesController();
