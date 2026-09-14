import type { Prisma } from '@prisma/client';

import { prisma } from '@/config/prisma';
import { ApiError } from '@/utils/ApiError';

function serialize(
  i: Prisma.InvestmentGetPayload<{ include: { contract: true; investor: true } }>,
) {
  return {
    id: i.id,
    contractId: i.contractId,
    contractCrop: i.contract.targetCrop,
    contractRegion: i.contract.region,
    investorId: i.investorId,
    investorName: i.investor.fullName,
    fundingType: i.fundingType,
    amountForeignCurrency: i.amountForeignCurrency.toString(),
    currency: i.currency,
    amountEtb: i.amountEtb.toString(),
    agreedReturnRate: i.agreedReturnRate.toString(),
    expectedReturnEtb: i.expectedReturnEtb.toString(),
    realizedReturnEtb: i.realizedReturnEtb?.toString(),
    investedAt: i.investedAt.toISOString(),
    settledAt: i.settledAt?.toISOString(),
  };
}

export async function mine(investorId: string, filters: { page?: number; pageSize?: number }) {
  const page = filters.page ?? 1;
  const pageSize = Math.min(filters.pageSize ?? 20, 100);

  const where: Prisma.InvestmentWhereInput = { investorId };
  const [items, total] = await Promise.all([
    prisma.investment.findMany({
      where,
      include: { contract: true, investor: true },
      orderBy: { investedAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.investment.count({ where }),
  ]);

  return { items: items.map(serialize), page, pageSize, total };
}

export async function list(filters: { page?: number; pageSize?: number }) {
  const page = filters.page ?? 1;
  const pageSize = Math.min(filters.pageSize ?? 20, 100);

  const [items, total] = await Promise.all([
    prisma.investment.findMany({
      include: { contract: true, investor: true },
      orderBy: { investedAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.investment.count(),
  ]);

  return { items: items.map(serialize), page, pageSize, total };
}

export async function detail(id: string) {
  const i = await prisma.investment.findUnique({
    where: { id },
    include: { contract: true, investor: true },
  });
  if (!i) throw ApiError.notFound('Investment not found');
  return serialize(i);
}

export async function create(
  input: {
    contractId: string;
    fundingType: 'DEBT_FIXED_RETURN' | 'EQUITY_PROFIT_SHARE';
    amountForeignCurrency: string;
    currency: string;
    agreedReturnRate: number;
    sourceOfFunds: string;
  },
  investorId: string,
) {
  const contract = await prisma.contract.findUnique({ where: { id: input.contractId } });
  if (!contract) throw ApiError.notFound('Contract not found');
  if (contract.status === 'FULFILLED' || contract.status === 'DEFAULTED') {
    throw ApiError.conflict('Contract is not open for investment');
  }

  const FX = 55; // Placeholder stable rate — replace with real FX service
  const amountEtb = Number(input.amountForeignCurrency) * FX;
  const expectedReturn = amountEtb * (1 + input.agreedReturnRate);

  const investment = await prisma.investment.create({
    data: {
      contractId: input.contractId,
      investorId,
      fundingType: input.fundingType,
      amountForeignCurrency: input.amountForeignCurrency as never,
      currency: input.currency as never,
      amountEtb: amountEtb.toFixed(2) as never,
      agreedReturnRate: input.agreedReturnRate.toString() as never,
      expectedReturnEtb: expectedReturn.toFixed(2) as never,
      sourceOfFunds: input.sourceOfFunds,
    },
    include: { contract: true, investor: true },
  });

  // Update committed amount on the contract
  await prisma.contract.update({
    where: { id: input.contractId },
    data: { committedAmountEtb: { increment: amountEtb.toFixed(2) as never } },
  });

  return serialize(investment);
}
