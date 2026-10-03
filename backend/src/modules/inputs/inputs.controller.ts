import { Request, Response } from 'express';
import { inputsService } from './inputs.service';
import { asyncHandler } from '../../utils/asyncHandler';
import { ok, created, list } from '../../utils/apiResponse';

export class InputsController {
  findAll = asyncHandler(async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const result = await inputsService.findAll(req.user!.userId, req.user!.institutionId, req.tenantScope);
    list(res, result);
  });

  findById = asyncHandler(async (req: Request, res: Response) => {
    const item = await inputsService.findById(req.params.id);
    ok(res, item);
  });

  create = asyncHandler(async (req: Request, res: Response) => {
    const item = await inputsService.create(req.body, req.user!.userId);
    created(res, item, 'Inputs created successfully');
  });

  update = asyncHandler(async (req: Request, res: Response) => {
    const item = await inputsService.update(req.params.id, req.body);
    ok(res, item, 'Inputs updated successfully');
  });

  delete = asyncHandler(async (req: Request, res: Response) => {
    await inputsService.delete(req.params.id);
    res.status(204).send();
  });
}

export const inputsController = new InputsController();
