import { prisma } from '../../config/prisma';
import { ApiError } from '../../utils/ApiError';
import { TenantScope } from '../../middleware/tenantScope';

export class SettlementsService {
  async findAll(userId: string, institutionId: string | null, scope: TenantScope, filter: any = {}, page = 1, limit = 20) {
    const where: Record<string, unknown> = {};
    if (scope === 'OWN') where.contractId = userId;
    if (filter.status) where.status = filter.status;
    const [data, total] = await Promise.all([
      prisma.settlement.findMany({ where, skip: (page - 1) * limit, take: limit, orderBy: { createdAt: 'desc' } }),
      prisma.settlement.count({ where }),
    ]);
    return { data, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }
  async findById(id: string) {
    const item = await prisma.settlement.findUnique({ where: { id } });
    if (!item) throw ApiError.notFound('Settlement not found');
    return item;
  }
  async create(data: any, userId: string) {
    return prisma.settlement.create({ data: { ...data, processedBy: userId } });
  }
  async update(id: string, data: any) {
    try { return await prisma.settlement.update({ where: { id }, data }); }
    catch (e) { if ((e as any).code === 'P2025') throw ApiError.notFound('Settlement not found'); throw e; }
  }
}
export const settlementsService = new SettlementsService();
