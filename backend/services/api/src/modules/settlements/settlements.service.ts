import type { Prisma } from '@prisma/client';

import { prisma } from '@/config/prisma';
import { ApiError } from '@/utils/ApiError';

function serializeSummary(
  s: Prisma.SettlementGetPayload<{ include: { contract: true } }>,
) {
  return {
    id: s.id,
    contractId: s.contractId,
    contractCrop: s.contract.targetCrop,
    status: s.status,
    grossRevenueEtb: s.grossRevenueEtb.toString(),
    actualYieldKg: s.actualYieldKg.toString(),
    totalDistributedEtb: s.totalDistributedEtb.toString(),
    executedAt: s.executedAt?.toISOString(),
    createdAt: s.createdAt.toISOString(),
  };
}

export async function list(filters: { contractId?: string; status?: string; page?: number; pageSize?: number }) {
  const page = filters.page ?? 1;
  const pageSize = Math.min(filters.pageSize ?? 20, 100);

  const where: Prisma.SettlementWhereInput = {};
  if (filters.contractId) where.contractId = filters.contractId;
  if (filters.status) where.status = filters.status as never;

  const [items, total] = await Promise.all([
    prisma.settlement.findMany({
      where,
      include: { contract: true },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.settlement.count({ where }),
  ]);

  return { items: items.map(serializeSummary), page, pageSize, total };
}

export async function detail(id: string) {
  const s = await prisma.settlement.findUnique({
    where: { id },
    include: {
      contract: true,
      distributions: { include: { recipient: true } },
    },
  });
  if (!s) throw ApiError.notFound('Settlement not found');

  return {
    ...serializeSummary(s),
    distributions: s.distributions.map((d) => ({
      recipientId: d.recipientId,
      recipientName: d.recipient.fullName,
      role: d.role,
      payoutAmountEtb: d.payoutAmountEtb.toString(),
      notes: d.notes ?? undefined,
    })),
    waterfallOrder: (s.waterfallOrder as string[]) ?? [],
    approvalChain: [],
  };
}

/**
 * Simulate a settlement without executing it.
 * Computes the waterfall distribution across all parties.
 */
export async function simulate(input: {
  contractId: string;
  actualYieldKg: string | number;
  grossRevenueEtb: string | number;
}) {
  const contract = await prisma.contract.findUnique({
    where: { id: input.contractId },
    include: {
      investments: { include: { investor: true } },
      inputPurchases: true,
      farmer: true,
      bank: true,
      escrow: true,
    },
  });
  if (!contract) throw ApiError.notFound('Contract not found');

  const distributions: {
    recipientId: string;
    recipientName: string;
    role: string;
    payoutAmountEtb: string;
  }[] = [];

  let remaining = Number(input.grossRevenueEtb);

  // 1. Diaspora investors
  for (const inv of contract.investments) {
    const principalEtb = Number(inv.amountEtb);
    const payout = principalEtb * (1 + Number(inv.agreedReturnRate));
    distributions.push({
      recipientId: inv.investorId,
      recipientName: inv.investor.fullName,
      role: 'DIASPORA_INVESTOR',
      payoutAmountEtb: payout.toFixed(2),
    });
    remaining -= payout;
  }

  // 2. Input suppliers (delivered but not disbursed)
  for (const p of contract.inputPurchases) {
    if (p.isDelivered && !p.isDisbursed) {
      distributions.push({
        recipientId: p.supplierId,
        recipientName: 'Input Supplier',
        role: 'INPUT_SUPPLIER',
        payoutAmountEtb: p.totalCostEtb.toString(),
      });
      remaining -= Number(p.totalCostEtb);
    }
  }

  // 3. Bank service fee (2%)
  const bankFee = Number(input.grossRevenueEtb) * 0.02;
  if (contract.bank) {
    distributions.push({
      recipientId: contract.bankId!,
      recipientName: contract.bank.fullName,
      role: 'COMMERCIAL_BANK',
      payoutAmountEtb: bankFee.toFixed(2),
    });
    remaining -= bankFee;
  }

  // 4. Farmer residual
  if (remaining > 0) {
    distributions.push({
      recipientId: contract.commercialFarmerId,
      recipientName: contract.farmer.fullName,
      role: 'COMMERCIAL_FARMER',
      payoutAmountEtb: remaining.toFixed(2),
    });
  }

  const settlement = await prisma.settlement.create({
    data: {
      contractId: input.contractId,
      status: 'SIMULATED',
      grossRevenueEtb: String(input.grossRevenueEtb) as never,
      actualYieldKg: String(input.actualYieldKg) as never,
      totalDistributedEtb: '0',
      waterfallOrder: ['DIASPORA_INVESTOR', 'INPUT_SUPPLIER', 'COMMERCIAL_BANK', 'COMMERCIAL_FARMER'],
    },
    include: { contract: true },
  });

  return {
    ...serializeSummary(settlement),
    distributions,
    waterfallOrder: ['DIASPORA_INVESTOR', 'INPUT_SUPPLIER', 'COMMERCIAL_BANK', 'COMMERCIAL_FARMER'],
    approvalChain: [],
  };
}

/**
 * Execute a settlement: persist distributions and mark the contract fulfilled.
 * In production this would run inside an idempotent job.
 */
export async function execute(id: string, _approvalToken: string) {
  const s = await prisma.settlement.findUnique({
    where: { id },
    include: { contract: true },
  });
  if (!s) throw ApiError.notFound('Settlement not found');
  if (s.status === 'EXECUTED') throw ApiError.conflict('Already executed');

  const simulated = await simulate({
    contractId: s.contractId,
    actualYieldKg: s.actualYieldKg.toString(),
    grossRevenueEtb: s.grossRevenueEtb.toString(),
  });

  await prisma.$transaction(async (tx) => {
    for (const d of simulated.distributions) {
      await tx.settlementDistribution.create({
        data: {
          settlementId: id,
          recipientId: d.recipientId,
          role: d.role as never,
          payoutAmountEtb: d.payoutAmountEtb as never,
        },
      });
    }

    const total = simulated.distributions.reduce(
      (sum, d) => sum + Number(d.payoutAmountEtb),
      0,
    );

    await tx.settlement.update({
      where: { id },
      data: {
        status: 'EXECUTED',
        executedAt: new Date(),
        totalDistributedEtb: total.toFixed(2) as never,
      },
    });

    await tx.contract.update({
      where: { id: s.contractId },
      data: { status: 'FULFILLED' },
    });

    await tx.contractTimelineEvent.create({
      data: {
        contractId: s.contractId,
        type: 'SETTLED',
        label: 'Settlement executed',
      },
    });
  });

  return detail(id);
}

export async function reverse(id: string, reason: string) {
  await prisma.settlement.update({
    where: { id },
    data: { status: 'REVERSED', reversalReason: reason },
  });
  return detail(id);
}
