-- AlterEnum
ALTER TYPE "Plan" ADD VALUE 'illimite';

-- AlterTable
ALTER TABLE "Subscription" ADD COLUMN     "intendedAt" TIMESTAMP(3),
ADD COLUMN     "intendedPlan" "Plan";
