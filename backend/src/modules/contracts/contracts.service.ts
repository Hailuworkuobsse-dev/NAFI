import prisma from '../../config/prisma';
import { ApiError } from '../../utils/ApiError';
import { generateContractHash, generateRef } from '../../utils/nafiId';

export class ContractsService {
  async findAll(userId: string, institutionId?: string | null, scope = 'OWN') {
    const where: Record<string, unknown> = {};
    
    if (scope === 'OWN') {
      where.borrowerId = userId;
    } else if (scope === 'INSTITUTION' && institutionId) {
      where.institutionId = institutionId;
    }
    
    return prisma.contract.findMany({
      where,
      include: {
        borrower: { select: { id: true, firstName: true, lastName: true, email: true } },
        institution: { select: { id: true, name: true, code: true } },
        _count: { select: { investments: true, escrows: true, settlements: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: string, userId: string, institutionId?: string | null) {
    const contract = await prisma.contract.findUnique({
      where: { id },
      include: {
        borrower: { select: { id: true, firstName: true, lastName: true, email: true } },
        institution: { select: { id: true, name: true, code: true } },
        escrows: true,
        investments: true,
        settlements: true,
        collateral: true,
        inputs: true,
      },
    });

    if (!contract) {
      throw ApiError.notFound('Contract not found');
    }

    return contract;
  }

  async create(data: any, userId: string) {
    const contractHash = generateContractHash(`${userId}-${Date.now()}`);
    const nafiContractId = generateRef('CNT');

    return prisma.contract.create({
      data: {
        ...data,
        contractHash,
        nafiContractId,
      },
      include: {
        borrower: { select: { id: true, firstName: true, lastName: true } },
      },
    });
  }

  async update(id: string, data: any) {
    const existing = await prisma.contract.findUnique({ where: { id } });
    if (!existing) {
      throw ApiError.notFound('Contract not found');
    }

    return prisma.contract.update({
      where: { id },
      data,
    });
  }

  async approve(id: string, notes?: string) {
    return prisma.contract.update({
      where: { id },
      data: { status: 'APPROVED' },
    });
  }

  async reject(id: string, reason: string) {
    return prisma.contract.update({
      where: { id },
      data: { status: 'REJECTED' },
    });
  }

  async delete(id: string) {
    const existing = await prisma.contract.findUnique({ where: { id } });
    if (!existing) {
      throw ApiError.notFound('Contract not found');
    }

    if (existing.status !== 'DRAFT') {
      throw ApiError.badRequest('Can only delete draft contracts');
    }

    return prisma.contract.delete({ where: { id } });
  }
}

export const contractsService = new ContractsService();
