-- Remise à plat des offres avant le changement d'énumération.
-- Les anciennes valeurs ('pro', 'illimite') n'existent plus dans `Plan` :
-- sans ce nettoyage, le transtypage échoue sur une base déjà semée.
-- Les droits sont réécrits intégralement par le seed.
DELETE FROM "FeatureFlag";
UPDATE "Subscription" SET "plan" = 'free' WHERE "plan"::text NOT IN ('free');
UPDATE "Subscription" SET "intendedPlan" = NULL WHERE "intendedPlan" IS NOT NULL;

-- CreateEnum
CREATE TYPE "DomainSource" AS ENUM ('metier', 'etudes', 'passion', 'entourage');

-- CreateEnum
CREATE TYPE "PayerType" AS ENUM ('business', 'professional', 'consumer');

-- CreateEnum
CREATE TYPE "IdeaStatus" AS ENUM ('proposed', 'selected', 'rejected');

-- CreateEnum
CREATE TYPE "TechPath" AS ENUM ('navigateur', 'ordinateur');

-- CreateEnum
CREATE TYPE "ProofKind" AS ENUM ('none', 'url', 'text');

-- CreateEnum
CREATE TYPE "PromptTarget" AS ENUM ('claude_code', 'replit', 'claude_web');

-- CreateEnum
CREATE TYPE "PromptStatus" AS ENUM ('todo', 'copied', 'executed', 'validated');

-- CreateEnum
CREATE TYPE "VideoAngle" AS ENUM ('probleme', 'demonstration', 'construire_en_public', 'pedagogie', 'coulisses', 'reponse');

-- CreateEnum
CREATE TYPE "VideoStatus" AS ENUM ('todo', 'filmed', 'published');

-- AlterEnum
BEGIN;
CREATE TYPE "NotificationType_new" AS ENUM ('daily_reminder', 'inactivity', 'milestone');
ALTER TABLE "Notification" ALTER COLUMN "type" TYPE "NotificationType_new" USING ("type"::text::"NotificationType_new");
ALTER TYPE "NotificationType" RENAME TO "NotificationType_old";
ALTER TYPE "NotificationType_new" RENAME TO "NotificationType";
DROP TYPE "public"."NotificationType_old";
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "Plan_new" AS ENUM ('free', 'depart', 'construction', 'lancement');
ALTER TABLE "public"."Subscription" ALTER COLUMN "plan" DROP DEFAULT;
ALTER TABLE "Subscription" ALTER COLUMN "plan" TYPE "Plan_new" USING ("plan"::text::"Plan_new");
ALTER TABLE "Subscription" ALTER COLUMN "intendedPlan" TYPE "Plan_new" USING ("intendedPlan"::text::"Plan_new");
ALTER TABLE "FeatureFlag" ALTER COLUMN "plans" TYPE "Plan_new"[] USING ("plans"::text::"Plan_new"[]);
ALTER TYPE "Plan" RENAME TO "Plan_old";
ALTER TYPE "Plan_new" RENAME TO "Plan";
DROP TYPE "public"."Plan_old";
ALTER TABLE "Subscription" ALTER COLUMN "plan" SET DEFAULT 'free';
COMMIT;

-- DropForeignKey
ALTER TABLE "Adjustment" DROP CONSTRAINT "Adjustment_stepId_fkey";

-- DropForeignKey
ALTER TABLE "Adjustment" DROP CONSTRAINT "Adjustment_userJourneyId_fkey";

-- DropForeignKey
ALTER TABLE "AssistantMessage" DROP CONSTRAINT "AssistantMessage_threadId_fkey";

-- DropForeignKey
ALTER TABLE "AssistantThread" DROP CONSTRAINT "AssistantThread_stepId_fkey";

-- DropForeignKey
ALTER TABLE "AssistantThread" DROP CONSTRAINT "AssistantThread_userId_fkey";

-- DropForeignKey
ALTER TABLE "AssistantThread" DROP CONSTRAINT "AssistantThread_userJourneyId_fkey";

-- DropForeignKey
ALTER TABLE "BusinessTag" DROP CONSTRAINT "BusinessTag_businessModelId_fkey";

