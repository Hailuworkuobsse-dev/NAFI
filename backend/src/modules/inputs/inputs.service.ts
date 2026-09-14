import { prisma } from '../../config/prisma';
import { ApiError } from '../../utils/ApiError';
import { TenantScope } from '../../middleware/tenantScope';

export class InputsService {
  async findAll(userId: string, institutionId: string | null, scope: TenantScope, filter: any = {}, page = 1, limit = 20) {
    const where: Record<string, unknown> = {};
    if (scope === 'OWN') where.providerId = userId;
    const [data, total] = await Promise.all([
      prisma.input.findMany({ where, skip: (page - 1) * limit, take: limit, orderBy: { createdAt: 'desc' } }),
      prisma.input.count({ where }),
    ]);
    return { data, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }
  async findById(id: string) {
    const item = await prisma.input.findUnique({ where: { id } });
    if (!item) throw ApiError.notFound('Input not found');
    return item;
  }
  async create(data: any, userId: string) {
    return prisma.input.create({ data: { ...data, providerId: userId } });
  }
  async update(id: string, data: any) {
    try { return await prisma.input.update({ where: { id }, data }); }
    catch (e) { if ((e as any).code === 'P2025') throw ApiError.notFound('Input not found'); throw e; }
  }
  async delete(id: string) {
    try { await prisma.input.delete({ where: { id } }); }
    catch (e) { if ((e as any).code === 'P2025') throw ApiError.notFound('Input not found'); throw e; }
  }
}
export const inputsService = new InputsService();
