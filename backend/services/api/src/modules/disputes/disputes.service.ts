import type { Prisma } from '@prisma/client';

import { prisma } from '@/config/prisma';
import { ApiError } from '@/utils/ApiError';

function serializeSummary(
  d: Prisma.DisputeGetPayload<{ include: { contract: true; filedBy: true; arbitrator: true } }>,
) {
  return {
    id: d.id,
    contractId: d.contractId,
    contractCrop: d.contract.targetCrop,
    category: d.category,
    status: d.status,
    filedById: d.filedById,
    filedByName: d.filedBy.fullName,
    summary: d.summary,
    arbitratorId: d.arbitratorId ?? undefined,
    arbitratorName: d.arbitrator?.fullName ?? undefined,
    filedAt: d.filedAt.toISOString(),
    resolvedAt: d.resolvedAt?.toISOString(),
  };
}

export async function list(filters: { contractId?: string; status?: string; category?: string; page?: number; pageSize?: number }) {
  const page = filters.page ?? 1;
  const pageSize = Math.min(filters.pageSize ?? 20, 100);

  const where: Prisma.DisputeWhereInput = {};
  if (filters.contractId) where.contractId = filters.contractId;
  if (filters.status) where.status = filters.status as never;
  if (filters.category) where.category = filters.category as never;

  const [items, total] = await Promise.all([
    prisma.dispute.findMany({
      where,
      include: { contract: true, filedBy: true, arbitrator: true },
      orderBy: { filedAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.dispute.count({ where }),
  ]);

  return { items: items.map(serializeSummary), page, pageSize, total };
}

export async function detail(id: string) {
  const d = await prisma.dispute.findUnique({
    where: { id },
    include: {
      contract: true,
      filedBy: true,
      arbitrator: true,
      evidence: true,
    },
  });
  if (!d) throw ApiError.notFound('Dispute not found');

  return {
    ...serializeSummary(d),
    evidence: d.evidence.map((e) => ({
      id: e.id,
      label: e.label,
      fileUrl: e.fileUrl,
      uploadedAt: e.uploadedAt.toISOString(),
    })),
    hearingAt: d.hearingAt?.toISOString(),
    decision: d.decision ?? undefined,
    decisionAt: d.decisionAt?.toISOString(),
  };
}

export async function file(
  input: { contractId: string; category: string; summary: string; evidenceUrls?: string[] },
  filedById: string,
) {
  const d = await prisma.dispute.create({
    data: {
      contractId: input.contractId,
      category: input.category as never,
      summary: input.summary,
      filedById,
      evidence: input.evidenceUrls?.length
        ? {
            create: input.evidenceUrls.map((url, i) => ({
              label: `Evidence ${i + 1}`,
              fileUrl: url,
            })),
          }
        : undefined,
    },
    include: { contract: true, filedBy: true, arbitrator: true },
  });

  // Freeze associated escrow
  await prisma.escrow.updateMany({
    where: { contractId: input.contractId },
    data: { status: 'FROZEN', isLocked: true },
  });

  await prisma.contract.update({
    where: { id: input.contractId },
    data: { status: 'DISPUTED' },
  });

  return serializeSummary(d);
}

export async function scheduleHearing(id: string, hearingAt: string, arbitratorId: string) {
  const d = await prisma.dispute.update({
    where: { id },
    data: {
      status: 'HEARING_SCHEDULED',
      hearingAt: new Date(hearingAt),
      arbitratorId,
    },
    include: { contract: true, filedBy: true, arbitrator: true, evidence: true },
  });
  return detail(d.id);
}

export async function decide(id: string, decision: string, outcome: string) {
  const d = await prisma.dispute.update({
    where: { id },
    data: {
      status: outcome === 'REJECT' ? 'CLOSED' : 'DECIDED',
      decision,
      decisionAt: new Date(),
      resolvedAt: new Date(),
    },
    include: { contract: true, filedBy: true, arbitrator: true, evidence: true },
  });
  return detail(d.id);
}
