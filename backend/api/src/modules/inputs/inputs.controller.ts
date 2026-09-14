import type { Request, Response } from 'express';

import { ApiError } from '@/utils/ApiError';
import { created, list as listRes, ok } from '@/utils/apiResponse';

import * as service from './inputs.service';

export async function list(req: Request, res: Response): Promise<void> {
  const result = await service.list({
    contractId: req.query.contractId as string | undefined,
    supplierId: req.query.supplierId as string | undefined,
    isDelivered:
      req.query.isDelivered !== undefined ? req.query.isDelivered === 'true' : undefined,
    isDisbursed:
      req.query.isDisbursed !== undefined ? req.query.isDisbursed === 'true' : undefined,
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
  const data = await service.create(req.body, req.user.sub);
  created(res, data);
}

export async function verify(req: Request, res: Response): Promise<void> {
  ok(res, await service.verifyDelivery(req.params.id!, req.body));
}
