import type { Request, Response } from 'express';

import { ok } from '@/utils/apiResponse';

import * as service from './opportunities.service';

export async function list(_req: Request, res: Response): Promise<void> {
  ok(res, await service.list());
}

export async function detail(req: Request, res: Response): Promise<void> {
  ok(res, await service.detail(req.params.id!));
}
