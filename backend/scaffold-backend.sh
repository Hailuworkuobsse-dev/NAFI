#!/usr/bin/env bash
# ============================================================
# NAFI Backend — Full Scaffolding Script
# Node.js + Express + Prisma + MySQL + CORS
#
# Creates:
#   - Full Prisma schema (13 models)
#   - Auth (JWT access + httpOnly refresh + MFA scaffold)
#   - RBAC middleware (permission + role + scope)
#   - Audit log middleware with hash chaining
#   - Rate limiting
#   - All 14 API modules (contracts, escrows, investments,
#     opportunities, inputs, settlements, collateral, disputes,
#     reports, users, notifications, audit, public, health)
#   - Error handling + async wrapper
#   - Test data seeding
# ============================================================
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "▶ NAFI Backend scaffolding → $SCRIPT_DIR"

mkfile() {
  local path="$1"
  mkdir -p "$(dirname "$path")"
  cat > "$path"
  echo "  ✓ $path"
}

API="services/api"
mkdir -p "$API/src"
mkdir -p "$API/prisma"

# ============================================================
# PACKAGE.JSON
# ============================================================

mkfile "$API/package.json" <<'EOF'
{
  "name": "@nafi/api",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "main": "./dist/server.js",
  "scripts": {
    "dev": "tsx watch src/server.ts",
    "build": "tsc -b",
    "start": "node dist/server.js",
    "typecheck": "tsc --noEmit",
    "lint": "eslint src --ext .ts",
    "prisma:generate": "prisma generate",
    "prisma:migrate": "prisma migrate dev",
    "prisma:deploy": "prisma migrate deploy",
    "prisma:studio": "prisma studio",
    "seed": "tsx prisma/seed.ts",
    "seed:test": "tsx src/scripts/seed-test.ts"
  },
  "dependencies": {
    "@nafi/rbac-core": "workspace:*",
    "@nafi/validators": "workspace:*",
    "@prisma/client": "^5.22.0",
    "bcrypt": "^5.1.1",
    "cookie-parser": "^1.4.7",
    "cors": "^2.8.5",
    "dotenv": "^16.4.5",
    "express": "^4.21.1",
    "express-rate-limit": "^7.4.1",
    "helmet": "^8.0.0",
    "jsonwebtoken": "^9.0.2",
    "pino": "^9.5.0",
    "pino-http": "^10.3.0",
    "zod": "^3.23.8"
  },
  "devDependencies": {
    "@types/bcrypt": "^5.0.2",
    "@types/cookie-parser": "^1.4.7",
    "@types/cors": "^2.8.17",
    "@types/express": "^5.0.0",
    "@types/jsonwebtoken": "^9.0.7",
    "@types/node": "^22.7.5",
    "prisma": "^5.22.0",
    "tsx": "^4.19.1",
    "typescript": "^5.6.3"
  }
}
EOF

mkfile "$API/tsconfig.json" <<'EOF'
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src",
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "target": "ES2022",
    "lib": ["ES2022"],
    "types": ["node"],
    "noEmit": false,
    "composite": false,
    "incremental": false,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
EOF

mkfile "$API/.env.example" <<'EOF'
NODE_ENV=development
PORT=4000

# Database
DATABASE_URL=mysql://nafi:nafi@localhost:3306/nafi

# JWT
JWT_SECRET=replace-with-64-char-random-string
JWT_REFRESH_SECRET=replace-with-another-64-char-random-string
JWT_ACCESS_TTL=15m
JWT_REFRESH_TTL=30d

# CORS
CORS_ORIGINS=http://localhost:3000,http://localhost:3001

# Cookies
COOKIE_DOMAIN=localhost
COOKIE_SECURE=false

# Push (VAPID)
VAPID_PUBLIC_KEY=
VAPID_PRIVATE_KEY=
EOF

# ============================================================
# PRISMA SCHEMA
# ============================================================

mkfile "$API/prisma/schema.prisma" <<'EOF'
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
}

// ============================================================
// ENUMS
// ============================================================

enum ParticipantRole {
  DIASPORA_INVESTOR
  COMMERCIAL_BANK
  DBE_OFFICER
  NAFA_OFFICER
  INPUT_SUPPLIER
  COMMERCIAL_FARMER
  OFF_TAKER
  GOVERNMENT_REGULATOR
  DONOR
  NAFI_ADMIN
  COMPLIANCE_OFFICER
  ARBITRATOR
}

enum ContractStatus {
  DRAFT
  ACTIVE
  FULFILLED
  DEFAULTED
  DISPUTED
}

enum ContractSignerRole {
  FARMER
  BANK
  GOVERNMENT_WITNESS
  SUPPLIER
  OFF_TAKER
}

enum EscrowStatus {
  OPEN
  LOCKED
  RELEASED
  FROZEN
  CLOSED
}

enum EscrowDirection {
  CREDIT
  DEBIT
  HOLD
  RELEASE
}

enum Currency {
  ETB
  USD
  EUR
  GBP
  CAD
  AUD
  AED
}

enum FundingType {
  DEBT_FIXED_RETURN
  EQUITY_PROFIT_SHARE
}

enum SettlementStatus {
  PENDING
  SIMULATED
  APPROVED
  EXECUTED
  REVERSED
}

enum CollateralType {
  WAREHOUSE_RECEIPT
  MOVABLE_PROPERTY
  FUTURE_HARVEST
  MACHINERY
}

enum LienStatus {
  FREE
  LIEN_REGISTERED
  LIQUIDATED
  RELEASED
}

enum DisputeStatus {
  FLAGGED
  UNDER_REVIEW
  HEARING_SCHEDULED
  DECIDED
  APPEALED
  CLOSED
}

enum DisputeCategory {
  CONTRACT_BREACH
  QUALITY
  PAYMENT
  DELIVERY
  OTHER
}

enum ReportType {
  REGULATORY_NBE
  REGULATORY_MOA
  REGULATORY_MOR
  DONOR_EIB
  DONOR_IFAD
  PORTFOLIO
  TAX
  AUDIT
}

enum ReportFormat {
  PDF
  CSV
  XLSX
}

// ============================================================
// MODELS
// ============================================================

model Stakeholder {
  id               String          @id @default(uuid())
  nafiId           String          @unique
  email            String          @unique
  passwordHash     String
  fullName         String
  phone            String?
  organizationName String?
  role             ParticipantRole
  institutionId    String?
  institutionName  String?
  locale           String          @default("en")
  countryCode      String          @default("ET")
  isActive         Boolean         @default(true)
  mfaEnabled       Boolean         @default(false)
  mfaSecret        String?
  avatarUrl        String?
  lastLoginAt      DateTime?
  createdAt        DateTime        @default(now())
  updatedAt        DateTime        @updatedAt

  // Relations
  refreshTokens     RefreshToken[]
  passwordResets    PasswordResetToken[]
  contractsAsFarmer Contract[]        @relation("ContractFarmer")
  contractsAsWitness Contract[]       @relation("ContractWitness")
  contractsAsBank   Contract[]        @relation("ContractBank")
  signatures        ContractSignature[]
  investments       Investment[]
  escrowsManaged    Escrow[]          @relation("EscrowBank")
  ledgerEntries     EscrowLedgerEntry[]
  inputOrdersAsSupp InputPurchase[]   @relation("InputSupplier")
  settlementsRecv   SettlementDistribution[]
  collateralOwned   Collateral[]      @relation("CollateralOwner")
  collateralLien    Collateral[]      @relation("CollateralLienHolder")
  disputesFiled     Dispute[]         @relation("DisputeFiledBy")
  disputesArbitrated Dispute[]        @relation("DisputeArbitrator")
  reportsGenerated  Report[]
  notifications     Notification[]
  pushSubscriptions PushSubscription[]
  auditEntries      AuditLog[]

  @@index([role])
  @@index([institutionId])
}

model RefreshToken {
  id         String    @id @default(uuid())
  userId     String
  tokenHash  String    @unique
  userAgent  String?
  ip         String?
  expiresAt  DateTime
  revokedAt  DateTime?
  createdAt  DateTime  @default(now())

  user Stakeholder @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([expiresAt])
}

model PasswordResetToken {
  id         String    @id @default(uuid())
  userId     String
  tokenHash  String    @unique
  expiresAt  DateTime
  usedAt     DateTime?
  createdAt  DateTime  @default(now())

  user Stakeholder @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
}

model Contract {
  id                   String         @id @default(uuid())
  targetCrop           String
  region               String
  regionCode           String
  commercialFarmerId   String
  governmentWitnessId  String?
  bankId               String?
  totalTargetYieldKg   Decimal        @db.Decimal(14, 2)
  guaranteedFloorPriceEtb Decimal     @db.Decimal(12, 2)
  contractValueEtb     Decimal        @db.Decimal(18, 2)
  committedAmountEtb   Decimal        @default(0) @db.Decimal(18, 2)
  status               ContractStatus @default(DRAFT)
  maturityDate         DateTime
  onChainHash          String
  createdAt            DateTime       @default(now())
  updatedAt            DateTime       @updatedAt

  farmer          Stakeholder          @relation("ContractFarmer", fields: [commercialFarmerId], references: [id])
  governmentWitness Stakeholder?       @relation("ContractWitness", fields: [governmentWitnessId], references: [id])
  bank            Stakeholder?         @relation("ContractBank", fields: [bankId], references: [id])
  signatures      ContractSignature[]
  timeline        ContractTimelineEvent[]
  escrow          Escrow?
  investments     Investment[]
  inputPurchases  InputPurchase[]
  settlements     Settlement[]
  collateral      Collateral[]         @relation("ContractCollateral")
  disputes        Dispute[]

  @@index([status])
  @@index([regionCode])
  @@index([commercialFarmerId])
}

model ContractSignature {
  id            String              @id @default(uuid())
  contractId    String
  role          ContractSignerRole
  signerId      String
  signatureHash String
  signedAt      DateTime            @default(now())

  contract Contract    @relation(fields: [contractId], references: [id], onDelete: Cascade)
  signer   Stakeholder @relation(fields: [signerId], references: [id])

  @@unique([contractId, role])
  @@index([contractId])
}

model ContractTimelineEvent {
  id          String   @id @default(uuid())
  contractId  String
  type        String
  label       String
  description String?  @db.Text
  timestamp   DateTime @default(now())

  contract Contract @relation(fields: [contractId], references: [id], onDelete: Cascade)

  @@index([contractId])
}

model Escrow {
  id                  String       @id @default(uuid())
  contractId          String       @unique
  managingBankId      String
  status              EscrowStatus @default(OPEN)
  isLocked            Boolean      @default(true)
  totalDepositedEtb   Decimal      @default(0) @db.Decimal(18, 2)
  createdAt           DateTime     @default(now())
  updatedAt           DateTime     @updatedAt

  contract Contract            @relation(fields: [contractId], references: [id])
  bank     Stakeholder         @relation("EscrowBank", fields: [managingBankId], references: [id])
  balances EscrowBalance[]
  ledger   EscrowLedgerEntry[]

  @@index([status])
}

model EscrowBalance {
  id       String   @id @default(uuid())
  escrowId String
  currency Currency
  amount   Decimal  @default(0) @db.Decimal(18, 2)

  escrow Escrow @relation(fields: [escrowId], references: [id], onDelete: Cascade)

  @@unique([escrowId, currency])
}

model EscrowLedgerEntry {
  id          String           @id @default(uuid())
  escrowId    String
  direction   EscrowDirection
  amount      Decimal          @db.Decimal(18, 2)
  currency    Currency
  purpose     String
  referenceId String?
  actorId     String
  createdAt   DateTime         @default(now())

  escrow Escrow      @relation(fields: [escrowId], references: [id], onDelete: Cascade)
  actor  Stakeholder @relation(fields: [actorId], references: [id])

  @@index([escrowId])
  @@index([createdAt])
}

model Investment {
  id                     String      @id @default(uuid())
  contractId             String
  investorId             String
  fundingType            FundingType
  amountForeignCurrency  Decimal     @db.Decimal(18, 2)
  currency               Currency
  amountEtb              Decimal     @db.Decimal(18, 2)
  agreedReturnRate       Decimal     @db.Decimal(6, 4)
  expectedReturnEtb      Decimal     @db.Decimal(18, 2)
  realizedReturnEtb      Decimal?    @db.Decimal(18, 2)
  sourceOfFunds          String?     @db.Text
  investedAt             DateTime    @default(now())
  settledAt              DateTime?

  contract Contract    @relation(fields: [contractId], references: [id])
  investor Stakeholder @relation(fields: [investorId], references: [id])

  @@index([contractId])
  @@index([investorId])
}

model InputPurchase {
  id               String    @id @default(uuid())
  contractId       String
  supplierId       String
  itemDescription  String
  quantity         Decimal   @db.Decimal(14, 3)
  unit             String
  unitCostEtb      Decimal   @db.Decimal(12, 2)
  totalCostEtb     Decimal   @db.Decimal(18, 2)
  isDelivered      Boolean   @default(false)
  isDisbursed      Boolean   @default(false)
  deliveredAt      DateTime?
  verifiedAt       DateTime?
  photoHash        String?
  latitude         Decimal?  @db.Decimal(10, 6)
  longitude        Decimal?  @db.Decimal(10, 6)
  qrCode           String?
  notes            String?   @db.Text
  createdAt        DateTime  @default(now())
  updatedAt        DateTime  @updatedAt

  contract Contract    @relation(fields: [contractId], references: [id])
  supplier Stakeholder @relation("InputSupplier", fields: [supplierId], references: [id])

  @@index([contractId])
  @@index([supplierId])
}

