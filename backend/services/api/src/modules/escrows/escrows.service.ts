import type { Prisma } from '@prisma/client';

import { prisma } from '@/config/prisma';
import { ApiError } from '@/utils/ApiError';

function serialize(
  e: Prisma.EscrowGetPayload<{ include: { contract: true; bank: true; balances: true } }>,
) {
  return {
    id: e.id,
    contractId: e.contractId,
    contractCrop: e.contract.targetCrop,
    managingBankId: e.managingBankId,
    managingBankName: e.bank.fullName,
    status: e.status,
    isLocked: e.isLocked,
    balances: e.balances.map((b) => ({ currency: b.currency, amount: b.amount.toString() })),
    totalDepositedEtb: e.totalDepositedEtb.toString(),
    createdAt: e.createdAt.toISOString(),
  };
}

export async function list(filters: { status?: string; bankId?: string; contractId?: string; page?: number; pageSize?: number }) {
  const page = filters.page ?? 1;
  const pageSize = Math.min(filters.pageSize ?? 20, 100);

  const where: Prisma.EscrowWhereInput = {};
  if (filters.status) where.status = filters.status as never;
  if (filters.bankId) where.managingBankId = filters.bankId;
  if (filters.contractId) where.contractId = filters.contractId;

  const [items, total] = await Promise.all([
    prisma.escrow.findMany({
      where,
      include: { contract: true, bank: true, balances: true },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.escrow.count({ where }),
  ]);

  return { items: items.map(serialize), page, pageSize, total };
}

export async function detail(id: string) {
  const e = await prisma.escrow.findUnique({
    where: { id },
    include: { contract: true, bank: true, balances: true },
  });
  if (!e) throw ApiError.notFound('Escrow not found');
  return serialize(e);
}

export async function ledger(id: string) {
  const entries = await prisma.escrowLedgerEntry.findMany({
    where: { escrowId: id },
    include: { actor: true },
    orderBy: { createdAt: 'desc' },
  });
  return entries.map((e) => ({
    id: e.id,
    escrowId: e.escrowId,
    direction: e.direction,
    amount: e.amount.toString(),
    currency: e.currency,
    purpose: e.purpose,
    referenceId: e.referenceId ?? undefined,
    actorId: e.actorId,
    actorName: e.actor.fullName,
    createdAt: e.createdAt.toISOString(),
  }));
}

export async function release(
  id: string,
  input: { amount: string; currency: string; recipientId: string; purpose: string; approvalToken?: string },
  actorId: string,
) {
  const escrow = await prisma.escrow.findUnique({ where: { id } });
  if (!escrow) throw ApiError.notFound('Escrow not found');
  if (escrow.status === 'FROZEN') throw ApiError.conflict('Escrow is frozen');
  if (escrow.isLocked && Number(input.amount) < 1_000_000) {
    throw ApiError.conflict('Escrow is locked');
  }
  if (Number(input.amount) > 1_000_000 && !input.approvalToken) {
    throw ApiError.badRequest('Multi-party approval token required for releases over 1M ETB');
  }

  const entry = await prisma.$transaction(async (tx) => {
    const e = await tx.escrowLedgerEntry.create({
      data: {
        escrowId: id,
        direction: 'RELEASE',
        amount: input.amount as never,
        currency: input.currency as never,
        purpose: input.purpose,
        actorId,
      },
      include: { actor: true },
    });

    await tx.escrowBalance.updateMany({
      where: { escrowId: id, currency: input.currency as never },
      data: { amount: { decrement: input.amount as never } },
    });

    return e;
  });

  return {
    id: entry.id,
    escrowId: entry.escrowId,
    direction: entry.direction,
    amount: entry.amount.toString(),
    currency: entry.currency,
    purpose: entry.purpose,
    actorId: entry.actorId,
    actorName: entry.actor.fullName,
    createdAt: entry.createdAt.toISOString(),
  };
}

export async function freeze(id: string, reason: string, actorId: string) {
  await prisma.$transaction([
    prisma.escrow.update({
      where: { id },
      data: { status: 'FROZEN', isLocked: true },
    }),
    prisma.escrowLedgerEntry.create({
      data: {
        escrowId: id,
        direction: 'HOLD',
        amount: '0' as never,
        currency: 'ETB',
        purpose: `Freeze: ${reason}`,
        actorId,
      },
    }),
  ]);
  return detail(id);
}

export async function close(id: string) {
  await prisma.escrow.update({
    where: { id },
    data: { status: 'CLOSED', isLocked: false },
  });
  return detail(id);
}
