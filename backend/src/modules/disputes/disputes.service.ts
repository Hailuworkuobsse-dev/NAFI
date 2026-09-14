import { prisma } from '../../config/prisma';
import { ApiError } from '../../utils/ApiError';
import { TenantScope } from '../../middleware/tenantScope';

export class DisputesService {
  async findAll(userId: string, institutionId: string | null, scope: TenantScope, filter: any = {}, page = 1, limit = 20) {
    const where: Record<string, unknown> = {};
    if (scope === 'OWN') where.raisedById = userId;
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
    return prisma.dispute.create({ data: { ...data, raisedById: userId } });
  }
  async update(id: string, data: any) {
    try { return await prisma.dispute.update({ where: { id }, data }); }
    catch (e) { if ((e as any).code === 'P2025') throw ApiError.notFound('Dispute not found'); throw e; }
  }
  async resolve(id: string, resolution: string, resolvedBy: string) {
    return prisma.dispute.update({
      where: { id },
      data: { status: 'RESOLVED', resolution, resolvedById: resolvedBy, resolvedAt: new Date() },
    });
  }
}
export const disputesService = new DisputesService();
