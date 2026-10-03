import { Request, Response } from 'express';
import { contractsService } from './contracts.service';
import { asyncHandler } from '../../utils/asyncHandler';
import { ok, created, list } from '../../utils/apiResponse';
import { contractCreateSchema, contractUpdateSchema } from '../../validators/contract';

export class ContractsController {
  findAll = asyncHandler(async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = parseInt(req.query.pageSize as string) || parseInt(req.query.limit as string) || 20;
    const filter = {
      status: req.query.status as string | undefined,
      borrowerId: req.query.borrowerId as string | undefined,
      institutionId: req.query.institutionId as string | undefined,
      q: req.query.q as string | undefined,
    };
    const result = await contractsService.findAll(
      req.user!.userId,
      req.user!.institutionId,
      req.tenantScope!,
      filter,
      page,
      pageSize
    );
    list(res, result);
  });

  findById = asyncHandler(async (req: Request, res: Response) => {
    const contract = await contractsService.findById(
      req.params.id,
      req.user!.userId,
      req.user!.institutionId
    );
    ok(res, contract);
  });

  create = asyncHandler(async (req: Request, res: Response) => {
    const data = contractCreateSchema.parse(req.body);
    const contract = await contractsService.create(data, req.user!.userId);
    created(res, contract, 'Contract created successfully');
  });

  update = asyncHandler(async (req: Request, res: Response) => {
    const data = contractUpdateSchema.parse(req.body);
    const contract = await contractsService.update(req.params.id, data);
    ok(res, contract, 'Contract updated successfully');
  });

  approve = asyncHandler(async (req: Request, res: Response) => {
    const contract = await contractsService.approve(req.params.id);
    ok(res, contract, 'Contract approved');
  });

  reject = asyncHandler(async (req: Request, res: Response) => {
    const { reason } = req.body;
    const contract = await contractsService.reject(req.params.id, reason);
    ok(res, contract, 'Contract rejected');
  });

  delete = asyncHandler(async (req: Request, res: Response) => {
    await contractsService.delete(req.params.id);
    res.status(204).send();
  });
}

export const contractsController = new ContractsController();
