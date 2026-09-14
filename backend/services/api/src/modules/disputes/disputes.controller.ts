import type { Request, Response } from 'express';

import { ApiError } from '@/utils/ApiError';
import { created, list as listRes, ok } from '@/utils/apiResponse';

import * as service from './disputes.service';

export async function list(req: Request, res: Response): Promise<void> {
  const result = await service.list({
    contractId: req.query.contractId as string | undefined,
    status: req.query.status as string | undefined,
    category: req.query.category as string | undefined,
    page: req.query.page ? Number(req.query.page) : undefined,
    pageSize: req.query.pageSize ? Number(req.query.pageSize) : undefined,
  });
  listRes(res, result.items, result.page, result.pageSize, result.total);
}

export async function detail(req: Request, res: Response): Promise<void> {
  ok(res, await service.detail(req.params.id!));
}

export async function file(req: Request, res: Response): Promise<void> {
  if (!req.user) throw ApiError.unauthorized();
  const data = await service.file(req.body, req.user.sub);
  created(res, data);
}

export async function schedule(req: Request, res: Response): Promise<void> {
  const data = await service.scheduleHearing(
    req.params.id!,
    req.body.hearingAt,
    req.body.arbitratorId,
  );
  ok(res, data);
}

export async function decide(req: Request, res: Response): Promise<void> {
  const data = await service.decide(req.params.id!, req.body.decision, req.body.outcome);
  ok(res, data);
}
