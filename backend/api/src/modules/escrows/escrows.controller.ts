import type { Request, Response } from 'express';

import { ApiError } from '@/utils/ApiError';
import { list as listRes, ok } from '@/utils/apiResponse';

import * as service from './escrows.service';

export async function list(req: Request, res: Response): Promise<void> {
  const result = await service.list({
    status: req.query.status as string | undefined,
    bankId: req.query.bankId as string | undefined,
    contractId: req.query.contractId as string | undefined,
    page: req.query.page ? Number(req.query.page) : undefined,
    pageSize: req.query.pageSize ? Number(req.query.pageSize) : undefined,
  });
  listRes(res, result.items, result.page, result.pageSize, result.total);
}

export async function detail(req: Request, res: Response): Promise<void> {
  ok(res, await service.detail(req.params.id!));
}

export async function ledger(req: Request, res: Response): Promise<void> {
  ok(res, await service.ledger(req.params.id!));
}

export async function release(req: Request, res: Response): Promise<void> {
  if (!req.user) throw ApiError.unauthorized();
  ok(res, await service.release(req.params.id!, req.body, req.user.sub));
}

export async function freeze(req: Request, res: Response): Promise<void> {
  if (!req.user) throw ApiError.unauthorized();
  ok(res, await service.freeze(req.params.id!, req.body.reason ?? 'Unspecified', req.user.sub));
}

export async function close(req: Request, res: Response): Promise<void> {
  ok(res, await service.close(req.params.id!));
}
