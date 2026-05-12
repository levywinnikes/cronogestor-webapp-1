-- CreateEnum
CREATE TYPE "PersonType" AS ENUM ('PF', 'PJ');

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'EMPLOYEE');

-- CreateEnum
CREATE TYPE "PlanType" AS ENUM ('FREE', 'PREMIUM', 'FULL');

-- CreateEnum
CREATE TYPE "ProjectStatus" AS ENUM ('NAO_INICIADO', 'EM_ANDAMENTO', 'PARALISADO', 'CONCLUIDO');

-- CreateEnum
CREATE TYPE "AttachmentStatus" AS ENUM ('PENDING', 'UPLOADED', 'FAILED');

-- CreateEnum
CREATE TYPE "MembershipRole" AS ENUM ('OWNER', 'ADMIN', 'EDITOR', 'VIEWER');

-- CreateEnum
CREATE TYPE "MembershipStatus" AS ENUM ('ACTIVE', 'INVITED', 'DISABLED');

-- CreateEnum
CREATE TYPE "SubscriptionStatus" AS ENUM ('TRIAL', 'ACTIVE', 'PAST_DUE', 'CANCELED');

-- CreateEnum
CREATE TYPE "ProposalStatus" AS ENUM ('EM_ELABORACAO', 'ENVIADA', 'APROVADA', 'REPROVADA');

-- CreateEnum
CREATE TYPE "BillingType" AS ENUM ('SERVICOS', 'PRODUTOS', 'INDUSTRIALIZACAO');

-- CreateEnum
CREATE TYPE "ProposalAccessRole" AS ENUM ('OWNER', 'EDITOR', 'VIEWER');

-- CreateEnum
CREATE TYPE "CostItemUnit" AS ENUM ('HORA', 'DIA', 'UNIDADE', 'KG', 'METRO', 'METRO_QUADRADO', 'METRO_CUBICO', 'LITRO', 'MES', 'OUTRO');

-- CreateEnum
CREATE TYPE "TaxRegime" AS ENUM ('LUCRO_PRESUMIDO_SERVICOS', 'LUCRO_PRESUMIDO_PRODUTOS', 'LUCRO_PRESUMIDO_INDUSTRIALIZACAO', 'SIMPLES_NACIONAL_WRB', 'SIMPLES_NACIONAL_BIOTORQUE');

-- CreateEnum
CREATE TYPE "ProposalDocumentLanguage" AS ENUM ('PT', 'ES');

-- CreateEnum
CREATE TYPE "ProposalDocumentFormat" AS ENUM ('HTML', 'PDF', 'XLSX');

-- CreateEnum
CREATE TYPE "ProposalDocumentStatus" AS ENUM ('PENDING', 'GENERATED', 'FAILED');

-- CreateEnum
CREATE TYPE "EmployeeRegime" AS ENUM ('DIA', 'QUINZENA', 'MES');

-- CreateEnum
CREATE TYPE "HolidayType" AS ENUM ('NACIONAL', 'ESTADUAL', 'MUNICIPAL', 'ORGANIZACAO');

-- CreateEnum
CREATE TYPE "TimeSheetStatus" AS ENUM ('DRAFT', 'CLOSED');

