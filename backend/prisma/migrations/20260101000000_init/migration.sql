-- Migration: Initial schema creation
-- Generated: 2026-01-01T00:00:00.000Z

-- CreateEnum for Role
CREATE TYPE "Role" AS ENUM ('SUPER_ADMIN', 'NATIONAL_ADMIN', 'INSTITUTION_ADMIN', 'COMPLIANCE_OFFICER', 'RISK_MANAGER', 'INVESTOR_RELATIONS', 'FIELD_AGENT', 'BORROWER', 'INVESTOR', 'GUARANTOR', 'AUDITOR', 'SYSTEM');

-- CreateEnum for ContractStatus
CREATE TYPE "ContractStatus" AS ENUM ('DRAFT', 'PENDING_REVIEW', 'APPROVED', 'REJECTED', 'ACTIVE', 'SUSPENDED', 'COMPLETED', 'DEFAULTED', 'CANCELLED');

-- CreateEnum for EscrowStatus
CREATE TYPE "EscrowStatus" AS ENUM ('PENDING', 'FUNDED', 'DISBURSED', 'REFUNDED', 'FROZEN', 'CLOSED');

-- CreateEnum for InvestmentStatus
CREATE TYPE "InvestmentStatus" AS ENUM ('PENDING', 'CONFIRMED', 'ACTIVE', 'PAID_OUT', 'WRITTEN_OFF');

-- CreateEnum for OpportunityStatus
CREATE TYPE "OpportunityStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'FUNDED', 'CLOSED', 'ARCHIVED');

-- CreateEnum for InputType
CREATE TYPE "InputType" AS ENUM ('SEEDS', 'FERTILIZER', 'EQUIPMENT', 'TRAINING', 'INSURANCE', 'LOGISTICS', 'OTHER');

-- CreateEnum for SettlementStatus
CREATE TYPE "SettlementStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'REVERSED');

-- CreateEnum for CollateralType
CREATE TYPE "CollateralType" AS ENUM ('LAND', 'LIVESTOCK', 'EQUIPMENT', 'INVENTORY', 'RECEIVABLES', 'GUARANTEE', 'OTHER');

-- CreateEnum for DisputeStatus
CREATE TYPE "DisputeStatus" AS ENUM ('OPEN', 'UNDER_REVIEW', 'MEDIATION', 'ARBITRATION', 'RESOLVED', 'ESCALATED', 'CLOSED');

-- CreateEnum for NotificationType
CREATE TYPE "NotificationType" AS ENUM ('INFO', 'WARNING', 'ALERT', 'PAYMENT_DUE', 'PAYMENT_RECEIVED', 'CONTRACT_UPDATE', 'DISPUTE_UPDATE', 'SYSTEM');

-- CreateEnum for AuditAction
CREATE TYPE "AuditAction" AS ENUM ('CREATE', 'READ', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT', 'APPROVE', 'REJECT', 'TRANSFER');

-- CreateEnum for TenantScope
CREATE TYPE "TenantScope" AS ENUM ('OWN', 'INSTITUTION', 'NATIONAL', 'ALL');

-- CreateTable: Institution
CREATE TABLE "Institution" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Institution_pkey" PRIMARY KEY ("id")
);

-- CreateTable: User
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "nafiId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "passwordHash" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'INVESTOR',
    "institutionId" TEXT,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastLoginAt" TIMESTAMP(3),
    "passwordResetToken" TEXT,
    "passwordResetExpires" TIMESTAMP(3),
    "refreshToken" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable: Contract
CREATE TABLE "Contract" (
    "id" TEXT NOT NULL,
    "contractHash" TEXT NOT NULL,
    "nafiContractId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "principalAmount" DECIMAL(15,2) NOT NULL,
    "interestRate" DECIMAL(5,2) NOT NULL,
    "termMonths" INTEGER NOT NULL,
    "status" "ContractStatus" NOT NULL DEFAULT 'DRAFT',
    "borrowerId" TEXT NOT NULL,
    "institutionId" TEXT,
    "startDate" TIMESTAMP(3),
    "maturityDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Contract_pkey" PRIMARY KEY ("id")
);