model Settlement {
  id                   String           @id @default(uuid())
  contractId           String
  status               SettlementStatus @default(PENDING)
  grossRevenueEtb      Decimal          @db.Decimal(18, 2)
  actualYieldKg        Decimal          @db.Decimal(14, 2)
  totalDistributedEtb  Decimal          @default(0) @db.Decimal(18, 2)
  waterfallOrder       Json?
  executedAt           DateTime?
  reversalReason       String?          @db.Text
  createdAt            DateTime         @default(now())
  updatedAt            DateTime         @updatedAt

  contract      Contract                 @relation(fields: [contractId], references: [id])
  distributions SettlementDistribution[]

  @@index([contractId])
  @@index([status])
}

model SettlementDistribution {
  id               String  @id @default(uuid())
  settlementId     String
  recipientId      String
  role             ParticipantRole
  payoutAmountEtb  Decimal @db.Decimal(18, 2)
  notes            String? @db.Text

  settlement Settlement  @relation(fields: [settlementId], references: [id], onDelete: Cascade)
  recipient  Stakeholder @relation(fields: [recipientId], references: [id])

  @@index([settlementId])
}

model Collateral {
  id                    String         @id @default(uuid())
  type                  CollateralType
  ownerId               String
  description           String
  estimatedValueEtb     Decimal        @db.Decimal(18, 2)
  lienStatus            LienStatus     @default(FREE)
  lienHolderId          String?
  contractId            String?
  quantityKg            Decimal?       @db.Decimal(14, 2)
  grade                 String?
  warehouseId           String?
  warehouseName         String?
  emcrRegistrationId    String?
  qrPayload             String?
  registeredAt          DateTime       @default(now())
  expiresAt             DateTime?

  owner      Stakeholder @relation("CollateralOwner", fields: [ownerId], references: [id])
  lienHolder Stakeholder? @relation("CollateralLienHolder", fields: [lienHolderId], references: [id])
  contract   Contract?   @relation("ContractCollateral", fields: [contractId], references: [id])

  @@index([ownerId])
  @@index([lienStatus])
}

model Dispute {
  id            String          @id @default(uuid())
  contractId    String
  category      DisputeCategory
  status        DisputeStatus   @default(FLAGGED)
  filedById     String
  summary       String          @db.Text
  arbitratorId  String?
  filedAt       DateTime        @default(now())
  hearingAt     DateTime?
  decision      String?         @db.Text
  decisionAt    DateTime?
  resolvedAt    DateTime?

  contract   Contract          @relation(fields: [contractId], references: [id])
  filedBy    Stakeholder       @relation("DisputeFiledBy", fields: [filedById], references: [id])
  arbitrator Stakeholder?      @relation("DisputeArbitrator", fields: [arbitratorId], references: [id])
  evidence   DisputeEvidence[]

  @@index([contractId])
  @@index([status])
  @@index([arbitratorId])
}

model DisputeEvidence {
  id         String   @id @default(uuid())
  disputeId  String
  label      String
  fileUrl    String
  uploadedAt DateTime @default(now())

  dispute Dispute @relation(fields: [disputeId], references: [id], onDelete: Cascade)

  @@index([disputeId])
}

model Report {
  id             String       @id @default(uuid())
  type           ReportType
  title          String
  periodStart    DateTime
  periodEnd      DateTime
  format         ReportFormat
  fileUrl        String
  generatedById  String
  generatedAt    DateTime     @default(now())

  generatedBy Stakeholder @relation(fields: [generatedById], references: [id])

  @@index([type])
  @@index([generatedById])
}

model Notification {
  id        String   @id @default(uuid())
  userId    String
  title     String
  body      String   @db.Text
  isRead    Boolean  @default(false)
  deepLink  String?
  createdAt DateTime @default(now())

  user Stakeholder @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId, isRead])
}

model PushSubscription {
  id        String   @id @default(uuid())
  userId    String
  endpoint  String   @unique @db.Text
  keys      Json
  createdAt DateTime @default(now())

  user Stakeholder @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
}

model AuditLog {
  id         String   @id @default(uuid())
  actorId    String?
  action     String
  resource   String
  resourceId String?
  ip         String?
  userAgent  String?  @db.Text
  metadata   Json?
  hash       String
  prevHash   String?
  createdAt  DateTime @default(now())

  actor Stakeholder? @relation(fields: [actorId], references: [id])

  @@index([actorId])
  @@index([resource, resourceId])
  @@index([createdAt])
}
EOF

# ============================================================
# CONFIG
# ============================================================

mkfile "$API/src/config/env.ts" <<'EOF'
import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().default(4000),
  DATABASE_URL: z.string().min(1),
  JWT_SECRET: z.string().min(32),
  JWT_REFRESH_SECRET: z.string().min(32),
  JWT_ACCESS_TTL: z.string().default('15m'),
  JWT_REFRESH_TTL: z.string().default('30d'),
  CORS_ORIGINS: z.string().default('http://localhost:3000,http://localhost:3001'),
  COOKIE_DOMAIN: z.string().default('localhost'),
  COOKIE_SECURE: z.coerce.boolean().default(false),
  VAPID_PUBLIC_KEY: z.string().optional(),
  VAPID_PRIVATE_KEY: z.string().optional(),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌ Invalid environment variables:');
  console.error(parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = {
  ...parsed.data,
  corsOrigins: parsed.data.CORS_ORIGINS.split(',').map((s) => s.trim()),
  isProd: parsed.data.NODE_ENV === 'production',
  isDev: parsed.data.NODE_ENV === 'development',
};
EOF

mkfile "$API/src/config/cors.ts" <<'EOF'
import type { CorsOptions } from 'cors';

import { env } from './env';

export const corsOptions: CorsOptions = {
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (env.corsOrigins.includes(origin)) return callback(null, true);
    callback(new Error(`Origin ${origin} not allowed by CORS`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Client-Version',
    'X-Request-Id',
    'X-Institution-Id',
  ],
  exposedHeaders: ['X-Request-Id', 'X-RateLimit-Remaining'],
  maxAge: 86_400,
};
EOF

mkfile "$API/src/config/prisma.ts" <<'EOF'
import { PrismaClient } from '@prisma/client';

import { env } from './env';

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: env.isDev ? ['query', 'warn', 'error'] : ['warn', 'error'],
  });

if (env.isDev) globalForPrisma.prisma = prisma;
EOF

mkfile "$API/src/config/logger.ts" <<'EOF'
import pino from 'pino';

import { env } from './env';

export const logger = pino({
  level: env.isProd ? 'info' : 'debug',
  transport: env.isDev
    ? {
        target: 'pino-pretty',
        options: { colorize: true, translateTime: 'SYS:standard' },
      }
    : undefined,
  redact: {
    paths: [
      'req.headers.authorization',
      'req.headers.cookie',
      'password',
      'passwordHash',
      'token',
      '*.password',
      '*.token',
    ],
    censor: '[redacted]',
  },
});
EOF

# ============================================================
# UTILS
# ============================================================

mkfile "$API/src/utils/ApiError.ts" <<'EOF'
export class ApiError extends Error {
  constructor(
    public statusCode: number,
    public code: string,
    message: string,
    public details?: Record<string, string[]>,
  ) {
    super(message);
    this.name = 'ApiError';
    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(message: string, details?: Record<string, string[]>) {
    return new ApiError(400, 'bad_request', message, details);
  }

  static unauthorized(message = 'Authentication required') {
    return new ApiError(401, 'unauthorized', message);
  }

  static forbidden(message = 'You do not have permission') {
    return new ApiError(403, 'forbidden', message);
  }

  static notFound(message = 'Resource not found') {
    return new ApiError(404, 'not_found', message);
  }

  static conflict(message: string) {
    return new ApiError(409, 'conflict', message);
  }

  static validation(message: string, details: Record<string, string[]>) {
    return new ApiError(422, 'validation_error', message, details);
  }

  static tooManyRequests(message = 'Too many requests') {
    return new ApiError(429, 'rate_limited', message);
  }

  static internal(message = 'Something went wrong') {
    return new ApiError(500, 'internal_error', message);
  }
}
EOF

mkfile "$API/src/utils/apiResponse.ts" <<'EOF'
import type { Response } from 'express';

export interface SuccessMeta {
  page?: number;
  pageSize?: number;
  total?: number;
  requestId?: string;
}

export function ok<T>(res: Response, data: T, meta?: SuccessMeta): void {
  res.status(200).json({
    success: true,
    data,
    meta: meta ? { ...meta, requestId: res.locals.requestId } : undefined,
  });
}

export function created<T>(res: Response, data: T): void {
  res.status(201).json({
    success: true,
    data,
    meta: { requestId: res.locals.requestId },
  });
}

export function noContent(res: Response): void {
  res.status(204).send();
}

export function list<T>(
  res: Response,
  items: T[],
  page: number,
  pageSize: number,
  total: number,
): void {
  res.status(200).json({
    success: true,
    data: { items, page, pageSize, total },
    meta: { page, pageSize, total, requestId: res.locals.requestId },
  });
}
EOF

mkfile "$API/src/utils/asyncHandler.ts" <<'EOF'
import type { NextFunction, Request, RequestHandler, Response } from 'express';

export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>,
): RequestHandler {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
EOF

mkfile "$API/src/utils/jwt.ts" <<'EOF'
import crypto from 'node:crypto';

import jwt from 'jsonwebtoken';

import { env } from '@/config/env';

export interface AccessTokenPayload {
  sub: string;
  nafiId: string;
  role: string;
  institutionId?: string;
}

export function signAccessToken(payload: AccessTokenPayload): string {
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_ACCESS_TTL,
    issuer: 'nafi',
    audience: 'nafi-api',
  });
}

export function verifyAccessToken(token: string): AccessTokenPayload {
  return jwt.verify(token, env.JWT_SECRET, {
    issuer: 'nafi',
    audience: 'nafi-api',
  }) as AccessTokenPayload;
}

export function signRefreshToken(userId: string): string {
  return jwt.sign({ sub: userId, jti: crypto.randomUUID() }, env.JWT_REFRESH_SECRET, {
    expiresIn: env.JWT_REFRESH_TTL,
    issuer: 'nafi',
    audience: 'nafi-api',
  });
}

export function verifyRefreshToken(token: string): { sub: string; jti: string } {
  return jwt.verify(token, env.JWT_REFRESH_SECRET, {
    issuer: 'nafi',
    audience: 'nafi-api',
  }) as { sub: string; jti: string };
}

export function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

export function hashRefreshToken(token: string): string {
  return hashToken(token);
}
EOF

mkfile "$API/src/utils/password.ts" <<'EOF'
import bcrypt from 'bcrypt';

const SALT_ROUNDS = 10;

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, SALT_ROUNDS);
}

export async function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}
EOF

mkfile "$API/src/utils/nafiId.ts" <<'EOF'
/**
 * Generate a NAFI ID: NAFI-XXXXXXXX (8 uppercase alphanumerics).
 */
export function generateNafiId(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let out = '';
  for (let i = 0; i < 8; i++) {
    out += chars[Math.floor(Math.random() * chars.length)];
  }
  return `NAFI-${out}`;
}

/**
 * Compute a pseudo on-chain hash for a contract.
 * In production this would be replaced by a real hash of the contract
 * canonical representation, anchored to the KalypsET ledger.
 */
export function generateContractHash(): string {
  const random = Math.random().toString(36).slice(2);
  return `0x${Buffer.from(random + Date.now()).toString('hex').padStart(64, '0').slice(0, 64)}`;
}
EOF

# ============================================================
# MIDDLEWARE
# ============================================================

mkfile "$API/src/middleware/requestId.ts" <<'EOF'
import crypto from 'node:crypto';

import type { NextFunction, Request, Response } from 'express';

export function requestId(req: Request, res: Response, next: NextFunction): void {
  const id = (req.header('X-Request-Id') as string | undefined) ?? crypto.randomUUID();
  res.locals.requestId = id;
  res.setHeader('X-Request-Id', id);
  next();
}
EOF

mkfile "$API/src/middleware/authenticate.ts" <<'EOF'
import type { NextFunction, Request, Response } from 'express';

import { ApiError } from '@/utils/ApiError';
import { verifyAccessToken, type AccessTokenPayload } from '@/utils/jwt';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: AccessTokenPayload & { permissions?: string[] };
    }
  }
}

export function authenticate(req: Request, _res: Response, next: NextFunction): void {
  const header = req.header('authorization');
  if (!header?.startsWith('Bearer ')) {
    return next(ApiError.unauthorized());
  }

  const token = header.slice(7);

  try {
    const payload = verifyAccessToken(token);
    req.user = payload;
    next();
  } catch {
    next(ApiError.unauthorized('Invalid or expired token'));
  }
}
EOF

mkfile "$API/src/middleware/authorize.ts" <<'EOF'
import type { NextFunction, Request, Response } from 'express';

import { can, ROLE_PERMISSIONS, type Permission, type Role } from '@nafi/rbac-core';

import { ApiError } from '@/utils/ApiError';

export function authorize(permission: Permission, scope?: string) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) return next(ApiError.unauthorized());

    const role = req.user.role as Role;
    const allowed = can({ role }, permission, scope);

    if (!allowed) {
      return next(
        ApiError.forbidden(
          `Missing permission: ${permission}${scope ? ` (scope: ${scope})` : ''}`,
        ),
      );
    }

    next();
  };
}

