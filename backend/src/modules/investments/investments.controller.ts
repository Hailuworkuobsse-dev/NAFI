import { Request, Response } from 'express';
import { investmentsService } from './investments.service';
import { asyncHandler } from '../../utils/asyncHandler';
import { ok, created, list, idParam } from '../../utils/apiResponse';

export class InvestmentsController {
  findAll = asyncHandler(async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || parseInt(req.query.pageSize as string) || 20;
    const result = await investmentsService.findAll(
      req.user!.userId,
      req.user!.institutionId ?? null,
      req.tenantScope!,
      {
        status: req.query.status as string | undefined,
        contractId: req.query.contractId as string | undefined,
        investorId: req.query.investorId as string | undefined,
      },
      page,
      limit
    );
    list(res, result);
  });

  findById = asyncHandler(async (req: Request, res: Response) => {
    const item = await investmentsService.findById(idParam(req.params.id));
    ok(res, item);
  });

  create = asyncHandler(async (req: Request, res: Response) => {
    const item = await investmentsService.create(req.body, req.user!.userId);
    created(res, item, 'Investment created successfully');
  });

  update = asyncHandler(async (req: Request, res: Response) => {
    const item = await investmentsService.update(idParam(req.params.id), req.body);
    ok(res, item, 'Investment updated successfully');
  });

  delete = asyncHandler(async (req: Request, res: Response) => {
    await investmentsService.delete(idParam(req.params.id));
    res.status(204).send();
  });
}

export const investmentsController = new InvestmentsController();
