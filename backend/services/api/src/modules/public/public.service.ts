import { prisma } from '@/config/prisma';

export async function stats() {
  const [contracts, farmers, escrows] = await Promise.all([
    prisma.contract.findMany({ select: { contractValueEtb: true, status: true } }),
    prisma.stakeholder.count({ where: { role: 'COMMERCIAL_FARMER' } }),
    prisma.escrow.findMany({ select: { totalDepositedEtb: true } }),
  ]);

  const totalFundedUsd = escrows.reduce(
    (s, e) => s + Number(e.totalDepositedEtb) / 55, // placeholder FX
    0,
  );
  const activeContracts = contracts.filter((c) => c.status === 'ACTIVE').length;
  const hectaresUnderContract = activeContracts * 1_500; // placeholder
  const forexGeneratedUsd = contracts
    .filter((c) => c.status === 'FULFILLED')
    .reduce((s, c) => s + Number(c.contractValueEtb) / 55, 0);

  return {
    totalFundedUsd: Math.round(totalFundedUsd),
    activeContracts,
    farmersReached: farmers,
    hectaresUnderContract,
    forexGeneratedUsd: Math.round(forexGeneratedUsd),
    jobsCreated: farmers * 2,
  };
}