export function requireRole(...roles: Role[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) return next(ApiError.unauthorized());
    if (!roles.includes(req.user.role as Role)) {
      return next(ApiError.forbidden('Role not permitted'));
    }
    next();
  };
}

/**
 * Effective permissions for the current user, expanded from role.
 */
export function effectivePermissions(role: Role): readonly string[] {
  return ROLE_PERMISSIONS[role] as readonly string[];
}
EOF

mkfile "$API/src/middleware/tenantScope.ts" <<'EOF'
import type { NextFunction, Request, Response } from 'express';

import type { Role } from '@nafi/rbac-core';

export type TenantScope = 'own' | 'institution' | 'national' | 'all';

const ROLE_SCOPE: Record<Role, TenantScope> = {
  DIASPORA_INVESTOR: 'own',
  COMMERCIAL_BANK: 'institution',
  DBE_OFFICER: 'national',
  NAFA_OFFICER: 'national',
  INPUT_SUPPLIER: 'institution',
  COMMERCIAL_FARMER: 'own',
  OFF_TAKER: 'institution',
  GOVERNMENT_REGULATOR: 'national',
  DONOR: 'national',
  NAFI_ADMIN: 'all',
  COMPLIANCE_OFFICER: 'all',
  ARBITRATOR: 'all',
};

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      tenantScope?: TenantScope;
    }
  }
}

export function tenantScope(req: Request, _res: Response, next: NextFunction): void {
  if (!req.user) return next();
  req.tenantScope = ROLE_SCOPE[req.user.role as Role] ?? 'own';
  next();
}
EOF

mkfile "$API/src/middleware/auditLog.ts" <<'EOF'
import crypto from 'node:crypto';

import type { NextFunction, Request, Response } from 'express';

import { prisma } from '@/config/prisma';
import { logger } from '@/config/logger';

interface AuditParams {
  action: string;
  resource: string;
  resourceId?: string | ((req: Request) => string | undefined);
  metadata?: Record<string, unknown> | ((req: Request) => Record<string, unknown>);
}

/**
 * Persists an audit entry with hash chaining.
 * The hash of each entry incorporates the previous entry's hash,
 * making tampering detectable.
 */
export async function writeAudit(
  req: Request,
  params: AuditParams,
): Promise<void> {
  try {
    const resourceId =
      typeof params.resourceId === 'function' ? params.resourceId(req) : params.resourceId;
    const metadata =
      typeof params.metadata === 'function' ? params.metadata(req) : params.metadata;

    const prev = await prisma.auditLog.findFirst({
      orderBy: { createdAt: 'desc' },
      select: { hash: true },
    });

    const payload = JSON.stringify({
      actorId: req.user?.sub ?? null,
      action: params.action,
      resource: params.resource,
      resourceId: resourceId ?? null,
      metadata: metadata ?? null,
      timestamp: new Date().toISOString(),
      prevHash: prev?.hash ?? null,
    });

    const hash = crypto.createHash('sha256').update(payload).digest('hex');

    await prisma.auditLog.create({
      data: {
        actorId: req.user?.sub ?? null,
        action: params.action,
        resource: params.resource,
        resourceId,
        ip: req.ip,
        userAgent: req.header('user-agent') ?? undefined,
        metadata: metadata as never,
        hash,
        prevHash: prev?.hash ?? null,
      },
    });
  } catch (err) {
    logger.error({ err }, 'Failed to write audit log');
  }
}

/**
 * Express middleware that logs the request after response is sent.
 */
export function auditMiddleware(action: string, resource: string) {
  return (req: Request, res: Response, next: NextFunction): void => {
    res.on('finish', () => {
      if (res.statusCode >= 200 && res.statusCode < 400) {
        void writeAudit(req, {
          action,
          resource,
          resourceId: req.params.id,
          metadata: { method: req.method, path: req.originalUrl },
        });
      }
    });
    next();
  };
}
EOF

mkfile "$API/src/middleware/rateLimiter.ts" <<'EOF'
import rateLimit from 'express-rate-limit';

export const authLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  limit: 10,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { success: false, error: { code: 'rate_limited', message: 'Too many attempts' } },
});

export const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 5,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { success: false, error: { code: 'rate_limited', message: 'Too many registrations' } },
});

export const generalLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  limit: 300,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
});
EOF

mkfile "$API/src/middleware/errorHandler.ts" <<'EOF'
import type { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';

import { logger } from '@/config/logger';
import { ApiError } from '@/utils/ApiError';

export function notFoundHandler(_req: Request, res: Response): void {
  res.status(404).json({
    success: false,
    error: { code: 'not_found', message: 'Route not found', requestId: res.locals.requestId },
  });
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  const requestId = res.locals.requestId;

  if (err instanceof ZodError) {
    const details: Record<string, string[]> = {};
    for (const issue of err.issues) {
      const key = issue.path.join('.') || '_';
      details[key] = details[key] ?? [];
      details[key].push(issue.message);
    }
    res.status(422).json({
      success: false,
      error: {
        code: 'validation_error',
        message: 'Some fields need your attention.',
        details,
        requestId,
      },
    });
    return;
  }

  if (err instanceof ApiError) {
    res.status(err.statusCode).json({
      success: false,
      error: {
        code: err.code,
        message: err.message,
        details: err.details,
        requestId,
      },
    });
    return;
  }

  logger.error({ err, requestId }, 'Unhandled error');

  res.status(500).json({
    success: false,
    error: {
      code: 'internal_error',
      message: 'Something went wrong on our side.',
      requestId,
    },
  });
}
EOF

# ============================================================
# AUTH MODULE
# ============================================================

mkfile "$API/src/modules/auth/auth.service.ts" <<'EOF'
import crypto from 'node:crypto';

import { ROLE_PERMISSIONS, type Role } from '@nafi/rbac-core';

import { env } from '@/config/env';
import { prisma } from '@/config/prisma';
import { ApiError } from '@/utils/ApiError';
import {
  hashRefreshToken,
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from '@/utils/jwt';
import { generateNafiId } from '@/utils/nafiId';
import { hashPassword, verifyPassword } from '@/utils/password';

export interface AuthUserView {
  id: string;
  nafiId: string;
  email: string;
  fullName: string;
  role: Role;
  institutionId?: string;
  institutionName?: string;
  permissions: string[];
  scopes?: Record<string, string[]>;
  locale: 'en' | 'am' | 'om' | 'ti';
  mfaEnabled: boolean;
  avatarUrl?: string;
}

function toView(user: {
  id: string;
  nafiId: string;
  email: string;
  fullName: string;
  role: string;
  institutionId: string | null;
  institutionName: string | null;
  locale: string;
  mfaEnabled: boolean;
  avatarUrl: string | null;
}): AuthUserView {
  const role = user.role as Role;
  return {
    id: user.id,
    nafiId: user.nafiId,
    email: user.email,
    fullName: user.fullName,
    role,
    institutionId: user.institutionId ?? undefined,
    institutionName: user.institutionName ?? undefined,
    permissions: ROLE_PERMISSIONS[role] as string[],
    locale: user.locale as AuthUserView['locale'],
    mfaEnabled: user.mfaEnabled,
    avatarUrl: user.avatarUrl ?? undefined,
  };
}

export async function login(input: {
  email: string;
  password: string;
  mfaCode?: string;
  ip?: string;
  userAgent?: string;
}): Promise<{ accessToken: string; refreshToken: string; user: AuthUserView }> {
  const user = await prisma.stakeholder.findUnique({ where: { email: input.email } });

  if (!user || !user.isActive) {
    throw ApiError.unauthorized('Invalid email or password');
  }

  const ok = await verifyPassword(input.password, user.passwordHash);
  if (!ok) throw ApiError.unauthorized('Invalid email or password');

  // MFA scaffold: if enabled, we require a 6-digit code (validation stubbed)
  if (user.mfaEnabled) {
    if (!input.mfaCode || input.mfaCode.length !== 6) {
      throw ApiError.unauthorized('MFA code required');
    }
    // TODO: verify against user.mfaSecret with a TOTP library
  }

  const accessToken = signAccessToken({
    sub: user.id,
    nafiId: user.nafiId,
    role: user.role,
    institutionId: user.institutionId ?? undefined,
  });

  const refreshToken = signRefreshToken(user.id);
  const tokenHash = hashRefreshToken(refreshToken);

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 30);

  await prisma.$transaction([
    prisma.refreshToken.create({
      data: {
        userId: user.id,
        tokenHash,
        expiresAt,
        ip: input.ip,
        userAgent: input.userAgent,
      },
    }),
    prisma.stakeholder.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    }),
  ]);

  return { accessToken, refreshToken, user: toView(user) };
}

export async function register(input: {
  role: Role;
  fullName: string;
  email: string;
  phone: string;
  password: string;
  locale: 'en' | 'am' | 'om' | 'ti';
}): Promise<{ userId: string; nafiId: string }> {
  const existing = await prisma.stakeholder.findUnique({ where: { email: input.email } });
  if (existing) throw ApiError.conflict('An account with this email already exists');

  const passwordHash = await hashPassword(input.password);

  let nafiId = generateNafiId();
  // Loop in the unlikely case of a collision
  for (let i = 0; i < 5; i++) {
    const clash = await prisma.stakeholder.findUnique({ where: { nafiId } });
    if (!clash) break;
    nafiId = generateNafiId();
  }

  const user = await prisma.stakeholder.create({
    data: {
      nafiId,
      email: input.email,
      passwordHash,
      fullName: input.fullName,
      phone: input.phone,
      role: input.role,
      locale: input.locale,
      countryCode: 'ET',
    },
  });

  return { userId: user.id, nafiId: user.nafiId };
}

export async function refresh(refreshToken: string): Promise<{
  accessToken: string;
  user: AuthUserView;
}> {
  let payload: { sub: string; jti: string };
  try {
    payload = verifyRefreshToken(refreshToken);
  } catch {
    throw ApiError.unauthorized('Invalid refresh token');
  }

  const tokenHash = hashRefreshToken(refreshToken);
  const stored = await prisma.refreshToken.findUnique({ where: { tokenHash } });

  if (!stored || stored.revokedAt || stored.expiresAt < new Date()) {
    throw ApiError.unauthorized('Refresh token expired or revoked');
  }

  const user = await prisma.stakeholder.findUnique({ where: { id: payload.sub } });
  if (!user || !user.isActive) throw ApiError.unauthorized();

  const accessToken = signAccessToken({
    sub: user.id,
    nafiId: user.nafiId,
    role: user.role,
    institutionId: user.institutionId ?? undefined,
  });

  return { accessToken, user: toView(user) };
}

export async function logout(refreshToken?: string): Promise<void> {
  if (!refreshToken) return;
  const tokenHash = hashRefreshToken(refreshToken);
  await prisma.refreshToken.updateMany({
    where: { tokenHash, revokedAt: null },
    data: { revokedAt: new Date() },
  });
}

export async function me(userId: string): Promise<AuthUserView> {
  const user = await prisma.stakeholder.findUnique({ where: { id: userId } });
  if (!user) throw ApiError.notFound('User not found');
  return toView(user);
}

export async function requestPasswordReset(email: string): Promise<void> {
  const user = await prisma.stakeholder.findUnique({ where: { email } });
  if (!user) return; // don't leak existence

  const token = crypto.randomBytes(32).toString('hex');
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + 1);

  await prisma.passwordResetToken.create({
    data: { userId: user.id, tokenHash, expiresAt },
  });

  // TODO: send email via provider. For now, log the raw token (dev only).
  if (env.isDev) {
    // eslint-disable-next-line no-console
    console.log(`[password-reset] ${email}: /reset-password/${token}`);
  }
}

export async function confirmPasswordReset(token: string, password: string): Promise<void> {
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
  const record = await prisma.passwordResetToken.findUnique({ where: { tokenHash } });

  if (!record || record.usedAt || record.expiresAt < new Date()) {
    throw ApiError.badRequest('Reset link is invalid or expired');
  }

  const passwordHash = await hashPassword(password);

  await prisma.$transaction([
    prisma.stakeholder.update({
      where: { id: record.userId },
      data: { passwordHash },
    }),
    prisma.passwordResetToken.update({
      where: { id: record.id },
      data: { usedAt: new Date() },
    }),
    prisma.refreshToken.updateMany({
      where: { userId: record.userId, revokedAt: null },
      data: { revokedAt: new Date() },
    }),
  ]);
}
EOF

mkfile "$API/src/modules/auth/auth.controller.ts" <<'EOF'
import type { Request, Response } from 'express';

import { loginSchema, registerSchema, type Role } from '@nafi/validators';

import { env } from '@/config/env';
import { ApiError } from '@/utils/ApiError';
import { created, noContent, ok } from '@/utils/apiResponse';

import * as authService from './auth.service';

const REFRESH_COOKIE = 'nafi_refresh';

const cookieOptions = {
  httpOnly: true,
  secure: env.isProd,
  sameSite: 'strict' as const,
  path: '/',
  domain: env.COOKIE_DOMAIN === 'localhost' ? undefined : env.COOKIE_DOMAIN,
  maxAge: 30 * 24 * 60 * 60 * 1000,
};

export async function login(req: Request, res: Response): Promise<void> {
  const input = loginSchema.parse(req.body);

  const { accessToken, refreshToken, user } = await authService.login({
    ...input,
    ip: req.ip,
    userAgent: req.header('user-agent') ?? undefined,
  });

  res.cookie(REFRESH_COOKIE, refreshToken, cookieOptions);

  ok(res, { accessToken, user });
}

