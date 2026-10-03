import { Request, Response } from 'express';
import { notificationsService } from './notifications.service';
import { asyncHandler } from '../../utils/asyncHandler';
import { ok, created, list, idParam } from '../../utils/apiResponse';

export class NotificationsController {
  findAll = asyncHandler(async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || parseInt(req.query.pageSize as string) || 20;
    const result = await notificationsService.findAll(req.user!.userId, page, limit);
    list(res, result);
  });

  unreadCount = asyncHandler(async (req: Request, res: Response) => {
    const count = await notificationsService.unreadCount(req.user!.userId);
    ok(res, { count });
  });

  findById = asyncHandler(async (req: Request, res: Response) => {
    const item = await notificationsService.findById(idParam(req.params.id), req.user!.userId);
    ok(res, item);
  });

  markAsRead = asyncHandler(async (req: Request, res: Response) => {
    const result = await notificationsService.markAsRead(idParam(req.params.id), req.user!.userId);
    ok(res, result, 'Notification marked as read');
  });

  markAllAsRead = asyncHandler(async (req: Request, res: Response) => {
    const result = await notificationsService.markAllAsRead(req.user!.userId);
    ok(res, result, 'All notifications marked as read');
  });

  create = asyncHandler(async (req: Request, res: Response) => {
    const item = await notificationsService.create(req.body, req.user!.userId);
    created(res, item, 'Notification created successfully');
  });
}

export const notificationsController = new NotificationsController();
