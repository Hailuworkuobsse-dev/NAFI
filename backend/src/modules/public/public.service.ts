import prisma from '../../config/prisma';

export class PublicService {
  async getStats() {
    try {
      const [totalUsers, activeContracts, totalInvestments, totalOpportunities] = await Promise.all([
        prisma.user.count(),
        prisma.contract.count({ where: { status: 'ACTIVE' } }),
        prisma.investment.count(),
        prisma.opportunity.count({ where: { status: 'PUBLISHED' } }),
      ]);
      return { totalUsers, activeContracts, totalInvestments, totalOpportunities };
    } catch (err) {
      // DB not reachable/not migrated yet -> degrade gracefully instead of 500
      console.warn('public stats unavailable:', (err as Error)?.message);
      return { totalUsers: 0, activeContracts: 0, totalInvestments: 0, totalOpportunities: 0 };
    }
  }

  async getOpportunities(page = 1, limit = 10) {
    const where = { status: 'PUBLISHED' as const };
    try {
      const [data, total] = await Promise.all([
        prisma.opportunity.findMany({ where, skip: (page - 1) * limit, take: limit }),
        prisma.opportunity.count({ where }),
      ]);
      return { data, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
    } catch (err) {
      console.warn('public opportunities unavailable:', (err as Error)?.message);
      return { data: [], pagination: { page, limit, total: 0, totalPages: 0 } };
    }
  }
}
export const publicService = new PublicService();
