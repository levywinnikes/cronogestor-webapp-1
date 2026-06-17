-- AlterTable
ALTER TABLE "Employee" ADD COLUMN "documentType" TEXT NOT NULL DEFAULT 'CPF';
ALTER TABLE "Employee" ADD COLUMN "documentTypeOther" TEXT;
