import { prisma } from '../../config/prisma';
import { ApiError } from '../../utils/ApiError';
import { Prisma, OpportunityStatus } from '@prisma/client';

export class OpportunitiesService {
  async findAll(filter: any = {}, page = 1, limit = 20) {
    const where: Prisma.OpportunityWhereInput = {};
    if (filter.status) {
      where.status = filter.status as OpportunityStatus;
    } else {
      where.status = 'PUBLISHED';
    }
    const [data, total] = await Promise.all([
      prisma.opportunity.findMany({ where, skip: (page - 1) * limit, take: limit, orderBy: { createdAt: 'desc' } }),
      prisma.opportunity.count({ where }),
    ]);
    return { data, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }
  async findById(id: string) {
    const item = await prisma.opportunity.findUnique({ where: { id }, include: { institution: true } });
    if (!item) throw ApiError.notFound('Opportunity not found');
    return item;
  }
  async create(data: any, _userId: string) {
    return prisma.opportunity.create({ data });
  }
  async update(id: string, data: any) {
    try { return await prisma.opportunity.update({ where: { id }, data }); }
    catch (e) { if ((e as any).code === 'P2025') throw ApiError.notFound('Opportunity not found'); throw e; }
  }
  async delete(id: string) {
    try { await prisma.opportunity.delete({ where: { id } }); }
    catch (e) { if ((e as any).code === 'P2025') throw ApiError.notFound('Opportunity not found'); throw e; }
  }
}
export const opportunitiesService = new OpportunitiesService();
