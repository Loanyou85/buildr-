import type { BudgetTier, ExperienceTier, PrismaClient } from '@prisma/client';
import { BUSINESS_MODELS, FEATURE_FLAGS, INTERESTS, MILESTONES, SKILLS } from './referential';
import { ugcJourney, ugcJourneyLowBudget } from './ugc';
import { STARTER_JOURNEYS } from './starter-journeys';
import type { JourneySeed } from './ugc/types';

export interface SeedSummary {
  skills: number;
  interests: number;
  milestones: number;
  featureFlags: number;
  businessModels: number;
  journeys: Array<{ name: string; phases: number; steps: number; actions: number; skipped: boolean }>;
  businessModelsWithoutJourney: string[];
}

/**
 * Seed idempotent : relançable sans dupliquer. Les parcours sont réécrits
 * intégralement (suppression puis recréation) parce qu'ils forment un tout
 * cohérent — un parcours à moitié à jour est pire qu'un parcours ancien.
 *
 * Exporté comme fonction pour être appelable de deux endroits : la commande
 * `npm run db:seed` et la route d'initialisation protégée, qui permet de
 * peupler une base de production sans terminal.
 */
export async function runSeed(db: PrismaClient): Promise<SeedSummary> {
  for (const skill of SKILLS) {
    await db.skill.upsert({ where: { slug: skill.slug }, update: skill, create: skill });
  }
  for (const interest of INTERESTS) {
    await db.interest.upsert({ where: { slug: interest.slug }, update: interest, create: interest });
  }
  for (const milestone of MILESTONES) {
    await db.milestone.upsert({ where: { key: milestone.key }, update: milestone, create: milestone });
  }
  for (const flag of FEATURE_FLAGS) {
    await db.featureFlag.upsert({ where: { key: flag.key }, update: flag, create: flag });
  }

  for (const seed of BUSINESS_MODELS) {
    const { tags, ...business } = seed;
    const defaults = {
      requiresFace: business.requiresFace ?? false,
      requiresContent: business.requiresContent ?? false,
      requiresSelling: business.requiresSelling ?? false,
      requiresLocalPresence: business.requiresLocalPresence ?? false,
    };
    const record = await db.businessModel.upsert({
      where: { slug: business.slug },
      update: { ...business, ...defaults },
      create: { ...business, ...defaults },
    });

    await db.businessTag.deleteMany({ where: { businessModelId: record.id } });
    await db.businessTag.createMany({ data: tags.map((tag) => ({ ...tag, businessModelId: record.id })) });
  }

  const journeys: SeedSummary['journeys'] = [];
  journeys.push(await seedJourney(db, 'agence-ugc', ugcJourney));
  journeys.push(await seedJourney(db, 'agence-ugc', ugcJourneyLowBudget));
  for (const [slug, seed] of Object.entries(STARTER_JOURNEYS)) {
    journeys.push(await seedJourney(db, slug, seed));
  }

  const withoutJourney = await db.businessModel.findMany({
    where: { journeys: { none: {} } },
    select: { slug: true },
  });

  return {
    skills: SKILLS.length,
    interests: INTERESTS.length,
    milestones: MILESTONES.length,
    featureFlags: FEATURE_FLAGS.length,
    businessModels: BUSINESS_MODELS.length,
    journeys,
    businessModelsWithoutJourney: withoutJourney.map((b) => b.slug),
  };
}

async function seedJourney(
  db: PrismaClient,
  businessSlug: string,
  seed: JourneySeed,
): Promise<SeedSummary['journeys'][number]> {
  const business = await db.businessModel.findUniqueOrThrow({ where: { slug: businessSlug } });

  const existing = await db.journey.findFirst({
    where: {
      businessModelId: business.id,
      budgetTier: seed.budgetTier as BudgetTier,
      experienceTier: seed.experienceTier as ExperienceTier,
      version: 1,
    },
    include: { userJourneys: { select: { id: true } } },
  });

  // Un parcours déjà démarré par un utilisateur n'est jamais supprimé : on
  // publierait une nouvelle version plutôt que d'effacer sa progression.
  if (existing && existing.userJourneys.length > 0) {
    return { name: seed.name, phases: 0, steps: 0, actions: 0, skipped: true };
  }
  if (existing) {
    await db.journey.delete({ where: { id: existing.id } });
  }

  const journey = await db.journey.create({
    data: {
      businessModelId: business.id,
      name: seed.name,
      budgetTier: seed.budgetTier as BudgetTier,
      experienceTier: seed.experienceTier as ExperienceTier,
      version: 1,
    },
  });

  let stepCount = 0;
  let actionCount = 0;

  for (const [phaseIndex, phaseSeed] of seed.phases.entries()) {
    const phase = await db.phase.create({
      data: { journeyId: journey.id, order: phaseIndex + 1, title: phaseSeed.title, goal: phaseSeed.goal },
    });

    for (const [stepIndex, stepSeed] of phaseSeed.steps.entries()) {
      const previousNumbers = phaseSeed.steps
        .slice(0, stepIndex)
        .map((s) => s.number)
        .concat(seed.phases.slice(0, phaseIndex).flatMap((p) => p.steps.map((s) => s.number)));

      const step = await db.step.create({
        data: {
          phaseId: phase.id,
          order: stepIndex + 1,
          number: stepSeed.number,
          title: stepSeed.title,
          goal: stepSeed.goal,
          why: stepSeed.why,
          estimatedMinutes: stepSeed.estimatedMinutes,
          difficulty: stepSeed.difficulty ?? 'easy',
          // Une étape se déverrouille quand la précédente est terminée.
          unlockConditions:
            previousNumbers.length > 0
              ? { requiresStepNumbers: [Math.max(...previousNumbers)] }
              : { requiresStepNumbers: [] },
        },
      });
      stepCount += 1;

      for (const [subIndex, subSeed] of stepSeed.subSteps.entries()) {
        const subStep = await db.subStep.create({
          data: { stepId: step.id, order: subIndex + 1, title: subSeed.title, body: subSeed.body },
        });

        await db.action.createMany({
          data: subSeed.actions.map((action, index) => ({
            subStepId: subStep.id,
            order: index + 1,
            instruction: action.instruction,
            externalUrl: action.externalUrl ?? null,
            templateRef: action.templateRef ?? null,
            example: action.example ?? null,
          })),
        });
        actionCount += subSeed.actions.length;
      }

      await db.checkpoint.createMany({
        data: stepSeed.checkpoints.map((checkpoint, index) => ({
          stepId: step.id,
          order: index + 1,
          label: checkpoint.label,
          isRequired: checkpoint.isRequired ?? true,
        })),
      });

      if (stepSeed.resources?.length) {
        await db.resource.createMany({
          data: stepSeed.resources.map((resource) => ({
            stepId: step.id,
            type: resource.type,
            title: resource.title,
            url: resource.url ?? null,
            body: resource.body ?? null,
          })),
        });
      }
    }
  }

  return { name: seed.name, phases: seed.phases.length, steps: stepCount, actions: actionCount, skipped: false };
}
