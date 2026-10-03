/**
 * NAFI — Comprehensive seed script with realistic Ethiopian data.
 *
 * Covers ALL 13 tables:
 *   Institution, User, Contract, Escrow, Investment, Opportunity,
 *   Input, Settlement, Collateral, Dispute, Notification, AuditLog
 *
 * Data reflects Ethiopian conditions:
 *   - Real regions/zones (Oromia, Amhara, Tigray, SNNPR/South Ethiopia, Sidama,
 *     Afar, Somali, Harari, Dire Dawa, Addis Ababa)
 *   - Common crops & value chains (teff, coffee, sesame, niger seed, wheat,
 *     maize, sorghum, barley, horticulture, dairy, poultry, honey)
 *   - Ethiopian banks/microfinance (CBE, Dashen, Awash, Abyssinia, Co-operative
 *     Bank of Oromia, Siinqee, OBEE, DECSI, OCSSCO), NAFIS/Naficdb, DBE
 *   - ETB & USD amounts, Ethiopian phone prefixes (+251 9xx / +251 7xx for
 *     Ethio Telecom), local names and paternal-name surnames
 *
 * Idempotent: re-running wipes generated rows (keeping nothing) and reseeds.
 */

import 'dotenv/config';
import {
  PrismaClient,
  Role,
  ContractStatus,
  EscrowStatus,
  InvestmentStatus,
  OpportunityStatus,
  InputType,
  SettlementStatus,
  CollateralType,
  DisputeStatus,
  NotificationType,
  AuditAction,
  TenantScope,
} from '@prisma/client';
import { createHash } from 'crypto';
import { hashPassword } from '../src/utils/password';

const prisma = new PrismaClient();

