import { Request, Response } from 'express';
import { auditService } from './audit.service';
import { asyncHandler } from '../../utils/asyncHandler';
import { ok, created, list } from '../../utils/apiResponse';

export class AuditController {
  findAll = asyncHandler(async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const result = await auditService.findAll(req.user!.userId, req.user!.institutionId, req.tenantScope);
    list(res, result);
  });

  findById = asyncHandler(async (req: Request, res: Response) => {
    const item = await auditService.findById(req.params.id);
    ok(res, item);
  });

  create = asyncHandler(async (req: Request, res: Response) => {
    const item = await auditService.create(req.body, req.user!.userId);
    created(res, item, 'Audit created successfully');
  });

  update = asyncHandler(async (req: Request, res: Response) => {
    const item = await auditService.update(req.params.id, req.body);
    ok(res, item, 'Audit updated successfully');
  });

  delete = asyncHandler(async (req: Request, res: Response) => {
    await auditService.delete(req.params.id);
    res.status(204).send();
  });
}

export const auditController = new AuditController();
