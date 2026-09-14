import type { Prisma } from '@prisma/client';

import { prisma } from '@/config/prisma';
import { ApiError } from '@/utils/ApiError';

function serialize(
  p: Prisma.InputPurchaseGetPayload<{ include: { contract: true; supplier: true } }>,
) {
  return {
    id: p.id,
    contractId: p.contractId,
    contractCrop: p.contract.targetCrop,
    supplierId: p.supplierId,
    supplierName: p.supplier.fullName,
    itemDescription: p.itemDescription,
    quantity: p.quantity.toString(),
    unit: p.unit,
    unitCostEtb: p.unitCostEtb.toString(),
    totalCostEtb: p.totalCostEtb.toString(),
    isDelivered: p.isDelivered,
    isDisbursed: p.isDisbursed,
    deliveredAt: p.deliveredAt?.toISOString(),
    verifiedAt: p.verifiedAt?.toISOString(),
    createdAt: p.createdAt.toISOString(),
  };
}

export async function list(filters: {
  contractId?: string;
  supplierId?: string;
  isDelivered?: boolean;
  isDisbursed?: boolean;
  page?: number;
  pageSize?: number;
}) {
  const page = filters.page ?? 1;
  const pageSize = Math.min(filters.pageSize ?? 20, 100);

  const where: Prisma.InputPurchaseWhereInput = {};
  if (filters.contractId) where.contractId = filters.contractId;
  if (filters.supplierId) where.supplierId = filters.supplierId;
  if (filters.isDelivered !== undefined) where.isDelivered = filters.isDelivered;
  if (filters.isDisbursed !== undefined) where.isDisbursed = filters.isDisbursed;

  const [items, total] = await Promise.all([
    prisma.inputPurchase.findMany({
      where,
      include: { contract: true, supplier: true },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.inputPurchase.count({ where }),
  ]);

  return { items: items.map(serialize), page, pageSize, total };
}

export async function detail(id: string) {
  const p = await prisma.inputPurchase.findUnique({
    where: { id },
    include: { contract: true, supplier: true },
  });
  if (!p) throw ApiError.notFound('Input order not found');
  return serialize(p);
}

export async function create(
  input: {
    contractId: string;
    itemDescription: string;
    quantity: string;
    unit: string;
    unitCostEtb: string;
  },
  supplierId: string,
) {
  const total = Number(input.quantity) * Number(input.unitCostEtb);
  const p = await prisma.inputPurchase.create({
    data: {
      contractId: input.contractId,
      supplierId,
      itemDescription: input.itemDescription,
      quantity: input.quantity as never,
      unit: input.unit,
      unitCostEtb: input.unitCostEtb as never,
      totalCostEtb: total.toFixed(2) as never,
    },
    include: { contract: true, supplier: true },
  });
  return serialize(p);
}

export async function verifyDelivery(
  id: string,
  input: {
    photoHash: string;
    latitude: number;
    longitude: number;
    qrCode?: string;
    notes?: string;
  },
) {
  const existing = await prisma.inputPurchase.findUnique({ where: { id } });
  if (!existing) throw ApiError.notFound('Input order not found');
  if (existing.verifiedAt) throw ApiError.conflict('Already verified');

  const p = await prisma.inputPurchase.update({
    where: { id },
    data: {
      isDelivered: true,
      deliveredAt: existing.deliveredAt ?? new Date(),
      verifiedAt: new Date(),
      photoHash: input.photoHash,
      latitude: input.latitude as never,
      longitude: input.longitude as never,
      qrCode: input.qrCode,
      notes: input.notes,
    },
    include: { contract: true, supplier: true },
  });

  return serialize(p);
}
