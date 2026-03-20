-- CreateEnum
CREATE TYPE "CompanyLifecycleStatus" AS ENUM ('candidate', 'active', 'under_review', 'removed', 'archived');

-- AlterTable
ALTER TABLE "Company"
ADD COLUMN "lifecycleStatus" "CompanyLifecycleStatus" NOT NULL DEFAULT 'candidate',
ADD COLUMN "haloFit" INTEGER NOT NULL DEFAULT 3,
ADD COLUMN "esgFit" INTEGER NOT NULL DEFAULT 3,
ADD COLUMN "mediumTermScore" INTEGER NOT NULL DEFAULT 3,
ADD COLUMN "reviewDueAt" TIMESTAMP(3);
