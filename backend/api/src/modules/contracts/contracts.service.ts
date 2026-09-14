import type { Prisma } from '@prisma/client';

import { prisma } from '@/config/prisma';
import { ApiError } from '@/utils/ApiError';
import { generateContractHash } from '@/utils/nafiId';

export interface ListFilters {
  status?: string;
  regionCode?: string;
  crop?: string;
  farmerId?: string;
  page?: number;
  pageSize?: number;
}

function serialize(c: Prisma.ContractGetPayload<{ include: { farmer: true; bank: true; governmentWitness: true } }>) {
  return {
    id: c.id,
    targetCrop: c.targetCrop,
    region: c.region,
    regionCode: c.regionCode,
    farmerId: c.commercialFarmerId,
    farmerName: c.farmer.fullName,
    totalTargetYieldKg: c.totalTargetYieldKg.toString(),
    guaranteedFloorPriceEtb: c.guaranteedFloorPriceEtb.toString(),
    contractValueEtb: c.contractValueEtb.toString(),
    committedAmountEtb: c.committedAmountEtb.toString(),
    status: c.status,
    maturityDate: c.maturityDate.toISOString(),
    createdAt: c.createdAt.toISOString(),
    updatedAt: c.updatedAt.toISOString(),
    bankId: c.bankId ?? undefined,
    bankName: c.bank?.fullName ?? undefined,
    governmentWitnessId: c.governmentWitnessId ?? undefined,
    governmentWitnessName: c.governmentWitness?.fullName ?? undefined,
    onChainHash: c.onChainHash,
  };
}

