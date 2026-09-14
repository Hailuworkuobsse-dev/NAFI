import { prisma } from '../../config/prisma';
import { ApiError } from '../../utils/ApiError';
import { TenantScope } from '../../middleware/tenantScope';
import { generateContractHash } from '../../utils/nafiId';

export interface ContractFilter {
  status?: string;
  type?: string;
  investorId?: string;
  opportunityId?: string;
}

export class ContractsService {
  async findAll(
    userId: string,
    institutionId: string | null,
    scope: TenantScope,
    filter: ContractFilter = {},
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
    if (filter.type) where.type = filter.type;
    if (filter.investorId) where.investorId = filter.investorId;
    if (filter.opportunityId) where.opportunityId = filter.opportunityId;

    const [contracts, total] = await Promise.all([
      prisma.contract.findMany({
        where,
        include: {
          investor: { select: { id: true, firstName: true, lastName: true, email: true } },
          opportunity: { select: { id: true, title: true } },
          escrow: { select: { id: true, status: true } },
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.contract.count({ where }),
    ]);

    return {
      data: contracts,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async findById(id: string) {
    const contract = await prisma.contract.findUnique({
      where: { id },
      include: {
        investor: true,
        opportunity: true,
        escrow: true,
        investments: true,
        settlements: true,
      },
    });
    if (!contract) throw ApiError.notFound('Contract not found');
    return contract;
  }

  async create(data: any, userId: string) {
    const contractHash = generateContractHash(data);
    return prisma.contract.create({
      data: { ...data, contractHash, investorId: userId },
      include: { investor: true, opportunity: true },
    });
  }

  async update(id: string, data: any) {
    try {
      return await prisma.contract.update({ where: { id }, data });
    } catch (e) {
      if ((e as any).code === 'P2025') throw ApiError.notFound('Contract not found');
      throw e;
    }
  }

  async delete(id: string) {
    try {
      await prisma.contract.delete({ where: { id } });
    } catch (e) {
      if ((e as any).code === 'P2025') throw ApiError.notFound('Contract not found');
      throw e;
    }
  }
}

export const contractsService = new ContractsService();
