import { Request, Response } from 'express';
import { usersService } from './users.service';
import { asyncHandler } from '../../utils/asyncHandler';
import { ok, created, list } from '../../utils/apiResponse';

export class UsersController {
  findAll = asyncHandler(async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const items = await usersService.findAll(req.user!.userId, req.user!.institutionId, req.tenantScope);
    ok(res, items);
  });

  findById = asyncHandler(async (req: Request, res: Response) => {
    const item = await usersService.findById(req.params.id);
    ok(res, item);
  });

  create = asyncHandler(async (req: Request, res: Response) => {
    const item = await usersService.create(req.body, req.user!.userId);
    created(res, item, 'Users created successfully');
  });

  update = asyncHandler(async (req: Request, res: Response) => {
    const item = await usersService.update(req.params.id, req.body);
    ok(res, item, 'Users updated successfully');
  });

  delete = asyncHandler(async (req: Request, res: Response) => {
    await usersService.delete(req.params.id);
    res.status(204).send();
  });
}

export const usersController = new UsersController();