-- DropForeignKey
ALTER TABLE "DailyPlan" DROP CONSTRAINT "DailyPlan_userJourneyId_fkey";

-- DropForeignKey
ALTER TABLE "HabitAnswer" DROP CONSTRAINT "HabitAnswer_profileId_fkey";

-- DropForeignKey
ALTER TABLE "Journey" DROP CONSTRAINT "Journey_businessModelId_fkey";

-- DropForeignKey
ALTER TABLE "Recommendation" DROP CONSTRAINT "Recommendation_businessModelId_fkey";

-- DropForeignKey
ALTER TABLE "Recommendation" DROP CONSTRAINT "Recommendation_userId_fkey";

-- DropForeignKey
ALTER TABLE "Resource" DROP CONSTRAINT "Resource_stepId_fkey";

-- DropIndex
DROP INDEX "Journey_businessModelId_budgetTier_experienceTier_version_key";

-- AlterTable
ALTER TABLE "Action" DROP COLUMN "example",
DROP COLUMN "templateRef",
ADD COLUMN     "promptTemplateSlug" TEXT,
ADD COLUMN     "screenshot" TEXT;

-- AlterTable
ALTER TABLE "Checkpoint" ADD COLUMN     "proofField" TEXT,
ADD COLUMN     "proofKind" "ProofKind" NOT NULL DEFAULT 'none';

-- AlterTable
ALTER TABLE "CheckpointProgress" ADD COLUMN     "proofValue" TEXT;

-- AlterTable
ALTER TABLE "Journey" DROP COLUMN "budgetTier",
DROP COLUMN "businessModelId",
DROP COLUMN "experienceTier",
ADD COLUMN     "slug" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Phase" ADD COLUMN     "key" TEXT NOT NULL,
ADD COLUMN     "outcome" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Profile" DROP COLUMN "city",
DROP COLUMN "createsContent",
DROP COLUMN "dislikedSubjects",
DROP COLUMN "educationField",
DROP COLUMN "educationLevel",
DROP COLUMN "financialGoal",
DROP COLUMN "hoursPerDay",
DROP COLUMN "initialBudget",
DROP COLUMN "likedSubjects",
DROP COLUMN "likesAnalyzing",
DROP COLUMN "likesCreating",
DROP COLUMN "likesRepetition",
DROP COLUMN "likesSelling",
DROP COLUMN "likesStrangers",
DROP COLUMN "monthlyBudget",
DROP COLUMN "onboardingCompleted",
DROP COLUMN "onboardingStep",
DROP COLUMN "prefersFreedom",
DROP COLUMN "workMode",
ADD COLUMN     "anonId" TEXT,
ADD COLUMN     "budget" INTEGER,
ADD COLUMN     "completedAt" TIMESTAMP(3),
ADD COLUMN     "currentQuestionKey" TEXT,
ADD COLUMN     "goalRevenue" INTEGER,
ADD COLUMN     "reachableCount" INTEGER,
ADD COLUMN     "technicalLevel" INTEGER,
ALTER COLUMN "userId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Step" ADD COLUMN     "techPath" "TechPath";

-- AlterTable
ALTER TABLE "StepProgress" DROP COLUMN "outreachReplies",
DROP COLUMN "outreachSent";

-- AlterTable
ALTER TABLE "Subscription" ADD COLUMN     "customPromptsMonth" TEXT,
ADD COLUMN     "customPromptsUsed" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "UserJourney" ADD COLUMN     "ideaId" TEXT,
ADD COLUMN     "techPath" "TechPath";

-- DropTable
DROP TABLE "Adjustment";

-- DropTable
DROP TABLE "AssistantMessage";

-- DropTable
DROP TABLE "AssistantThread";

-- DropTable
DROP TABLE "BusinessModel";

-- DropTable
DROP TABLE "BusinessTag";

-- DropTable
DROP TABLE "DailyPlan";

-- DropTable
DROP TABLE "HabitAnswer";

-- DropTable
DROP TABLE "Recommendation";

-- DropTable
DROP TABLE "Resource";

-- DropEnum
DROP TYPE "AdjustmentReason";

