import type { Request, Response } from 'express';

import { investmentCreateSchema } from '@nafi/validators';

import { ApiError } from '@/utils/ApiError';
import { created, list as listRes, ok } from '@/utils/apiResponse';

import * as service from './investments.service';

export async function mine(req: Request, res: Response): Promise<void> {
  if (!req.user) throw ApiError.unauthorized();
  const result = await service.mine(req.user.sub, {
    page: req.query.page ? Number(req.query.page) : undefined,
    pageSize: req.query.pageSize ? Number(req.query.pageSize) : undefined,
  });
  listRes(res, result.items, result.page, result.pageSize, result.total);
}

export async function list(req: Request, res: Response): Promise<void> {
  const result = await service.list({
    page: req.query.page ? Number(req.query.page) : undefined,
    pageSize: req.query.pageSize ? Number(req.query.pageSize) : undefined,
  });
  listRes(res, result.items, result.page, result.pageSize, result.total);
}

export async function detail(req: Request, res: Response): Promise<void> {
  ok(res, await service.detail(req.params.id!));
}

export async function create(req: Request, res: Response): Promise<void> {
  if (!req.user) throw ApiError.unauthorized();
  const input = investmentCreateSchema.parse(req.body);
  const data = await service.create(input, req.user.sub);
  created(res, data);
}
