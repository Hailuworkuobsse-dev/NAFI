import { Request, Response } from 'express';
import { escrowsService } from './escrows.service';
import { asyncHandler } from '../../utils/asyncHandler';
import { ok, created, list } from '../../utils/apiResponse';

export class EscrowsController {
  findAll = asyncHandler(async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const result = await escrowsService.findAll(req.user!.userId, req.user!.institutionId, req.tenantScope);
    list(res, result);
  });

  findById = asyncHandler(async (req: Request, res: Response) => {
    const item = await escrowsService.findById(req.params.id);
    ok(res, item);
  });

  create = asyncHandler(async (req: Request, res: Response) => {
    const item = await escrowsService.create(req.body, req.user!.userId);
    created(res, item, 'Escrows created successfully');
  });

  update = asyncHandler(async (req: Request, res: Response) => {
    const item = await escrowsService.update(req.params.id, req.body);
    ok(res, item, 'Escrows updated successfully');
  });

  delete = asyncHandler(async (req: Request, res: Response) => {
    await escrowsService.delete(req.params.id);
    res.status(204).send();
  });
}

export const escrowsController = new EscrowsController();
