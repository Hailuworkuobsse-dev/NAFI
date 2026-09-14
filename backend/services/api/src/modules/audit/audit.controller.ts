import type { Request, Response } from 'express';

import { list as listRes } from '@/utils/apiResponse';

import * as service from './audit.service';

export async function list(req: Request, res: Response): Promise<void> {
  const result = await service.list({
    actorId: req.query.actorId as string | undefined,
    resource: req.query.resource as string | undefined,
    resourceId: req.query.resourceId as string | undefined,
    from: req.query.from as string | undefined,
    to: req.query.to as string | undefined,
    page: req.query.page ? Number(req.query.page) : undefined,
    pageSize: req.query.pageSize ? Number(req.query.pageSize) : undefined,
  });
  listRes(res, result.items, result.page, result.pageSize, result.total);
}
