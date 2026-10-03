import { Request, Response } from 'express';
import { publicService } from './public.service';
import { asyncHandler } from '../../utils/asyncHandler';
import { ok, list } from '../../utils/apiResponse';

export class PublicController {
  stats = asyncHandler(async (_req: Request, res: Response) => {
    const data = await publicService.getStats();
    ok(res, data);
  });

  opportunities = asyncHandler(async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || parseInt(req.query.pageSize as string) || 10;
    const result = await publicService.getOpportunities(page, limit);
    list(res, result);
  });
}

export const publicController = new PublicController();
