import { prisma } from '../../config/prisma';
import { ApiError } from '../../utils/ApiError';
import { TenantScope } from '../../middleware/tenantScope';

export interface InvestmentFilter {
  status?: string;
  contractId?: string;
  investorId?: string;
}

export class InvestmentsService {
  async findAll(
    userId: string,
    institutionId: string | null,
    scope: TenantScope,
    filter: InvestmentFilter = {},
    page = 1,
    limit = 20
  ) {
    const where: Record<string, unknown> = {};

    switch (scope) {
      case 'OWN':
        where.investorId = userId;
        break;
      case 'INSTITUTION':
        if (institutionId) {
          where.institutionId = institutionId;
        }
        break;
    }

    if (filter.status) where.status = filter.status;
    if (filter.contractId) where.contractId = filter.contractId;
    if (filter.investorId) where.investorId = filter.investorId;

    const [investments, total] = await Promise.all([
      prisma.investment.findMany({
        where,
        include: {
          contract: { select: { id: true, contractHash: true } },
          investor: { select: { id: true, firstName: true, lastName: true } },
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.investment.count({ where }),
    ]);

    return {
      data: investments,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async findById(id: string) {
    const investment = await prisma.investment.findUnique({
      where: { id },
      include: { contract: true, investor: true },
    });
    if (!investment) throw ApiError.notFound('Investment not found');
    return investment;
  }

  async create(data: any, userId: string) {
    return prisma.investment.create({
      data: { ...data, investorId: userId },
      include: { contract: true, investor: true },
    });
  }

  async update(id: string, data: any) {
    try {
      return await prisma.investment.update({ where: { id }, data });
    } catch (e) {
      if ((e as any).code === 'P2025') throw ApiError.notFound('Investment not found');
      throw e;
    }
  }

  async delete(id: string) {
    try {
      await prisma.investment.delete({ where: { id } });
    } catch (e) {
      if ((e as any).code === 'P2025') throw ApiError.notFound('Investment not found');
      throw e;
    }
  }
}

export const investmentsService = new InvestmentsService();
