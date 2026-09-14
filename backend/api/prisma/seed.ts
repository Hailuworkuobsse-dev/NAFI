import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

import { generateContractHash, generateNafiId } from '../src/utils/nafiId.js';

const prisma = new PrismaClient();

async function main(): Promise<void> {
  console.log('▶ Seeding NAFI database…');

  const passwordHash = await bcrypt.hash('Password123', 10);

  const users = [
    { email: 'investor@nafi.et', role: 'DIASPORA_INVESTOR', name: 'Hanna Girma' },
    { email: 'farmer@nafi.et', role: 'COMMERCIAL_FARMER', name: 'Abebe Bekele' },
    { email: 'bank@nafi.et', role: 'COMMERCIAL_BANK', name: 'Dashen Bank Officer' },
    { email: 'dbe@nafi.et', role: 'DBE_OFFICER', name: 'DBE Officer' },
    { email: 'nafa@nafi.et', role: 'NAFA_OFFICER', name: 'NAFA Officer' },
    { email: 'supplier@nafi.et', role: 'INPUT_SUPPLIER', name: 'Seed Supplier' },
    { email: 'buyer@nafi.et', role: 'OFF_TAKER', name: 'Export Buyer' },
    { email: 'gov@nafi.et', role: 'GOVERNMENT_REGULATOR', name: 'MoA Regulator' },
    { email: 'donor@nafi.et', role: 'DONOR', name: 'EIB Program Officer' },
    { email: 'admin@nafi.et', role: 'NAFI_ADMIN', name: 'NAFI Admin' },
    { email: 'compliance@nafi.et', role: 'COMPLIANCE_OFFICER', name: 'Compliance Officer' },
    { email: 'arbitrator@nafi.et', role: 'ARBITRATOR', name: 'Arbitrator' },
  ] as const;

  const created: Record<string, string> = {};

  for (const u of users) {
    const existing = await prisma.stakeholder.findUnique({ where: { email: u.email } });
    if (existing) {
      created[u.role] = existing.id;
      continue;
    }

    const user = await prisma.stakeholder.create({
      data: {
        nafiId: generateNafiId(),
        email: u.email,
        passwordHash,
        fullName: u.name,
        role: u.role as never,
        countryCode: 'ET',
        locale: 'en',
      },
    });

    created[u.role] = user.id;
    console.log(`  ✓ ${u.email} (${u.role})`);
  }

  // Create a demo contract between farmer, bank, government witness
  const farmerId = created.COMMERCIAL_FARMER!;
  const bankId = created.COMMERCIAL_BANK!;
  const witnessId = created.GOVERNMENT_REGULATOR!;

  const existingContract = await prisma.contract.findFirst({
    where: { commercialFarmerId: farmerId },
  });

  if (!existingContract) {
    const contract = await prisma.contract.create({
      data: {
        targetCrop: 'Sesame',
        region: 'Amhara',
        regionCode: 'ET-AM',
        commercialFarmerId: farmerId,
        governmentWitnessId: witnessId,
        bankId,
        totalTargetYieldKg: '500000.00',
        guaranteedFloorPriceEtb: '45.50',
        contractValueEtb: '22750000.00',
        status: 'ACTIVE',
        maturityDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
        onChainHash: generateContractHash(),
        timeline: {
          create: [
            { type: 'CREATED', label: 'Contract created' },
            { type: 'SIGNED', label: 'Signed by FARMER' },
            { type: 'SIGNED', label: 'Signed by BANK' },
            { type: 'SIGNED', label: 'Signed by GOVERNMENT WITNESS' },
          ],
        },
        escrow: {
          create: {
            managingBankId: bankId,
            status: 'OPEN',
            isLocked: true,
            totalDepositedEtb: '2500000.00',
            balances: {
              create: [
                { currency: 'ETB', amount: '2500000.00' },
                { currency: 'USD', amount: '100000.00' },
              ],
            },
          },
        },
      },
    });

    console.log(`  ✓ Demo contract: ${contract.id}`);
  }

  console.log('✓ Seed complete');
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
