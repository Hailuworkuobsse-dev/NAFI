import { PrismaClient, Role } from '@prisma/client';
import { hash } from 'bcrypt';

const prisma = new PrismaClient();

const TEST_USERS = [
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
  { email: 'arbitrator@nafi.et', role: 'ARBITRATOR', name: 'Arbi Trator' },
] as const;

async function main() {
  const passwordHash = await hash('Password123', 10);
  let seq = 0;

  for (const user of TEST_USERS) {
    seq += 1;
    const [firstName, ...rest] = user.name.split(' ');
    await prisma.user.upsert({
      where: { email: user.email },
      update: {},
      create: {
        nafiId: `NAFI-TEST-${String(seq).padStart(6, '0')}`,
        email: user.email,
        passwordHash,
        firstName,
        lastName: rest.join(' ') || 'User',
        role: user.role as Role,
        isVerified: true,
        isActive: true,
      },
    });
  }

  // Seed sample contracts, escrows, inputs for E2E
  // ...

  console.log('✓ Test data seeded');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