export async function register(req: Request, res: Response): Promise<void> {
  const input = registerSchema.parse(req.body);
  const result = await authService.register({ ...input, role: input.role as Role });
  created(res, result);
}

export async function refresh(req: Request, res: Response): Promise<void> {
  const token = req.cookies?.[REFRESH_COOKIE];
  if (!token) throw ApiError.unauthorized('No refresh token');

  const { accessToken, user } = await authService.refresh(token);
  ok(res, { accessToken, user });
}

export async function logout(req: Request, res: Response): Promise<void> {
  const token = req.cookies?.[REFRESH_COOKIE];
  await authService.logout(token);
  res.clearCookie(REFRESH_COOKIE, { ...cookieOptions, maxAge: undefined });
  noContent(res);
}

export async function me(req: Request, res: Response): Promise<void> {
  if (!req.user) throw ApiError.unauthorized();
  const user = await authService.me(req.user.sub);
  ok(res, user);
}

export async function forgotPassword(req: Request, res: Response): Promise<void> {
  const { email } = req.body as { email?: string };
  if (!email) throw ApiError.badRequest('Email is required');
  await authService.requestPasswordReset(email);
  ok(res, { sent: true });
}

export async function resetPassword(req: Request, res: Response): Promise<void> {
  const { token, password } = req.body as { token?: string; password?: string };
  if (!token || !password) throw ApiError.badRequest('Token and password are required');
  await authService.confirmPasswordReset(token, password);
  ok(res, { reset: true });
}
EOF

mkfile "$API/src/modules/auth/auth.routes.ts" <<'EOF'
import { Router } from 'express';

import { authenticate } from '@/middleware/authenticate';
import { authLimiter, registerLimiter } from '@/middleware/rateLimiter';
import { asyncHandler } from '@/utils/asyncHandler';

import * as controller from './auth.controller';

export const authRouter = Router();

authRouter.post('/login', authLimiter, asyncHandler(controller.login));
authRouter.post('/register', registerLimiter, asyncHandler(controller.register));
authRouter.post('/refresh', asyncHandler(controller.refresh));
authRouter.post('/logout', asyncHandler(controller.logout));
authRouter.get('/me', authenticate, asyncHandler(controller.me));
authRouter.post('/password/forgot', authLimiter, asyncHandler(controller.forgotPassword));
authRouter.post('/password/reset', authLimiter, asyncHandler(controller.resetPassword));
EOF

# ============================================================
# CONTRACTS MODULE
# ============================================================

mkfile "$API/src/modules/contracts/contracts.service.ts" <<'EOF'
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
EOF

mkfile "$API/src/modules/contracts/contracts.controller.ts" <<'EOF'
import type { Request, Response } from 'express';

import { contractCreateSchema } from '@nafi/validators';

import { ApiError } from '@/utils/ApiError';
import { created, list as listRes, ok } from '@/utils/apiResponse';

import * as service from './contracts.service';

export async function list(req: Request, res: Response): Promise<void> {
  const result = await service.list({
    status: req.query.status as string | undefined,
    regionCode: req.query.regionCode as string | undefined,
    crop: req.query.crop as string | undefined,
    farmerId: req.query.farmerId as string | undefined,
    page: req.query.page ? Number(req.query.page) : undefined,
    pageSize: req.query.pageSize ? Number(req.query.pageSize) : undefined,
  });
  listRes(res, result.items, result.page, result.pageSize, result.total);
}

export async function detail(req: Request, res: Response): Promise<void> {
  const data = await service.detail(req.params.id!);
  ok(res, data);
}

export async function create(req: Request, res: Response): Promise<void> {
  const input = contractCreateSchema.parse(req.body);
  if (!req.user) throw ApiError.unauthorized();
  const data = await service.create(
    {
      ...input,
      regionCode: input.regionCode,
      maturityDate: input.maturityDate,
    },
    req.user.sub,
  );
  created(res, data);
}

export async function update(req: Request, res: Response): Promise<void> {
  const data = await service.update(req.params.id!, req.body);
  ok(res, data);
}

export async function sign(req: Request, res: Response): Promise<void> {
  if (!req.user) throw ApiError.unauthorized();
  const data = await service.sign(req.params.id!, req.body, req.user.sub);
  ok(res, data);
}

export async function freeze(req: Request, res: Response): Promise<void> {
  const data = await service.freeze(req.params.id!, req.body.reason ?? 'Unspecified');
  ok(res, data);
}

export async function timeline(req: Request, res: Response): Promise<void> {
  const data = await service.timeline(req.params.id!);
  ok(res, data);
}

export async function signatures(req: Request, res: Response): Promise<void> {
  const data = await service.signatures(req.params.id!);
  ok(res, data);
}
EOF

mkfile "$API/src/modules/contracts/contracts.routes.ts" <<'EOF'
import { PERMISSIONS } from '@nafi/rbac-core';
import { Router } from 'express';

import { asyncHandler } from '@/utils/asyncHandler';
import { authenticate } from '@/middleware/authenticate';
import { authorize } from '@/middleware/authorize';
import { auditMiddleware } from '@/middleware/auditLog';

import * as controller from './contracts.controller';

export const contractsRouter = Router();

contractsRouter.use(authenticate);

contractsRouter.get(
  '/',
  authorize(PERMISSIONS.CONTRACT_READ_OWN),
  asyncHandler(controller.list),
);

contractsRouter.get(
  '/:id',
  authorize(PERMISSIONS.CONTRACT_READ_OWN),
  asyncHandler(controller.detail),
);

contractsRouter.get('/:id/timeline', asyncHandler(controller.timeline));
contractsRouter.get('/:id/signatures', asyncHandler(controller.signatures));

contractsRouter.post(
  '/',
  authorize(PERMISSIONS.CONTRACT_CREATE),
  auditMiddleware('create', 'contract'),
  asyncHandler(controller.create),
);

contractsRouter.patch(
  '/:id',
  authorize(PERMISSIONS.CONTRACT_UPDATE),
  auditMiddleware('update', 'contract'),
  asyncHandler(controller.update),
);

contractsRouter.post(
  '/:id/sign',
  authorize(PERMISSIONS.CONTRACT_UPDATE),
  auditMiddleware('sign', 'contract'),
  asyncHandler(controller.sign),
);

contractsRouter.post(
  '/:id/freeze',
  authorize(PERMISSIONS.CONTRACT_FREEZE),
  auditMiddleware('freeze', 'contract'),
  asyncHandler(controller.freeze),
);
EOF

# ============================================================
# ESCROWS MODULE
# ============================================================

mkfile "$API/src/modules/escrows/escrows.service.ts" <<'EOF'
import type { Prisma } from '@prisma/client';

import { prisma } from '@/config/prisma';
import { ApiError } from '@/utils/ApiError';

function serialize(
  e: Prisma.EscrowGetPayload<{ include: { contract: true; bank: true; balances: true } }>,
) {
  return {
    id: e.id,
    contractId: e.contractId,
    contractCrop: e.contract.targetCrop,
    managingBankId: e.managingBankId,
    managingBankName: e.bank.fullName,
    status: e.status,
    isLocked: e.isLocked,
    balances: e.balances.map((b) => ({ currency: b.currency, amount: b.amount.toString() })),
    totalDepositedEtb: e.totalDepositedEtb.toString(),
    createdAt: e.createdAt.toISOString(),
  };
}

