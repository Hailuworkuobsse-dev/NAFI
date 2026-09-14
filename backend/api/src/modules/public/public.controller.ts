import type { Request, Response } from 'express';

import { ok } from '@/utils/apiResponse';

import * as service from './public.service';

export async function stats(_req: Request, res: Response): Promise<void> {
  ok(res, await service.stats());
}