-- DropEnum
DROP TYPE "BudgetTier";

-- DropEnum
DROP TYPE "EducationLevel";

-- DropEnum
DROP TYPE "ExperienceTier";

-- DropEnum
DROP TYPE "MessageRole";

-- DropEnum
DROP TYPE "RecommendationStatus";

-- DropEnum
DROP TYPE "ResourceType";

-- DropEnum
DROP TYPE "WorkMode";

-- CreateTable
CREATE TABLE "Domain" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "family" TEXT NOT NULL,

    CONSTRAINT "Domain_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserDomain" (
    "profileId" TEXT NOT NULL,
    "domainId" TEXT NOT NULL,
    "yearsExposure" INTEGER NOT NULL DEFAULT 0,
    "source" "DomainSource" NOT NULL DEFAULT 'metier',

    CONSTRAINT "UserDomain_pkey" PRIMARY KEY ("profileId","domainId")
);

-- CreateTable
CREATE TABLE "FrictionAnswer" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "questionKey" TEXT NOT NULL,
    "answer" TEXT NOT NULL,

    CONSTRAINT "FrictionAnswer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ScoringWeight" (
    "dimension" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "weight" DOUBLE PRECISION NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "ScoringWeight_pkey" PRIMARY KEY ("dimension")
);

-- CreateTable
CREATE TABLE "IdeaBlueprint" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "oneLiner" TEXT NOT NULL,
    "targetAudience" TEXT NOT NULL,
    "problem" TEXT NOT NULL,
    "solution" TEXT NOT NULL,
    "pricingModel" TEXT NOT NULL,
    "monthlyPrice" INTEGER NOT NULL,
    "buildComplexity" INTEGER NOT NULL,
    "weeksToFirstEuro" INTEGER NOT NULL,
    "payerType" "PayerType" NOT NULL,
    "hoursPerWeekMin" INTEGER NOT NULL DEFAULT 5,
    "monthlyFixedCost" INTEGER NOT NULL DEFAULT 0,
    "requiresComplexCode" BOOLEAN NOT NULL DEFAULT false,
    "requiresRegulatedLicense" BOOLEAN NOT NULL DEFAULT false,
    "requiresPhysicalStock" BOOLEAN NOT NULL DEFAULT false,
    "requiresTeam" BOOLEAN NOT NULL DEFAULT false,
    "requiresFace" BOOLEAN NOT NULL DEFAULT false,
    "requiresOutbound" BOOLEAN NOT NULL DEFAULT true,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "IdeaBlueprint_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IdeaBlueprintTag" (
    "id" TEXT NOT NULL,
    "blueprintId" TEXT NOT NULL,
    "dimension" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "weight" DOUBLE PRECISION NOT NULL DEFAULT 1,

    CONSTRAINT "IdeaBlueprintTag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Idea" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "anonId" TEXT,
    "blueprintId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "oneLiner" TEXT NOT NULL,
    "targetAudience" TEXT NOT NULL,
    "problem" TEXT NOT NULL,
    "solution" TEXT NOT NULL,
    "pricingModel" TEXT NOT NULL,
    "monthlyPrice" INTEGER NOT NULL,
    "buildComplexity" INTEGER NOT NULL,
    "timeToFirstEuro" INTEGER NOT NULL,
    "score" DOUBLE PRECISION NOT NULL,
    "rank" INTEGER NOT NULL DEFAULT 1,
    "breakdown" JSONB NOT NULL,
    "rationale" TEXT,
    "status" "IdeaStatus" NOT NULL DEFAULT 'proposed',
    "rejectionReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Idea_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IdeaSource" (
    "id" TEXT NOT NULL,
    "ideaId" TEXT NOT NULL,
    "dimension" TEXT NOT NULL,
    "evidence" TEXT NOT NULL,

    CONSTRAINT "IdeaSource_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProjectState" (
    "userJourneyId" TEXT NOT NULL,
    "projectName" TEXT,
    "repoUrl" TEXT,
    "deployUrl" TEXT,
    "domainName" TEXT,
    "entities" JSONB,
    "screens" JSONB,
    "conventions" JSONB,
    "stack" JSONB,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProjectState_pkey" PRIMARY KEY ("userJourneyId")
);

-- CreateTable
CREATE TABLE "PromptTemplate" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "blockKey" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "objective" TEXT NOT NULL,
    "target" "PromptTarget" NOT NULL DEFAULT 'claude_code',
    "body" TEXT NOT NULL,
    "expectedOutcome" TEXT NOT NULL,
    "verification" TEXT NOT NULL,
    "maxChars" INTEGER NOT NULL DEFAULT 4000,
    "isRepair" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "version" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "PromptTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PromptPack" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "ideaId" TEXT NOT NULL,
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "version" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "PromptPack_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GeneratedPrompt" (
    "id" TEXT NOT NULL,
    "packId" TEXT NOT NULL,
    "templateId" TEXT,
    "stepId" TEXT,
    "order" INTEGER NOT NULL,
    "phaseKey" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "objective" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "target" "PromptTarget" NOT NULL DEFAULT 'claude_code',
    "expectedOutcome" TEXT NOT NULL,
    "verification" TEXT NOT NULL,
    "repairSlug" TEXT,
    "isCustom" BOOLEAN NOT NULL DEFAULT false,
    "status" "PromptStatus" NOT NULL DEFAULT 'todo',
    "copiedAt" TIMESTAMP(3),
    "executedAt" TIMESTAMP(3),
    "rating" INTEGER,

    CONSTRAINT "GeneratedPrompt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ErrorPattern" (
    "id" TEXT NOT NULL,
    "signature" TEXT NOT NULL,
    "matcher" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "explanation" TEXT NOT NULL,
    "repairTemplateId" TEXT,

    CONSTRAINT "ErrorPattern_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CustomPromptRequest" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "packId" TEXT NOT NULL,
    "request" TEXT NOT NULL,
    "generatedPromptId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CustomPromptRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VideoScript" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "ideaId" TEXT NOT NULL,
    "dayNumber" INTEGER NOT NULL,
    "angle" "VideoAngle" NOT NULL,
    "hook" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "shotPlan" JSONB NOT NULL,
    "onScreenText" JSONB NOT NULL,
    "caption" TEXT NOT NULL,
    "pinnedComment" TEXT NOT NULL,
    "durationSeconds" INTEGER NOT NULL,
    "status" "VideoStatus" NOT NULL DEFAULT 'todo',
    "renderedVideoUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VideoScript_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_DomainToIdeaBlueprint" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_DomainToIdeaBlueprint_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "Domain_slug_key" ON "Domain"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "FrictionAnswer_profileId_questionKey_key" ON "FrictionAnswer"("profileId", "questionKey");

-- CreateIndex
CREATE UNIQUE INDEX "IdeaBlueprint_slug_key" ON "IdeaBlueprint"("slug");

-- CreateIndex
CREATE INDEX "IdeaBlueprintTag_dimension_key_idx" ON "IdeaBlueprintTag"("dimension", "key");

-- CreateIndex
CREATE UNIQUE INDEX "IdeaBlueprintTag_blueprintId_dimension_key_key" ON "IdeaBlueprintTag"("blueprintId", "dimension", "key");

-- CreateIndex
CREATE INDEX "Idea_userId_createdAt_idx" ON "Idea"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "Idea_anonId_createdAt_idx" ON "Idea"("anonId", "createdAt");

-- CreateIndex
CREATE INDEX "IdeaSource_ideaId_idx" ON "IdeaSource"("ideaId");

-- CreateIndex
CREATE UNIQUE INDEX "PromptTemplate_slug_key" ON "PromptTemplate"("slug");

-- CreateIndex
CREATE INDEX "PromptTemplate_blockKey_order_idx" ON "PromptTemplate"("blockKey", "order");

-- CreateIndex
CREATE UNIQUE INDEX "PromptPack_userId_ideaId_version_key" ON "PromptPack"("userId", "ideaId", "version");

-- CreateIndex
CREATE INDEX "GeneratedPrompt_packId_order_idx" ON "GeneratedPrompt"("packId", "order");

-- CreateIndex
CREATE UNIQUE INDEX "ErrorPattern_signature_key" ON "ErrorPattern"("signature");

-- CreateIndex
CREATE UNIQUE INDEX "CustomPromptRequest_generatedPromptId_key" ON "CustomPromptRequest"("generatedPromptId");

-- CreateIndex
CREATE INDEX "CustomPromptRequest_userId_createdAt_idx" ON "CustomPromptRequest"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "VideoScript_userId_dayNumber_idx" ON "VideoScript"("userId", "dayNumber");

-- CreateIndex
CREATE UNIQUE INDEX "VideoScript_userId_ideaId_dayNumber_key" ON "VideoScript"("userId", "ideaId", "dayNumber");

-- CreateIndex
CREATE INDEX "_DomainToIdeaBlueprint_B_index" ON "_DomainToIdeaBlueprint"("B");

-- CreateIndex
CREATE UNIQUE INDEX "Journey_slug_key" ON "Journey"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Profile_anonId_key" ON "Profile"("anonId");

-- AddForeignKey
ALTER TABLE "UserDomain" ADD CONSTRAINT "UserDomain_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserDomain" ADD CONSTRAINT "UserDomain_domainId_fkey" FOREIGN KEY ("domainId") REFERENCES "Domain"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FrictionAnswer" ADD CONSTRAINT "FrictionAnswer_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IdeaBlueprintTag" ADD CONSTRAINT "IdeaBlueprintTag_blueprintId_fkey" FOREIGN KEY ("blueprintId") REFERENCES "IdeaBlueprint"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Idea" ADD CONSTRAINT "Idea_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Idea" ADD CONSTRAINT "Idea_blueprintId_fkey" FOREIGN KEY ("blueprintId") REFERENCES "IdeaBlueprint"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IdeaSource" ADD CONSTRAINT "IdeaSource_ideaId_fkey" FOREIGN KEY ("ideaId") REFERENCES "Idea"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserJourney" ADD CONSTRAINT "UserJourney_ideaId_fkey" FOREIGN KEY ("ideaId") REFERENCES "Idea"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectState" ADD CONSTRAINT "ProjectState_userJourneyId_fkey" FOREIGN KEY ("userJourneyId") REFERENCES "UserJourney"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PromptPack" ADD CONSTRAINT "PromptPack_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PromptPack" ADD CONSTRAINT "PromptPack_ideaId_fkey" FOREIGN KEY ("ideaId") REFERENCES "Idea"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GeneratedPrompt" ADD CONSTRAINT "GeneratedPrompt_packId_fkey" FOREIGN KEY ("packId") REFERENCES "PromptPack"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GeneratedPrompt" ADD CONSTRAINT "GeneratedPrompt_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "PromptTemplate"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GeneratedPrompt" ADD CONSTRAINT "GeneratedPrompt_stepId_fkey" FOREIGN KEY ("stepId") REFERENCES "Step"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ErrorPattern" ADD CONSTRAINT "ErrorPattern_repairTemplateId_fkey" FOREIGN KEY ("repairTemplateId") REFERENCES "PromptTemplate"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomPromptRequest" ADD CONSTRAINT "CustomPromptRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomPromptRequest" ADD CONSTRAINT "CustomPromptRequest_packId_fkey" FOREIGN KEY ("packId") REFERENCES "PromptPack"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomPromptRequest" ADD CONSTRAINT "CustomPromptRequest_generatedPromptId_fkey" FOREIGN KEY ("generatedPromptId") REFERENCES "GeneratedPrompt"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VideoScript" ADD CONSTRAINT "VideoScript_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VideoScript" ADD CONSTRAINT "VideoScript_ideaId_fkey" FOREIGN KEY ("ideaId") REFERENCES "Idea"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_DomainToIdeaBlueprint" ADD CONSTRAINT "_DomainToIdeaBlueprint_A_fkey" FOREIGN KEY ("A") REFERENCES "Domain"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_DomainToIdeaBlueprint" ADD CONSTRAINT "_DomainToIdeaBlueprint_B_fkey" FOREIGN KEY ("B") REFERENCES "IdeaBlueprint"("id") ON DELETE CASCADE ON UPDATE CASCADE;

