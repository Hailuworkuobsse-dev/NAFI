import { PrismaClient, Role } from '@prisma/client';
import { hashPassword } from '../src/utils/password';
import { generateNafiId, generateContractHash } from '../src/utils/nafiId';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // Create an institution first
  const institution = await prisma.institution.upsert({
    where: { code: 'NAFI-DEMO' },
    update: {},
    create: {
      name: 'NAFI Demo Institution',
      code: 'NAFI-DEMO',
      type: 'MICROFINANCE',
      country: 'KE',
      isVerified: true,
      isActive: true,
    },
  });

  console.log(`✅ Institution created: ${institution.name}`);

  // Define 12 test users with different roles (aligned with frontend)
  const roles: Role[] = [
    'DIASPORA_INVESTOR',
    'COMMERCIAL_BANK',
    'DBE_OFFICER',
    'NAFA_OFFICER',
    'INPUT_SUPPLIER',
    'COMMERCIAL_FARMER',
    'OFF_TAKER',
    'GOVERNMENT_REGULATOR',
    'DONOR',
    'NAFI_ADMIN',
    'COMPLIANCE_OFFICER',
    'ARBITRATOR',
  ];

  const passwordHash = await hashPassword('Password123!');

  for (let i = 0; i < roles.length; i++) {
    const role = roles[i];
    const email = `${role.toLowerCase().replace('_', '.')}@nafi.test`;
    
    await prisma.user.upsert({
      where: { email },
      update: {},
      create: {
        nafiId: generateNafiId(role),
        email,
        passwordHash,
        firstName: role.split('_')[0],
        lastName: `User ${i + 1}`,
        role,
        institutionId: role === 'COMMERCIAL_BANK' || role === 'DBE_OFFICER' || role === 'NAFA_OFFICER' ? institution.id : null,
        isVerified: true,
        isActive: true,
      },
    });

    console.log(`✅ User created: ${email} (${role})`);
  }

  // Create a demo contract
  const borrower = await prisma.user.findFirst({
    where: { role: 'COMMERCIAL_FARMER' },
  });

  if (borrower) {
    const contractHash = generateContractHash(`demo-contract-${Date.now()}`);
    
    await prisma.contract.create({
      data: {
        contractHash,
        nafiContractId: `NAFI-CNT-${Date.now()}`,
        title: 'Demo Agricultural Contract',
        description: 'A demonstration contract for smallholder farmers',
        principalAmount: 5000,
        interestRate: 8.5,
        termMonths: 12,
        status: 'ACTIVE',
        borrowerId: borrower.id,
        institutionId: institution.id,
        startDate: new Date(),
        maturityDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      },
    });

    console.log('✅ Demo contract created');
  }

  console.log('🎉 Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
