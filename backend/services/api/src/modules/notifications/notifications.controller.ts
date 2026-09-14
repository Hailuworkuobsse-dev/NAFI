import type { Request, Response } from 'express';

import { env } from '@/config/env';
import { ApiError } from '@/utils/ApiError';
import { noContent, ok } from '@/utils/apiResponse';

import * as service from './notifications.service';

export async function list(req: Request, res: Response): Promise<void> {
  if (!req.user) throw ApiError.unauthorized();
  ok(res, await service.list(req.user.sub));
}

export async function unreadCount(req: Request, res: Response): Promise<void> {
  if (!req.user) throw ApiError.unauthorized();
  ok(res, await service.unreadCount(req.user.sub));
}

export async function markRead(req: Request, res: Response): Promise<void> {
  if (!req.user) throw ApiError.unauthorized();
  await service.markRead(req.params.id!, req.user.sub);
  noContent(res);
}

export async function markAllRead(req: Request, res: Response): Promise<void> {
  if (!req.user) throw ApiError.unauthorized();
  await service.markAllRead(req.user.sub);
  noContent(res);
}

export function vapidPublicKey(_req: Request, res: Response): void {
  ok(res, { publicKey: env.VAPID_PUBLIC_KEY ?? '' });
}

export async function pushSubscribe(req: Request, res: Response): Promise<void> {
  if (!req.user) throw ApiError.unauthorized();
  await service.savePushSubscription(req.user.sub, req.body);
  ok(res, { subscribed: true });
}

export async function pushUnsubscribe(req: Request, res: Response): Promise<void> {
  await service.removePushSubscription(req.body.endpoint);
  ok(res, { unsubscribed: true });
}
