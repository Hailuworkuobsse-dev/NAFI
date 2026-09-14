import type { Prisma } from '@prisma/client';

import { prisma } from '@/config/prisma';
import { ApiError } from '@/utils/ApiError';

function serialize(
  c: Prisma.CollateralGetPayload<{ include: { owner: true; lienHolder: true } }>,
) {
  return {
    id: c.id,
    type: c.type,
    ownerId: c.ownerId,
    ownerName: c.owner.fullName,
    description: c.description,
    estimatedValueEtb: c.estimatedValueEtb.toString(),
    lienStatus: c.lienStatus,
    lienHolderId: c.lienHolderId ?? undefined,
    lienHolderName: c.lienHolder?.fullName ?? undefined,
    registeredAt: c.registeredAt.toISOString(),
    expiresAt: c.expiresAt?.toISOString(),
    quantityKg: c.quantityKg?.toString(),
    grade: c.grade ?? undefined,
    warehouseName: c.warehouseName ?? undefined,
  };
}

export async function list(filters: {
  type?: string;
  lienStatus?: string;
  ownerId?: string;
  lienHolderId?: string;
  page?: number;
  pageSize?: number;
}) {
  const page = filters.page ?? 1;
  const pageSize = Math.min(filters.pageSize ?? 20, 100);

  const where: Prisma.CollateralWhereInput = {};
  if (filters.type) where.type = filters.type as never;
  if (filters.lienStatus) where.lienStatus = filters.lienStatus as never;
  if (filters.ownerId) where.ownerId = filters.ownerId;
  if (filters.lienHolderId) where.lienHolderId = filters.lienHolderId;

  const [items, total] = await Promise.all([
    prisma.collateral.findMany({
      where,
      include: { owner: true, lienHolder: true },
      orderBy: { registeredAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.collateral.count({ where }),
  ]);

  return { items: items.map(serialize), page, pageSize, total };
}

export async function detail(id: string) {
  const c = await prisma.collateral.findUnique({
    where: { id },
    include: { owner: true, lienHolder: true },
  });
  if (!c) throw ApiError.notFound('Collateral not found');
  return serialize(c);
}

export async function register(
  input: {
    type: 'WAREHOUSE_RECEIPT' | 'MOVABLE_PROPERTY' | 'FUTURE_HARVEST' | 'MACHINERY';
    description: string;
    estimatedValueEtb: string;
    quantityKg?: string;
    grade?: string;
    warehouseId?: string;
    expiresAt?: string;
  },
  ownerId: string,
) {
  const c = await prisma.collateral.create({
    data: {
      type: input.type,
      ownerId,
      description: input.description,
      estimatedValueEtb: input.estimatedValueEtb as never,
      quantityKg: input.quantityKg as never,
      grade: input.grade,
      warehouseId: input.warehouseId,
      expiresAt: input.expiresAt ? new Date(input.expiresAt) : undefined,
    },
    include: { owner: true, lienHolder: true },
  });
  return serialize(c);
}

export async function registerLien(id: string, lienHolderId: string) {
  const c = await prisma.collateral.update({
    where: { id },
    data: { lienStatus: 'LIEN_REGISTERED', lienHolderId },
    include: { owner: true, lienHolder: true },
  });
  return serialize(c);
}

export async function releaseLien(id: string) {
  const c = await prisma.collateral.update({
    where: { id },
    data: { lienStatus: 'RELEASED' },
    include: { owner: true, lienHolder: true },
  });
  return serialize(c);
}

export async function liquidate(id: string, _reason: string) {
  const c = await prisma.collateral.update({
    where: { id },
    data: { lienStatus: 'LIQUIDATED' },
    include: { owner: true, lienHolder: true },
  });
  return serialize(c);
}
