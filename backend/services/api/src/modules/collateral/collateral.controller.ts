import type { Request, Response } from 'express';

import { ApiError } from '@/utils/ApiError';
import { created, list as listRes, ok } from '@/utils/apiResponse';

import * as service from './collateral.service';

export async function list(req: Request, res: Response): Promise<void> {
  const result = await service.list({
    type: req.query.type as string | undefined,
    lienStatus: req.query.lienStatus as string | undefined,
    ownerId: req.query.ownerId as string | undefined,
    lienHolderId: req.query.lienHolderId as string | undefined,
    page: req.query.page ? Number(req.query.page) : undefined,
    pageSize: req.query.pageSize ? Number(req.query.pageSize) : undefined,
  });
  listRes(res, result.items, result.page, result.pageSize, result.total);
}

export async function detail(req: Request, res: Response): Promise<void> {
  ok(res, await service.detail(req.params.id!));
}

export async function register(req: Request, res: Response): Promise<void> {
  if (!req.user) throw ApiError.unauthorized();
  const data = await service.register(req.body, req.user.sub);
  created(res, data);
}

export async function lien(req: Request, res: Response): Promise<void> {
  const data = await service.registerLien(req.params.id!, req.body.lienHolderId);
  ok(res, data);
}

export async function release(req: Request, res: Response): Promise<void> {
  ok(res, await service.releaseLien(req.params.id!));
}

export async function liquidate(req: Request, res: Response): Promise<void> {
  ok(res, await service.liquidate(req.params.id!, req.body.reason ?? 'Unspecified'));
}