// ---------------------------------------------------------------------------
// Deterministic pseudo-random helpers (so seeds are reproducible)
// ---------------------------------------------------------------------------
let _seed = 20261003;
function rand(): number {
  // mulberry32
  _seed |= 0;
  _seed = (_seed + 0x6d2b79f5) | 0;
  let t = Math.imul(_seed ^ (_seed >>> 15), 1 | _seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}
const pick = <T>(arr: readonly T[]): T => {
  const v = arr[Math.floor(rand() * arr.length)];
  if (v === undefined) throw new Error('pick from empty array');
  return v;
};
const intBetween = (min: number, max: number): number =>
  Math.floor(rand() * (max - min + 1)) + min;
const money = (min: number, max: number): number =>
  Math.round((rand() * (max - min) + min) * 100) / 100;

const DAY = 24 * 60 * 60 * 1000;
const NOW = new Date('2026-10-03T12:00:00Z');
const daysAgo = (d: number) => new Date(NOW.getTime() - d * DAY);
const daysFromNow = (d: number) => new Date(NOW.getTime() + d * DAY);

function sha(s: string): string {
  return createHash('sha256').update(s).digest('hex');
}

// ---------------------------------------------------------------------------
// Reference counters for human-readable IDs
// ---------------------------------------------------------------------------
let contractSeq = 1000;
const nextContractId = () => `NAFI-CNT-2026-${String(++contractSeq).padStart(5, '0')}`;

// ---------------------------------------------------------------------------
// Ethiopian name pools
// ---------------------------------------------------------------------------
const MALE_FIRST = [
  'Abebe', 'Kebede', 'Dawit', 'Yonas', 'Solomon', 'Getachew', 'Mulugeta',
  'Tesfaye', 'Haile', 'Fikru', 'Bekele', 'Girma', 'Lemma', 'Tadesse',
  'Workneh', 'Alemyehun', 'Biruk', 'Eyob', 'Hailu', 'Kassahun', 'Mekonnen',
  'Negussie', 'Temesgen', 'Yohannes', 'Zerihun', 'Abadi', 'Assefa',
  'Biftu', 'Dereje', 'Elias', 'Fitsum', 'Gebre', 'Jemal', 'Lulseged',
  'Mestawet', 'Nahom', 'Samson', 'Tariku', 'Wondimagegn', 'Yared',
];
const FEMALE_FIRST = [
  'Almaz', 'Birtukan', 'Chaltu', 'Doroth', 'Eleni', 'Genet', 'Hanna',
  'Iqubazier', 'Kidan', 'Lulit', 'Meron', 'Nardos', 'Rahel', 'Saba',
  'Tsion', 'Wosen', 'Yeshi', 'Zenebech', 'Aster', 'Betelhem', 'Firehiwot',
  'Halima', 'Jamila', 'Kaltuma', 'Mekdes', 'Hiwot', 'Selam', 'Aman',
  'Befkaf', 'Etagegn', 'Frewoni', 'Hedilu', 'Mahlet', 'Sennait', 'Tigist',
  'Wezirow', 'Yolanda', 'Zinash', 'Adanech', 'Biddu',
];
// Ethiopians typically use [own name] + [father's name] (+ grandfather's).
const PATRONYMICS = [
  'Bekele', 'Girma', 'Mengesha', 'Wolde', 'Tadesse', 'Kebede', 'Alemu',
  'Bala', 'Hussein', 'Mohammed', 'Tesfaye', 'Deressa', 'Chanie', 'Asrat',
  'Wassie', 'Gebremedhin', 'Hailemariam', 'Kumsa', 'Libse', 'Mekonnen',
  'Nigussie', 'Solomon', 'Tamiru', 'Urago', 'Yimer', 'Zeleke', 'Feyisa',
  'Gadisa', 'Hamid', 'Juhar', 'Kedir', 'Legesse', 'Mamo', 'Nego',
];

function fullName(gender?: 'M' | 'F') {
  const g = gender ?? (rand() > 0.5 ? 'M' : 'F');
  const first = g === 'M' ? pick(MALE_FIRST) : pick(FEMALE_FIRST);
  const father = pick(PATRONYMICS);
  return `${first} ${father}`;
}

// ---------------------------------------------------------------------------
// Ethiopian geography
// ---------------------------------------------------------------------------
const ETH_REGIONS = [
  { region: 'Oromia', woredas: ['Adama', 'Bishoftu', 'Jimma', 'Nekemte', 'Shashamanne', 'Arsi Negele', 'Bale Robe', 'Ambo', 'Woliso', 'Tooto Qello'], towns: ['Adama', 'Bishoftu', 'Jimma', 'Nekemte', 'Robe', 'Asella', 'Ambo', 'Woliso'] },
  { region: 'Amhara', woredas: ['Machakel', 'Derashe', 'Fogera', 'Chilga', 'Bahir Dar Zuria', 'Estie', 'Dangila'], towns: ['Bahir Dar', 'Gondar', 'Debre Markos', 'Dessie', 'Mekanesa', 'Woldia'] },
  { region: 'Tigray', woredas: ['Tahtay Adiyabo', 'Laelay Maychew', 'Endamehoni', 'Korem', 'Abugida'], towns: ['Mekelle', 'Adigrat', 'Axum', 'Maychew', 'Hagere Selam'] },
  { region: 'South Ethiopia', woredas: ['Wolayita Sodo', 'Hawassa Zuria', 'Yirgachefe', 'Kochere', 'Bensho'], towns: ['Hawassa', 'Sodo', 'Arba Minch', 'Yirgachefe', 'Dilla'] },
  { region: 'Sidama', woredas: ['Hawassa Zuria', 'Yirgachefe', 'Bensa', 'Aleta Wondo'], towns: ['Hawassa', 'Yirgachefe', 'Aleta Wondo'] },
  { region: 'Central Ethiopia', woredas: ['Dugda Bora', 'Asasa', 'Adama Special'], towns: ['Adama', 'Dubti', 'Asela'] },
  { region: 'Afar', woredas: ['Awash', 'Dubti', 'Mille Kalu'], towns: ['Semera', 'Awash', 'Asayita'] },
  { region: 'Somali', woredas: ['Awbare', 'Kersa', 'Shinile'], towns: ['Jijiga', 'Gode', 'Haraganshe'] },
  { region: 'Harari', woredas: ['Harar City'], towns: ['Harar'] },
  { region: 'Dire Dawa', woredas: ['Dire Dawa', 'Legehare'], towns: ['Dire Dawa'] },
  { region: 'Addis Ababa', woredas: ['Bole', 'Yeka', 'Kolfe Keranio', 'Nifas Silk-Lafto', 'Akaki Kality'], towns: ['Addis Ababa'] },
];

// ---------------------------------------------------------------------------
// Institutions — banks, MFDs, unions, off-takers, suppliers, donors, agencies
// ---------------------------------------------------------------------------
interface InstSeed {
  name: string; code: string; type: string; city: string; verified: boolean;
}
const INSTITUTIONS: InstSeed[] = [
  { name: 'Commercial Bank of Ethiopia', code: 'CBE', type: 'COMMERCIAL_BANK', city: 'Addis Ababa', verified: true },
  { name: 'Dashen Bank S.C.', code: 'DASHEN', type: 'COMMERCIAL_BANK', city: 'Addis Ababa', verified: true },
  { name: 'Awash International Bank S.C.', code: 'AWASH', type: 'COMMERCIAL_BANK', city: 'Addis Ababa', verified: true },
  { name: 'Abyssinia Bank S.C.', code: 'ABYSSINIA', type: 'COMMERCIAL_BANK', city: 'Addis Ababa', verified: true },
  { name: 'Co-operative Bank of Oromia S.C.', code: 'CBO', type: 'COMMERCIAL_BANK', city: 'Adama', verified: true },
  { name: 'Siinqee Credit Guarantee & Financial Services S.C.', code: 'SIINQEE', type: 'MICROFINANCE', city: 'Adama', verified: true },
  { name: 'OCSSCO Microfinance Share Company', code: 'OCSSCO', type: 'MICROFINANCE', city: 'Bishoftu', verified: true },
  { name: 'DECSI — Development Credit & Savings Coop. Union', code: 'DECSI', type: 'MICROFINANCE', city: 'Bahir Dar', verified: true },
  { name: 'Obollo Gold Credit & Saving Coop. Union', code: 'OBEE', type: 'COOP_UNION', city: 'Goba', verified: true },
  { name: 'National Agricultural Finance Information Center (NAFIC)', code: 'NAFIC', type: 'GOVERNMENT_AGENCY', city: 'Addis Ababa', verified: true },
  { name: 'Ministry of Agriculture — NAFIS Program', code: 'MOA-NAFIS', type: 'GOVERNMENT_PROGRAM', city: 'Addis Ababa', verified: true },
  { name: 'Development Bank of Ethiopia', code: 'DBE', type: 'DEVELOPMENT_BANK', city: 'Addis Ababa', verified: true },
  { name: 'Ethiopian Commodity Exchange (ECX)', code: 'ECX', type: 'COMMODITY_EXCHANGE', city: 'Addis Ababa', verified: true },
  { name: 'Oromia Coffee Farmers Cooperative Union', code: 'OCFCU', type: 'COOP_UNION', city: 'Jimma', verified: true },
  { name: 'Sidama Coffee Farmers Cooperative Union', code: 'SCFCU', type: 'COOP_UNION', city: 'Hawassa', verified: true },
  { name: 'Ethiopian Oilseeds Processors Association', code: 'EOPA', type: 'OFF_TAKER_ASSOCIATION', city: 'Adama', verified: true },
  { name: 'Ethio Agri-Seeds PLC', code: 'ETHIOSEED', type: 'INPUT_SUPPLIER', city: 'Adama', verified: true },
  { name: 'Ethiopian Fertilizer Trading Enterprise', code: 'EFTE', type: 'INPUT_SUPPLIER', city: 'Addis Ababa', verified: true },
  { name: 'Meher Teff Processing PLC', code: 'MEHER-TEFF', type: 'OFF_TAKER', city: 'Debre Markos', verified: true },
  { name: 'Habesha Foods Manufacturing S.C.', code: 'HABESHA-FOOD', type: 'OFF_TAKER', city: 'Adama', verified: true },
  { name: 'Starlin Agri Export PLC', code: 'STARLIN', type: 'OFF_TAKER', city: 'Bishoftu', verified: false },
  { name: 'USAID Feed the Future Ethiopia', code: 'USAID-LIV3', type: 'DONOR', city: 'Addis Ababa', verified: true },
  { name: 'GIZ — Sustainable Rural Development Program', code: 'GIZ-SRD', type: 'DONOR', city: 'Addis Ababa', verified: true },
  { name: 'AGP-II (Grow Through Agriculture)', code: 'USAID-AGP2', type: 'DONOR', city: 'Addis Ababa', verified: true },
];

// Value-chain products common in Ethiopia
const VALUE_CHAINS = [
  { crop: 'Teff (Dukem variety)', unit: 'quintal', pricePerQuintalETB: 4800, region: 'Amhara' },
  { crop: 'Coffee (Washed Yirgacheffe G1)', unit: 'quintal', pricePerQuintalETB: 21000, region: 'Sidama' },
  { crop: 'Coffee (Natural Jimma Grade 4)', unit: 'quintal', pricePerQuintalETB: 15500, region: 'Oromia' },
  { crop: 'Humera Sesame (White)', unit: 'quintal', pricePerQuintalETB: 16500, region: 'Amhara' },
  { crop: 'Niger Seed (Nug)', unit: 'quintal', pricePerQuintalETB: 9200, region: 'Amhara' },
  { crop: 'Wheat (Kakaba variety)', unit: 'quintal', pricePerQuintalETB: 3700, region: 'Oromia' },
  { crop: 'Maize', unit: 'quintal', pricePerQuintalETB: 2900, region: 'Oromia' },
  { crop: 'Sorghum (Milk-white)', unit: 'quintal', pricePerQuintalETB: 2600, region: 'Tigray' },
  { crop: 'Barley (Nuraga-D)', unit: 'quintal', pricePerQuintalETB: 3200, region: 'Tigray' },
  { crop: 'Cut Flowers (Roses, export)', unit: 'stem-box', pricePerQuintalETB: 12000, region: 'Central Ethiopia' },
  { crop: 'Avocado (Hass, export)', unit: 'quintal', pricePerQuintalETB: 7800, region: 'South Ethiopia' },
  { crop: 'Chilli (Local)', unit: 'quintal', pricePerQuintalETB: 9500, region: 'Afar' },
  { crop: 'Onion', unit: 'quintal', pricePerQuintalETB: 3100, region: 'Oromia' },
  { crop: 'Potato', unit: 'quintal', pricePerQuintalETB: 2400, region: 'Amhara' },
  { crop: 'Honey (Forest, in frames)', unit: 'kg', pricePerQuintalETB: 1400, region: 'Oromia' },
  { crop: 'Dairy (Raw milk aggregation)', unit: 'liter', pricePerQuintalETB: 62, region: 'Central Ethiopia' },
  { crop: 'Poultry (Layers & broilers)', unit: 'bird', pricePerQuintalETB: 900, region: 'Addis Ababa' },
  { crop: 'Sheep & Goat Fattening', unit: 'head', pricePerQuintalETB: 6500, region: 'Afar' },
  { crop: 'Enset (Kocho)', unit: 'quintal', pricePerQuintalETB: 1900, region: 'South Ethiopia' },
  { crop: 'Mango (Apple variety)', unit: 'quintal', pricePerQuintalETB: 4200, region: 'Central Ethiopia' },
];

// ---------------------------------------------------------------------------
// Users
// ---------------------------------------------------------------------------
interface UserSeed {
  email: string; role: Role; institutionCode?: string; gender?: 'M' | 'F';
}
const ROLE_PREFIX: Record<Role, string> = {
  DIASPORA_INVESTOR: 'DIA', COMMERCIAL_BANK: 'BNK', DBE_OFFICER: 'DBE',
  NAFA_OFFICER: 'NFA', INPUT_SUPPLIER: 'SUP', COMMERCIAL_FARMER: 'FRM',
  OFF_TAKER: 'OTK', GOVERNMENT_REGULATOR: 'GOV', DONOR: 'DNR',
  NAFI_ADMIN: 'ADM', COMPLIANCE_OFFICER: 'CMP', ARBITRATOR: 'ARB',
};

const USERS: UserSeed[] = [];

// Demo/test accounts aligned with frontend login shortcuts
const DEMO_ROLES: Role[] = [
  'DIASPORA_INVESTOR', 'COMMERCIAL_BANK', 'DBE_OFFICER', 'NAFA_OFFICER',
  'INPUT_SUPPLIER', 'COMMERCIAL_FARMER', 'OFF_TAKER', 'GOVERNMENT_REGULATOR',
  'DONOR', 'NAFI_ADMIN', 'COMPLIANCE_OFFICER', 'ARBITRATOR',
];
for (const role of DEMO_ROLES) {
  USERS.push({
    email: `${role.toLowerCase().replace('_', '.')}@nafi.test`,
    role,
    institutionCode:
      role === 'COMMERCIAL_BANK' ? 'CBE' :
      role === 'DBE_OFFICER' ? 'DBE' :
      role === 'NAFA_OFFICER' ? 'NAFIC' :
      role === 'INPUT_SUPPLIER' ? 'ETHIOSEED' :
      role === 'OFF_TAKER' ? 'MEHER-TEFF' :
      role === 'DONOR' ? 'USAID-LIV3' : undefined,
  });
}

// Diaspora investors (Ethiopians abroad — US, UAE, Saudi, Israel, UK, Germany…)
for (let i = 0; i < 22; i++) {
  USERS.push({
    email: `diaspora${i + 1}@${pick(['gmail.com', 'yahoo.com', 'outlook.com'])}`,
    role: 'DIASPORA_INVESTOR',
    gender: rand() > 0.5 ? 'M' : 'F',
  });
}

// Commercial farmers across regions
for (let i = 0; i < 40; i++) {
  USERS.push({ email: `farmer.${i + 1}@ethiofarm.et`, role: 'COMMERCIAL_FARMER', gender: rand() > 0.35 ? 'M' : 'F' });
}
// Input suppliers
for (let i = 0; i < 10; i++) {
  USERS.push({ email: `supplier.${i + 1}@ethioagri.et`, role: 'INPUT_SUPPLIER', institutionCode: pick(['ETHIOSEED', 'EFTE']), gender: rand() > 0.5 ? 'M' : 'F' });
}
// Off-takers
for (let i = 0; i < 10; i++) {
  USERS.push({ email: `offtaker.${i + 1}@agroexport.et`, role: 'OFF_TAKER', institutionCode: pick(['MEHER-TEFF', 'HABESHA-FOOD', 'ECX', 'EOPA']), gender: rand() > 0.5 ? 'M' : 'F' });
}
// Bank & MFI staff
const BANK_DOMAINS: Record<string, string> = {
  CBE: 'cbe.com.et', DASHEN: 'dashenbank.com.et', AWASH: 'awashbank.com.et',
  ABYSSINIA: 'abyssinia.bank', CBO: 'cborbank.et', SIINQEE: 'siinqee.com.et',
  OCSSCO: 'ocssco.com.et',
};
const BANK_CODES = Object.keys(BANK_DOMAINS);
for (let i = 0; i < 12; i++) {
  const code = pick(BANK_CODES);
  USERS.push({ email: `bank.${i + 1}@${BANK_DOMAINS[code]}`, role: 'COMMERCIAL_BANK', institutionCode: code, gender: rand() > 0.5 ? 'M' : 'F' });
}
// DBE officers
for (let i = 0; i < 4; i++) USERS.push({ email: `dbe.officer${i + 1}@dbe.gov.et`, role: 'DBE_OFFICER', institutionCode: 'DBE' });
// NAFI / NAFIC officers
for (let i = 0; i < 6; i++) USERS.push({ email: `nafis.officer${i + 1}@nafis.gov.et`, role: 'NAFA_OFFICER', institutionCode: 'NAFIC' });
// Government regulators
for (let i = 0; i < 4; i++) USERS.push({ email: `regulator${i + 1}@moa.gov.et`, role: 'GOVERNMENT_REGULATOR', institutionCode: 'MOA-NAFIS' });
// Donor program staff
for (let i = 0; i < 4; i++) USERS.push({ email: `donor.staff${i + 1}@usaid-liv3-et.org`, role: 'DONOR', institutionCode: pick(['USAID-LIV3', 'GIZ-SRD', 'USAID-AGP2']) });
// Compliance officers
for (let i = 0; i < 3; i++) USERS.push({ email: `compliance${i + 1}@nafi.gov.et`, role: 'COMPLIANCE_OFFICER' });
// Arbitrators (retired judges / sharia & customary dispute elders incl. Jaarsa)
for (let i = 0; i < 3; i++) USERS.push({ email: `arbitrator${i + 1}@gcc.gov.et`, role: 'ARBITRATOR' });

// Deduplicate emails
{
  const seen = new Set<string>();
  for (let i = USERS.length - 1; i >= 0; i--) {
    const e = USERS[i]!.email;
    if (seen.has(e)) USERS.splice(i, 1);
    else seen.add(e);
  }
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
async function main() {
  console.log('🌱 Starting comprehensive Ethiopian seed...');

  // --- wipe (order matters for FKs) ---
  await prisma.auditLog.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.dispute.deleteMany();
  await prisma.collateral.deleteMany();
  await prisma.settlement.deleteMany();
  await prisma.input.deleteMany();
  await prisma.investment.deleteMany();
  await prisma.escrow.deleteMany();
  await prisma.contract.deleteMany();
  await prisma.opportunity.deleteMany();
  await prisma.user.deleteMany();
  await prisma.institution.deleteMany();
  console.log('🧹 Cleared existing data');

  // ----------------------------- Institutions ------------------------------
  const instByCode = new Map<string, { id: string; name: string }>();
  for (const ins of INSTITUTIONS) {
    const rec = await prisma.institution.create({
      data: {
        name: ins.name,
        code: ins.code,
        type: ins.type,
        country: 'ET',
        isVerified: ins.verified,
        isActive: true,
      },
    });
    instByCode.set(ins.code, { id: rec.id, name: rec.name });
  }
  console.log(`✅ Institutions: ${INSTITUTIONS.length}`);

  // --------------------------------- Users ---------------------------------
  const passwordHash = await hashPassword('Password123!');
  const users: { id: string; nafiId: string; email: string; role: Role; name: string; institutionId: string | null }[] = [];

  for (let i = 0; i < USERS.length; i++) {
    const u = USERS[i]!;
    const name = u.gender ? fullName(u.gender) : fullName();
    const [firstName = name, ...rest] = name.split(' ');
    const lastName = rest.join(' ');
    const isDiaspora = u.role === 'DIASPORA_INVESTOR';
    const phone = isDiaspora
      ? `+${intBetween(1, 99)}${intBetween(2000000000, 9999999999)}`
      : `+2519${String(intBetween(10000000, 99999999))}`;

    const rec = await prisma.user.create({
      data: {
        nafiId: `NAFI-${ROLE_PREFIX[u.role]}-${(NOW.getTime() + i).toString(36).toUpperCase()}-${sha(u.email).slice(0, 8).toUpperCase()}`,
        email: u.email,
        phone,
        passwordHash,
        firstName,
        lastName,
        role: u.role,
        institutionId: u.institutionCode ? instByCode.get(u.institutionCode)?.id ?? null : null,
        isVerified: rand() > 0.15,
        isActive: rand() > 0.05,
        lastLoginAt: rand() > 0.2 ? daysAgo(intBetween(0, 45)) : null,
      },
    });
    users.push({ id: rec.id, nafiId: rec.nafiId, email: rec.email, role: rec.role, name: `${firstName} ${lastName}`, institutionId: rec.institutionId });
  }
  console.log(`✅ Users: ${users.length}`);

  const byRole = (r: Role) => users.filter((u) => u.role === r);
  const farmers = byRole('COMMERCIAL_FARMER');
  const diaspora = byRole('DIASPORA_INVESTOR');
  const banks = byRole('COMMERCIAL_BANK');
  const suppliers = byRole('INPUT_SUPPLIER');
  const offtakers = byRole('OFF_TAKER');
  const officers = [...byRole('NAFA_OFFICER'), ...byRole('DBE_OFFICER')];
  const admins = byRole('NAFI_ADMIN');
  const compliance = byRole('COMPLIANCE_OFFICER');
  const arbitrators = byRole('ARBITRATOR');
  const donors = byRole('DONOR');

  // ------------------------------ Opportunities ----------------------------
  const oppTitles = [
    'Seasonal Input Credit for Teff Smallholders — Amhara',
    'Coffee Renovation & Cherry Washing Stations — Sidama',
    'Sesame Aggregation for Export — Humera Corridor',
    'Dairy Cold Chain & Bulk Milk Coolers — Central Ethiopia',
    'Poultry Layer Project for Women Groups — Bishoftu',
    'Nug (Niger Seed) Consolidation — North Shewa',
    'Greenhouse Vegetable Farm — Ziway / Adama Belt',
    'Honey Forest Cooperative Processing — Bench Sheko',
    'Smallholder Irrigation Onion Scheme — Awash Valley',
    'Wheat Mechanization Cluster — Bale Arsi',
    'Sheep & Goat Fattening for Eid Markets — Afar',
    'Mango Orchard Rehabilitation — Lower Awash',
    'Enset Value Addition Pilot — Wolayita',
    'Spices Processing Factory — Harar',
    'Barley Malting Supply Contract — Tigray Highlands',
    'Cut Flowers Growth Capital — Ziway',
    'Agri-Machinery Leasing Pool — Oromia',
    'School Feeding Legume Supply — South Ethiopia',
  ];
  const opportunities = [];
  for (let i = 0; i < oppTitles.length; i++) {
    const vc = pick(VALUE_CHAINS);
    const target = money(25000, 450000);
    const statusPool: OpportunityStatus[] = ['PUBLISHED', 'PUBLISHED', 'PUBLISHED', 'FUNDED', 'CLOSED', 'ARCHIVED', 'DRAFT'];
    const st = pick(statusPool);
    const raised = st === 'DRAFT' ? 0 : st === 'FUNDED' ? target : st === 'CLOSED' ? money(target * 0.6, target) : money(0, target * 0.9);
    const pub = st === 'DRAFT' ? null : daysAgo(intBetween(20, 200));
    const rec = await prisma.opportunity.create({
      data: {
        title: oppTitles[i]!,
        description:
          `Financing for ${vc.crop.toLowerCase()} production under the NAFIS model. ` +
          `Target area covers smallholder clusters with bundled inputs, extension services via woreda DAs, ` +
          `off-taker offtake agreements, and escrow-protected disbursement. Estimated yield uplift 25–40%.`,
        targetAmount: target,
        raisedAmount: Math.min(raised, target),
        minInvestment: pick([100, 250, 500, 1000]),
        status: st,
        publishedAt: pub,
        closesAt: st === 'DRAFT' || st === 'CLOSED' || st === 'ARCHIVED' ? (pub ? daysFromNow(intBetween(-60, 120)) : null) : daysFromNow(intBetween(10, 150)),
        institutionId: pick([...instByCode.values()]).id,
      },
    });
    opportunities.push(rec);
  }
  console.log(`✅ Opportunities: ${opportunities.length}`);

  // -------------------------------- Contracts -------------------------------
  const STATUSES: { s: ContractStatus; w: number }[] = [
    { s: 'ACTIVE', w: 40 }, { s: 'COMPLETED', w: 12 }, { s: 'PENDING_REVIEW', w: 12 },
    { s: 'DRAFT', w: 8 }, { s: 'APPROVED', w: 8 }, { s: 'DEFAULTED', w: 7 },
    { s: 'SUSPENDED', w: 5 }, { s: 'REJECTED', w: 4 }, { s: 'CANCELLED', w: 4 },
  ];
  const weightedStatus = (): ContractStatus => {
    const total = STATUSES.reduce((a, b) => a + b.w, 0);
    let x = rand() * total;
    for (const st of STATUSES) { if ((x -= st.w) <= 0) return st.s; }
    return 'ACTIVE';
  };

  const contracts = [];
  const NUM_CONTRACTS = 60;
  for (let i = 0; i < NUM_CONTRACTS; i++) {
    const farmer = pick(farmers);
    const vc = pick(VALUE_CHAINS);
    const regionInfo = pick(ETH_REGIONS);
    const hectares = pick([0.5, 1, 1.5, 2, 3, 5, 8, 10, 15, 25]);
    // principal in ETB — typical NAFIS loans run ~15,000 to 3,000,000 Birr
    const principalETB = Math.round(money(15000, 2_500_000) / 500) * 500;
    const termMonths = pick([3, 4, 6, 9, 12, 12, 12, 18, 24]);
    const status = weightedStatus();
    const startOffset = intBetween(30, 400);
    const startDate = status === 'DRAFT' || status === 'PENDING_REVIEW' ? null : daysAgo(startOffset);
    const maturityDate = startDate ? new Date(startDate.getTime() + termMonths * 30 * DAY) : null;
    const cid = nextContractId();
    const instCode = pick(['CBE', 'DASHEN', 'AWASH', 'ABYSSINIA', 'CBO', 'SIINQEE', 'OCSSCO', 'DECSI', 'DBE']);

    const rec = await prisma.contract.create({
      data: {
        contractHash: sha(`${cid}:${farmer.id}:${principalETB}`),
        nafiContractId: cid,
        title: `${vc.crop} — ${regionInfo.region} (${hectares} ha)`,
        description:
          `NAFIS-style input credit & output guarantee contract for ${farmer.name}. ` +
          `Commodity: ${vc.crop}. Location: ${pick(regionInfo.towns)}, ${regionInfo.region} Region, woreda ${pick(regionInfo.woredas)}. ` +
          `Area covered: ${hectares} ha. Bundled services: improved seed, DAP/Urea fertilizer via EFTE, agronomy support from development agents, ` +
          `harvest aggregation and ECX-certified grading. Repayment in-kind or cash at harvest.`,
        principalAmount: principalETB,
        interestRate: pick([11.0, 12.0, 12.5, 13.0, 14.0, 14.5, 15.0, 16.0]),
        termMonths,
        status,
        borrowerId: farmer.id,
        institutionId: instByCode.get(instCode)?.id ?? null,
        startDate,
        maturityDate,
      },
    });
    contracts.push(rec);
  }
  console.log(`✅ Contracts: ${contracts.length}`);

  // ---------------------------------- Inputs --------------------------------
  const INPUT_DEFS: { type: InputType; desc: string; unit: string; lo: number; hi: number; supplier: string }[] = [
    { type: 'SEEDS', desc: 'Improved Teff seed (Dukem)', unit: 'quintal', lo: 2, hi: 30, supplier: 'Ethio Agri-Seeds PLC' },
    { type: 'SEEDS', desc: 'Wheat seed (Kakaba)', unit: 'quintal', lo: 3, hi: 40, supplier: 'Ethio Agri-Seeds PLC' },
    { type: 'SEEDS', desc: 'Hybrid Maize seed (BH-661)', unit: 'kg', lo: 25, hi: 400, supplier: 'Selamu Seeds Plc' },
    { type: 'SEEDS', desc: 'Niger seed (Nug) improved', unit: 'kg', lo: 10, hi: 150, supplier: 'Ethio Agri-Seeds PLC' },
    { type: 'FERTILIZER', desc: 'DAP Blended Fertilizer (NPSB)', unit: 'quintal', lo: 5, hi: 120, supplier: 'Ethiopian Fertilizer Trading Enterprise' },
    { type: 'FERTILIZER', desc: 'Urea (46% N)', unit: 'quintal', lo: 4, hi: 100, supplier: 'Ethiopian Fertilizer Trading Enterprise' },
    { type: 'FERTILIZER', desc: 'Organic compost / bio-slurry', unit: 'quintal', lo: 10, hi: 200, supplier: 'Woreda Cooperatives Union' },
    { type: 'EQUIPMENT', desc: 'Two-wheel tractor (25 HP)', unit: 'unit', lo: 1, hi: 2, supplier: 'METEC / Sad Insect Agri' },
    { type: 'EQUIPMENT', desc: 'Knapsack sprayer', unit: 'unit', lo: 2, hi: 25, supplier: 'AgriEquip Import' },
    { type: 'EQUIPMENT', desc: 'Solar water pump kit', unit: 'kit', lo: 1, hi: 4, supplier: 'SunCulture Ethiopia' },
    { type: 'TRAINING', desc: 'Good Agronomy Practices training', unit: 'day', lo: 1, hi: 6, supplier: 'BADE / Regional TVET' },
    { type: 'TRAINING', desc: 'Post-harvest handling & grading', unit: 'day', lo: 1, hi: 4, supplier: 'ECX Academy' },
    { type: 'INSURANCE', desc: 'Index-based weather insurance', unit: 'ha', lo: 1, hi: 25, supplier: 'Nyala Insurance / INSWIM' },
    { type: 'LOGISTICS', desc: 'Harvest haulage to aggregation center', unit: 'trip', lo: 2, hi: 20, supplier: 'Selam Bus Freight' },
  ];
  let inputSeq = 0;
  for (const c of contracts) {
    if (c.status === 'DRAFT') continue;
    const n = intBetween(1, 4);
    for (let k = 0; k < n; k++) {
      const def = pick(INPUT_DEFS);
      const qty = intBetween(def.lo, def.hi);
      const unitPrice =
        def.type === 'EQUIPMENT' && def.unit === 'unit' && def.desc.includes('tractor')
          ? money(350000, 650000)
          : money(800, 15000);
      const delivered = ['ACTIVE', 'COMPLETED', 'DEFAULTED', 'SUSPENDED'].includes(c.status)
        ? c.startDate ? new Date(c.startDate.getTime() + intBetween(5, 45) * DAY) : null
        : null;
      await prisma.input.create({
        data: {
          inputRef: `NAFI-INP-${String(++inputSeq).padStart(5, '0')}`,
          contractId: c.id,
          type: def.type,
          description: def.desc,
          quantity: qty,
          unit: def.unit,
          unitPrice,
          totalPrice: Math.round(qty * unitPrice * 100) / 100,
          supplier: def.supplier,
          deliveredAt: delivered,
          verifiedAt: delivered && rand() > 0.2 ? new Date(delivered.getTime() + DAY) : null,
        },
      });
    }
  }
  console.log('✅ Inputs seeded');

  // --------------------------------- Escrows --------------------------------
  let escrowSeq = 0;
  for (const c of contracts) {
    if (['DRAFT', 'REJECTED', 'CANCELLED'].includes(c.status)) continue;
    const count = rand() > 0.75 ? 2 : 1;
    for (let k = 0; k < count; k++) {
      const usd = rand() > 0.6; // diaspora funding often USD
      const amount = usd
        ? money(500, 25000)
        : Math.round((Number(c.principalAmount) * (0.3 + rand() * 0.7)) / 100) * 100;
      let status: EscrowStatus = 'PENDING';
      if (c.status === 'COMPLETED') status = pick<EscrowStatus>(['DISBURSED', 'CLOSED']);
      else if (c.status === 'DEFAULTED') status = pick<EscrowStatus>(['FROZEN', 'REFUNDED', 'DISBURSED']);
      else if (c.status === 'SUSPENDED') status = 'FROZEN';
      else if (c.status === 'ACTIVE') status = pick<EscrowStatus>(['FUNDED', 'DISBURSED', 'FUNDED']);
      else if (c.status === 'APPROVED') status = 'PENDING';
      await prisma.escrow.create({
        data: {
          escrowRef: `NAFI-ESC-2026-${String(++escrowSeq).padStart(5, '0')}`,
          contractId: c.id,
          amount,
          currency: usd ? 'USD' : 'ETB',
          status,
          fundedAt: status !== 'PENDING' ? c.startDate ?? daysAgo(intBetween(10, 100)) : null,
          disbursedAt: status === 'DISBURSED' || status === 'CLOSED' ? daysAgo(intBetween(1, 60)) : null,
          refundAddress: status === 'REFUNDED' ? `tel:+2519${intBetween(10000000, 99999999)}` : null,
        },
      });
    }
  }
  console.log('✅ Escrows seeded');

  // ------------------------------- Investments ------------------------------
  let invSeq = 0;
  for (const c of contracts) {
    if (!['ACTIVE', 'COMPLETED', 'DEFAULTED', 'SUSPENDED'].includes(c.status)) continue;
    const n = intBetween(1, 5);
    for (let k = 0; k < n; k++) {
      const investor = pick(diaspora.length ? diaspora : users);
      const amount = money(100, 20000);
      const shares = Math.round(amount * 0.95 * 10000) / 10000;
      const status: InvestmentStatus =
        c.status === 'COMPLETED' ? pick<InvestmentStatus>(['PAID_OUT', 'CONFIRMED']) :
        c.status === 'DEFAULTED' ? pick<InvestmentStatus>(['WRITTEN_OFF', 'ACTIVE']) :
        pick<InvestmentStatus>(['ACTIVE', 'CONFIRMED', 'PENDING']);
      await prisma.investment.create({
        data: {
          investmentRef: `NAFI-INV-2026-${String(++invSeq).padStart(5, '0')}`,
          contractId: c.id,
          investorId: investor.id,
          amount,
          shares,
          status,
          confirmedAt: status === 'PENDING' ? null : daysAgo(intBetween(5, 200)),
          payoutAddress: rand() > 0.5 ? `CBE-Acc-${intBetween(1000000, 9999999)}` : `wallet:${sha(investor.email).slice(0, 24)}`,
        },
      });
    }
  }
  console.log('✅ Investments seeded');

  // ------------------------------- Settlements ------------------------------
  let setSeq = 0;
  for (const c of contracts) {
    if (['DRAFT', 'REJECTED', 'CANCELLED'].includes(c.status)) continue;
    const months = c.termMonths;
    const numInstallments = Math.max(1, Math.min(4, Math.ceil(months / 6)));
    const principal = Number(c.principalAmount);
    const rate = Number(c.interestRate);
    const totalDue = Math.round(principal * (1 + rate / 100) * (months / 12) * 100) / 100;
    const per = Math.round((totalDue / numInstallments) * 100) / 100;
    for (let m = 0; m < numInstallments; m++) {
      const due = new Date((c.startDate ?? daysAgo(180)).getTime() + ((m + 1) * months / numInstallments) * 30 * DAY);
      let status: SettlementStatus;
      if (due < NOW) {
        if (c.status === 'DEFAULTED') status = pick<SettlementStatus>(['FAILED', 'PENDING', 'REVERSED']);
        else status = pick<SettlementStatus>(['COMPLETED', 'COMPLETED', 'COMPLETED', 'PROCESSING']);
      } else {
        status = 'PENDING';
      }
      const method = pick(['CBE Birr', 'Telebirr', 'Bank Transfer', 'Cash at Branch', 'ECX Offset', 'M-Pesa (Ethio)']);
      await prisma.settlement.create({
        data: {
          settlementRef: `NAFI-SET-2026-${String(++setSeq).padStart(5, '0')}`,
          contractId: c.id,
          amount: per,
          type: m === numInstallments - 1 ? 'FINAL_PRINCIPAL_PLUS_INTEREST' : 'INSTALLMENT',
          status,
          dueDate: due,
          paidAt: status === 'COMPLETED' ? new Date(due.getTime() - intBetween(-3, 10) * DAY) : null,
          paymentMethod: status === 'COMPLETED' || status === 'PROCESSING' ? method : null,
          transactionRef: status === 'COMPLETED' ? `${(method.split(' ')[0] ?? 'TXN').toUpperCase()}-${sha(`${c.id}${m}`).slice(0, 12).toUpperCase()}` : null,
        },
      });
    }
  }
  console.log('✅ Settlements seeded');

  // -------------------------------- Collateral ------------------------------
  let colSeq = 0;
  const COL_DESCS: { t: CollateralType; d: () => string }[] = [
    { t: 'LAND', d: () => `Use-right certificate for ${pick([2, 3, 5, 8, 10])} ha farmland in ${pick(pick(ETH_REGIONS).towns)} (holding no. ${intBetween(10000, 99999)})` },
    { t: 'LIVESTOCK', d: () => `${pick([5, 8, 12, 20, 30])} head of ${pick(['Boran cattle', 'Highland sheep', 'Horror goats', 'Equine mules'])}, ear-tagged & vet-registered` },
    { t: 'EQUIPMENT', d: () => pick(['Two-wheel tractor + trailer', 'Water pump set', 'Shellers (2 units)', 'Rotary tiller']) },
    { t: 'INVENTORY', d: () => `${pick([40, 80, 150, 300])} quintal ${pick(['teff', 'wheat', 'sesame', 'niger seed'])} stored at cooperative warehouse (receipt #${intBetween(1000, 9999)})` },
    { t: 'RECEIVABLES', d: () => `Off-take assignment — invoice from ${pick(['Habesha Foods', 'Meher Teff PLC', 'ECX broker house', 'Starlin Agri Export'])}` },
    { t: 'GUARANTEE', d: () => `Third-party guarantee by ${fullName()} (Kebele ID ${intBetween(100000, 999999)})` },
    { t: 'OTHER', d: () => pick(['Motorbike (Bajaj) plate ' + intBetween(10000, 99999), 'Warehouse structure title', 'Deposit account pledge']) },
  ];
  for (const c of contracts) {
    if (['DRAFT', 'REJECTED'].includes(c.status)) continue;
    const n = rand() > 0.6 ? 2 : 1;
    for (let k = 0; k < n; k++) {
      const cd = pick(COL_DESCS);
      const verified = rand() > 0.25;
      await prisma.collateral.create({
        data: {
          collateralRef: `NAFI-COL-2026-${String(++colSeq).padStart(5, '0')}`,
          contractId: c.id,
          type: cd.t,
          description: cd.d(),
          estimatedValue: Math.round(Number(c.principalAmount) * (1.1 + rand() * 0.8)),
          verified,
          verifiedBy: verified ? pick(officers.concat(compliance)).name : null,
          verifiedAt: verified ? daysAgo(intBetween(10, 200)) : null,
          documents: JSON.stringify([
            { name: 'holding_certificate.pdf', size_kb: intBetween(120, 900) },
            { name: 'kebele_id.jpg', size_kb: intBetween(60, 300) },
            ...(cd.t === 'LIVESTOCK' ? [{ name: 'vaccination_record.pdf' }] : []),
          ]),
        },
      });
    }
  }
  console.log('✅ Collateral seeded');

  // --------------------------------- Disputes -------------------------------
  const DISPUTE_REASONS = [
    ['Late delivery of DAP fertilizer', 'Inputs arrived after the belg planting window closed, reducing expected yield by an estimated 30%. Farmer requests partial compensation.'],
    ['Quality grade disagreement at ECX', 'Off-taker rejected lot as Grade 3 while cooperative samples tested Grade 2. Awaiting arbitration lab re-test.'],
    ['Escrow disbursement delay', 'Diaspora investor funds cleared but disbursement to farmer delayed 12 days pending KYC re-check.'],
    ['Side-selling allegation', 'Farmer allegedly sold produce outside the contract off-taker. Cooperative demands penalty clause enforcement.'],
    ['Livestock collateral valuation dispute', 'Estimated value of Boran herd disputed after drought-related condition loss.'],
    ['Double-registration claim', 'Same land use-right certificate appears attached to two contracts.'],
    ['Payment via Telebirr not reflected', 'Settlement marked FAILED though Telebirr statement shows debit on due date.'],
    ['Force majeure — hail damage', 'Hailstorm destroyed 60% of wheat near Sululta; farmer invokes force-majeure clause.'],
    ['Insurance index payout contested', 'Rainfall index triggered but insurer disputes station data quality.'],
    ['Unilateral suspension by bank', 'Branch suspended active facility citing internal audit; borrower seeks reinstatement.'],
  ];
  const disputedContracts = contracts.filter((c) => ['ACTIVE', 'DEFAULTED', 'SUSPENDED', 'COMPLETED'].includes(c.status));
  let dispSeq = 0;
  for (let i = 0; i < 14; i++) {
    const c = pick(disputedContracts);
    const initiator = pick([c.borrowerId, ...banks.map(b => b.id), ...diaspora.map(d => d.id)]);
    const reasonPair = pick(DISPUTE_REASONS);
    const reasonTitle = reasonPair[0]!;
    const reasonBody = reasonPair[1]!;
    const status = pick<DisputeStatus>(['OPEN', 'UNDER_REVIEW', 'MEDIATION', 'ARBITRATION', 'RESOLVED', 'RESOLVED', 'ESCALATED', 'CLOSED']);
    const resolved = status === 'RESOLVED' || status === 'CLOSED';
    await prisma.dispute.create({
      data: {
        disputeRef: `NAFI-DSP-2026-${String(++dispSeq).padStart(4, '0')}`,
        contractId: c.id,
        initiatedBy: initiator,
        reason: reasonTitle,
        description: reasonBody,
        status,
        resolution: resolved ? pick([
          'Mediated settlement: 15% price adjustment, installment rescheduled to next harvest.',
          'ECX lab re-grade confirmed Grade 2; off-taker to pay difference within 10 working days.',
          'Force majeure accepted; loan extended one season, insurance claim filed.',
          'Partial refund released from escrow to investor; contract terminated without fault.',
          'Claim dismissed — evidence insufficient; parties reminded of appeal window (30 days).',
        ]) : null,
        resolvedAt: resolved ? daysAgo(intBetween(1, 90)) : null,
        resolvedBy: resolved ? pick(arbitrators.concat(officers)).name : null,
      },
    });
  }
  console.log('✅ Disputes seeded');

  // ------------------------------ Notifications -----------------------------
  const NOTIF_TEMPLATES: { type: NotificationType; title: string; msg: (who: string) => string }[] = [
    { type: 'PAYMENT_DUE', title: 'Installment due in 7 days', msg: (w) => `Dear ${w}, an installment on your NAFIS contract is due within 7 days. Please fund your account via CBE Birr or Telebirr.` },
    { type: 'PAYMENT_RECEIVED', title: 'Payment received', msg: () => 'Your repayment was received and matched to the contract. Thank you for keeping your account current.' },
    { type: 'CONTRACT_UPDATE', title: 'Contract status changed to ACTIVE', msg: (w) => `${w}, your input-credit contract has been activated after escrow funding confirmation.` },
    { type: 'CONTRACT_UPDATE', title: 'Collateral verification pending', msg: () => 'A field officer will visit to verify livestock collateral next week (ear-tag check).' },
    { type: 'DISPUTE_UPDATE', title: 'Dispute moved to MEDIATION', msg: () => 'The dispute concerning your contract has entered mediation. Both parties should upload supporting documents.' },
    { type: 'ALERT', title: 'Escrow frozen pending compliance review', msg: () => 'Escrow balance temporarily frozen following a compliance flag. No action required yet.' },
    { type: 'WARNING', title: 'KYC expiring', msg: (w) => `${w}, your Kebele ID / passport KYC expires in 30 days. Please renew to keep investing.` },
    { type: 'INFO', title: 'New opportunity: Dairy cold chain — Central Ethiopia', msg: () => 'A new escrow-backed opportunity matching remittance-to-investment is open for diaspora investors.' },
    { type: 'INFO', title: 'Coffee cherry collection opens this week', msg: () => 'Washing stations in Yirgachefe begin cherry collection. Check your aggregated contract schedule.' },
    { type: 'SYSTEM', title: 'Scheduled maintenance Sunday 02:00 EAT', msg: () => 'Platform maintenance window: reports module unavailable for ~2 hours.' },
    { type: 'PAYMENT_RECEIVED', title: 'Dividend payout completed', msg: () => 'Your share of harvest proceeds has been paid out to your linked CBE account.' },
    { type: 'ALERT', title: 'Missed settlement — DEFAULT risk', msg: () => 'A settlement passed its grace period. The contract may be marked DEFAULTED within 14 days.' },
  ];
  let notifSeq = 0;
  for (const u of users) {
    const n = intBetween(1, 5);
    for (let k = 0; k < n; k++) {
      const t = pick(NOTIF_TEMPLATES);
      const read = rand() > 0.4;
      await prisma.notification.create({
        data: {
          notificationRef: `NAFI-NTF-${String(++notifSeq).padStart(6, '0')}`,
          userId: u.id,
          type: t.type,
          title: t.title,
          message: t.msg(u.name.split(' ')[0] ?? u.name),
          data: { channel: pick(['sms', 'email', 'push', 'telegram']), priority: pick(['low', 'normal', 'high']) },
          isRead: read,
          readAt: read ? daysAgo(intBetween(0, 30)) : null,
          createdAt: daysAgo(intBetween(0, 120)),
        },
      });
    }
  }
  console.log('✅ Notifications seeded');

  // -------------------------------- AuditLog --------------------------------
  // Hash-chained ledger: each entry links to the previous hash.
  const AUDIT_ACTIONS: { action: AuditAction; entity: string; scope: TenantScope }[] = [
    { action: 'LOGIN', entity: 'Auth', scope: 'OWN' },
    { action: 'LOGOUT', entity: 'Auth', scope: 'OWN' },
    { action: 'CREATE', entity: 'Contract', scope: 'INSTITUTION' },
    { action: 'UPDATE', entity: 'Contract', scope: 'INSTITUTION' },
    { action: 'APPROVE', entity: 'Contract', scope: 'INSTITUTION' },
    { action: 'REJECT', entity: 'Contract', scope: 'INSTITUTION' },
    { action: 'CREATE', entity: 'Escrow', scope: 'ALL' },
    { action: 'TRANSFER', entity: 'Escrow', scope: 'ALL' },
    { action: 'CREATE', entity: 'Investment', scope: 'OWN' },
    { action: 'CREATE', entity: 'Settlement', scope: 'INSTITUTION' },
    { action: 'UPDATE', entity: 'Settlement', scope: 'INSTITUTION' },
    { action: 'CREATE', entity: 'Collateral', scope: 'INSTITUTION' },
    { action: 'CREATE', entity: 'Dispute', scope: 'NATIONAL' },
    { action: 'UPDATE', entity: 'Dispute', scope: 'NATIONAL' },
    { action: 'READ', entity: 'Report', scope: 'NATIONAL' },
    { action: 'DELETE', entity: 'DraftOpportunity', scope: 'INSTITUTION' },
  ];
  let prevHash: string | null = null;
  const IP_POOL = ['196.188.', '196.189.', '41.60.', '196.186.', '154.120.'];
  const UA_POOL = [
    'Mozilla/5.0 (Android 14; SM-A155F) Chrome/126 Mobile',
    'Mozilla/5.0 (iPhone; iOS 17.5) Safari/605.1.15',
    'Mozilla/5.0 (Windows NT 10.0; Win64) Chrome/127 Safari/537.36',
    'EthioTelecom-Broadband/2.1 (Addis Ababa)',
  ];
  const actorPool = users.filter((u) => ![
    'COMMERCIAL_FARMER',
  ].includes(u.role)).concat(farmers.slice(0, 10));
  let auditSeq = 0;
  for (let i = 0; i < 220; i++) {
    const a = pick(AUDIT_ACTIONS);
    const actor = pick(actorPool);
    const entityRec = pick(contracts);
    const payload = JSON.stringify({ action: a.action, entity: a.entity, actor: actor.id, ts: NOW.getTime() - i * 3600_000 });
    const currentHash = sha(prevHash ? `${prevHash}:${payload}` : payload);
    await prisma.auditLog.create({
      data: {
        logRef: `NAFI-AUD-${String(++auditSeq).padStart(6, '0')}`,
        previousHash: prevHash,
        currentHash,
        action: a.action,
        entity: a.entity,
        entityId: a.entity === 'Auth' ? actor.id : entityRec.id,
        userId: actor.id,
        tenantScope: a.scope,
        ipAddress: `${pick(IP_POOL)}${intBetween(1, 254)}.${intBetween(1, 254)}`,
        userAgent: pick(UA_POOL),
        metadata: { nafiContractId: entityRec.nafiContractId, region: 'ET' },
        createdAt: new Date(NOW.getTime() - i * intBetween(1, 6) * 3600_000),
      },
    });
    prevHash = currentHash;
  }
  console.log('✅ Audit logs seeded (hash-chained)');

  // ------------------------------- Summary ----------------------------------
  const counts = {
    institutions: await prisma.institution.count(),
    users: await prisma.user.count(),
    contracts: await prisma.contract.count(),
    escrows: await prisma.escrow.count(),
    investments: await prisma.investment.count(),
    opportunities: await prisma.opportunity.count(),
    inputs: await prisma.input.count(),
    settlements: await prisma.settlement.count(),
    collaterals: await prisma.collateral.count(),
    disputes: await prisma.dispute.count(),
    notifications: await prisma.notification.count(),
    auditLogs: await prisma.auditLog.count(),
  };
  console.log('📊 Row counts:', counts);
  console.log('🎉 Seed completed successfully! Login: any user e.g. nafi.admin@nafi.test / Password123!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
