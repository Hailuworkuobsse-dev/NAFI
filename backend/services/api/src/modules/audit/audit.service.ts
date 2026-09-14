import type { Prisma } from '@prisma/client';

import { prisma } from '@/config/prisma';

export async function list(filters: {
  actorId?: string;
  resource?: string;
  resourceId?: string;
  from?: string;
  to?: string;
  page?: number;
  pageSize?: number;
}) {
  const page = filters.page ?? 1;
  const pageSize = Math.min(filters.pageSize ?? 50, 200);

  const where: Prisma.AuditLogWhereInput = {};
  if (filters.actorId) where.actorId = filters.actorId;
  if (filters.resource) where.resource = filters.resource;
  if (filters.resourceId) where.resourceId = filters.resourceId;
  if (filters.from || filters.to) {
    where.createdAt = {};
    if (filters.from) where.createdAt.gte = new Date(filters.from);
    if (filters.to) where.createdAt.lte = new Date(filters.to);
  }

  const [items, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      include: { actor: true },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.auditLog.count({ where }),
  ]);

  return {
    items: items.map((a) => ({
      id: a.id,
      actorId: a.actorId ?? '',
      actorName: a.actor?.fullName ?? 'System',
      action: a.action,
      resource: a.resource,
      resourceId: a.resourceId ?? '',
      ip: a.ip ?? '',
      createdAt: a.createdAt.toISOString(),
      metadata: a.metadata as Record<string, unknown> | undefined,
    })),
    page,
    pageSize,
    total,
  };
}
