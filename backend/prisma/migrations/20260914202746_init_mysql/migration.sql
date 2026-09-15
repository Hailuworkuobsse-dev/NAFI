-- CreateTable
CREATE TABLE `User` (
    `id` VARCHAR(191) NOT NULL,
    `nafiId` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `phone` VARCHAR(191) NULL,
    `passwordHash` VARCHAR(191) NOT NULL,
    `firstName` VARCHAR(191) NOT NULL,
    `lastName` VARCHAR(191) NOT NULL,
    `role` ENUM('DIASPORA_INVESTOR', 'COMMERCIAL_BANK', 'DBE_OFFICER', 'NAFA_OFFICER', 'INPUT_SUPPLIER', 'COMMERCIAL_FARMER', 'OFF_TAKER', 'GOVERNMENT_REGULATOR', 'DONOR', 'NAFI_ADMIN', 'COMPLIANCE_OFFICER', 'ARBITRATOR') NOT NULL DEFAULT 'COMMERCIAL_FARMER',
    `institutionId` VARCHAR(191) NULL,
    `isVerified` BOOLEAN NOT NULL DEFAULT false,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `lastLoginAt` DATETIME(3) NULL,
    `passwordResetToken` VARCHAR(191) NULL,
    `passwordResetExpires` DATETIME(3) NULL,
    `refreshToken` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `User_nafiId_key`(`nafiId`),
    UNIQUE INDEX `User_email_key`(`email`),
    INDEX `User_email_idx`(`email`),
    INDEX `User_nafiId_idx`(`nafiId`),
    INDEX `User_role_idx`(`role`),
    INDEX `User_institutionId_idx`(`institutionId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Institution` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `code` VARCHAR(191) NOT NULL,
    `type` VARCHAR(191) NOT NULL,
    `country` VARCHAR(191) NOT NULL,
    `isVerified` BOOLEAN NOT NULL DEFAULT false,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Institution_code_key`(`code`),
    INDEX `Institution_code_idx`(`code`),
    INDEX `Institution_country_idx`(`country`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Contract` (
    `id` VARCHAR(191) NOT NULL,
    `contractHash` VARCHAR(191) NOT NULL,
    `nafiContractId` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NOT NULL,
    `principalAmount` DECIMAL(15, 2) NOT NULL,
    `interestRate` DECIMAL(5, 2) NOT NULL,
    `termMonths` INTEGER NOT NULL,
    `status` ENUM('DRAFT', 'PENDING_REVIEW', 'APPROVED', 'REJECTED', 'ACTIVE', 'SUSPENDED', 'COMPLETED', 'DEFAULTED', 'CANCELLED') NOT NULL DEFAULT 'DRAFT',
    `borrowerId` VARCHAR(191) NOT NULL,
    `institutionId` VARCHAR(191) NULL,
    `startDate` DATETIME(3) NULL,
    `maturityDate` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Contract_contractHash_key`(`contractHash`),
    UNIQUE INDEX `Contract_nafiContractId_key`(`nafiContractId`),
    INDEX `Contract_contractHash_idx`(`contractHash`),
    INDEX `Contract_nafiContractId_idx`(`nafiContractId`),
    INDEX `Contract_borrowerId_idx`(`borrowerId`),
    INDEX `Contract_status_idx`(`status`),
    INDEX `Contract_institutionId_idx`(`institutionId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Escrow` (
    `id` VARCHAR(191) NOT NULL,
    `escrowRef` VARCHAR(191) NOT NULL,
    `contractId` VARCHAR(191) NOT NULL,
    `amount` DECIMAL(15, 2) NOT NULL,
    `currency` VARCHAR(191) NOT NULL DEFAULT 'USD',
    `status` ENUM('PENDING', 'FUNDED', 'DISBURSED', 'REFUNDED', 'FROZEN', 'CLOSED') NOT NULL DEFAULT 'PENDING',
    `fundedAt` DATETIME(3) NULL,
    `disbursedAt` DATETIME(3) NULL,
    `refundAddress` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Escrow_escrowRef_key`(`escrowRef`),
    INDEX `Escrow_contractId_idx`(`contractId`),
    INDEX `Escrow_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Investment` (
    `id` VARCHAR(191) NOT NULL,
    `investmentRef` VARCHAR(191) NOT NULL,
    `contractId` VARCHAR(191) NOT NULL,
    `investorId` VARCHAR(191) NOT NULL,
    `amount` DECIMAL(15, 2) NOT NULL,
    `shares` DECIMAL(15, 4) NOT NULL,
    `status` ENUM('PENDING', 'CONFIRMED', 'ACTIVE', 'PAID_OUT', 'WRITTEN_OFF') NOT NULL DEFAULT 'PENDING',
    `confirmedAt` DATETIME(3) NULL,
    `payoutAddress` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Investment_investmentRef_key`(`investmentRef`),
    INDEX `Investment_contractId_idx`(`contractId`),
    INDEX `Investment_investorId_idx`(`investorId`),
    INDEX `Investment_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Opportunity` (
    `id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NOT NULL,
    `targetAmount` DECIMAL(15, 2) NOT NULL,
    `raisedAmount` DECIMAL(15, 2) NOT NULL DEFAULT 0,
    `minInvestment` DECIMAL(15, 2) NOT NULL,
    `status` ENUM('DRAFT', 'PUBLISHED', 'FUNDED', 'CLOSED', 'ARCHIVED') NOT NULL DEFAULT 'DRAFT',
    `publishedAt` DATETIME(3) NULL,
    `closesAt` DATETIME(3) NULL,
    `institutionId` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Opportunity_status_idx`(`status`),
    INDEX `Opportunity_institutionId_idx`(`institutionId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Input` (
    `id` VARCHAR(191) NOT NULL,
    `inputRef` VARCHAR(191) NOT NULL,
    `contractId` VARCHAR(191) NOT NULL,
    `type` ENUM('SEEDS', 'FERTILIZER', 'EQUIPMENT', 'TRAINING', 'INSURANCE', 'LOGISTICS', 'OTHER') NOT NULL,
    `description` VARCHAR(191) NOT NULL,
    `quantity` DECIMAL(15, 2) NOT NULL,
    `unit` VARCHAR(191) NOT NULL,
    `unitPrice` DECIMAL(15, 2) NOT NULL,
    `totalPrice` DECIMAL(15, 2) NOT NULL,
    `supplier` VARCHAR(191) NULL,
    `deliveredAt` DATETIME(3) NULL,
    `verifiedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Input_inputRef_key`(`inputRef`),
    INDEX `Input_contractId_idx`(`contractId`),
    INDEX `Input_type_idx`(`type`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Settlement` (
    `id` VARCHAR(191) NOT NULL,
    `settlementRef` VARCHAR(191) NOT NULL,
    `contractId` VARCHAR(191) NOT NULL,
    `amount` DECIMAL(15, 2) NOT NULL,
    `type` VARCHAR(191) NOT NULL,
    `status` ENUM('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'REVERSED') NOT NULL DEFAULT 'PENDING',
    `dueDate` DATETIME(3) NOT NULL,
    `paidAt` DATETIME(3) NULL,
    `paymentMethod` VARCHAR(191) NULL,
    `transactionRef` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Settlement_settlementRef_key`(`settlementRef`),
    INDEX `Settlement_contractId_idx`(`contractId`),
    INDEX `Settlement_status_idx`(`status`),
    INDEX `Settlement_dueDate_idx`(`dueDate`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Collateral` (
    `id` VARCHAR(191) NOT NULL,
    `collateralRef` VARCHAR(191) NOT NULL,
    `contractId` VARCHAR(191) NOT NULL,
    `type` ENUM('LAND', 'LIVESTOCK', 'EQUIPMENT', 'INVENTORY', 'RECEIVABLES', 'GUARANTEE', 'OTHER') NOT NULL,
    `description` VARCHAR(191) NOT NULL,
    `estimatedValue` DECIMAL(15, 2) NOT NULL,
    `verified` BOOLEAN NOT NULL DEFAULT false,
    `verifiedBy` VARCHAR(191) NULL,
    `verifiedAt` DATETIME(3) NULL,
    `documents` VARCHAR(191) NOT NULL DEFAULT '[]',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Collateral_collateralRef_key`(`collateralRef`),
    INDEX `Collateral_contractId_idx`(`contractId`),
    INDEX `Collateral_type_idx`(`type`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Dispute` (
    `id` VARCHAR(191) NOT NULL,
    `disputeRef` VARCHAR(191) NOT NULL,
    `contractId` VARCHAR(191) NULL,
    `initiatedBy` VARCHAR(191) NOT NULL,
    `reason` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NOT NULL,
    `status` ENUM('OPEN', 'UNDER_REVIEW', 'MEDIATION', 'ARBITRATION', 'RESOLVED', 'ESCALATED', 'CLOSED') NOT NULL DEFAULT 'OPEN',
    `resolution` VARCHAR(191) NULL,
    `resolvedAt` DATETIME(3) NULL,
    `resolvedBy` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Dispute_disputeRef_key`(`disputeRef`),
    INDEX `Dispute_contractId_idx`(`contractId`),
    INDEX `Dispute_status_idx`(`status`),
    INDEX `Dispute_initiatedBy_idx`(`initiatedBy`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Notification` (
    `id` VARCHAR(191) NOT NULL,
    `notificationRef` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `type` ENUM('INFO', 'WARNING', 'ALERT', 'PAYMENT_DUE', 'PAYMENT_RECEIVED', 'CONTRACT_UPDATE', 'DISPUTE_UPDATE', 'SYSTEM') NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `message` VARCHAR(191) NOT NULL,
    `data` JSON NULL,
    `isRead` BOOLEAN NOT NULL DEFAULT false,
    `readAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `Notification_notificationRef_key`(`notificationRef`),
    INDEX `Notification_userId_idx`(`userId`),
    INDEX `Notification_isRead_idx`(`isRead`),
    INDEX `Notification_type_idx`(`type`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AuditLog` (
    `id` VARCHAR(191) NOT NULL,
    `logRef` VARCHAR(191) NOT NULL,
    `previousHash` VARCHAR(191) NULL,
    `currentHash` VARCHAR(191) NOT NULL,
    `action` ENUM('CREATE', 'READ', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT', 'APPROVE', 'REJECT', 'TRANSFER') NOT NULL,
    `entity` VARCHAR(191) NOT NULL,
    `entityId` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NULL,
    `tenantScope` ENUM('OWN', 'INSTITUTION', 'NATIONAL', 'ALL') NOT NULL DEFAULT 'OWN',
    `ipAddress` VARCHAR(191) NULL,
    `userAgent` VARCHAR(191) NULL,
    `metadata` JSON NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `AuditLog_logRef_key`(`logRef`),
    UNIQUE INDEX `AuditLog_currentHash_key`(`currentHash`),
    INDEX `AuditLog_entity_idx`(`entity`),
    INDEX `AuditLog_entityId_idx`(`entityId`),
    INDEX `AuditLog_userId_idx`(`userId`),
    INDEX `AuditLog_currentHash_idx`(`currentHash`),
    INDEX `AuditLog_createdAt_idx`(`createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `User` ADD CONSTRAINT `User_institutionId_fkey` FOREIGN KEY (`institutionId`) REFERENCES `Institution`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Contract` ADD CONSTRAINT `Contract_borrowerId_fkey` FOREIGN KEY (`borrowerId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Contract` ADD CONSTRAINT `Contract_institutionId_fkey` FOREIGN KEY (`institutionId`) REFERENCES `Institution`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Escrow` ADD CONSTRAINT `Escrow_contractId_fkey` FOREIGN KEY (`contractId`) REFERENCES `Contract`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Investment` ADD CONSTRAINT `Investment_contractId_fkey` FOREIGN KEY (`contractId`) REFERENCES `Contract`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Investment` ADD CONSTRAINT `Investment_investorId_fkey` FOREIGN KEY (`investorId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Opportunity` ADD CONSTRAINT `Opportunity_institutionId_fkey` FOREIGN KEY (`institutionId`) REFERENCES `Institution`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Input` ADD CONSTRAINT `Input_contractId_fkey` FOREIGN KEY (`contractId`) REFERENCES `Contract`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Settlement` ADD CONSTRAINT `Settlement_contractId_fkey` FOREIGN KEY (`contractId`) REFERENCES `Contract`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Collateral` ADD CONSTRAINT `Collateral_contractId_fkey` FOREIGN KEY (`contractId`) REFERENCES `Contract`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Dispute` ADD CONSTRAINT `Dispute_contractId_fkey` FOREIGN KEY (`contractId`) REFERENCES `Contract`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Dispute` ADD CONSTRAINT `Dispute_initiatedBy_fkey` FOREIGN KEY (`initiatedBy`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Notification` ADD CONSTRAINT `Notification_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AuditLog` ADD CONSTRAINT `AuditLog_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