export async function list(filters: { status?: string; bankId?: string; contractId?: string; page?: number; pageSize?: number }) {
  const page = filters.page ?? 1;
  const pageSize = Math.min(filters.pageSize ?? 20, 100);

  const where: Prisma.EscrowWhereInput = {};
  if (filters.status) where.status = filters.status as never;
  if (filters.bankId) where.managingBankId = filters.bankId;
  if (filters.contractId) where.contractId = filters.contractId;

  const [items, total] = await Promise.all([
    prisma.escrow.findMany({
      where,
      include: { contract: true, bank: true, balances: true },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.escrow.count({ where }),
  ]);

  return { items: items.map(serialize), page, pageSize, total };
}

export async function detail(id: string) {
  const e = await prisma.escrow.findUnique({
    where: { id },
    include: { contract: true, bank: true, balances: true },
  });
  if (!e) throw ApiError.notFound('Escrow not found');
  return serialize(e);
}

export async function ledger(id: string) {
  const entries = await prisma.escrowLedgerEntry.findMany({
    where: { escrowId: id },
    include: { actor: true },
    orderBy: { createdAt: 'desc' },
  });
  return entries.map((e) => ({
    id: e.id,
    escrowId: e.escrowId,
    direction: e.direction,
    amount: e.amount.toString(),
    currency: e.currency,
    purpose: e.purpose,
    referenceId: e.referenceId ?? undefined,
    actorId: e.actorId,
    actorName: e.actor.fullName,
    createdAt: e.createdAt.toISOString(),
  }));
}

export async function release(
  id: string,
  input: { amount: string; currency: string; recipientId: string; purpose: string; approvalToken?: string },
  actorId: string,
) {
  const escrow = await prisma.escrow.findUnique({ where: { id } });
  if (!escrow) throw ApiError.notFound('Escrow not found');
  if (escrow.status === 'FROZEN') throw ApiError.conflict('Escrow is frozen');
  if (escrow.isLocked && Number(input.amount) < 1_000_000) {
    throw ApiError.conflict('Escrow is locked');
  }
  if (Number(input.amount) > 1_000_000 && !input.approvalToken) {
    throw ApiError.badRequest('Multi-party approval token required for releases over 1M ETB');
  }

  const entry = await prisma.$transaction(async (tx) => {
    const e = await tx.escrowLedgerEntry.create({
      data: {
        escrowId: id,
        direction: 'RELEASE',
        amount: input.amount as never,
        currency: input.currency as never,
        purpose: input.purpose,
        actorId,
      },
      include: { actor: true },
    });

    await tx.escrowBalance.updateMany({
      where: { escrowId: id, currency: input.currency as never },
      data: { amount: { decrement: input.amount as never } },
    });

    return e;
  });

  return {
    id: entry.id,
    escrowId: entry.escrowId,
    direction: entry.direction,
    amount: entry.amount.toString(),
    currency: entry.currency,
    purpose: entry.purpose,
    actorId: entry.actorId,
    actorName: entry.actor.fullName,
    createdAt: entry.createdAt.toISOString(),
  };
}

export async function freeze(id: string, reason: string, actorId: string) {
  await prisma.$transaction([
    prisma.escrow.update({
      where: { id },
      data: { status: 'FROZEN', isLocked: true },
    }),
    prisma.escrowLedgerEntry.create({
      data: {
        escrowId: id,
        direction: 'HOLD',
        amount: '0' as never,
        currency: 'ETB',
        purpose: `Freeze: ${reason}`,
        actorId,
      },
    }),
  ]);
  return detail(id);
}

export async function close(id: string) {
  await prisma.escrow.update({
    where: { id },
    data: { status: 'CLOSED', isLocked: false },
  });
  return detail(id);
}
EOF

mkfile "$API/src/modules/escrows/escrows.controller.ts" <<'EOF'
import type { Request, Response } from 'express';

import { ApiError } from '@/utils/ApiError';
import { list as listRes, ok } from '@/utils/apiResponse';

import * as service from './escrows.service';

export async function list(req: Request, res: Response): Promise<void> {
  const result = await service.list({
    status: req.query.status as string | undefined,
    bankId: req.query.bankId as string | undefined,
    contractId: req.query.contractId as string | undefined,
    page: req.query.page ? Number(req.query.page) : undefined,
    pageSize: req.query.pageSize ? Number(req.query.pageSize) : undefined,
  });
  listRes(res, result.items, result.page, result.pageSize, result.total);
}

export async function detail(req: Request, res: Response): Promise<void> {
  ok(res, await service.detail(req.params.id!));
}

export async function ledger(req: Request, res: Response): Promise<void> {
  ok(res, await service.ledger(req.params.id!));
}

export async function release(req: Request, res: Response): Promise<void> {
  if (!req.user) throw ApiError.unauthorized();
  ok(res, await service.release(req.params.id!, req.body, req.user.sub));
}

export async function freeze(req: Request, res: Response): Promise<void> {
  if (!req.user) throw ApiError.unauthorized();
  ok(res, await service.freeze(req.params.id!, req.body.reason ?? 'Unspecified', req.user.sub));
}

export async function close(req: Request, res: Response): Promise<void> {
  ok(res, await service.close(req.params.id!));
}
EOF

mkfile "$API/src/modules/escrows/escrows.routes.ts" <<'EOF'
import { PERMISSIONS } from '@nafi/rbac-core';
import { Router } from 'express';

import { asyncHandler } from '@/utils/asyncHandler';
import { authenticate } from '@/middleware/authenticate';
import { authorize } from '@/middleware/authorize';
import { auditMiddleware } from '@/middleware/auditLog';

import * as controller from './escrows.controller';

export const escrowsRouter = Router();

escrowsRouter.use(authenticate);

escrowsRouter.get('/', authorize(PERMISSIONS.ESCROW_READ_OWN), asyncHandler(controller.list));
escrowsRouter.get('/:id', authorize(PERMISSIONS.ESCROW_READ_OWN), asyncHandler(controller.detail));
escrowsRouter.get('/:id/ledger', authorize(PERMISSIONS.ESCROW_READ_OWN), asyncHandler(controller.ledger));

escrowsRouter.post(
  '/:id/release',
  authorize(PERMISSIONS.ESCROW_RELEASE),
  auditMiddleware('release', 'escrow'),
  asyncHandler(controller.release),
);

escrowsRouter.post(
  '/:id/freeze',
  authorize(PERMISSIONS.ESCROW_FREEZE),
  auditMiddleware('freeze', 'escrow'),
  asyncHandler(controller.freeze),
);

escrowsRouter.post('/:id/close', authorize(PERMISSIONS.ESCROW_RELEASE), asyncHandler(controller.close));
EOF

# ============================================================
# INVESTMENTS MODULE
# ============================================================

mkfile "$API/src/modules/investments/investments.service.ts" <<'EOF'
import type { Prisma } from '@prisma/client';

import { prisma } from '@/config/prisma';
import { ApiError } from '@/utils/ApiError';

function serialize(
  i: Prisma.InvestmentGetPayload<{ include: { contract: true; investor: true } }>,
) {
  return {
    id: i.id,
    contractId: i.contractId,
    contractCrop: i.contract.targetCrop,
    contractRegion: i.contract.region,
    investorId: i.investorId,
    investorName: i.investor.fullName,
    fundingType: i.fundingType,
    amountForeignCurrency: i.amountForeignCurrency.toString(),
    currency: i.currency,
    amountEtb: i.amountEtb.toString(),
    agreedReturnRate: i.agreedReturnRate.toString(),
    expectedReturnEtb: i.expectedReturnEtb.toString(),
    realizedReturnEtb: i.realizedReturnEtb?.toString(),
    investedAt: i.investedAt.toISOString(),
    settledAt: i.settledAt?.toISOString(),
  };
}

export async function mine(investorId: string, filters: { page?: number; pageSize?: number }) {
  const page = filters.page ?? 1;
  const pageSize = Math.min(filters.pageSize ?? 20, 100);

  const where: Prisma.InvestmentWhereInput = { investorId };
  const [items, total] = await Promise.all([
    prisma.investment.findMany({
      where,
      include: { contract: true, investor: true },
      orderBy: { investedAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.investment.count({ where }),
  ]);

  return { items: items.map(serialize), page, pageSize, total };
}

export async function list(filters: { page?: number; pageSize?: number }) {
  const page = filters.page ?? 1;
  const pageSize = Math.min(filters.pageSize ?? 20, 100);

  const [items, total] = await Promise.all([
    prisma.investment.findMany({
      include: { contract: true, investor: true },
      orderBy: { investedAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.investment.count(),
  ]);

  return { items: items.map(serialize), page, pageSize, total };
}

export async function detail(id: string) {
  const i = await prisma.investment.findUnique({
    where: { id },
    include: { contract: true, investor: true },
  });
  if (!i) throw ApiError.notFound('Investment not found');
  return serialize(i);
}

export async function create(
  input: {
    contractId: string;
    fundingType: 'DEBT_FIXED_RETURN' | 'EQUITY_PROFIT_SHARE';
    amountForeignCurrency: string;
    currency: string;
    agreedReturnRate: number;
    sourceOfFunds: string;
  },
  investorId: string,
) {
  const contract = await prisma.contract.findUnique({ where: { id: input.contractId } });
  if (!contract) throw ApiError.notFound('Contract not found');
  if (contract.status === 'FULFILLED' || contract.status === 'DEFAULTED') {
    throw ApiError.conflict('Contract is not open for investment');
  }

  const FX = 55; // Placeholder stable rate — replace with real FX service
  const amountEtb = Number(input.amountForeignCurrency) * FX;
  const expectedReturn = amountEtb * (1 + input.agreedReturnRate);

  const investment = await prisma.investment.create({
    data: {
      contractId: input.contractId,
      investorId,
      fundingType: input.fundingType,
      amountForeignCurrency: input.amountForeignCurrency as never,
      currency: input.currency as never,
      amountEtb: amountEtb.toFixed(2) as never,
      agreedReturnRate: input.agreedReturnRate.toString() as never,
      expectedReturnEtb: expectedReturn.toFixed(2) as never,
      sourceOfFunds: input.sourceOfFunds,
    },
    include: { contract: true, investor: true },
  });

  // Update committed amount on the contract
  await prisma.contract.update({
    where: { id: input.contractId },
    data: { committedAmountEtb: { increment: amountEtb.toFixed(2) as never } },
  });

  return serialize(investment);
}
EOF

mkfile "$API/src/modules/investments/investments.controller.ts" <<'EOF'
import type { Request, Response } from 'express';

import { investmentCreateSchema } from '@nafi/validators';

import { ApiError } from '@/utils/ApiError';
import { created, list as listRes, ok } from '@/utils/apiResponse';

import * as service from './investments.service';

export async function mine(req: Request, res: Response): Promise<void> {
  if (!req.user) throw ApiError.unauthorized();
  const result = await service.mine(req.user.sub, {
    page: req.query.page ? Number(req.query.page) : undefined,
    pageSize: req.query.pageSize ? Number(req.query.pageSize) : undefined,
  });
  listRes(res, result.items, result.page, result.pageSize, result.total);
}

export async function list(req: Request, res: Response): Promise<void> {
  const result = await service.list({
    page: req.query.page ? Number(req.query.page) : undefined,
    pageSize: req.query.pageSize ? Number(req.query.pageSize) : undefined,
  });
  listRes(res, result.items, result.page, result.pageSize, result.total);
}

export async function detail(req: Request, res: Response): Promise<void> {
  ok(res, await service.detail(req.params.id!));
}

export async function create(req: Request, res: Response): Promise<void> {
  if (!req.user) throw ApiError.unauthorized();
  const input = investmentCreateSchema.parse(req.body);
  const data = await service.create(input, req.user.sub);
  created(res, data);
}
EOF

mkfile "$API/src/modules/investments/investments.routes.ts" <<'EOF'
import { PERMISSIONS } from '@nafi/rbac-core';
import { Router } from 'express';

import { asyncHandler } from '@/utils/asyncHandler';
import { authenticate } from '@/middleware/authenticate';
import { authorize } from '@/middleware/authorize';
import { auditMiddleware } from '@/middleware/auditLog';

import * as controller from './investments.controller';

export const investmentsRouter = Router();

investmentsRouter.use(authenticate);

investmentsRouter.get('/mine', authorize(PERMISSIONS.INVESTMENT_READ_OWN), asyncHandler(controller.mine));
investmentsRouter.get('/', authorize(PERMISSIONS.INVESTMENT_READ_ALL), asyncHandler(controller.list));
investmentsRouter.get('/:id', authorize(PERMISSIONS.INVESTMENT_READ_OWN), asyncHandler(controller.detail));
investmentsRouter.post(
  '/',
  authorize(PERMISSIONS.INVESTMENT_CREATE),
  auditMiddleware('create', 'investment'),
  asyncHandler(controller.create),
);
EOF

# ============================================================
# OPPORTUNITIES MODULE (public)
# ============================================================

mkfile "$API/src/modules/opportunities/opportunities.service.ts" <<'EOF'
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
EOF

mkfile "$API/src/modules/opportunities/opportunities.controller.ts" <<'EOF'
import type { Request, Response } from 'express';

import { ok } from '@/utils/apiResponse';

import * as service from './opportunities.service';

export async function list(_req: Request, res: Response): Promise<void> {
  ok(res, await service.list());
}

export async function detail(req: Request, res: Response): Promise<void> {
  ok(res, await service.detail(req.params.id!));
}
EOF

mkfile "$API/src/modules/opportunities/opportunities.routes.ts" <<'EOF'
import { Router } from 'express';

import { asyncHandler } from '@/utils/asyncHandler';

import * as controller from './opportunities.controller';

export const opportunitiesRouter = Router();

opportunitiesRouter.get('/', asyncHandler(controller.list));
opportunitiesRouter.get('/:id', asyncHandler(controller.detail));
EOF

# ============================================================
# INPUTS MODULE
# ============================================================

mkfile "$API/src/modules/inputs/inputs.service.ts" <<'EOF'
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
EOF

mkfile "$API/src/modules/inputs/inputs.controller.ts" <<'EOF'
import type { Request, Response } from 'express';

import { ApiError } from '@/utils/ApiError';
import { created, list as listRes, ok } from '@/utils/apiResponse';

import * as service from './inputs.service';

export async function list(req: Request, res: Response): Promise<void> {
  const result = await service.list({
    contractId: req.query.contractId as string | undefined,
    supplierId: req.query.supplierId as string | undefined,
    isDelivered:
      req.query.isDelivered !== undefined ? req.query.isDelivered === 'true' : undefined,
    isDisbursed:
      req.query.isDisbursed !== undefined ? req.query.isDisbursed === 'true' : undefined,
    page: req.query.page ? Number(req.query.page) : undefined,
    pageSize: req.query.pageSize ? Number(req.query.pageSize) : undefined,
  });
  listRes(res, result.items, result.page, result.pageSize, result.total);
}

export async function detail(req: Request, res: Response): Promise<void> {
  ok(res, await service.detail(req.params.id!));
}

export async function create(req: Request, res: Response): Promise<void> {
  if (!req.user) throw ApiError.unauthorized();
  const data = await service.create(req.body, req.user.sub);
  created(res, data);
}

export async function verify(req: Request, res: Response): Promise<void> {
  ok(res, await service.verifyDelivery(req.params.id!, req.body));
}
EOF

mkfile "$API/src/modules/inputs/inputs.routes.ts" <<'EOF'
import { PERMISSIONS } from '@nafi/rbac-core';
import { Router } from 'express';

import { asyncHandler } from '@/utils/asyncHandler';
import { authenticate } from '@/middleware/authenticate';
import { authorize } from '@/middleware/authorize';
import { auditMiddleware } from '@/middleware/auditLog';

import * as controller from './inputs.controller';

export const inputsRouter = Router();

inputsRouter.use(authenticate);

inputsRouter.get('/', authorize(PERMISSIONS.CONTRACT_READ_OWN), asyncHandler(controller.list));
inputsRouter.get('/:id', authorize(PERMISSIONS.CONTRACT_READ_OWN), asyncHandler(controller.detail));
inputsRouter.post(
  '/',
  authorize(PERMISSIONS.INPUT_CREATE),
  auditMiddleware('create', 'input_purchase'),
  asyncHandler(controller.create),
);
inputsRouter.post(
  '/:id/verify',
  authorize(PERMISSIONS.INPUT_VERIFY),
  auditMiddleware('verify_delivery', 'input_purchase'),
  asyncHandler(controller.verify),
);
EOF

# ============================================================
# SETTLEMENTS MODULE
# ============================================================

mkfile "$API/src/modules/settlements/settlements.service.ts" <<'EOF'
import type { Prisma } from '@prisma/client';

import { prisma } from '@/config/prisma';
import { ApiError } from '@/utils/ApiError';

function serializeSummary(
  s: Prisma.SettlementGetPayload<{ include: { contract: true } }>,
) {
  return {
    id: s.id,
    contractId: s.contractId,
    contractCrop: s.contract.targetCrop,
    status: s.status,
    grossRevenueEtb: s.grossRevenueEtb.toString(),
    actualYieldKg: s.actualYieldKg.toString(),
    totalDistributedEtb: s.totalDistributedEtb.toString(),
    executedAt: s.executedAt?.toISOString(),
    createdAt: s.createdAt.toISOString(),
  };
}

export async function list(filters: { contractId?: string; status?: string; page?: number; pageSize?: number }) {
  const page = filters.page ?? 1;
  const pageSize = Math.min(filters.pageSize ?? 20, 100);

  const where: Prisma.SettlementWhereInput = {};
  if (filters.contractId) where.contractId = filters.contractId;
  if (filters.status) where.status = filters.status as never;

  const [items, total] = await Promise.all([
    prisma.settlement.findMany({
      where,
      include: { contract: true },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.settlement.count({ where }),
  ]);

  return { items: items.map(serializeSummary), page, pageSize, total };
}

export async function detail(id: string) {
  const s = await prisma.settlement.findUnique({
    where: { id },
    include: {
      contract: true,
      distributions: { include: { recipient: true } },
    },
  });
  if (!s) throw ApiError.notFound('Settlement not found');

  return {
    ...serializeSummary(s),
    distributions: s.distributions.map((d) => ({
      recipientId: d.recipientId,
      recipientName: d.recipient.fullName,
      role: d.role,
      payoutAmountEtb: d.payoutAmountEtb.toString(),
      notes: d.notes ?? undefined,
    })),
    waterfallOrder: (s.waterfallOrder as string[]) ?? [],
    approvalChain: [],
  };
}

/**
 * Simulate a settlement without executing it.
 * Computes the waterfall distribution across all parties.
 */
export async function simulate(input: {
  contractId: string;
  actualYieldKg: string | number;
  grossRevenueEtb: string | number;
}) {
  const contract = await prisma.contract.findUnique({
    where: { id: input.contractId },
    include: {
      investments: { include: { investor: true } },
      inputPurchases: true,
      farmer: true,
      bank: true,
      escrow: true,
    },
  });
  if (!contract) throw ApiError.notFound('Contract not found');

  const distributions: {
    recipientId: string;
    recipientName: string;
    role: string;
    payoutAmountEtb: string;
  }[] = [];

  let remaining = Number(input.grossRevenueEtb);

  // 1. Diaspora investors
  for (const inv of contract.investments) {
    const principalEtb = Number(inv.amountEtb);
    const payout = principalEtb * (1 + Number(inv.agreedReturnRate));
    distributions.push({
      recipientId: inv.investorId,
      recipientName: inv.investor.fullName,
      role: 'DIASPORA_INVESTOR',
      payoutAmountEtb: payout.toFixed(2),
    });
    remaining -= payout;
  }

  // 2. Input suppliers (delivered but not disbursed)
  for (const p of contract.inputPurchases) {
    if (p.isDelivered && !p.isDisbursed) {
      distributions.push({
        recipientId: p.supplierId,
        recipientName: 'Input Supplier',
        role: 'INPUT_SUPPLIER',
        payoutAmountEtb: p.totalCostEtb.toString(),
      });
      remaining -= Number(p.totalCostEtb);
    }
  }

  // 3. Bank service fee (2%)
  const bankFee = Number(input.grossRevenueEtb) * 0.02;
  if (contract.bank) {
    distributions.push({
      recipientId: contract.bankId!,
      recipientName: contract.bank.fullName,
      role: 'COMMERCIAL_BANK',
      payoutAmountEtb: bankFee.toFixed(2),
    });
    remaining -= bankFee;
  }

  // 4. Farmer residual
  if (remaining > 0) {
    distributions.push({
      recipientId: contract.commercialFarmerId,
      recipientName: contract.farmer.fullName,
      role: 'COMMERCIAL_FARMER',
      payoutAmountEtb: remaining.toFixed(2),
    });
  }

  const settlement = await prisma.settlement.create({
    data: {
      contractId: input.contractId,
      status: 'SIMULATED',
      grossRevenueEtb: String(input.grossRevenueEtb) as never,
      actualYieldKg: String(input.actualYieldKg) as never,
      totalDistributedEtb: '0',
      waterfallOrder: ['DIASPORA_INVESTOR', 'INPUT_SUPPLIER', 'COMMERCIAL_BANK', 'COMMERCIAL_FARMER'],
    },
    include: { contract: true },
  });

  return {
    ...serializeSummary(settlement),
    distributions,
    waterfallOrder: ['DIASPORA_INVESTOR', 'INPUT_SUPPLIER', 'COMMERCIAL_BANK', 'COMMERCIAL_FARMER'],
    approvalChain: [],
  };
}

/**
 * Execute a settlement: persist distributions and mark the contract fulfilled.
 * In production this would run inside an idempotent job.
 */
export async function execute(id: string, _approvalToken: string) {
  const s = await prisma.settlement.findUnique({
    where: { id },
    include: { contract: true },
  });
  if (!s) throw ApiError.notFound('Settlement not found');
  if (s.status === 'EXECUTED') throw ApiError.conflict('Already executed');

  const simulated = await simulate({
    contractId: s.contractId,
    actualYieldKg: s.actualYieldKg.toString(),
    grossRevenueEtb: s.grossRevenueEtb.toString(),
  });

  await prisma.$transaction(async (tx) => {
    for (const d of simulated.distributions) {
      await tx.settlementDistribution.create({
        data: {
          settlementId: id,
          recipientId: d.recipientId,
          role: d.role as never,
          payoutAmountEtb: d.payoutAmountEtb as never,
        },
      });
    }

    const total = simulated.distributions.reduce(
      (sum, d) => sum + Number(d.payoutAmountEtb),
      0,
    );

    await tx.settlement.update({
      where: { id },
      data: {
        status: 'EXECUTED',
        executedAt: new Date(),
        totalDistributedEtb: total.toFixed(2) as never,
      },
    });

    await tx.contract.update({
      where: { id: s.contractId },
      data: { status: 'FULFILLED' },
    });

    await tx.contractTimelineEvent.create({
      data: {
        contractId: s.contractId,
        type: 'SETTLED',
        label: 'Settlement executed',
      },
    });
  });

  return detail(id);
}

export async function reverse(id: string, reason: string) {
  await prisma.settlement.update({
    where: { id },
    data: { status: 'REVERSED', reversalReason: reason },
  });
  return detail(id);
}
EOF

mkfile "$API/src/modules/settlements/settlements.controller.ts" <<'EOF'
import type { Request, Response } from 'express';

import { ApiError } from '@/utils/ApiError';
import { list as listRes, ok } from '@/utils/apiResponse';

import * as service from './settlements.service';

export async function list(req: Request, res: Response): Promise<void> {
  const result = await service.list({
    contractId: req.query.contractId as string | undefined,
    status: req.query.status as string | undefined,
    page: req.query.page ? Number(req.query.page) : undefined,
    pageSize: req.query.pageSize ? Number(req.query.pageSize) : undefined,
  });
  listRes(res, result.items, result.page, result.pageSize, result.total);
}

export async function detail(req: Request, res: Response): Promise<void> {
  ok(res, await service.detail(req.params.id!));
}

export async function simulate(req: Request, res: Response): Promise<void> {
  ok(res, await service.simulate(req.body));
}

export async function execute(req: Request, res: Response): Promise<void> {
  const token = (req.body as { approvalToken?: string }).approvalToken;
  if (!token) throw ApiError.badRequest('Approval token required');
  ok(res, await service.execute(req.params.id!, token));
}

export async function reverse(req: Request, res: Response): Promise<void> {
  ok(res, await service.reverse(req.params.id!, req.body.reason ?? 'Unspecified'));
}
EOF

mkfile "$API/src/modules/settlements/settlements.routes.ts" <<'EOF'
import { PERMISSIONS } from '@nafi/rbac-core';
import { Router } from 'express';

import { asyncHandler } from '@/utils/asyncHandler';
import { authenticate } from '@/middleware/authenticate';
import { authorize } from '@/middleware/authorize';
import { auditMiddleware } from '@/middleware/auditLog';

import * as controller from './settlements.controller';

export const settlementsRouter = Router();

settlementsRouter.use(authenticate);

settlementsRouter.get('/', authorize(PERMISSIONS.SETTLEMENT_READ), asyncHandler(controller.list));
settlementsRouter.get('/:id', authorize(PERMISSIONS.SETTLEMENT_READ), asyncHandler(controller.detail));
settlementsRouter.post(
  '/simulate',
  authorize(PERMISSIONS.SETTLEMENT_SIMULATE),
  asyncHandler(controller.simulate),
);
settlementsRouter.post(
  '/:id/execute',
  authorize(PERMISSIONS.SETTLEMENT_EXECUTE),
  auditMiddleware('execute', 'settlement'),
  asyncHandler(controller.execute),
);
settlementsRouter.post(
  '/:id/reverse',
  authorize(PERMISSIONS.SETTLEMENT_EXECUTE),
  auditMiddleware('reverse', 'settlement'),
  asyncHandler(controller.reverse),
);
EOF

# ============================================================
# COLLATERAL MODULE
# ============================================================

mkfile "$API/src/modules/collateral/collateral.service.ts" <<'EOF'
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
EOF

mkfile "$API/src/modules/collateral/collateral.controller.ts" <<'EOF'
import type { Request, Response } from 'express';

import { ApiError } from '@/utils/ApiError';
import { created, list as listRes, ok } from '@/utils/apiResponse';

import * as service from './collateral.service';

export async function list(req: Request, res: Response): Promise<void> {
  const result = await service.list({
    type: req.query.type as string | undefined,
    lienStatus: req.query.lienStatus as string | undefined,
    ownerId: req.query.ownerId as string | undefined,
    lienHolderId: req.query.lienHolderId as string | undefined,
    page: req.query.page ? Number(req.query.page) : undefined,
    pageSize: req.query.pageSize ? Number(req.query.pageSize) : undefined,
  });
  listRes(res, result.items, result.page, result.pageSize, result.total);
}

export async function detail(req: Request, res: Response): Promise<void> {
  ok(res, await service.detail(req.params.id!));
}

export async function register(req: Request, res: Response): Promise<void> {
  if (!req.user) throw ApiError.unauthorized();
  const data = await service.register(req.body, req.user.sub);
  created(res, data);
}

export async function lien(req: Request, res: Response): Promise<void> {
  const data = await service.registerLien(req.params.id!, req.body.lienHolderId);
  ok(res, data);
}

export async function release(req: Request, res: Response): Promise<void> {
  ok(res, await service.releaseLien(req.params.id!));
}

export async function liquidate(req: Request, res: Response): Promise<void> {
  ok(res, await service.liquidate(req.params.id!, req.body.reason ?? 'Unspecified'));
}
EOF

mkfile "$API/src/modules/collateral/collateral.routes.ts" <<'EOF'
import { PERMISSIONS } from '@nafi/rbac-core';
import { Router } from 'express';

import { asyncHandler } from '@/utils/asyncHandler';
import { authenticate } from '@/middleware/authenticate';
import { authorize } from '@/middleware/authorize';
import { auditMiddleware } from '@/middleware/auditLog';

import * as controller from './collateral.controller';

export const collateralRouter = Router();

collateralRouter.use(authenticate);

collateralRouter.get('/', authorize(PERMISSIONS.COLLATERAL_REGISTER), asyncHandler(controller.list));
collateralRouter.get('/:id', authorize(PERMISSIONS.COLLATERAL_REGISTER), asyncHandler(controller.detail));
collateralRouter.post(
  '/',
  authorize(PERMISSIONS.COLLATERAL_REGISTER),
  auditMiddleware('register', 'collateral'),
  asyncHandler(controller.register),
);
collateralRouter.post('/:id/lien', authorize(PERMISSIONS.COLLATERAL_REGISTER), asyncHandler(controller.lien));
collateralRouter.post('/:id/release', authorize(PERMISSIONS.COLLATERAL_REGISTER), asyncHandler(controller.release));
collateralRouter.post(
  '/:id/liquidate',
  authorize(PERMISSIONS.COLLATERAL_LIQUIDATE),
  auditMiddleware('liquidate', 'collateral'),
  asyncHandler(controller.liquidate),
);
EOF

# ============================================================
# DISPUTES MODULE
# ============================================================

mkfile "$API/src/modules/disputes/disputes.service.ts" <<'EOF'
import type { Prisma } from '@prisma/client';

import { prisma } from '@/config/prisma';
import { ApiError } from '@/utils/ApiError';

function serializeSummary(
  d: Prisma.DisputeGetPayload<{ include: { contract: true; filedBy: true; arbitrator: true } }>,
) {
  return {
    id: d.id,
    contractId: d.contractId,
    contractCrop: d.contract.targetCrop,
    category: d.category,
    status: d.status,
    filedById: d.filedById,
    filedByName: d.filedBy.fullName,
    summary: d.summary,
    arbitratorId: d.arbitratorId ?? undefined,
    arbitratorName: d.arbitrator?.fullName ?? undefined,
    filedAt: d.filedAt.toISOString(),
    resolvedAt: d.resolvedAt?.toISOString(),
  };
}

export async function list(filters: { contractId?: string; status?: string; category?: string; page?: number; pageSize?: number }) {
  const page = filters.page ?? 1;
  const pageSize = Math.min(filters.pageSize ?? 20, 100);

  const where: Prisma.DisputeWhereInput = {};
  if (filters.contractId) where.contractId = filters.contractId;
  if (filters.status) where.status = filters.status as never;
  if (filters.category) where.category = filters.category as never;

  const [items, total] = await Promise.all([
    prisma.dispute.findMany({
      where,
      include: { contract: true, filedBy: true, arbitrator: true },
      orderBy: { filedAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.dispute.count({ where }),
  ]);

  return { items: items.map(serializeSummary), page, pageSize, total };
}

export async function detail(id: string) {
  const d = await prisma.dispute.findUnique({
    where: { id },
    include: {
      contract: true,
      filedBy: true,
      arbitrator: true,
      evidence: true,
    },
  });
  if (!d) throw ApiError.notFound('Dispute not found');

  return {
    ...serializeSummary(d),
    evidence: d.evidence.map((e) => ({
      id: e.id,
      label: e.label,
      fileUrl: e.fileUrl,
      uploadedAt: e.uploadedAt.toISOString(),
    })),
    hearingAt: d.hearingAt?.toISOString(),
    decision: d.decision ?? undefined,
    decisionAt: d.decisionAt?.toISOString(),
  };
}

export async function file(
  input: { contractId: string; category: string; summary: string; evidenceUrls?: string[] },
  filedById: string,
) {
  const d = await prisma.dispute.create({
    data: {
      contractId: input.contractId,
      category: input.category as never,
      summary: input.summary,
      filedById,
      evidence: input.evidenceUrls?.length
        ? {
            create: input.evidenceUrls.map((url, i) => ({
              label: `Evidence ${i + 1}`,
              fileUrl: url,
            })),
          }
        : undefined,
    },
    include: { contract: true, filedBy: true, arbitrator: true },
  });

  // Freeze associated escrow
  await prisma.escrow.updateMany({
    where: { contractId: input.contractId },
    data: { status: 'FROZEN', isLocked: true },
  });

  await prisma.contract.update({
    where: { id: input.contractId },
    data: { status: 'DISPUTED' },
  });

  return serializeSummary(d);
}

export async function scheduleHearing(id: string, hearingAt: string, arbitratorId: string) {
  const d = await prisma.dispute.update({
    where: { id },
    data: {
      status: 'HEARING_SCHEDULED',
      hearingAt: new Date(hearingAt),
      arbitratorId,
    },
    include: { contract: true, filedBy: true, arbitrator: true, evidence: true },
  });
  return detail(d.id);
}

export async function decide(id: string, decision: string, outcome: string) {
  const d = await prisma.dispute.update({
    where: { id },
    data: {
      status: outcome === 'REJECT' ? 'CLOSED' : 'DECIDED',
      decision,
      decisionAt: new Date(),
      resolvedAt: new Date(),
    },
    include: { contract: true, filedBy: true, arbitrator: true, evidence: true },
  });
  return detail(d.id);
}
EOF

mkfile "$API/src/modules/disputes/disputes.controller.ts" <<'EOF'
import type { Request, Response } from 'express';

import { ApiError } from '@/utils/ApiError';
import { created, list as listRes, ok } from '@/utils/apiResponse';

import * as service from './disputes.service';

export async function list(req: Request, res: Response): Promise<void> {
  const result = await service.list({
    contractId: req.query.contractId as string | undefined,
    status: req.query.status as string | undefined,
    category: req.query.category as string | undefined,
    page: req.query.page ? Number(req.query.page) : undefined,
    pageSize: req.query.pageSize ? Number(req.query.pageSize) : undefined,
  });
  listRes(res, result.items, result.page, result.pageSize, result.total);
}

export async function detail(req: Request, res: Response): Promise<void> {
  ok(res, await service.detail(req.params.id!));
}

export async function file(req: Request, res: Response): Promise<void> {
  if (!req.user) throw ApiError.unauthorized();
  const data = await service.file(req.body, req.user.sub);
  created(res, data);
}

export async function schedule(req: Request, res: Response): Promise<void> {
  const data = await service.scheduleHearing(
    req.params.id!,
    req.body.hearingAt,
    req.body.arbitratorId,
  );
  ok(res, data);
}

export async function decide(req: Request, res: Response): Promise<void> {
  const data = await service.decide(req.params.id!, req.body.decision, req.body.outcome);
  ok(res, data);
}
EOF

mkfile "$API/src/modules/disputes/disputes.routes.ts" <<'EOF'
import { PERMISSIONS } from '@nafi/rbac-core';
import { Router } from 'express';

import { asyncHandler } from '@/utils/asyncHandler';
import { authenticate } from '@/middleware/authenticate';
import { authorize } from '@/middleware/authorize';
import { auditMiddleware } from '@/middleware/auditLog';

import * as controller from './disputes.controller';

export const disputesRouter = Router();

disputesRouter.use(authenticate);

disputesRouter.get('/', authorize(PERMISSIONS.CONTRACT_READ_OWN), asyncHandler(controller.list));
disputesRouter.get('/:id', authorize(PERMISSIONS.CONTRACT_READ_OWN), asyncHandler(controller.detail));
disputesRouter.post(
  '/',
  authorize(PERMISSIONS.DISPUTE_FLAG),
  auditMiddleware('file', 'dispute'),
  asyncHandler(controller.file),
);
disputesRouter.post(
  '/:id/schedule',
  authorize(PERMISSIONS.DISPUTE_ARBITRATE),
  asyncHandler(controller.schedule),
);
disputesRouter.post(
  '/:id/decide',
  authorize(PERMISSIONS.DISPUTE_ARBITRATE),
  auditMiddleware('decide', 'dispute'),
  asyncHandler(controller.decide),
);
EOF

# ============================================================
# REPORTS MODULE
# ============================================================

mkfile "$API/src/modules/reports/reports.service.ts" <<'EOF'
import type { Prisma } from '@prisma/client';

import { prisma } from '@/config/prisma';
import { ApiError } from '@/utils/ApiError';

function serialize(r: Prisma.ReportGetPayload<{ include: { generatedBy: true } }>) {
  return {
    id: r.id,
    type: r.type,
    title: r.title,
    periodStart: r.periodStart.toISOString(),
    periodEnd: r.periodEnd.toISOString(),
    format: r.format,
    fileUrl: r.fileUrl,
    generatedById: r.generatedById,
    generatedByName: r.generatedBy.fullName,
    generatedAt: r.generatedAt.toISOString(),
  };
}

export async function list(filters: { type?: string; page?: number; pageSize?: number }) {
  const page = filters.page ?? 1;
  const pageSize = Math.min(filters.pageSize ?? 20, 100);

  const where: Prisma.ReportWhereInput = {};
  if (filters.type) where.type = filters.type as never;

  const [items, total] = await Promise.all([
    prisma.report.findMany({
      where,
      include: { generatedBy: true },
      orderBy: { generatedAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.report.count({ where }),
  ]);

  return { items: items.map(serialize), page, pageSize, total };
}

export async function detail(id: string) {
  const r = await prisma.report.findUnique({
    where: { id },
    include: { generatedBy: true },
  });
  if (!r) throw ApiError.notFound('Report not found');
  return serialize(r);
}

export async function generate(
  input: {
    type: string;
    periodStart: string;
    periodEnd: string;
    format: string;
  },
  generatedById: string,
) {
  const report = await prisma.report.create({
    data: {
      type: input.type as never,
      title: `${input.type.replace(/_/g, ' ')} — ${input.periodStart} to ${input.periodEnd}`,
      periodStart: new Date(input.periodStart),
      periodEnd: new Date(input.periodEnd),
      format: input.format as never,
      fileUrl: `/reports/${Date.now()}.${input.format.toLowerCase()}`,
      generatedById,
    },
    include: { generatedBy: true },
  });
  return serialize(report);
}
EOF

mkfile "$API/src/modules/reports/reports.controller.ts" <<'EOF'
import type { Request, Response } from 'express';

import { ApiError } from '@/utils/ApiError';
import { created, list as listRes, ok } from '@/utils/apiResponse';

import * as service from './reports.service';

export async function list(req: Request, res: Response): Promise<void> {
  const result = await service.list({
    type: req.query.type as string | undefined,
    page: req.query.page ? Number(req.query.page) : undefined,
    pageSize: req.query.pageSize ? Number(req.query.pageSize) : undefined,
  });
  listRes(res, result.items, result.page, result.pageSize, result.total);
}

export async function detail(req: Request, res: Response): Promise<void> {
  ok(res, await service.detail(req.params.id!));
}

export async function generate(req: Request, res: Response): Promise<void> {
  if (!req.user) throw ApiError.unauthorized();
  created(res, await service.generate(req.body, req.user.sub));
}
EOF

mkfile "$API/src/modules/reports/reports.routes.ts" <<'EOF'
import { PERMISSIONS } from '@nafi/rbac-core';
import { Router } from 'express';

import { asyncHandler } from '@/utils/asyncHandler';
import { authenticate } from '@/middleware/authenticate';
import { authorize } from '@/middleware/authorize';

import * as controller from './reports.controller';

export const reportsRouter = Router();

reportsRouter.use(authenticate);

reportsRouter.get('/', authorize(PERMISSIONS.REPORT_READ_OWN), asyncHandler(controller.list));
reportsRouter.get('/:id', authorize(PERMISSIONS.REPORT_READ_OWN), asyncHandler(controller.detail));
reportsRouter.post('/', authorize(PERMISSIONS.REPORT_GENERATE), asyncHandler(controller.generate));
EOF

# ============================================================
# USERS MODULE
# ============================================================

mkfile "$API/src/modules/users/users.service.ts" <<'EOF'
import type { Prisma } from '@prisma/client';

import { ROLE_PERMISSIONS, type Role } from '@nafi/rbac-core';

import { prisma } from '@/config/prisma';
import { ApiError } from '@/utils/ApiError';
import { generateNafiId } from '@/utils/nafiId';
import { hashPassword } from '@/utils/password';

function serialize(u: Prisma.StakeholderGetPayload<object>) {
  return {
    id: u.id,
    nafiId: u.nafiId,
    fullName: u.fullName,
    email: u.email,
    role: u.role,
    institutionId: u.institutionId ?? undefined,
    institutionName: u.institutionName ?? undefined,
    isActive: u.isActive,
    lastLoginAt: u.lastLoginAt?.toISOString(),
    createdAt: u.createdAt.toISOString(),
  };
}

export async function list(filters: {
  role?: string;
  institutionId?: string;
  isActive?: boolean;
  page?: number;
  pageSize?: number;
}) {
  const page = filters.page ?? 1;
  const pageSize = Math.min(filters.pageSize ?? 20, 100);

  const where: Prisma.StakeholderWhereInput = {};
  if (filters.role) where.role = filters.role as never;
  if (filters.institutionId) where.institutionId = filters.institutionId;
  if (filters.isActive !== undefined) where.isActive = filters.isActive;

  const [items, total] = await Promise.all([
    prisma.stakeholder.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.stakeholder.count({ where }),
  ]);

  return { items: items.map(serialize), page, pageSize, total };
}

export async function detail(id: string) {
  const u = await prisma.stakeholder.findUnique({ where: { id } });
  if (!u) throw ApiError.notFound('User not found');
  return serialize(u);
}

export async function invite(input: { email: string; fullName: string; role: string }) {
  const existing = await prisma.stakeholder.findUnique({ where: { email: input.email } });
  if (existing) throw ApiError.conflict('User already exists');

  const passwordHash = await hashPassword(`Temp-${Math.random().toString(36).slice(2)}`);

  let nafiId = generateNafiId();
  for (let i = 0; i < 5; i++) {
    const clash = await prisma.stakeholder.findUnique({ where: { nafiId } });
    if (!clash) break;
    nafiId = generateNafiId();
  }

  const u = await prisma.stakeholder.create({
    data: {
      nafiId,
      email: input.email,
      fullName: input.fullName,
      passwordHash,
      role: input.role as never,
    },
  });

  // Ensure the permission list is derived cleanly for the response
  const perms = ROLE_PERMISSIONS[input.role as Role];

  return { ...serialize(u), permissions: perms };
}

export async function deactivate(id: string) {
  const u = await prisma.stakeholder.update({
    where: { id },
    data: { isActive: false },
  });
  return serialize(u);
}

export async function reactivate(id: string) {
  const u = await prisma.stakeholder.update({
    where: { id },
    data: { isActive: true },
  });
  return serialize(u);
}
EOF

mkfile "$API/src/modules/users/users.controller.ts" <<'EOF'
import type { Request, Response } from 'express';

import { created, list as listRes, ok } from '@/utils/apiResponse';

import * as service from './users.service';

export async function list(req: Request, res: Response): Promise<void> {
  const result = await service.list({
    role: req.query.role as string | undefined,
    institutionId: req.query.institutionId as string | undefined,
    isActive:
      req.query.isActive !== undefined ? req.query.isActive === 'true' : undefined,
    page: req.query.page ? Number(req.query.page) : undefined,
    pageSize: req.query.pageSize ? Number(req.query.pageSize) : undefined,
  });
  listRes(res, result.items, result.page, result.pageSize, result.total);
}

export async function detail(req: Request, res: Response): Promise<void> {
  ok(res, await service.detail(req.params.id!));
}

export async function invite(req: Request, res: Response): Promise<void> {
  created(res, await service.invite(req.body));
}

export async function deactivate(req: Request, res: Response): Promise<void> {
  ok(res, await service.deactivate(req.params.id!));
}

export async function reactivate(req: Request, res: Response): Promise<void> {
  ok(res, await service.reactivate(req.params.id!));
}
EOF

mkfile "$API/src/modules/users/users.routes.ts" <<'EOF'
import { PERMISSIONS } from '@nafi/rbac-core';
import { Router } from 'express';

import { asyncHandler } from '@/utils/asyncHandler';
import { authenticate } from '@/middleware/authenticate';
import { authorize } from '@/middleware/authorize';
import { auditMiddleware } from '@/middleware/auditLog';

import * as controller from './users.controller';

export const usersRouter = Router();

usersRouter.use(authenticate);

usersRouter.get('/', authorize(PERMISSIONS.USER_MANAGE_ALL), asyncHandler(controller.list));
usersRouter.get('/:id', authorize(PERMISSIONS.USER_MANAGE_ALL), asyncHandler(controller.detail));
usersRouter.post(
  '/invite',
  authorize(PERMISSIONS.USER_INVITE),
  auditMiddleware('invite', 'user'),
  asyncHandler(controller.invite),
);
usersRouter.post(
  '/:id/deactivate',
  authorize(PERMISSIONS.USER_MANAGE_ALL),
  auditMiddleware('deactivate', 'user'),
  asyncHandler(controller.deactivate),
);
usersRouter.post(
  '/:id/reactivate',
  authorize(PERMISSIONS.USER_MANAGE_ALL),
  auditMiddleware('reactivate', 'user'),
  asyncHandler(controller.reactivate),
);
EOF

# ============================================================
# NOTIFICATIONS MODULE
# ============================================================

mkfile "$API/src/modules/notifications/notifications.service.ts" <<'EOF'
import { prisma } from '@/config/prisma';

export async function list(userId: string) {
  const items = await prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });
  return items.map((n) => ({
    id: n.id,
    title: n.title,
    body: n.body,
    isRead: n.isRead,
    createdAt: n.createdAt.toISOString(),
    deepLink: n.deepLink ?? undefined,
  }));
}

export async function unreadCount(userId: string) {
  const count = await prisma.notification.count({
    where: { userId, isRead: false },
  });
  return { count };
}

export async function markRead(id: string, userId: string) {
  await prisma.notification.updateMany({
    where: { id, userId },
    data: { isRead: true },
  });
}

export async function markAllRead(userId: string) {
  await prisma.notification.updateMany({
    where: { userId, isRead: false },
    data: { isRead: true },
  });
}

export async function savePushSubscription(
  userId: string,
  subscription: { endpoint: string; keys: unknown },
) {
  await prisma.pushSubscription.upsert({
    where: { endpoint: subscription.endpoint },
    update: { userId, keys: subscription.keys as never },
    create: {
      userId,
      endpoint: subscription.endpoint,
      keys: subscription.keys as never,
    },
  });
}

export async function removePushSubscription(endpoint: string) {
  await prisma.pushSubscription.deleteMany({ where: { endpoint } });
}
EOF

mkfile "$API/src/modules/notifications/notifications.controller.ts" <<'EOF'
import type { Request, Response } from 'express';

import { env } from '@/config/env';
import { ApiError } from '@/utils/ApiError';
import { noContent, ok } from '@/utils/apiResponse';

import * as service from './notifications.service';

export async function list(req: Request, res: Response): Promise<void> {
  if (!req.user) throw ApiError.unauthorized();
  ok(res, await service.list(req.user.sub));
}

export async function unreadCount(req: Request, res: Response): Promise<void> {
  if (!req.user) throw ApiError.unauthorized();
  ok(res, await service.unreadCount(req.user.sub));
}

export async function markRead(req: Request, res: Response): Promise<void> {
  if (!req.user) throw ApiError.unauthorized();
  await service.markRead(req.params.id!, req.user.sub);
  noContent(res);
}

export async function markAllRead(req: Request, res: Response): Promise<void> {
  if (!req.user) throw ApiError.unauthorized();
  await service.markAllRead(req.user.sub);
  noContent(res);
}

export function vapidPublicKey(_req: Request, res: Response): void {
  ok(res, { publicKey: env.VAPID_PUBLIC_KEY ?? '' });
}

export async function pushSubscribe(req: Request, res: Response): Promise<void> {
  if (!req.user) throw ApiError.unauthorized();
  await service.savePushSubscription(req.user.sub, req.body);
  ok(res, { subscribed: true });
}

export async function pushUnsubscribe(req: Request, res: Response): Promise<void> {
  await service.removePushSubscription(req.body.endpoint);
  ok(res, { unsubscribed: true });
}
EOF

mkfile "$API/src/modules/notifications/notifications.routes.ts" <<'EOF'
import { Router } from 'express';

import { asyncHandler } from '@/utils/asyncHandler';
import { authenticate } from '@/middleware/authenticate';

import * as controller from './notifications.controller';

export const notificationsRouter = Router();

notificationsRouter.get('/push/vapid-public-key', asyncHandler(controller.vapidPublicKey));

notificationsRouter.use(authenticate);

notificationsRouter.get('/', asyncHandler(controller.list));
notificationsRouter.get('/unread-count', asyncHandler(controller.unreadCount));
notificationsRouter.post('/:id/read', asyncHandler(controller.markRead));
notificationsRouter.post('/read-all', asyncHandler(controller.markAllRead));
notificationsRouter.post('/push/subscribe', asyncHandler(controller.pushSubscribe));
notificationsRouter.post('/push/unsubscribe', asyncHandler(controller.pushUnsubscribe));
EOF

# ============================================================
# AUDIT MODULE
# ============================================================

mkfile "$API/src/modules/audit/audit.service.ts" <<'EOF'
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
EOF

mkfile "$API/src/modules/audit/audit.controller.ts" <<'EOF'
import type { Request, Response } from 'express';

import { list as listRes } from '@/utils/apiResponse';

import * as service from './audit.service';

export async function list(req: Request, res: Response): Promise<void> {
  const result = await service.list({
    actorId: req.query.actorId as string | undefined,
    resource: req.query.resource as string | undefined,
    resourceId: req.query.resourceId as string | undefined,
    from: req.query.from as string | undefined,
    to: req.query.to as string | undefined,
    page: req.query.page ? Number(req.query.page) : undefined,
    pageSize: req.query.pageSize ? Number(req.query.pageSize) : undefined,
  });
  listRes(res, result.items, result.page, result.pageSize, result.total);
}
EOF

mkfile "$API/src/modules/audit/audit.routes.ts" <<'EOF'
import { PERMISSIONS } from '@nafi/rbac-core';
import { Router } from 'express';

import { asyncHandler } from '@/utils/asyncHandler';
import { authenticate } from '@/middleware/authenticate';
import { authorize } from '@/middleware/authorize';

import * as controller from './audit.controller';

export const auditRouter = Router();

auditRouter.use(authenticate);
auditRouter.get('/', authorize(PERMISSIONS.AUDIT_READ), asyncHandler(controller.list));
EOF

# ============================================================
# PUBLIC MODULE
# ============================================================

mkfile "$API/src/modules/public/public.service.ts" <<'EOF'
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
EOF

mkfile "$API/src/modules/public/public.controller.ts" <<'EOF'
import type { Request, Response } from 'express';

import { ok } from '@/utils/apiResponse';

import * as service from './public.service';

export async function stats(_req: Request, res: Response): Promise<void> {
  ok(res, await service.stats());
}
EOF

mkfile "$API/src/modules/public/public.routes.ts" <<'EOF'
import { Router } from 'express';

import { asyncHandler } from '@/utils/asyncHandler';

import * as controller from './public.controller';

export const publicRouter = Router();

publicRouter.get('/stats', asyncHandler(controller.stats));
EOF

# ============================================================
# HEALTH MODULE
# ============================================================

mkfile "$API/src/modules/health/health.controller.ts" <<'EOF'
import type { Request, Response } from 'express';

import { prisma } from '@/config/prisma';

export function liveness(_req: Request, res: Response): void {
  res.json({ status: 'ok' });
}

export async function readiness(_req: Request, res: Response): Promise<void> {
  const start = Date.now();
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({
      status: 'ok',
      database: { status: 'ok', latencyMs: Date.now() - start },
    });
  } catch {
    res.status(503).json({
      status: 'degraded',
      database: { status: 'error' },
    });
  }
}

export async function db(_req: Request, res: Response): Promise<void> {
  const start = Date.now();
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: 'ok', latencyMs: Date.now() - start });
  } catch {
    res.status(503).json({ status: 'error' });
  }
}
EOF

mkfile "$API/src/modules/health/health.routes.ts" <<'EOF'
import { Router } from 'express';

import { asyncHandler } from '@/utils/asyncHandler';

import * as controller from './health.controller';

export const healthRouter = Router();

healthRouter.get('/', controller.liveness);
healthRouter.get('/ready', asyncHandler(controller.readiness));
healthRouter.get('/db', asyncHandler(controller.db));
EOF

# ============================================================
# APP + SERVER
# ============================================================

mkfile "$API/src/app.ts" <<'EOF'
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import pinoHttp from 'pino-http';

import { corsOptions } from '@/config/cors';
import { logger } from '@/config/logger';
import { errorHandler, notFoundHandler } from '@/middleware/errorHandler';
import { generalLimiter } from '@/middleware/rateLimiter';
import { requestId } from '@/middleware/requestId';
import { tenantScope } from '@/middleware/tenantScope';
import { auditRouter } from '@/modules/audit/audit.routes';
import { authRouter } from '@/modules/auth/auth.routes';
import { collateralRouter } from '@/modules/collateral/collateral.routes';
import { contractsRouter } from '@/modules/contracts/contracts.routes';
import { disputesRouter } from '@/modules/disputes/disputes.routes';
import { escrowsRouter } from '@/modules/escrows/escrows.routes';
import { healthRouter } from '@/modules/health/health.routes';
import { inputsRouter } from '@/modules/inputs/inputs.routes';
import { investmentsRouter } from '@/modules/investments/investments.routes';
import { notificationsRouter } from '@/modules/notifications/notifications.routes';
import { opportunitiesRouter } from '@/modules/opportunities/opportunities.routes';
import { publicRouter } from '@/modules/public/public.routes';
import { reportsRouter } from '@/modules/reports/reports.routes';
import { settlementsRouter } from '@/modules/settlements/settlements.routes';
import { usersRouter } from '@/modules/users/users.routes';

export function createApp(): express.Express {
  const app = express();

  app.set('trust proxy', 1);

  app.use(requestId);
  app.use(
    pinoHttp({
      logger,
      customLogLevel: (_req, res) => (res.statusCode >= 500 ? 'error' : 'info'),
      genReqId: (_req, res) => res.locals.requestId,
    }),
  );
  app.use(helmet());
  app.use(cors(corsOptions));
  app.use(cookieParser());
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true }));
  app.use(generalLimiter);
  app.use(tenantScope);

  // Health routes (no /api/v1 prefix aliasing for uptime probes)
  app.use('/health', healthRouter);

  // API v1
  const api = express.Router();
  api.use('/health', healthRouter);
  api.use('/auth', authRouter);
  api.use('/public', publicRouter);
  api.use('/opportunities', opportunitiesRouter);
  api.use('/contracts', contractsRouter);
  api.use('/escrows', escrowsRouter);
  api.use('/investments', investmentsRouter);
  api.use('/inputs', inputsRouter);
  api.use('/settlements', settlementsRouter);
  api.use('/collateral', collateralRouter);
  api.use('/disputes', disputesRouter);
  api.use('/reports', reportsRouter);
  api.use('/users', usersRouter);
  api.use('/notifications', notificationsRouter);
  api.use('/audit', auditRouter);

  app.use('/api/v1', api);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
EOF

mkfile "$API/src/server.ts" <<'EOF'
import { createApp } from './app';
import { env } from './config/env';
import { logger } from './config/logger';
import { prisma } from './config/prisma';

async function main(): Promise<void> {
  const app = createApp();

  const server = app.listen(env.PORT, () => {
    logger.info(
      { port: env.PORT, env: env.NODE_ENV },
      `NAFI API listening on http://localhost:${env.PORT}`,
    );
  });

  const shutdown = async (signal: string) => {
    logger.info({ signal }, 'Shutting down gracefully');
    server.close(() => {
      void prisma.$disconnect().finally(() => process.exit(0));
    });

    // Force exit after 10s
    setTimeout(() => process.exit(1), 10_000).unref();
  };

  process.on('SIGTERM', () => void shutdown('SIGTERM'));
  process.on('SIGINT', () => void shutdown('SIGINT'));
}

main().catch((err) => {
  logger.error({ err }, 'Fatal startup error');
  process.exit(1);
});
EOF

# ============================================================
# SEED SCRIPT
# ============================================================

mkfile "$API/prisma/seed.ts" <<'EOF'
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
EOF

# ============================================================
# TEST SEED SCRIPT (used by E2E)
# ============================================================

mkfile "$API/src/scripts/seed-test.ts" <<'EOF'
/**
 * Test data seeder for E2E.
 * Idempotent — safe to run repeatedly.
 * Delegates to the main seed script.
 */
import '../prisma/seed.js';
EOF

# ============================================================
# DONE
# ============================================================

echo ""
echo "============================================================"
echo "✅ NAFI Backend scaffolding complete"
echo "============================================================"
echo ""
echo "Created services/api with:"
echo ""
echo "  Config:"
echo "    package.json                    (Express + Prisma + deps)"
echo "    tsconfig.json"
echo "    .env.example"
echo ""
echo "  Prisma:"
echo "    prisma/schema.prisma            (13 models, 12 enums)"
echo "    prisma/seed.ts                  (12 test users + demo contract)"
echo ""
echo "  Config layer:"
echo "    src/config/{env,cors,prisma,logger}.ts"
echo ""
echo "  Utils:"
echo "    src/utils/{ApiError,apiResponse,asyncHandler,jwt,password,nafiId}.ts"
echo ""
echo "  Middleware:"
echo "    src/middleware/{requestId,authenticate,authorize,tenantScope,"
echo "                    auditLog,rateLimiter,errorHandler}.ts"
echo ""
echo "  Modules (14):"
echo "    auth           (login, register, refresh, me, logout, password reset)"
echo "    contracts      (list, detail, create, update, sign, freeze, timeline)"
echo "    escrows        (list, detail, ledger, release, freeze, close)"
echo "    investments    (mine, list, detail, create)"
echo "    opportunities  (public list + detail)"
echo "    inputs         (list, detail, create, verify delivery)"
echo "    settlements    (list, detail, simulate, execute, reverse)"
echo "    collateral     (list, detail, register, lien, release, liquidate)"
echo "    disputes       (list, detail, file, schedule, decide)"
echo "    reports        (list, detail, generate)"
echo "    users          (list, detail, invite, deactivate, reactivate)"
echo "    notifications  (list, unread, markRead, push subscribe/unsubscribe)"
echo "    audit          (list with filters)"
echo "    public         (stats, opportunities)"
echo "    health         (liveness, readiness, db)"
echo ""
echo "  App:"
echo "    src/app.ts                      (Express app factory)"
echo "    src/server.ts                   (entry with graceful shutdown)"
echo ""
echo "Next steps:"
echo "  pnpm install"
echo "  cd services/api"
echo "  cp .env.example .env"
echo "  # Edit .env — set DATABASE_URL, JWT_SECRET, JWT_REFRESH_SECRET"
echo "  pnpm prisma:generate"
echo "  pnpm prisma:migrate"
echo "  pnpm seed"
echo "  pnpm dev                        # → http://localhost:4000"
echo ""
echo "Health check:"
echo "  curl http://localhost:4000/health"
echo ""
echo "Login test:"
echo '  curl -X POST http://localhost:4000/api/v1/auth/login \'
echo '    -H "Content-Type: application/json" \'
echo '    -d "{\"email\":\"farmer@nafi.et\",\"password\":\"Password123\"}"'
echo ""