-- CreateTable
CREATE TABLE "Organization" (
    "id" TEXT NOT NULL,
    "personType" "PersonType" NOT NULL,
    "document" TEXT NOT NULL,
    "legalName" TEXT NOT NULL,
    "displayName" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Organization_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserAccount" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserAccount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuthSession" (
    "id" TEXT NOT NULL,
    "userAccountId" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "refreshTokenHash" TEXT NOT NULL,
    "userAgent" TEXT,
    "ipAddress" TEXT,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "revokedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AuthSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrganizationMembership" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "userAccountId" TEXT NOT NULL,
    "role" "MembershipRole" NOT NULL DEFAULT 'EDITOR',
    "status" "MembershipStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OrganizationMembership_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Invitation" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" "MembershipRole" NOT NULL,
    "status" "MembershipStatus" NOT NULL DEFAULT 'INVITED',
    "tokenHash" TEXT NOT NULL,
    "invitedByUserId" TEXT,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "acceptedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Invitation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Subscription" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "planType" "PlanType" NOT NULL,
    "status" "SubscriptionStatus" NOT NULL DEFAULT 'TRIAL',
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endsAt" TIMESTAMP(3),
    "canceledAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Subscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Company" (
    "id" TEXT NOT NULL,
    "personType" "PersonType" NOT NULL,
    "document" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "planType" "PlanType" NOT NULL DEFAULT 'FREE',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Company_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'EMPLOYEE',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Project" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "projectCode" TEXT,
    "name" TEXT NOT NULL,
    "responsible" TEXT,
    "contractType" TEXT,
    "contractor" TEXT,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "budgetForecast" DECIMAL(12,2),
    "contractNumber" TEXT,
    "status" "ProjectStatus" NOT NULL DEFAULT 'NAO_INICIADO',
    "address" TEXT,
    "hasTaskList" BOOLEAN NOT NULL DEFAULT false,
    "extraMonthlyPerEmployee" DECIMAL(12,2),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProjectAttachment" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "storageKey" TEXT,
    "mimeType" TEXT,
    "byteSize" INTEGER,
    "status" "AttachmentStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProjectAttachment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TimeEntry" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "breakDurationMinutes" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TimeEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Proposal" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "proposalCode" TEXT NOT NULL,
    "projectCode" TEXT,
    "customerName" TEXT NOT NULL,
    "serviceDescription" TEXT NOT NULL,
    "internalResponsible" TEXT,
    "workType" TEXT,
    "billingType" "BillingType" NOT NULL,
    "requestDate" TIMESTAMP(3),
    "completionDate" TIMESTAMP(3),
    "sentDate" TIMESTAMP(3),
    "decisionDate" TIMESTAMP(3),
    "status" "ProposalStatus" NOT NULL DEFAULT 'EM_ELABORACAO',
    "rejectionReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Proposal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProposalContact" (
    "id" TEXT NOT NULL,
    "proposalId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "position" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProposalContact_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProposalAccess" (
    "id" TEXT NOT NULL,
    "proposalId" TEXT NOT NULL,
    "membershipId" TEXT NOT NULL,
    "role" "ProposalAccessRole" NOT NULL DEFAULT 'VIEWER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProposalAccess_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProposalModItem" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "proposalId" TEXT NOT NULL,
    "itemOrder" INTEGER NOT NULL,
    "category" TEXT NOT NULL,
    "functionName" TEXT NOT NULL,
    "quantityTime" DECIMAL(12,2) NOT NULL,
    "timeUnit" "CostItemUnit" NOT NULL,
    "peopleCount" INTEGER NOT NULL,
    "unitCost" DECIMAL(12,2) NOT NULL,
    "subtotal" DECIMAL(14,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProposalModItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProposalMoiItem" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "proposalId" TEXT NOT NULL,
    "itemOrder" INTEGER NOT NULL,
    "category" TEXT NOT NULL,
    "functionName" TEXT NOT NULL,
    "quantityTime" DECIMAL(12,2) NOT NULL,
    "timeUnit" "CostItemUnit" NOT NULL,
    "peopleCount" INTEGER NOT NULL,
    "unitCost" DECIMAL(12,2) NOT NULL,
    "subtotal" DECIMAL(14,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProposalMoiItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProposalMaterialItem" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "proposalId" TEXT NOT NULL,
    "itemOrder" INTEGER NOT NULL,
    "itemCode" TEXT,
    "usage" TEXT,
    "description" TEXT NOT NULL,
    "material" TEXT,
    "length" DECIMAL(12,3),
    "width" DECIMAL(12,3),
    "thickness" DECIMAL(12,3),
    "quantity" DECIMAL(12,3) NOT NULL,
    "unit" "CostItemUnit" NOT NULL,
    "unitCost" DECIMAL(12,2) NOT NULL,
    "subtotal" DECIMAL(14,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProposalMaterialItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProposalEquipmentItem" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "proposalId" TEXT NOT NULL,
    "itemOrder" INTEGER NOT NULL,
    "category" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "quantity" DECIMAL(12,3) NOT NULL,
    "unit" "CostItemUnit" NOT NULL,
    "icmsPercent" DECIMAL(5,2),
    "pisPercent" DECIMAL(5,2),
    "cofinsPercent" DECIMAL(5,2),
    "unitCost" DECIMAL(12,2) NOT NULL,
    "subtotal" DECIMAL(14,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProposalEquipmentItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProposalThirdPartyItem" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "proposalId" TEXT NOT NULL,
    "itemOrder" INTEGER NOT NULL,
    "category" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "quantity" DECIMAL(12,3) NOT NULL,
    "unit" "CostItemUnit" NOT NULL,
    "unitCost" DECIMAL(12,2) NOT NULL,
    "subtotal" DECIMAL(14,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProposalThirdPartyItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProposalConsumableItem" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "proposalId" TEXT NOT NULL,
    "itemOrder" INTEGER NOT NULL,
    "category" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "quantity" DECIMAL(12,3) NOT NULL,
    "unit" "CostItemUnit" NOT NULL,
    "unitCost" DECIMAL(12,2) NOT NULL,
    "subtotal" DECIMAL(14,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProposalConsumableItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProposalExpenseItem" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "proposalId" TEXT NOT NULL,
    "itemOrder" INTEGER NOT NULL,
    "category" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "quantity" DECIMAL(12,3) NOT NULL,
    "unit" "CostItemUnit" NOT NULL,
    "unitCost" DECIMAL(12,2) NOT NULL,
    "subtotal" DECIMAL(14,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProposalExpenseItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SalaryBaseTable" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SalaryBaseTable_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SalaryBaseRole" (
    "id" TEXT NOT NULL,
    "salaryBaseTableId" TEXT NOT NULL,
    "roleName" TEXT NOT NULL,
    "monthlySalary" DECIMAL(12,2) NOT NULL,
    "monthlyHours" DECIMAL(8,2) NOT NULL,
    "chargesPercent" DECIMAL(5,2) NOT NULL,
    "hourCostWithCharges" DECIMAL(12,4) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SalaryBaseRole_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TaxProfile" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "regime" "TaxRegime" NOT NULL,
    "rulesJson" JSONB,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TaxProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SimplesNacionalRate" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "annex" TEXT NOT NULL,
    "rangeStart" DECIMAL(14,2) NOT NULL,
    "rangeEnd" DECIMAL(14,2) NOT NULL,
    "nominalAliquot" DECIMAL(6,4) NOT NULL,
    "deduction" DECIMAL(14,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SimplesNacionalRate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProposalCalculationInput" (
    "id" TEXT NOT NULL,
    "proposalId" TEXT NOT NULL,
    "taxProfileId" TEXT,
    "bdiPercent" DECIMAL(6,2) NOT NULL,
    "assistancePercent" DECIMAL(6,2) NOT NULL,
    "commissionPercent" DECIMAL(6,2) NOT NULL,
    "profitPercent" DECIMAL(6,2) NOT NULL,
    "safetyFactor" DECIMAL(8,4) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProposalCalculationInput_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProposalCalculationResult" (
    "id" TEXT NOT NULL,
    "proposalId" TEXT NOT NULL,
    "totalMod" DECIMAL(14,2) NOT NULL,
    "totalMoi" DECIMAL(14,2) NOT NULL,
    "totalMaterials" DECIMAL(14,2) NOT NULL,
    "totalEquipment" DECIMAL(14,2) NOT NULL,
    "totalThirdParty" DECIMAL(14,2) NOT NULL,
    "totalConsumables" DECIMAL(14,2) NOT NULL,
    "totalExpenses" DECIMAL(14,2) NOT NULL,
    "totalCost" DECIMAL(14,2) NOT NULL,
    "saleValueBeforeTaxes" DECIMAL(14,2) NOT NULL,
    "taxesValue" DECIMAL(14,2) NOT NULL,
    "finalValueWithMarkup" DECIMAL(14,2) NOT NULL,
    "calculatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProposalCalculationResult_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProposalDocument" (
    "id" TEXT NOT NULL,
    "proposalId" TEXT NOT NULL,
    "language" "ProposalDocumentLanguage" NOT NULL,
    "format" "ProposalDocumentFormat" NOT NULL,
    "status" "ProposalDocumentStatus" NOT NULL DEFAULT 'PENDING',
    "storageKey" TEXT,
    "generatedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProposalDocument_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProposalAttachment" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "proposalId" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "storageKey" TEXT,
    "mimeType" TEXT,
    "byteSize" INTEGER,
    "status" "AttachmentStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProposalAttachment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Employee" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "employeeCode" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "document" TEXT NOT NULL,
    "roleName" TEXT,
    "salary" DECIMAL(12,2) NOT NULL,
    "regime" "EmployeeRegime" NOT NULL DEFAULT 'MES',
    "hoursPerDay" DECIMAL(5,2) NOT NULL,
    "chargesPercent" DECIMAL(5,2) NOT NULL,
    "benefitsAmount" DECIMAL(12,2) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Employee_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmployeeProjectAssignment" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "unassignedAt" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "EmployeeProjectAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrganizationLaborPolicy" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "policyName" TEXT NOT NULL,
    "weeklyWorkloadHours" DECIMAL(5,2) NOT NULL,
    "weekdayFirstTwoHoursPercent" DECIMAL(5,2) NOT NULL,
    "weekdayAfterTwoHoursPercent" DECIMAL(5,2) NOT NULL,
    "saturdayPercent" DECIMAL(5,2) NOT NULL,
    "sundayPercent" DECIMAL(5,2) NOT NULL,
    "holidayPercent" DECIMAL(5,2) NOT NULL,
    "nightAdditionalPercent" DECIMAL(5,2) NOT NULL,
    "nightStart" TEXT NOT NULL,
    "nightEnd" TEXT NOT NULL,
    "isDefault" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OrganizationLaborPolicy_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmployeeLaborPolicyOverride" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "basePolicyId" TEXT,
    "weekdayFirstTwoHoursPercent" DECIMAL(5,2),
    "weekdayAfterTwoHoursPercent" DECIMAL(5,2),
    "saturdayPercent" DECIMAL(5,2),
    "sundayPercent" DECIMAL(5,2),
    "holidayPercent" DECIMAL(5,2),
    "nightAdditionalPercent" DECIMAL(5,2),
    "nightStart" TEXT,
    "nightEnd" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EmployeeLaborPolicyOverride_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrganizationHoliday" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "name" TEXT NOT NULL,
    "type" "HolidayType" NOT NULL DEFAULT 'ORGANIZACAO',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OrganizationHoliday_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TimeSheet" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "periodYear" INTEGER NOT NULL,
    "periodMonth" INTEGER NOT NULL,
    "status" "TimeSheetStatus" NOT NULL DEFAULT 'DRAFT',
    "closedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TimeSheet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TimeSheetEntry" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "timeSheetId" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "workDate" TIMESTAMP(3) NOT NULL,
    "startDateTime" TIMESTAMP(3) NOT NULL,
    "endDateTime" TIMESTAMP(3) NOT NULL,
    "breakMinutes" INTEGER NOT NULL DEFAULT 0,
    "snapshotBaseSalary" DECIMAL(12,2) NOT NULL,
    "snapshotChargesPercent" DECIMAL(5,2) NOT NULL,
    "snapshotHourlyBase" DECIMAL(12,4) NOT NULL,
    "snapshotWeekdayFirstTwoPercent" DECIMAL(5,2) NOT NULL,
    "snapshotWeekdayAfterTwoPercent" DECIMAL(5,2) NOT NULL,
    "snapshotSaturdayPercent" DECIMAL(5,2) NOT NULL,
    "snapshotSundayPercent" DECIMAL(5,2) NOT NULL,
    "snapshotHolidayPercent" DECIMAL(5,2) NOT NULL,
    "snapshotNightAdditionalPercent" DECIMAL(5,2) NOT NULL,
    "normalMinutes" INTEGER NOT NULL DEFAULT 0,
    "overtimeFirstTwoMinutes" INTEGER NOT NULL DEFAULT 0,
    "overtimeAfterTwoMinutes" INTEGER NOT NULL DEFAULT 0,
    "saturdayMinutes" INTEGER NOT NULL DEFAULT 0,
    "sundayOrHolidayMinutes" INTEGER NOT NULL DEFAULT 0,
    "nightMinutes" INTEGER NOT NULL DEFAULT 0,
    "calculatedAmount" DECIMAL(14,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TimeSheetEntry_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Organization_document_key" ON "Organization"("document");

-- CreateIndex
CREATE UNIQUE INDEX "UserAccount_email_key" ON "UserAccount"("email");

-- CreateIndex
CREATE INDEX "AuthSession_userAccountId_organizationId_revokedAt_idx" ON "AuthSession"("userAccountId", "organizationId", "revokedAt");

-- CreateIndex
CREATE INDEX "AuthSession_expiresAt_idx" ON "AuthSession"("expiresAt");

-- CreateIndex
CREATE INDEX "OrganizationMembership_organizationId_role_idx" ON "OrganizationMembership"("organizationId", "role");

-- CreateIndex
CREATE INDEX "OrganizationMembership_userAccountId_idx" ON "OrganizationMembership"("userAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "OrganizationMembership_organizationId_userAccountId_key" ON "OrganizationMembership"("organizationId", "userAccountId");

-- CreateIndex
CREATE INDEX "Invitation_organizationId_email_idx" ON "Invitation"("organizationId", "email");

-- CreateIndex
CREATE INDEX "Invitation_tokenHash_idx" ON "Invitation"("tokenHash");

-- CreateIndex
CREATE INDEX "Subscription_organizationId_status_idx" ON "Subscription"("organizationId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "Company_document_key" ON "Company"("document");

-- CreateIndex
CREATE UNIQUE INDEX "Company_email_key" ON "Company"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_companyId_idx" ON "User"("companyId");

-- CreateIndex
CREATE INDEX "Project_companyId_idx" ON "Project"("companyId");

-- CreateIndex
CREATE UNIQUE INDEX "Project_companyId_projectCode_key" ON "Project"("companyId", "projectCode");

-- CreateIndex
CREATE INDEX "ProjectAttachment_companyId_projectId_idx" ON "ProjectAttachment"("companyId", "projectId");

-- CreateIndex
CREATE INDEX "ProjectAttachment_status_idx" ON "ProjectAttachment"("status");

-- CreateIndex
CREATE INDEX "TimeEntry_userId_date_idx" ON "TimeEntry"("userId", "date");

-- CreateIndex
CREATE INDEX "TimeEntry_projectId_date_idx" ON "TimeEntry"("projectId", "date");

-- CreateIndex
CREATE INDEX "Proposal_organizationId_status_idx" ON "Proposal"("organizationId", "status");

-- CreateIndex
CREATE INDEX "Proposal_customerName_idx" ON "Proposal"("customerName");

-- CreateIndex
CREATE UNIQUE INDEX "Proposal_organizationId_proposalCode_key" ON "Proposal"("organizationId", "proposalCode");

-- CreateIndex
CREATE UNIQUE INDEX "ProposalContact_proposalId_position_key" ON "ProposalContact"("proposalId", "position");

-- CreateIndex
CREATE INDEX "ProposalAccess_membershipId_idx" ON "ProposalAccess"("membershipId");

-- CreateIndex
CREATE UNIQUE INDEX "ProposalAccess_proposalId_membershipId_key" ON "ProposalAccess"("proposalId", "membershipId");

-- CreateIndex
CREATE INDEX "ProposalModItem_organizationId_proposalId_idx" ON "ProposalModItem"("organizationId", "proposalId");

-- CreateIndex
CREATE INDEX "ProposalModItem_proposalId_itemOrder_idx" ON "ProposalModItem"("proposalId", "itemOrder");

-- CreateIndex
CREATE INDEX "ProposalMoiItem_organizationId_proposalId_idx" ON "ProposalMoiItem"("organizationId", "proposalId");

-- CreateIndex
CREATE INDEX "ProposalMoiItem_proposalId_itemOrder_idx" ON "ProposalMoiItem"("proposalId", "itemOrder");

-- CreateIndex
CREATE INDEX "ProposalMaterialItem_organizationId_proposalId_idx" ON "ProposalMaterialItem"("organizationId", "proposalId");

-- CreateIndex
CREATE INDEX "ProposalMaterialItem_proposalId_itemOrder_idx" ON "ProposalMaterialItem"("proposalId", "itemOrder");

-- CreateIndex
CREATE INDEX "ProposalEquipmentItem_organizationId_proposalId_idx" ON "ProposalEquipmentItem"("organizationId", "proposalId");

-- CreateIndex
CREATE INDEX "ProposalEquipmentItem_proposalId_itemOrder_idx" ON "ProposalEquipmentItem"("proposalId", "itemOrder");

-- CreateIndex
CREATE INDEX "ProposalThirdPartyItem_organizationId_proposalId_idx" ON "ProposalThirdPartyItem"("organizationId", "proposalId");

-- CreateIndex
CREATE INDEX "ProposalThirdPartyItem_proposalId_itemOrder_idx" ON "ProposalThirdPartyItem"("proposalId", "itemOrder");

-- CreateIndex
CREATE INDEX "ProposalConsumableItem_organizationId_proposalId_idx" ON "ProposalConsumableItem"("organizationId", "proposalId");

-- CreateIndex
CREATE INDEX "ProposalConsumableItem_proposalId_itemOrder_idx" ON "ProposalConsumableItem"("proposalId", "itemOrder");

-- CreateIndex
CREATE INDEX "ProposalExpenseItem_organizationId_proposalId_idx" ON "ProposalExpenseItem"("organizationId", "proposalId");

-- CreateIndex
CREATE INDEX "ProposalExpenseItem_proposalId_itemOrder_idx" ON "ProposalExpenseItem"("proposalId", "itemOrder");

-- CreateIndex
CREATE INDEX "SalaryBaseTable_organizationId_isDefault_idx" ON "SalaryBaseTable"("organizationId", "isDefault");

-- CreateIndex
CREATE UNIQUE INDEX "SalaryBaseRole_salaryBaseTableId_roleName_key" ON "SalaryBaseRole"("salaryBaseTableId", "roleName");

-- CreateIndex
CREATE INDEX "TaxProfile_organizationId_isDefault_idx" ON "TaxProfile"("organizationId", "isDefault");

-- CreateIndex
CREATE INDEX "SimplesNacionalRate_organizationId_annex_idx" ON "SimplesNacionalRate"("organizationId", "annex");

-- CreateIndex
CREATE INDEX "SimplesNacionalRate_rangeStart_rangeEnd_idx" ON "SimplesNacionalRate"("rangeStart", "rangeEnd");

-- CreateIndex
CREATE UNIQUE INDEX "ProposalCalculationInput_proposalId_key" ON "ProposalCalculationInput"("proposalId");

-- CreateIndex
CREATE UNIQUE INDEX "ProposalCalculationResult_proposalId_key" ON "ProposalCalculationResult"("proposalId");

-- CreateIndex
CREATE INDEX "ProposalDocument_proposalId_language_format_idx" ON "ProposalDocument"("proposalId", "language", "format");

-- CreateIndex
CREATE INDEX "ProposalDocument_status_idx" ON "ProposalDocument"("status");

-- CreateIndex
CREATE INDEX "ProposalAttachment_organizationId_proposalId_idx" ON "ProposalAttachment"("organizationId", "proposalId");

-- CreateIndex
CREATE INDEX "ProposalAttachment_status_idx" ON "ProposalAttachment"("status");

-- CreateIndex
CREATE INDEX "Employee_organizationId_lastName_idx" ON "Employee"("organizationId", "lastName");

-- CreateIndex
CREATE UNIQUE INDEX "Employee_organizationId_employeeCode_key" ON "Employee"("organizationId", "employeeCode");

-- CreateIndex
CREATE UNIQUE INDEX "Employee_organizationId_document_key" ON "Employee"("organizationId", "document");

-- CreateIndex
CREATE INDEX "EmployeeProjectAssignment_projectId_isActive_idx" ON "EmployeeProjectAssignment"("projectId", "isActive");

-- CreateIndex
CREATE UNIQUE INDEX "EmployeeProjectAssignment_organizationId_employeeId_project_key" ON "EmployeeProjectAssignment"("organizationId", "employeeId", "projectId");

-- CreateIndex
CREATE INDEX "OrganizationLaborPolicy_organizationId_isDefault_idx" ON "OrganizationLaborPolicy"("organizationId", "isDefault");

-- CreateIndex
CREATE UNIQUE INDEX "EmployeeLaborPolicyOverride_organizationId_employeeId_key" ON "EmployeeLaborPolicyOverride"("organizationId", "employeeId");

-- CreateIndex
CREATE INDEX "OrganizationHoliday_organizationId_date_idx" ON "OrganizationHoliday"("organizationId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "OrganizationHoliday_organizationId_date_name_key" ON "OrganizationHoliday"("organizationId", "date", "name");

-- CreateIndex
CREATE INDEX "TimeSheet_organizationId_status_idx" ON "TimeSheet"("organizationId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "TimeSheet_organizationId_projectId_employeeId_periodYear_pe_key" ON "TimeSheet"("organizationId", "projectId", "employeeId", "periodYear", "periodMonth");

-- CreateIndex
CREATE INDEX "TimeSheetEntry_organizationId_workDate_idx" ON "TimeSheetEntry"("organizationId", "workDate");

-- CreateIndex
CREATE INDEX "TimeSheetEntry_employeeId_workDate_idx" ON "TimeSheetEntry"("employeeId", "workDate");

-- CreateIndex
CREATE INDEX "TimeSheetEntry_projectId_workDate_idx" ON "TimeSheetEntry"("projectId", "workDate");

-- AddForeignKey
ALTER TABLE "AuthSession" ADD CONSTRAINT "AuthSession_userAccountId_fkey" FOREIGN KEY ("userAccountId") REFERENCES "UserAccount"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuthSession" ADD CONSTRAINT "AuthSession_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrganizationMembership" ADD CONSTRAINT "OrganizationMembership_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrganizationMembership" ADD CONSTRAINT "OrganizationMembership_userAccountId_fkey" FOREIGN KEY ("userAccountId") REFERENCES "UserAccount"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invitation" ADD CONSTRAINT "Invitation_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invitation" ADD CONSTRAINT "Invitation_invitedByUserId_fkey" FOREIGN KEY ("invitedByUserId") REFERENCES "UserAccount"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectAttachment" ADD CONSTRAINT "ProjectAttachment_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectAttachment" ADD CONSTRAINT "ProjectAttachment_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TimeEntry" ADD CONSTRAINT "TimeEntry_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TimeEntry" ADD CONSTRAINT "TimeEntry_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Proposal" ADD CONSTRAINT "Proposal_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProposalContact" ADD CONSTRAINT "ProposalContact_proposalId_fkey" FOREIGN KEY ("proposalId") REFERENCES "Proposal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProposalAccess" ADD CONSTRAINT "ProposalAccess_proposalId_fkey" FOREIGN KEY ("proposalId") REFERENCES "Proposal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProposalAccess" ADD CONSTRAINT "ProposalAccess_membershipId_fkey" FOREIGN KEY ("membershipId") REFERENCES "OrganizationMembership"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProposalModItem" ADD CONSTRAINT "ProposalModItem_proposalId_fkey" FOREIGN KEY ("proposalId") REFERENCES "Proposal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProposalModItem" ADD CONSTRAINT "ProposalModItem_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProposalMoiItem" ADD CONSTRAINT "ProposalMoiItem_proposalId_fkey" FOREIGN KEY ("proposalId") REFERENCES "Proposal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProposalMoiItem" ADD CONSTRAINT "ProposalMoiItem_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProposalMaterialItem" ADD CONSTRAINT "ProposalMaterialItem_proposalId_fkey" FOREIGN KEY ("proposalId") REFERENCES "Proposal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProposalMaterialItem" ADD CONSTRAINT "ProposalMaterialItem_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProposalEquipmentItem" ADD CONSTRAINT "ProposalEquipmentItem_proposalId_fkey" FOREIGN KEY ("proposalId") REFERENCES "Proposal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProposalEquipmentItem" ADD CONSTRAINT "ProposalEquipmentItem_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProposalThirdPartyItem" ADD CONSTRAINT "ProposalThirdPartyItem_proposalId_fkey" FOREIGN KEY ("proposalId") REFERENCES "Proposal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProposalThirdPartyItem" ADD CONSTRAINT "ProposalThirdPartyItem_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProposalConsumableItem" ADD CONSTRAINT "ProposalConsumableItem_proposalId_fkey" FOREIGN KEY ("proposalId") REFERENCES "Proposal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProposalConsumableItem" ADD CONSTRAINT "ProposalConsumableItem_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProposalExpenseItem" ADD CONSTRAINT "ProposalExpenseItem_proposalId_fkey" FOREIGN KEY ("proposalId") REFERENCES "Proposal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProposalExpenseItem" ADD CONSTRAINT "ProposalExpenseItem_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalaryBaseTable" ADD CONSTRAINT "SalaryBaseTable_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalaryBaseRole" ADD CONSTRAINT "SalaryBaseRole_salaryBaseTableId_fkey" FOREIGN KEY ("salaryBaseTableId") REFERENCES "SalaryBaseTable"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaxProfile" ADD CONSTRAINT "TaxProfile_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SimplesNacionalRate" ADD CONSTRAINT "SimplesNacionalRate_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProposalCalculationInput" ADD CONSTRAINT "ProposalCalculationInput_proposalId_fkey" FOREIGN KEY ("proposalId") REFERENCES "Proposal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProposalCalculationInput" ADD CONSTRAINT "ProposalCalculationInput_taxProfileId_fkey" FOREIGN KEY ("taxProfileId") REFERENCES "TaxProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProposalCalculationResult" ADD CONSTRAINT "ProposalCalculationResult_proposalId_fkey" FOREIGN KEY ("proposalId") REFERENCES "Proposal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProposalDocument" ADD CONSTRAINT "ProposalDocument_proposalId_fkey" FOREIGN KEY ("proposalId") REFERENCES "Proposal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProposalAttachment" ADD CONSTRAINT "ProposalAttachment_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProposalAttachment" ADD CONSTRAINT "ProposalAttachment_proposalId_fkey" FOREIGN KEY ("proposalId") REFERENCES "Proposal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Employee" ADD CONSTRAINT "Employee_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmployeeProjectAssignment" ADD CONSTRAINT "EmployeeProjectAssignment_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmployeeProjectAssignment" ADD CONSTRAINT "EmployeeProjectAssignment_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmployeeProjectAssignment" ADD CONSTRAINT "EmployeeProjectAssignment_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrganizationLaborPolicy" ADD CONSTRAINT "OrganizationLaborPolicy_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmployeeLaborPolicyOverride" ADD CONSTRAINT "EmployeeLaborPolicyOverride_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmployeeLaborPolicyOverride" ADD CONSTRAINT "EmployeeLaborPolicyOverride_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmployeeLaborPolicyOverride" ADD CONSTRAINT "EmployeeLaborPolicyOverride_basePolicyId_fkey" FOREIGN KEY ("basePolicyId") REFERENCES "OrganizationLaborPolicy"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrganizationHoliday" ADD CONSTRAINT "OrganizationHoliday_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TimeSheet" ADD CONSTRAINT "TimeSheet_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TimeSheet" ADD CONSTRAINT "TimeSheet_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TimeSheet" ADD CONSTRAINT "TimeSheet_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TimeSheetEntry" ADD CONSTRAINT "TimeSheetEntry_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TimeSheetEntry" ADD CONSTRAINT "TimeSheetEntry_timeSheetId_fkey" FOREIGN KEY ("timeSheetId") REFERENCES "TimeSheet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TimeSheetEntry" ADD CONSTRAINT "TimeSheetEntry_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TimeSheetEntry" ADD CONSTRAINT "TimeSheetEntry_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