-- CreateTable: Escrow
CREATE TABLE "Escrow" (
    "id" TEXT NOT NULL,
    "escrowRef" TEXT NOT NULL,
    "contractId" TEXT NOT NULL,
    "amount" DECIMAL(15,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "status" "EscrowStatus" NOT NULL DEFAULT 'PENDING',
    "fundedAt" TIMESTAMP(3),
    "disbursedAt" TIMESTAMP(3),
    "refundAddress" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Escrow_pkey" PRIMARY KEY ("id")
);

-- CreateTable: Investment
CREATE TABLE "Investment" (
    "id" TEXT NOT NULL,
    "investmentRef" TEXT NOT NULL,
    "contractId" TEXT NOT NULL,
    "investorId" TEXT NOT NULL,
    "amount" DECIMAL(15,2) NOT NULL,
    "shares" DECIMAL(15,4) NOT NULL,
    "status" "InvestmentStatus" NOT NULL DEFAULT 'PENDING',
    "confirmedAt" TIMESTAMP(3),
    "payoutAddress" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Investment_pkey" PRIMARY KEY ("id")
);

-- CreateTable: Opportunity
CREATE TABLE "Opportunity" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "targetAmount" DECIMAL(15,2) NOT NULL,
    "raisedAmount" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "minInvestment" DECIMAL(15,2) NOT NULL,
    "status" "OpportunityStatus" NOT NULL DEFAULT 'DRAFT',
    "publishedAt" TIMESTAMP(3),
    "closesAt" TIMESTAMP(3),
    "institutionId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Opportunity_pkey" PRIMARY KEY ("id")
);

-- CreateTable: Input
CREATE TABLE "Input" (
    "id" TEXT NOT NULL,
    "inputRef" TEXT NOT NULL,
    "contractId" TEXT NOT NULL,
    "type" "InputType" NOT NULL,
    "description" TEXT NOT NULL,
    "quantity" DECIMAL(15,2) NOT NULL,
    "unit" TEXT NOT NULL,
    "unitPrice" DECIMAL(15,2) NOT NULL,
    "totalPrice" DECIMAL(15,2) NOT NULL,
    "supplier" TEXT,
    "deliveredAt" TIMESTAMP(3),
    "verifiedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Input_pkey" PRIMARY KEY ("id")
);

-- CreateTable: Settlement
CREATE TABLE "Settlement" (
    "id" TEXT NOT NULL,
    "settlementRef" TEXT NOT NULL,
    "contractId" TEXT NOT NULL,
    "amount" DECIMAL(15,2) NOT NULL,
    "type" TEXT NOT NULL,
    "status" "SettlementStatus" NOT NULL DEFAULT 'PENDING',
    "dueDate" TIMESTAMP(3) NOT NULL,
    "paidAt" TIMESTAMP(3),
    "paymentMethod" TEXT,
    "transactionRef" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Settlement_pkey" PRIMARY KEY ("id")
);

-- CreateTable: Collateral
CREATE TABLE "Collateral" (
    "id" TEXT NOT NULL,
    "collateralRef" TEXT NOT NULL,
    "contractId" TEXT NOT NULL,
    "type" "CollateralType" NOT NULL,
    "description" TEXT NOT NULL,
    "estimatedValue" DECIMAL(15,2) NOT NULL,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "verifiedBy" TEXT,
    "verifiedAt" TIMESTAMP(3),
    "documents" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Collateral_pkey" PRIMARY KEY ("id")
);

-- CreateTable: Dispute
CREATE TABLE "Dispute" (
    "id" TEXT NOT NULL,
    "disputeRef" TEXT NOT NULL,
    "contractId" TEXT,
    "initiatedBy" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "status" "DisputeStatus" NOT NULL DEFAULT 'OPEN',
    "resolution" TEXT,
    "resolvedAt" TIMESTAMP(3),
    "resolvedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Dispute_pkey" PRIMARY KEY ("id")
);

-- CreateTable: Notification
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "notificationRef" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "data" JSONB,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "readAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable: AuditLog
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "logRef" TEXT NOT NULL,
    "previousHash" TEXT,
    "currentHash" TEXT NOT NULL,
    "action" "AuditAction" NOT NULL,
    "entity" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "userId" TEXT,
    "tenantScope" "TenantScope" NOT NULL DEFAULT 'OWN',
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Institution_code_key" ON "Institution"("code");
CREATE INDEX "Institution_country_idx" ON "Institution"("country");

CREATE UNIQUE INDEX "User_nafiId_key" ON "User"("nafiId");
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE INDEX "User_email_idx" ON "User"("email");
CREATE INDEX "User_role_idx" ON "User"("role");
CREATE INDEX "User_institutionId_idx" ON "User"("institutionId");

CREATE UNIQUE INDEX "Contract_contractHash_key" ON "Contract"("contractHash");
CREATE UNIQUE INDEX "Contract_nafiContractId_key" ON "Contract"("nafiContractId");
CREATE INDEX "Contract_borrowerId_idx" ON "Contract"("borrowerId");
CREATE INDEX "Contract_status_idx" ON "Contract"("status");
CREATE INDEX "Contract_institutionId_idx" ON "Contract"("institutionId");

