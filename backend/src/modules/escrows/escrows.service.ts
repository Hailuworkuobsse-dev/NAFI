import { prisma } from '../../config/prisma';
import { ApiError } from '../../utils/ApiError';
import { TenantScope } from '../../middleware/tenantScope';

export class EscrowsService {
  async findAll(userId: string, institutionId: string | null, scope: TenantScope, filter: any = {}, page = 1, limit = 20) {
    const where: Record<string, unknown> = {};
    if (scope === 'OWN') where.contractId = userId;
    if (filter.status) where.status = filter.status;
    const [data, total] = await Promise.all([
      prisma.escrow.findMany({ where, skip: (page - 1) * limit, take: limit, orderBy: { createdAt: 'desc' } }),
      prisma.escrow.count({ where }),
    ]);
    return { data, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }
  async findById(id: string) {
    const item = await prisma.escrow.findUnique({ where: { id } });
    if (!item) throw ApiError.notFound('Escrow not found');
    return item;
  }
  async create(data: any, userId: string) {
    return prisma.escrow.create({ data: { ...data, contractId: data.contractId } });
  }
  async update(id: string, data: any) {
    try { return await prisma.escrow.update({ where: { id }, data }); }
    catch (e) { if ((e as any).code === 'P2025') throw ApiError.notFound('Escrow not found'); throw e; }
  }
  async delete(id: string) {
    try { await prisma.escrow.delete({ where: { id } }); }
    catch (e) { if ((e as any).code === 'P2025') throw ApiError.notFound('Escrow not found'); throw e; }
  }
}
export const escrowsService = new EscrowsService();
