import { prisma } from '../../config/prisma';
import { ApiError } from '../../utils/ApiError';
import { TenantScope } from '../../middleware/tenantScope';
import { generateContractHash } from '../../utils/nafiId';

export interface ContractFilter {
  status?: string;
  borrowerId?: string;
  institutionId?: string;
  q?: string;
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
        // Contracts belong to the farmer (borrower), not an investor
        where.borrowerId = userId;
        break;
      case 'INSTITUTION':
        if (institutionId) {
          where.institutionId = institutionId;
        } else {
          where.id = 'impossible-id';
        }
        break;
      case 'NATIONAL':
      case 'ALL':
        // national-level roles see everything
        break;
    }

    if (filter.status) where.status = filter.status;
    if (filter.borrowerId) where.borrowerId = filter.borrowerId;
    if (filter.institutionId) where.institutionId = filter.institutionId;
    if (filter.q) {
      where.OR = [
        { title: { contains: filter.q } },
        { nafiContractId: { contains: filter.q } },
      ];
    }

    const [contracts, total] = await Promise.all([
      prisma.contract.findMany({
        where,
        include: {
          borrower: { select: { id: true, firstName: true, lastName: true, email: true } },
          institution: { select: { id: true, name: true, code: true } },
          escrows: { select: { id: true, status: true } },
          _count: { select: { investments: true, settlements: true, disputes: true } },
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.contract.count({ where }),
    ]);

    const items = contracts.map(({ _count, escrows, ...c }) => ({
      ...c,
      escrow: escrows[0] ?? null,
      investmentCount: _count.investments,
      settlementCount: _count.settlements,
      disputeCount: _count.disputes,
    }));

    return {
      items,
      page,
      pageSize: limit,
      total,
    };
  }

  async findById(id: string) {
    const contract = await prisma.contract.findFirst({
      where: { OR: [{ id }, { nafiContractId: id }] },
      include: {
        borrower: true,
        institution: true,
        escrows: true,
        investments: { include: { investor: { select: { id: true, firstName: true, lastName: true } } } },
        settlements: true,
        collateral: true,
        disputes: true,
        inputs: true,
      },
    });
    if (!contract) throw ApiError.notFound('Contract not found');
    return contract;
  }

  async create(data: any, userId: string) {
    const contractHash = generateContractHash(JSON.stringify(data));
    const nafiContractId = `CT-${Date.now().toString(36).toUpperCase()}`;
    return prisma.contract.create({
      data: { ...data, contractHash, nafiContractId, borrowerId: data.borrowerId ?? userId },
      include: { borrower: true, institution: true },
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

  async approve(id: string) {
    return this.update(id, { status: 'APPROVED' });
  }

  async reject(id: string, reason?: string) {
    return this.update(id, { status: 'REJECTED' });
  }
}

export const contractsService = new ContractsService();
