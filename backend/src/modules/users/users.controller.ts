import { Request, Response } from 'express';
import { usersService, UserFilter } from './users.service';
import { asyncHandler } from '../../utils/asyncHandler';
import { ok, created, list } from '../../utils/apiResponse';

export class UsersController {
  findAll = asyncHandler(async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const filter: UserFilter = {
      search: req.query.search as string,
      role: req.query.role as string,
      institutionId: req.query.institutionId as string,
    };
    const result = await usersService.findAll(
      req.user!.userId,
      req.user!.institutionId,
      req.tenantScope,
      filter,
      page,
      limit
    );
    list(res, result);
  });

  findById = asyncHandler(async (req: Request, res: Response) => {
    const user = await usersService.findById(req.params.id);
    ok(res, user);
  });

  create = asyncHandler(async (req: Request, res: Response) => {
    const user = await usersService.create(req.body, req.user!.userId);
    created(res, user, 'User created successfully');
  });

  update = asyncHandler(async (req: Request, res: Response) => {
    const user = await usersService.update(req.params.id, req.body, req.user!.userId);
    ok(res, user, 'User updated successfully');
  });

  delete = asyncHandler(async (req: Request, res: Response) => {
    await usersService.delete(req.params.id);
    res.status(204).send();
  });
}

export const usersController = new UsersController();
