import type { Request, Response } from 'express';

import { created, list as listRes, ok } from '@/utils/apiResponse';

import * as service from './users.service';

export async function list(req: Request, res: Response): Promise<void> {
  const result = await service.list({
    role: req.query.role as string | undefined,
    institutionId: req.query.institutionId as string | undefined,
    isActive:
      req.query.isActive !== undefined ? req.query.isActive === 'true' : undefined,
    page: req.query.page ? Number(req.query.page) : undefined,
    pageSize: req.query.pageSize ? Number(req.query.pageSize) : undefined,
  });
  listRes(res, result.items, result.page, result.pageSize, result.total);
}

export async function detail(req: Request, res: Response): Promise<void> {
  ok(res, await service.detail(req.params.id!));
}

export async function invite(req: Request, res: Response): Promise<void> {
  created(res, await service.invite(req.body));
}

export async function deactivate(req: Request, res: Response): Promise<void> {
  ok(res, await service.deactivate(req.params.id!));
}

export async function reactivate(req: Request, res: Response): Promise<void> {
  ok(res, await service.reactivate(req.params.id!));
}
