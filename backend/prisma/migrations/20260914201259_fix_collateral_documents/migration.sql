/*
  Warnings:

  - The values [SUPER_ADMIN,NATIONAL_ADMIN,INSTITUTION_ADMIN,RISK_MANAGER,INVESTOR_RELATIONS,FIELD_AGENT,BORROWER,INVESTOR,GUARANTOR,AUDITOR,SYSTEM] on the enum `Role` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "Role_new" AS ENUM ('DIASPORA_INVESTOR', 'COMMERCIAL_BANK', 'DBE_OFFICER', 'NAFA_OFFICER', 'INPUT_SUPPLIER', 'COMMERCIAL_FARMER', 'OFF_TAKER', 'GOVERNMENT_REGULATOR', 'DONOR', 'NAFI_ADMIN', 'COMPLIANCE_OFFICER', 'ARBITRATOR');
ALTER TABLE "User" ALTER COLUMN "role" DROP DEFAULT;
ALTER TABLE "User" ALTER COLUMN "role" TYPE "Role_new" USING ("role"::text::"Role_new");
ALTER TYPE "Role" RENAME TO "Role_old";
ALTER TYPE "Role_new" RENAME TO "Role";
DROP TYPE "Role_old";
ALTER TABLE "User" ALTER COLUMN "role" SET DEFAULT 'COMMERCIAL_FARMER';
COMMIT;

-- AlterTable
ALTER TABLE "Collateral" ALTER COLUMN "documents" SET NOT NULL,
ALTER COLUMN "documents" SET DEFAULT '[]',
ALTER COLUMN "documents" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "role" SET DEFAULT 'COMMERCIAL_FARMER';

-- CreateIndex
CREATE INDEX "AuditLog_currentHash_idx" ON "AuditLog"("currentHash");

-- CreateIndex
CREATE INDEX "Contract_contractHash_idx" ON "Contract"("contractHash");

-- CreateIndex
CREATE INDEX "Contract_nafiContractId_idx" ON "Contract"("nafiContractId");

-- CreateIndex
CREATE INDEX "Institution_code_idx" ON "Institution"("code");

-- CreateIndex
CREATE INDEX "User_nafiId_idx" ON "User"("nafiId");
