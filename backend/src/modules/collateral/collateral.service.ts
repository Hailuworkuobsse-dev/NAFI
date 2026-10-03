import { prisma } from '../../config/prisma';
import { ApiError } from '../../utils/ApiError';
import { TenantScope } from '../../middleware/tenantScope';

export class CollateralService {
  async findAll(userId: string, institutionId: string | null, scope: TenantScope, filter: any = {}, page = 1, limit = 20) {
    const where: Record<string, unknown> = {};
    if (scope === TenantScope.OWN || scope === TenantScope.INSTITUTION) {
      where.contract = scope === TenantScope.OWN
        ? { borrowerId: userId }
        : institutionId ? { institutionId } : { id: 'impossible-id' };
    }
    if (filter.type) where.type = filter.type;
    const [data, total] = await Promise.all([
      prisma.collateral.findMany({ where, skip: (page - 1) * limit, take: limit, orderBy: { createdAt: 'desc' } }),
      prisma.collateral.count({ where }),
    ]);
    return { data, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }
  async findById(id: string) {
    const item = await prisma.collateral.findUnique({ where: { id } });
    if (!item) throw ApiError.notFound('Collateral not found');
    return item;
  }
  async create(data: any, _userId: string) {
    return prisma.collateral.create({ data });
  }
  async update(id: string, data: any) {
    try { return await prisma.collateral.update({ where: { id }, data }); }
    catch (e) { if ((e as any).code === 'P2025') throw ApiError.notFound('Collateral not found'); throw e; }
  }
  async delete(id: string) {
    try { await prisma.collateral.delete({ where: { id } }); }
    catch (e) { if ((e as any).code === 'P2025') throw ApiError.notFound('Collateral not found'); throw e; }
  }
}
export const collateralService = new CollateralService();
