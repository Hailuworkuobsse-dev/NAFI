<<<<<<< HEAD
import { Request, Response } from "express";
import { investmentsService } from "./investments.service";
import { asyncHandler } from "../../utils/asyncHandler";
import { ok, created, list } from "../../utils/apiResponse";
import { ApiError } from "../../utils/ApiError";

function getInvestmentId(req: Request): string {
  const id = req.params.id;
  if (typeof id !== "string" || !id.trim()) {
    throw ApiError.badRequest("Investment ID is required");
  }
  return id;
}
=======
import { Request, Response } from 'express';
import { investmentsService } from './investments.service';
import { asyncHandler } from '../../utils/asyncHandler';
import { ok, created, list, idParam } from '../../utils/apiResponse';
>>>>>>> 2f234d308eeac4f3a7bf0e5ac323820d92f5467e

export class InvestmentsController {
  findAll = asyncHandler(async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
<<<<<<< HEAD
    const pageSize =
      parseInt(req.query.pageSize as string) ||
      parseInt(req.query.limit as string) ||
      20;
=======
    const limit = parseInt(req.query.limit as string) || parseInt(req.query.pageSize as string) || 20;
>>>>>>> 2f234d308eeac4f3a7bf0e5ac323820d92f5467e
    const result = await investmentsService.findAll(
      req.user!.userId,
      req.user!.institutionId ?? null,
      req.tenantScope!,
      {
        status: req.query.status as string | undefined,
        contractId: req.query.contractId as string | undefined,
<<<<<<< HEAD
      },
      page,
      pageSize,
=======
        investorId: req.query.investorId as string | undefined,
      },
      page,
      limit
>>>>>>> 2f234d308eeac4f3a7bf0e5ac323820d92f5467e
    );
    list(res, result);
  });

  findById = asyncHandler(async (req: Request, res: Response) => {
<<<<<<< HEAD
    const item = await investmentsService.findById(getInvestmentId(req));
=======
    const item = await investmentsService.findById(idParam(req.params.id));
>>>>>>> 2f234d308eeac4f3a7bf0e5ac323820d92f5467e
    ok(res, item);
  });

  create = asyncHandler(async (req: Request, res: Response) => {
    const item = await investmentsService.create(req.body, req.user!.userId);
<<<<<<< HEAD
    created(res, item, "Investments created successfully");
  });

  update = asyncHandler(async (req: Request, res: Response) => {
    const item = await investmentsService.update(
      getInvestmentId(req),
      req.body,
    );
    ok(res, item, "Investments updated successfully");
  });

  delete = asyncHandler(async (req: Request, res: Response) => {
    await investmentsService.delete(getInvestmentId(req));
=======
    created(res, item, 'Investment created successfully');
  });

  update = asyncHandler(async (req: Request, res: Response) => {
    const item = await investmentsService.update(idParam(req.params.id), req.body);
    ok(res, item, 'Investment updated successfully');
  });

  delete = asyncHandler(async (req: Request, res: Response) => {
    await investmentsService.delete(idParam(req.params.id));
>>>>>>> 2f234d308eeac4f3a7bf0e5ac323820d92f5467e
    res.status(204).send();
  });
}

export const investmentsController = new InvestmentsController();
