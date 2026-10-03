import { prisma } from '../../config/prisma';
import { ApiError } from '../../utils/ApiError';
import { TenantScope } from '../../middleware/tenantScope';

export class DisputesService {
  async findAll(userId: string, institutionId: string | null, scope: TenantScope, filter: any = {}, page = 1, limit = 20) {
    const where: Record<string, unknown> = {};
    if (scope === TenantScope.OWN) where.initiatedBy = userId;
    if (scope === TenantScope.INSTITUTION) {
      where.contract = institutionId ? { institutionId } : { id: 'impossible-id' };
    }
    if (filter.status) where.status = filter.status;
    const [data, total] = await Promise.all([
      prisma.dispute.findMany({ where, skip: (page - 1) * limit, take: limit, orderBy: { createdAt: 'desc' } }),
      prisma.dispute.count({ where }),
    ]);
    return { data, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }
  async findById(id: string) {
    const item = await prisma.dispute.findUnique({ where: { id } });
    if (!item) throw ApiError.notFound('Dispute not found');
    return item;
  }
  async create(data: any, userId: string) {
    return prisma.dispute.create({ data: { ...data, initiatedBy: userId } });
  }
  async update(id: string, data: any) {
    try { return await prisma.dispute.update({ where: { id }, data }); }
    catch (e) { if ((e as any).code === 'P2025') throw ApiError.notFound('Dispute not found'); throw e; }
  }
  async resolve(id: string, resolution: string, resolvedBy: string) {
    try {
      return await prisma.dispute.update({
        where: { id },
        data: { status: 'RESOLVED', resolution, resolvedBy, resolvedAt: new Date() },
      });
    } catch (e) {
      if ((e as any).code === 'P2025') throw ApiError.notFound('Dispute not found');
      throw e;
    }
  }
}
export const disputesService = new DisputesService();
