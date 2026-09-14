import { prisma } from '../../config/prisma';
import { ApiError } from '../../utils/ApiError';

export class OpportunitiesService {
  async findAll(filter: any = {}, page = 1, limit = 20) {
    const where: Record<string, unknown> = { status: 'ACTIVE' };
    if (filter.type) where.type = filter.type;
    const [data, total] = await Promise.all([
      prisma.opportunity.findMany({ where, skip: (page - 1) * limit, take: limit, orderBy: { createdAt: 'desc' } }),
      prisma.opportunity.count({ where }),
    ]);
    return { data, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }
  async findById(id: string) {
    const item = await prisma.opportunity.findUnique({ where: { id } });
    if (!item) throw ApiError.notFound('Opportunity not found');
    return item;
  }
}
export const opportunitiesService = new OpportunitiesService();
