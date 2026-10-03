import { Request, Response } from 'express';
import { auditService } from './audit.service';
import { asyncHandler } from '../../utils/asyncHandler';
import { ok, list, idParam } from '../../utils/apiResponse';

export class AuditController {
  findAll = asyncHandler(async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || parseInt(req.query.pageSize as string) || 20;
    const result = await auditService.findAll(
      req.user!.userId,
      req.user!.institutionId ?? null,
      req.tenantScope!,
      {
        action: req.query.action as string | undefined,
        entity: req.query.entity as string | undefined,
        userId: req.query.userId as string | undefined,
      },
      page,
      limit
    );
    list(res, result);
  });

  verifyChain = asyncHandler(async (_req: Request, res: Response) => {
    const result = await auditService.verifyChain();
    ok(res, result);
  });

  findById = asyncHandler(async (req: Request, res: Response) => {
    const item = await auditService.findById(idParam(req.params.id));
    ok(res, item);
  });
}

export const auditController = new AuditController();
