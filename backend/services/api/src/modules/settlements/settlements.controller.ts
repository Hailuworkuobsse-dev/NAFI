import type { Request, Response } from 'express';

import { ApiError } from '@/utils/ApiError';
import { list as listRes, ok } from '@/utils/apiResponse';

import * as service from './settlements.service';

export async function list(req: Request, res: Response): Promise<void> {
  const result = await service.list({
    contractId: req.query.contractId as string | undefined,
    status: req.query.status as string | undefined,
    page: req.query.page ? Number(req.query.page) : undefined,
    pageSize: req.query.pageSize ? Number(req.query.pageSize) : undefined,
  });
  listRes(res, result.items, result.page, result.pageSize, result.total);
}

export async function detail(req: Request, res: Response): Promise<void> {
  ok(res, await service.detail(req.params.id!));
}

export async function simulate(req: Request, res: Response): Promise<void> {
  ok(res, await service.simulate(req.body));
}

export async function execute(req: Request, res: Response): Promise<void> {
  const token = (req.body as { approvalToken?: string }).approvalToken;
  if (!token) throw ApiError.badRequest('Approval token required');
  ok(res, await service.execute(req.params.id!, token));
}

export async function reverse(req: Request, res: Response): Promise<void> {
  ok(res, await service.reverse(req.params.id!, req.body.reason ?? 'Unspecified'));
}