CREATE UNIQUE INDEX "Escrow_escrowRef_key" ON "Escrow"("escrowRef");
CREATE INDEX "Escrow_contractId_idx" ON "Escrow"("contractId");
CREATE INDEX "Escrow_status_idx" ON "Escrow"("status");

CREATE UNIQUE INDEX "Investment_investmentRef_key" ON "Investment"("investmentRef");
CREATE INDEX "Investment_contractId_idx" ON "Investment"("contractId");
CREATE INDEX "Investment_investorId_idx" ON "Investment"("investorId");
CREATE INDEX "Investment_status_idx" ON "Investment"("status");

CREATE INDEX "Opportunity_status_idx" ON "Opportunity"("status");
CREATE INDEX "Opportunity_institutionId_idx" ON "Opportunity"("institutionId");

CREATE UNIQUE INDEX "Input_inputRef_key" ON "Input"("inputRef");
CREATE INDEX "Input_contractId_idx" ON "Input"("contractId");
CREATE INDEX "Input_type_idx" ON "Input"("type");

CREATE UNIQUE INDEX "Settlement_settlementRef_key" ON "Settlement"("settlementRef");
CREATE INDEX "Settlement_contractId_idx" ON "Settlement"("contractId");
CREATE INDEX "Settlement_status_idx" ON "Settlement"("status");
CREATE INDEX "Settlement_dueDate_idx" ON "Settlement"("dueDate");

CREATE UNIQUE INDEX "Collateral_collateralRef_key" ON "Collateral"("collateralRef");
CREATE INDEX "Collateral_contractId_idx" ON "Collateral"("contractId");
CREATE INDEX "Collateral_type_idx" ON "Collateral"("type");

CREATE UNIQUE INDEX "Dispute_disputeRef_key" ON "Dispute"("disputeRef");
CREATE INDEX "Dispute_contractId_idx" ON "Dispute"("contractId");
CREATE INDEX "Dispute_status_idx" ON "Dispute"("status");
CREATE INDEX "Dispute_initiatedBy_idx" ON "Dispute"("initiatedBy");

CREATE UNIQUE INDEX "Notification_notificationRef_key" ON "Notification"("notificationRef");
CREATE INDEX "Notification_userId_idx" ON "Notification"("userId");
CREATE INDEX "Notification_isRead_idx" ON "Notification"("isRead");
CREATE INDEX "Notification_type_idx" ON "Notification"("type");

CREATE UNIQUE INDEX "AuditLog_logRef_key" ON "AuditLog"("logRef");
CREATE UNIQUE INDEX "AuditLog_currentHash_key" ON "AuditLog"("currentHash");
CREATE INDEX "AuditLog_entity_idx" ON "AuditLog"("entity");
CREATE INDEX "AuditLog_entityId_idx" ON "AuditLog"("entityId");
CREATE INDEX "AuditLog_userId_idx" ON "AuditLog"("userId");
CREATE INDEX "AuditLog_createdAt_idx" ON "AuditLog"("createdAt");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "Institution"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "Contract" ADD CONSTRAINT "Contract_borrowerId_fkey" FOREIGN KEY ("borrowerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Contract" ADD CONSTRAINT "Contract_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "Institution"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "Escrow" ADD CONSTRAINT "Escrow_contractId_fkey" FOREIGN KEY ("contractId") REFERENCES "Contract"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Investment" ADD CONSTRAINT "Investment_contractId_fkey" FOREIGN KEY ("contractId") REFERENCES "Contract"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Investment" ADD CONSTRAINT "Investment_investorId_fkey" FOREIGN KEY ("investorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Opportunity" ADD CONSTRAINT "Opportunity_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "Institution"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "Input" ADD CONSTRAINT "Input_contractId_fkey" FOREIGN KEY ("contractId") REFERENCES "Contract"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Settlement" ADD CONSTRAINT "Settlement_contractId_fkey" FOREIGN KEY ("contractId") REFERENCES "Contract"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Collateral" ADD CONSTRAINT "Collateral_contractId_fkey" FOREIGN KEY ("contractId") REFERENCES "Contract"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Dispute" ADD CONSTRAINT "Dispute_contractId_fkey" FOREIGN KEY ("contractId") REFERENCES "Contract"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Dispute" ADD CONSTRAINT "Dispute_initiatedBy_fkey" FOREIGN KEY ("initiatedBy") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
