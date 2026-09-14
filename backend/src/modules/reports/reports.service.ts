import { prisma } from '../../config/prisma';
import { ApiError } from '../../utils/ApiError';
import { TenantScope } from '../../middleware/tenantScope';

export class ReportsService {
  async findAll(userId: string, institutionId: string | null, scope: TenantScope, filter: any = {}, page = 1, limit = 20) {
    const where: Record<string, unknown> = {};
    if (scope === 'OWN') where.generatedBy = userId;
    if (filter.type) where.type = filter.type;
    const [data, total] = await Promise.all([
      prisma.report.findMany({ where, skip: (page - 1) * limit, take: limit, orderBy: { createdAt: 'desc' } }),
      prisma.report.count({ where }),
    ]);
    return { data, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }
  async findById(id: string) {
    const item = await prisma.report.findUnique({ where: { id } });
    if (!item) throw ApiError.notFound('Report not found');
    return item;
  }
  async create(data: any, userId: string) {
    return prisma.report.create({ data: { ...data, generatedBy: userId } });
  }
}
export const reportsService = new ReportsService();
