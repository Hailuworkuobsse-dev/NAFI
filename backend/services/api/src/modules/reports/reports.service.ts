import type { Prisma } from '@prisma/client';

import { prisma } from '@/config/prisma';
import { ApiError } from '@/utils/ApiError';

function serialize(r: Prisma.ReportGetPayload<{ include: { generatedBy: true } }>) {
  return {
    id: r.id,
    type: r.type,
    title: r.title,
    periodStart: r.periodStart.toISOString(),
    periodEnd: r.periodEnd.toISOString(),
    format: r.format,
    fileUrl: r.fileUrl,
    generatedById: r.generatedById,
    generatedByName: r.generatedBy.fullName,
    generatedAt: r.generatedAt.toISOString(),
  };
}

export async function list(filters: { type?: string; page?: number; pageSize?: number }) {
  const page = filters.page ?? 1;
  const pageSize = Math.min(filters.pageSize ?? 20, 100);

  const where: Prisma.ReportWhereInput = {};
  if (filters.type) where.type = filters.type as never;

  const [items, total] = await Promise.all([
    prisma.report.findMany({
      where,
      include: { generatedBy: true },
      orderBy: { generatedAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.report.count({ where }),
  ]);

  return { items: items.map(serialize), page, pageSize, total };
}

export async function detail(id: string) {
  const r = await prisma.report.findUnique({
    where: { id },
    include: { generatedBy: true },
  });
  if (!r) throw ApiError.notFound('Report not found');
  return serialize(r);
}

export async function generate(
  input: {
    type: string;
    periodStart: string;
    periodEnd: string;
    format: string;
  },
  generatedById: string,
) {
  const report = await prisma.report.create({
    data: {
      type: input.type as never,
      title: `${input.type.replace(/_/g, ' ')} — ${input.periodStart} to ${input.periodEnd}`,
      periodStart: new Date(input.periodStart),
      periodEnd: new Date(input.periodEnd),
      format: input.format as never,
      fileUrl: `/reports/${Date.now()}.${input.format.toLowerCase()}`,
      generatedById,
    },
    include: { generatedBy: true },
  });
  return serialize(report);
}
