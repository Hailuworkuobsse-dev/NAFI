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

export class InvestmentsController {
  findAll = asyncHandler(async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const pageSize =
      parseInt(req.query.pageSize as string) ||
      parseInt(req.query.limit as string) ||
      20;
    const result = await investmentsService.findAll(
      req.user!.userId,
      req.user!.institutionId ?? null,
      req.tenantScope!,
      {
        status: req.query.status as string | undefined,
        contractId: req.query.contractId as string | undefined,
      },
      page,
      pageSize,
    );
    list(res, result);
  });

  findById = asyncHandler(async (req: Request, res: Response) => {
    const item = await investmentsService.findById(getInvestmentId(req));
    ok(res, item);
  });

  create = asyncHandler(async (req: Request, res: Response) => {
    const item = await investmentsService.create(req.body, req.user!.userId);
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
    res.status(204).send();
  });
}

export const investmentsController = new InvestmentsController();
