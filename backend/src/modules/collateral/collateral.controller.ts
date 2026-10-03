import { Request, Response } from 'express';
import { collateralService } from './collateral.service';
import { asyncHandler } from '../../utils/asyncHandler';
import { ok, created, list } from '../../utils/apiResponse';

export class CollateralController {
  findAll = asyncHandler(async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const result = await collateralService.findAll(req.user!.userId, req.user!.institutionId, req.tenantScope);
    list(res, result);
  });

  findById = asyncHandler(async (req: Request, res: Response) => {
    const item = await collateralService.findById(req.params.id);
    ok(res, item);
  });

  create = asyncHandler(async (req: Request, res: Response) => {
    const item = await collateralService.create(req.body, req.user!.userId);
    created(res, item, 'Collateral created successfully');
  });

  update = asyncHandler(async (req: Request, res: Response) => {
    const item = await collateralService.update(req.params.id, req.body);
    ok(res, item, 'Collateral updated successfully');
  });

  delete = asyncHandler(async (req: Request, res: Response) => {
    await collateralService.delete(req.params.id);
    res.status(204).send();
  });
}

export const collateralController = new CollateralController();