export async function list(filters: ListFilters) {
  const page = filters.page ?? 1;
  const pageSize = Math.min(filters.pageSize ?? 20, 100);

  const where: Prisma.ContractWhereInput = {};
  if (filters.status) where.status = filters.status as never;
  if (filters.regionCode) where.regionCode = filters.regionCode;
  if (filters.crop) where.targetCrop = { contains: filters.crop };
  if (filters.farmerId) where.commercialFarmerId = filters.farmerId;

  const [items, total] = await Promise.all([
    prisma.contract.findMany({
      where,
      include: { farmer: true, bank: true, governmentWitness: true },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.contract.count({ where }),
  ]);

  return { items: items.map(serialize), page, pageSize, total };
}

export async function detail(id: string) {
  const c = await prisma.contract.findUnique({
    where: { id },
    include: {
      farmer: true,
      bank: true,
      governmentWitness: true,
      signatures: { include: { signer: true } },
      timeline: { orderBy: { timestamp: 'asc' } },
      escrow: true,
      investments: true,
    },
  });
  if (!c) throw ApiError.notFound('Contract not found');

  const committed = c.investments.reduce(
    (s, i) => s + Number(i.amountEtb),
    0,
  );
  const fundedPercent =
    Number(c.contractValueEtb) > 0
      ? committed / Number(c.contractValueEtb)
      : 0;

  return {
    ...serialize(c),
    investorCount: c.investments.length,
    fundedPercent,
    escrowId: c.escrow?.id,
    signatures: c.signatures.map((s) => ({
      role: s.role,
      signerId: s.signerId,
      signerName: s.signer.fullName,
      signatureHash: s.signatureHash,
      signedAt: s.signedAt.toISOString(),
    })),
    timeline: c.timeline.map((e) => ({
      id: e.id,
      type: e.type,
      label: e.label,
      description: e.description ?? undefined,
      timestamp: e.timestamp.toISOString(),
    })),
  };
}

export async function create(input: {
  commercialFarmerId: string;
  targetCrop: string;
  totalTargetYieldKg: string | number;
  guaranteedFloorPriceEtb: string | number;
  maturityDate: Date | string;
  governmentWitnessId: string;
  regionCode: string;
  region?: string;
}, actorId: string) {
  const contractValue =
    Number(input.totalTargetYieldKg) * Number(input.guaranteedFloorPriceEtb);

  const contract = await prisma.contract.create({
    data: {
      targetCrop: input.targetCrop,
      region: input.region ?? input.regionCode,
      regionCode: input.regionCode,
      commercialFarmerId: input.commercialFarmerId,
      governmentWitnessId: input.governmentWitnessId,
      totalTargetYieldKg: input.totalTargetYieldKg as never,
      guaranteedFloorPriceEtb: input.guaranteedFloorPriceEtb as never,
      contractValueEtb: contractValue.toFixed(2) as never,
      maturityDate: new Date(input.maturityDate),
      onChainHash: generateContractHash(),
      status: 'DRAFT',
      timeline: {
        create: {
          type: 'CREATED',
          label: 'Contract created',
          description: `Created by actor ${actorId}`,
        },
      },
    },
    include: { farmer: true, bank: true, governmentWitness: true },
  });

  return serialize(contract);
}

export async function update(id: string, input: Record<string, unknown>) {
  const data: Prisma.ContractUpdateInput = {};
  if (typeof input.targetCrop === 'string') data.targetCrop = input.targetCrop;
  if (input.totalTargetYieldKg !== undefined) {
    data.totalTargetYieldKg = String(input.totalTargetYieldKg) as never;
  }
  if (input.guaranteedFloorPriceEtb !== undefined) {
    data.guaranteedFloorPriceEtb = String(input.guaranteedFloorPriceEtb) as never;
  }
  if (input.maturityDate) data.maturityDate = new Date(input.maturityDate as string);

  const contract = await prisma.contract.update({
    where: { id },
    data,
    include: { farmer: true, bank: true, governmentWitness: true },
  });

  await prisma.contractTimelineEvent.create({
    data: { contractId: id, type: 'UPDATED', label: 'Contract updated' },
  });

  return serialize(contract);
}

export async function sign(
  contractId: string,
  input: { role: 'FARMER' | 'BANK' | 'GOVERNMENT_WITNESS' | 'SUPPLIER' | 'OFF_TAKER'; signatureHash: string },
  signerId: string,
) {
  const existing = await prisma.contractSignature.findUnique({
    where: { contractId_role: { contractId, role: input.role } },
  });
  if (existing) throw ApiError.conflict('Already signed for this role');

  const sig = await prisma.contractSignature.create({
    data: {
      contractId,
      role: input.role,
      signerId,
      signatureHash: input.signatureHash,
    },
    include: { signer: true },
  });

  await prisma.contractTimelineEvent.create({
    data: {
      contractId,
      type: 'SIGNED',
      label: `Signed by ${input.role.replace(/_/g, ' ')}`,
      description: sig.signer.fullName,
    },
  });

  return {
    role: sig.role,
    signerId: sig.signerId,
    signerName: sig.signer.fullName,
    signatureHash: sig.signatureHash,
    signedAt: sig.signedAt.toISOString(),
  };
}

export async function freeze(id: string, reason: string) {
  await prisma.contract.update({
    where: { id },
    data: { status: 'DEFAULTED' },
  });
  await prisma.contractTimelineEvent.create({
    data: { contractId: id, type: 'FROZEN', label: 'Contract frozen', description: reason },
  });
  return detail(id);
}

export async function timeline(id: string) {
  const events = await prisma.contractTimelineEvent.findMany({
    where: { contractId: id },
    orderBy: { timestamp: 'asc' },
  });
  return events.map((e) => ({
    id: e.id,
    type: e.type,
    label: e.label,
    description: e.description ?? undefined,
    timestamp: e.timestamp.toISOString(),
  }));
}

export async function signatures(id: string) {
  const sigs = await prisma.contractSignature.findMany({
    where: { contractId: id },
    include: { signer: true },
  });
  return sigs.map((s) => ({
    role: s.role,
    signerId: s.signerId,
    signerName: s.signer.fullName,
    signatureHash: s.signatureHash,
    signedAt: s.signedAt.toISOString(),
  }));
}
