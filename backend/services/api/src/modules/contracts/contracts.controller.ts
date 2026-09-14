import type { Request, Response } from 'express';

import { contractCreateSchema } from '@nafi/validators';

import { ApiError } from '@/utils/ApiError';
import { created, list as listRes, ok } from '@/utils/apiResponse';

import * as service from './contracts.service';

export async function list(req: Request, res: Response): Promise<void> {
  const result = await service.list({
    status: req.query.status as string | undefined,
    regionCode: req.query.regionCode as string | undefined,
    crop: req.query.crop as string | undefined,
    farmerId: req.query.farmerId as string | undefined,
    page: req.query.page ? Number(req.query.page) : undefined,
    pageSize: req.query.pageSize ? Number(req.query.pageSize) : undefined,
  });
  listRes(res, result.items, result.page, result.pageSize, result.total);
}

export async function detail(req: Request, res: Response): Promise<void> {
  const data = await service.detail(req.params.id!);
  ok(res, data);
}

export async function create(req: Request, res: Response): Promise<void> {
  const input = contractCreateSchema.parse(req.body);
  if (!req.user) throw ApiError.unauthorized();
  const data = await service.create(
    {
      ...input,
      regionCode: input.regionCode,
      maturityDate: input.maturityDate,
    },
    req.user.sub,
  );
  created(res, data);
}

export async function update(req: Request, res: Response): Promise<void> {
  const data = await service.update(req.params.id!, req.body);
  ok(res, data);
}

export async function sign(req: Request, res: Response): Promise<void> {
  if (!req.user) throw ApiError.unauthorized();
  const data = await service.sign(req.params.id!, req.body, req.user.sub);
  ok(res, data);
}

export async function freeze(req: Request, res: Response): Promise<void> {
  const data = await service.freeze(req.params.id!, req.body.reason ?? 'Unspecified');
  ok(res, data);
}

export async function timeline(req: Request, res: Response): Promise<void> {
  const data = await service.timeline(req.params.id!);
  ok(res, data);
}

export async function signatures(req: Request, res: Response): Promise<void> {
  const data = await service.signatures(req.params.id!);
  ok(res, data);
}
