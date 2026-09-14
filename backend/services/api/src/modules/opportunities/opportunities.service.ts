import { prisma } from '@/config/prisma';
import { ApiError } from '@/utils/ApiError';

function serialize(
  c: Awaited<ReturnType<typeof prisma.contract.findFirst>> & {
    investments: { amountEtb: unknown }[];
  },
  investorCount: number,
) {
  const committed = c!.investments.reduce((s, i) => s + Number(i.amountEtb), 0);
  const target = Number(c!.contractValueEtb);
  return {
    id: c!.id,
    targetCrop: c!.targetCrop,
    region: c!.region,
    regionCode: c!.regionCode,
    targetAmountEtb: c!.contractValueEtb.toString(),
    committedAmountEtb: committed.toFixed(2),
    investorCount,
    targetYieldKg: c!.totalTargetYieldKg.toString(),
    floorPriceEtb: c!.guaranteedFloorPriceEtb.toString(),
    maturityDate: c!.maturityDate.toISOString(),
    fundedPercent: target > 0 ? committed / target : 0,
  };
}

export async function list() {
  const contracts = await prisma.contract.findMany({
    where: { status: { in: ['DRAFT', 'ACTIVE'] } },
    include: { investments: { select: { amountEtb: true } } },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });

  return contracts.map((c) => serialize(c, c.investments.length));
}

export async function detail(id: string) {
  const c = await prisma.contract.findUnique({
    where: { id },
    include: { investments: { select: { amountEtb: true } } },
  });
  if (!c) throw ApiError.notFound('Opportunity not found');
  return serialize(c, c.investments.length);
}
