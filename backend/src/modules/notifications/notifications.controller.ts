import { Request, Response } from 'express';
import { notificationsService } from './notifications.service';
import { asyncHandler } from '../../utils/asyncHandler';
import { ok, created, list } from '../../utils/apiResponse';

export class NotificationsController {
  findAll = asyncHandler(async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const result = await notificationsService.findAll(req.user!.userId, req.user!.institutionId, req.tenantScope);
    list(res, result);
  });

  findById = asyncHandler(async (req: Request, res: Response) => {
    const item = await notificationsService.findById(req.params.id);
    ok(res, item);
  });

  create = asyncHandler(async (req: Request, res: Response) => {
    const item = await notificationsService.create(req.body, req.user!.userId);
    created(res, item, 'Notifications created successfully');
  });

  update = asyncHandler(async (req: Request, res: Response) => {
    const item = await notificationsService.update(req.params.id, req.body);
    ok(res, item, 'Notifications updated successfully');
  });

  delete = asyncHandler(async (req: Request, res: Response) => {
    await notificationsService.delete(req.params.id);
    res.status(204).send();
  });
}

export const notificationsController = new NotificationsController();
