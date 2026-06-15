-- AlterTable
ALTER TABLE "Employee" ADD COLUMN     "bankAccount" TEXT,
ADD COLUMN     "bankAccountDigit" TEXT,
ADD COLUMN     "bankAgency" TEXT,
ADD COLUMN     "bankIban" TEXT,
ADD COLUMN     "bankName" TEXT,
ADD COLUMN     "bankSwift" TEXT,
ADD COLUMN     "pixKey" TEXT,
ADD COLUMN     "vtEnabled" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "budgetLabor" DECIMAL(12,2),
ADD COLUMN     "budgetMaterials" DECIMAL(12,2),
ADD COLUMN     "budgetOthers" DECIMAL(12,2);
