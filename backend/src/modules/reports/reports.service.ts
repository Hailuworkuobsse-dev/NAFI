import { prisma } from '../../config/prisma';
import { ApiError } from '../../utils/ApiError';
import { TenantScope } from '../../middleware/tenantScope';

/**
 * There is no dedicated Report table in the schema. Reports are computed
 * aggregates over contracts/investments/settlements for a given scope.
 */
export class ReportsService {
  async findAll(userId: string, institutionId: string | null, scope: TenantScope, _filter: any = {}, page = 1, limit = 20) {
    const contractWhere: Record<string, unknown> = {};
    if (scope === TenantScope.OWN) contractWhere.borrowerId = userId;
    if (scope === TenantScope.INSTITUTION) {
      contractWhere.institutionId = institutionId ?? 'impossible-id';
    }

    const [contracts, investments, settlements] = await Promise.all([
      prisma.contract.groupBy({ by: ['status'], where: contractWhere, _count: { _all: true }, _sum: { principalAmount: true } }),
      prisma.investment.groupBy({ by: ['status'], _count: { _all: true }, _sum: { amount: true } }),
      prisma.settlement.groupBy({ by: ['status'], _count: { _all: true }, _sum: { amount: true } }),
    ]);

    const data = [
      { report: 'contracts_by_status', rows: contracts, generatedAt: new Date() },
      { report: 'investments_by_status', rows: investments, generatedAt: new Date() },
      { report: 'settlements_by_status', rows: settlements, generatedAt: new Date() },
    ];

    return { data, pagination: { page, limit, total: data.length, totalPages: 1 } };
  }

  async findById(_id: string) {
    throw ApiError.notFound('Individual report lookup is not supported; use GET /reports');
  }

  async create(data: any, userId: string) {
    // Persist nothing; echo a generated snapshot for the requester's scope.
    const result = await this.findAll(userId, null, TenantScope.OWN, data, 1, 100);
    return { id: `RPT-${Date.now().toString(36).toUpperCase()}`, params: data, ...result };
  }
}
export const reportsService = new ReportsService();
