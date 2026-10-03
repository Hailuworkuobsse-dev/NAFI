import { prisma } from '../../config/prisma';

export class PublicService {
  async getStats() {
    const [totalUsers, activeContracts, totalInvestments, totalOpportunities] = await Promise.all([
      prisma.user.count(),
      prisma.contract.count({ where: { status: 'ACTIVE' } }),
      prisma.investment.count(),
      prisma.opportunity.count({ where: { status: 'PUBLISHED' } }),
    ]);
    return { totalUsers, activeContracts, totalInvestments, totalOpportunities };
  }
  async getOpportunities(page = 1, limit = 10) {
    const where = { status: 'PUBLISHED' as const };
    const [data, total] = await Promise.all([
      prisma.opportunity.findMany({ where, skip: (page - 1) * limit, take: limit }),
      prisma.opportunity.count({ where }),
    ]);
    return { data, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }
}
export const publicService = new PublicService();
