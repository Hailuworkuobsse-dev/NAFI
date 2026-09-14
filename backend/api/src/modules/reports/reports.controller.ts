import type { Request, Response } from 'express';

import { ApiError } from '@/utils/ApiError';
import { created, list as listRes, ok } from '@/utils/apiResponse';

import * as service from './reports.service';

export async function list(req: Request, res: Response): Promise<void> {
  const result = await service.list({
    type: req.query.type as string | undefined,
    page: req.query.page ? Number(req.query.page) : undefined,
    pageSize: req.query.pageSize ? Number(req.query.pageSize) : undefined,
  });
  listRes(res, result.items, result.page, result.pageSize, result.total);
}

export async function detail(req: Request, res: Response): Promise<void> {
  ok(res, await service.detail(req.params.id!));
}

export async function generate(req: Request, res: Response): Promise<void> {
  if (!req.user) throw ApiError.unauthorized();
  created(res, await service.generate(req.body, req.user.sub));
}
