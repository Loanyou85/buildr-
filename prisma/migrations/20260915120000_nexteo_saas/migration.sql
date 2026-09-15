-- ---------------------------------------------------------------------------
-- Bascule vers le schéma Nexteo.
--
-- Cette migration remplace un produit par un autre : l'ancien contenu — modèles
-- d'activité, parcours UGC, recommandations — n'a aucun équivalent dans le
-- nouveau et n'est pas repris.
--
-- Elle repart d'une table rase plutôt que de transformer l'existant, pour une
-- raison précise : une première version tentait d'ajouter des colonnes
-- obligatoires à des tables déjà remplies (`Journey.slug`, `Phase.key`), ce qui
-- échoue sur une base semée et laisse la migration à moitié appliquée. Repartir
-- de zéro est la seule forme qui aboutisse depuis les trois états possibles :
-- base neuve, base de l'ancien produit, base restée en échec.
--
-- Le journal de migrations est le seul objet préservé.
-- ---------------------------------------------------------------------------

DO $$
DECLARE objet record;
BEGIN
  FOR objet IN
    SELECT tablename FROM pg_tables
    WHERE schemaname = 'public' AND tablename <> '_prisma_migrations'
  LOOP
    EXECUTE format('DROP TABLE IF EXISTS public.%I CASCADE', objet.tablename);
  END LOOP;

  -- Les énumérations aussi : leurs valeurs changent d'un produit à l'autre, et
  -- une exécution interrompue peut en avoir laissé des provisoires.
  FOR objet IN
    SELECT t.typname FROM pg_type t
    JOIN pg_namespace n ON n.oid = t.typnamespace
    WHERE n.nspname = 'public' AND t.typtype = 'e'
  LOOP
    EXECUTE format('DROP TYPE IF EXISTS public.%I CASCADE', objet.typname);
  END LOOP;
END $$;

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('user', 'admin');

-- CreateEnum
CREATE TYPE "ProfileStatus" AS ENUM ('student', 'employed', 'unemployed', 'freelance', 'entrepreneur', 'other');

-- CreateEnum
CREATE TYPE "RiskTolerance" AS ENUM ('low', 'medium', 'high');

-- CreateEnum
CREATE TYPE "DomainSource" AS ENUM ('metier', 'etudes', 'passion', 'entourage');

-- CreateEnum
CREATE TYPE "PayerType" AS ENUM ('business', 'professional', 'consumer');

-- CreateEnum
CREATE TYPE "IdeaStatus" AS ENUM ('proposed', 'selected', 'rejected');

-- CreateEnum
CREATE TYPE "Difficulty" AS ENUM ('easy', 'medium', 'hard');

-- CreateEnum
CREATE TYPE "TechPath" AS ENUM ('navigateur', 'ordinateur');

-- CreateEnum
CREATE TYPE "ProofKind" AS ENUM ('none', 'url', 'text');

-- CreateEnum
CREATE TYPE "StepStatus" AS ENUM ('locked', 'available', 'in_progress', 'done');

-- CreateEnum
CREATE TYPE "PromptTarget" AS ENUM ('claude_code', 'replit', 'claude_web');

-- CreateEnum
CREATE TYPE "PromptStatus" AS ENUM ('todo', 'copied', 'executed', 'validated');

-- CreateEnum
CREATE TYPE "VideoAngle" AS ENUM ('probleme', 'demonstration', 'construire_en_public', 'pedagogie', 'coulisses', 'reponse');

-- CreateEnum
CREATE TYPE "VideoStatus" AS ENUM ('todo', 'filmed', 'published');

-- CreateEnum
CREATE TYPE "VerificationStatus" AS ENUM ('declared', 'verified');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('daily_reminder', 'inactivity', 'milestone');

-- CreateEnum
CREATE TYPE "NotificationChannel" AS ENUM ('email', 'browser', 'both');

-- CreateEnum
CREATE TYPE "Plan" AS ENUM ('free', 'depart', 'construction', 'lancement');

-- CreateEnum
CREATE TYPE "SubscriptionStatus" AS ENUM ('active', 'past_due', 'canceled');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "emailVerified" TIMESTAMP(3),
    "name" TEXT,
    "passwordHash" TEXT,
    "image" TEXT,
    "role" "Role" NOT NULL DEFAULT 'user',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "consentAcceptedAt" TIMESTAMP(3),
    "consentVersion" TEXT,
    "dataRetentionMonths" INTEGER NOT NULL DEFAULT 36,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Account" (
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("provider","providerAccountId")
);

-- CreateTable
CREATE TABLE "Session" (
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("sessionToken")
);

-- CreateTable
CREATE TABLE "VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VerificationToken_pkey" PRIMARY KEY ("identifier","token")
);

-- CreateTable
CREATE TABLE "Profile" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "anonId" TEXT,
    "age" INTEGER,
    "country" TEXT,
    "status" "ProfileStatus",
    "hoursPerWeek" INTEGER,
    "budget" INTEGER,
    "technicalLevel" INTEGER,
    "goalRevenue" INTEGER,
    "timeHorizon" INTEGER,
    "riskTolerance" "RiskTolerance",
    "showsFace" BOOLEAN,
    "prefersSolo" BOOLEAN,
    "reachableCount" INTEGER,
    "currentQuestionKey" TEXT,
    "completedAt" TIMESTAMP(3),
    "derivedSignals" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Profile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Skill" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "category" TEXT NOT NULL,

    CONSTRAINT "Skill_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserSkill" (
    "profileId" TEXT NOT NULL,
    "skillId" TEXT NOT NULL,
    "level" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "UserSkill_pkey" PRIMARY KEY ("profileId","skillId")
);

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
CREATE TABLE "Interest" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "label" TEXT NOT NULL,

    CONSTRAINT "Interest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserInterest" (
    "profileId" TEXT NOT NULL,
    "interestId" TEXT NOT NULL,

    CONSTRAINT "UserInterest_pkey" PRIMARY KEY ("profileId","interestId")
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
CREATE TABLE "Journey" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Journey_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Phase" (
    "id" TEXT NOT NULL,
    "journeyId" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "key" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "goal" TEXT NOT NULL,
    "outcome" TEXT NOT NULL,

    CONSTRAINT "Phase_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Step" (
    "id" TEXT NOT NULL,
    "phaseId" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "number" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "goal" TEXT NOT NULL,
    "why" TEXT NOT NULL,
    "estimatedMinutes" INTEGER NOT NULL,
    "difficulty" "Difficulty" NOT NULL DEFAULT 'easy',
    "techPath" "TechPath",
    "unlockConditions" JSONB,

    CONSTRAINT "Step_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SubStep" (
    "id" TEXT NOT NULL,
    "stepId" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,

    CONSTRAINT "SubStep_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Action" (
    "id" TEXT NOT NULL,
    "subStepId" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "instruction" TEXT NOT NULL,
    "externalUrl" TEXT,
    "promptTemplateSlug" TEXT,
    "screenshot" TEXT,

    CONSTRAINT "Action_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Checkpoint" (
    "id" TEXT NOT NULL,
    "stepId" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "label" TEXT NOT NULL,
    "isRequired" BOOLEAN NOT NULL DEFAULT true,
    "proofKind" "ProofKind" NOT NULL DEFAULT 'none',
    "proofField" TEXT,

    CONSTRAINT "Checkpoint_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserJourney" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "journeyId" TEXT NOT NULL,
    "ideaId" TEXT,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "currentStepId" TEXT,
    "progressPercent" INTEGER NOT NULL DEFAULT 0,
    "techPath" "TechPath",
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "UserJourney_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StepProgress" (
    "id" TEXT NOT NULL,
    "userJourneyId" TEXT NOT NULL,
    "stepId" TEXT NOT NULL,
    "status" "StepStatus" NOT NULL DEFAULT 'locked',
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "lastActivityAt" TIMESTAMP(3),

    CONSTRAINT "StepProgress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CheckpointProgress" (
    "id" TEXT NOT NULL,
    "stepProgressId" TEXT NOT NULL,
    "checkpointId" TEXT NOT NULL,
    "checkedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "proofValue" TEXT,

    CONSTRAINT "CheckpointProgress_pkey" PRIMARY KEY ("id")
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
CREATE TABLE "Milestone" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Milestone_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserMilestone" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "milestoneId" TEXT NOT NULL,
    "reachedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "declaredValue" INTEGER,
    "verificationStatus" "VerificationStatus" NOT NULL DEFAULT 'declared',

    CONSTRAINT "UserMilestone_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Adventure" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "story" TEXT,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isDemo" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Adventure_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdventureShare" (
    "id" TEXT NOT NULL,
    "adventureId" TEXT NOT NULL,
    "milestoneId" TEXT NOT NULL,
    "cardImageUrl" TEXT,
    "sharedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AdventureShare_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL,
    "payload" JSONB NOT NULL,
    "scheduledFor" TIMESTAMP(3) NOT NULL,
    "sentAt" TIMESTAMP(3),
    "readAt" TIMESTAMP(3),

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NotificationPref" (
    "userId" TEXT NOT NULL,
    "dailyReminder" BOOLEAN NOT NULL DEFAULT true,
    "reminderHour" INTEGER NOT NULL DEFAULT 9,
    "inactivityReminder" BOOLEAN NOT NULL DEFAULT true,
    "channel" "NotificationChannel" NOT NULL DEFAULT 'email',

    CONSTRAINT "NotificationPref_pkey" PRIMARY KEY ("userId")
);

-- CreateTable
CREATE TABLE "Subscription" (
    "userId" TEXT NOT NULL,
    "plan" "Plan" NOT NULL DEFAULT 'free',
    "status" "SubscriptionStatus" NOT NULL DEFAULT 'active',
    "currentPeriodEnd" TIMESTAMP(3),
    "intendedPlan" "Plan",
    "intendedAt" TIMESTAMP(3),
    "stripeCustomerId" TEXT,
    "stripeSubscriptionId" TEXT,
    "cancelAtPeriodEnd" BOOLEAN NOT NULL DEFAULT false,
    "customPromptsMonth" TEXT,
    "customPromptsUsed" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Subscription_pkey" PRIMARY KEY ("userId")
);

-- CreateTable
CREATE TABLE "FeatureFlag" (
    "key" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "plans" "Plan"[],

    CONSTRAINT "FeatureFlag_pkey" PRIMARY KEY ("key")
);

-- CreateTable
CREATE TABLE "_DomainToIdeaBlueprint" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_DomainToIdeaBlueprint_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Profile_userId_key" ON "Profile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Profile_anonId_key" ON "Profile"("anonId");

-- CreateIndex
CREATE UNIQUE INDEX "Skill_slug_key" ON "Skill"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Domain_slug_key" ON "Domain"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Interest_slug_key" ON "Interest"("slug");

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
CREATE UNIQUE INDEX "Journey_slug_key" ON "Journey"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Phase_journeyId_order_key" ON "Phase"("journeyId", "order");

-- CreateIndex
CREATE UNIQUE INDEX "Step_phaseId_order_key" ON "Step"("phaseId", "order");

-- CreateIndex
CREATE UNIQUE INDEX "SubStep_stepId_order_key" ON "SubStep"("stepId", "order");

-- CreateIndex
CREATE UNIQUE INDEX "Action_subStepId_order_key" ON "Action"("subStepId", "order");

-- CreateIndex
CREATE UNIQUE INDEX "Checkpoint_stepId_order_key" ON "Checkpoint"("stepId", "order");

-- CreateIndex
CREATE INDEX "UserJourney_userId_idx" ON "UserJourney"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "UserJourney_userId_journeyId_key" ON "UserJourney"("userId", "journeyId");

-- CreateIndex
CREATE UNIQUE INDEX "StepProgress_userJourneyId_stepId_key" ON "StepProgress"("userJourneyId", "stepId");

-- CreateIndex
CREATE UNIQUE INDEX "CheckpointProgress_stepProgressId_checkpointId_key" ON "CheckpointProgress"("stepProgressId", "checkpointId");

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
CREATE UNIQUE INDEX "Milestone_key_key" ON "Milestone"("key");

-- CreateIndex
CREATE UNIQUE INDEX "UserMilestone_userId_milestoneId_key" ON "UserMilestone"("userId", "milestoneId");

-- CreateIndex
CREATE UNIQUE INDEX "Adventure_userId_key" ON "Adventure"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Adventure_slug_key" ON "Adventure"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "AdventureShare_adventureId_milestoneId_key" ON "AdventureShare"("adventureId", "milestoneId");

-- CreateIndex
CREATE INDEX "Notification_userId_scheduledFor_idx" ON "Notification"("userId", "scheduledFor");

-- CreateIndex
CREATE UNIQUE INDEX "Subscription_stripeCustomerId_key" ON "Subscription"("stripeCustomerId");

-- CreateIndex
CREATE UNIQUE INDEX "Subscription_stripeSubscriptionId_key" ON "Subscription"("stripeSubscriptionId");

-- CreateIndex
CREATE INDEX "_DomainToIdeaBlueprint_B_index" ON "_DomainToIdeaBlueprint"("B");

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Profile" ADD CONSTRAINT "Profile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserSkill" ADD CONSTRAINT "UserSkill_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserSkill" ADD CONSTRAINT "UserSkill_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "Skill"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserDomain" ADD CONSTRAINT "UserDomain_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserDomain" ADD CONSTRAINT "UserDomain_domainId_fkey" FOREIGN KEY ("domainId") REFERENCES "Domain"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserInterest" ADD CONSTRAINT "UserInterest_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserInterest" ADD CONSTRAINT "UserInterest_interestId_fkey" FOREIGN KEY ("interestId") REFERENCES "Interest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

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
ALTER TABLE "Phase" ADD CONSTRAINT "Phase_journeyId_fkey" FOREIGN KEY ("journeyId") REFERENCES "Journey"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Step" ADD CONSTRAINT "Step_phaseId_fkey" FOREIGN KEY ("phaseId") REFERENCES "Phase"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubStep" ADD CONSTRAINT "SubStep_stepId_fkey" FOREIGN KEY ("stepId") REFERENCES "Step"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Action" ADD CONSTRAINT "Action_subStepId_fkey" FOREIGN KEY ("subStepId") REFERENCES "SubStep"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Checkpoint" ADD CONSTRAINT "Checkpoint_stepId_fkey" FOREIGN KEY ("stepId") REFERENCES "Step"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserJourney" ADD CONSTRAINT "UserJourney_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserJourney" ADD CONSTRAINT "UserJourney_journeyId_fkey" FOREIGN KEY ("journeyId") REFERENCES "Journey"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserJourney" ADD CONSTRAINT "UserJourney_ideaId_fkey" FOREIGN KEY ("ideaId") REFERENCES "Idea"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StepProgress" ADD CONSTRAINT "StepProgress_userJourneyId_fkey" FOREIGN KEY ("userJourneyId") REFERENCES "UserJourney"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StepProgress" ADD CONSTRAINT "StepProgress_stepId_fkey" FOREIGN KEY ("stepId") REFERENCES "Step"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CheckpointProgress" ADD CONSTRAINT "CheckpointProgress_stepProgressId_fkey" FOREIGN KEY ("stepProgressId") REFERENCES "StepProgress"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CheckpointProgress" ADD CONSTRAINT "CheckpointProgress_checkpointId_fkey" FOREIGN KEY ("checkpointId") REFERENCES "Checkpoint"("id") ON DELETE CASCADE ON UPDATE CASCADE;

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
ALTER TABLE "UserMilestone" ADD CONSTRAINT "UserMilestone_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserMilestone" ADD CONSTRAINT "UserMilestone_milestoneId_fkey" FOREIGN KEY ("milestoneId") REFERENCES "Milestone"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Adventure" ADD CONSTRAINT "Adventure_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdventureShare" ADD CONSTRAINT "AdventureShare_adventureId_fkey" FOREIGN KEY ("adventureId") REFERENCES "Adventure"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdventureShare" ADD CONSTRAINT "AdventureShare_milestoneId_fkey" FOREIGN KEY ("milestoneId") REFERENCES "Milestone"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NotificationPref" ADD CONSTRAINT "NotificationPref_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_DomainToIdeaBlueprint" ADD CONSTRAINT "_DomainToIdeaBlueprint_A_fkey" FOREIGN KEY ("A") REFERENCES "Domain"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_DomainToIdeaBlueprint" ADD CONSTRAINT "_DomainToIdeaBlueprint_B_fkey" FOREIGN KEY ("B") REFERENCES "IdeaBlueprint"("id") ON DELETE CASCADE ON UPDATE CASCADE;

