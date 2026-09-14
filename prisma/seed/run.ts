import { randomUUID } from 'node:crypto';
import type { BudgetTier, ExperienceTier, Prisma, PrismaClient } from '@prisma/client';
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

type Tx = Prisma.TransactionClient;

/** Identifiant arbitraire, partagé par toutes les initialisations. */
const SEED_LOCK_ID = 8_142_026;

/**
 * Seed idempotent : relançable sans dupliquer.
 *
 * Deux propriétés sont indispensables ici, parce que cette fonction tourne
 * aussi dans une fonction serverless, où un appel peut être relancé pendant
 * qu'un autre est encore en cours :
 *
 * 1. **Atomique et sérialisée.** Tout passe dans une seule transaction, ouverte
 *    par un verrou consultatif Postgres. Deux initialisations simultanées
 *    s'attendent au lieu de s'écraser — sans ça, l'une supprime les lignes que
 *    l'autre vient d'insérer et la contrainte d'unicité saute.
 * 2. **Peu d'allers-retours.** Les identifiants sont générés ici, ce qui permet
 *    d'insérer chaque niveau du parcours en une seule requête au lieu d'une par
 *    ligne. Un parcours de 22 étapes passe de plusieurs centaines de requêtes à
 *    une dizaine : c'est ce qui le fait tenir dans la durée d'une fonction.
 */
export async function runSeed(db: PrismaClient): Promise<SeedSummary> {
  return db.$transaction(
    async (tx) => {
      // Le verrou est lié à la transaction : il est relâché à la fin, même en
      // cas d'erreur, et fonctionne à travers un pooler de connexions.
      await tx.$executeRaw`SELECT pg_advisory_xact_lock(${SEED_LOCK_ID})`;

      await seedReferential(tx);
      await seedBusinessModels(tx);

      const journeys: SeedSummary['journeys'] = [];
      journeys.push(await seedJourney(tx, 'agence-ugc', ugcJourney));
      journeys.push(await seedJourney(tx, 'agence-ugc', ugcJourneyLowBudget));
      for (const [slug, seed] of Object.entries(STARTER_JOURNEYS)) {
        journeys.push(await seedJourney(tx, slug, seed));
      }

      const withoutJourney = await tx.businessModel.findMany({
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
    },
    // Généreux : la transaction attend le verrou si une autre initialisation
    // est déjà en cours.
    { timeout: 120_000, maxWait: 60_000 },
  );
}

async function seedReferential(tx: Tx): Promise<void> {
  for (const skill of SKILLS) {
    await tx.skill.upsert({ where: { slug: skill.slug }, update: skill, create: skill });
  }
  for (const interest of INTERESTS) {
    await tx.interest.upsert({ where: { slug: interest.slug }, update: interest, create: interest });
  }
  for (const milestone of MILESTONES) {
    await tx.milestone.upsert({ where: { key: milestone.key }, update: milestone, create: milestone });
  }
  for (const flag of FEATURE_FLAGS) {
    await tx.featureFlag.upsert({ where: { key: flag.key }, update: flag, create: flag });
  }
}

async function seedBusinessModels(tx: Tx): Promise<void> {
  for (const seed of BUSINESS_MODELS) {
    const { tags, ...business } = seed;
    const defaults = {
      requiresFace: business.requiresFace ?? false,
      requiresContent: business.requiresContent ?? false,
      requiresSelling: business.requiresSelling ?? false,
      requiresLocalPresence: business.requiresLocalPresence ?? false,
    };
    const record = await tx.businessModel.upsert({
      where: { slug: business.slug },
      update: { ...business, ...defaults },
      create: { ...business, ...defaults },
    });

    await tx.businessTag.deleteMany({ where: { businessModelId: record.id } });
    await tx.businessTag.createMany({
      data: tags.map((tag) => ({ ...tag, businessModelId: record.id })),
      // Ceinture et bretelles : même si deux exécutions se croisaient malgré le
      // verrou, on ne veut pas d'une erreur, on veut le bon état final.
      skipDuplicates: true,
    });
  }
}

async function seedJourney(
  tx: Tx,
  businessSlug: string,
  seed: JourneySeed,
): Promise<SeedSummary['journeys'][number]> {
  const business = await tx.businessModel.findUniqueOrThrow({ where: { slug: businessSlug } });

  const existing = await tx.journey.findFirst({
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
    await tx.journey.delete({ where: { id: existing.id } });
  }

  // On compose l'arbre complet en mémoire, avec ses identifiants, pour
  // l'insérer niveau par niveau en quelques requêtes.
  const journeyId = randomUUID();
  const phases: Prisma.PhaseCreateManyInput[] = [];
  const steps: Prisma.StepCreateManyInput[] = [];
  const subSteps: Prisma.SubStepCreateManyInput[] = [];
  const actions: Prisma.ActionCreateManyInput[] = [];
  const checkpoints: Prisma.CheckpointCreateManyInput[] = [];
  const resources: Prisma.ResourceCreateManyInput[] = [];

  for (const [phaseIndex, phaseSeed] of seed.phases.entries()) {
    const phaseId = randomUUID();
    phases.push({
      id: phaseId,
      journeyId,
      order: phaseIndex + 1,
      title: phaseSeed.title,
      goal: phaseSeed.goal,
    });

    for (const [stepIndex, stepSeed] of phaseSeed.steps.entries()) {
      const stepId = randomUUID();
      const previousNumbers = phaseSeed.steps
        .slice(0, stepIndex)
        .map((s) => s.number)
        .concat(seed.phases.slice(0, phaseIndex).flatMap((p) => p.steps.map((s) => s.number)));

      steps.push({
        id: stepId,
        phaseId,
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
      });

      for (const [subIndex, subSeed] of stepSeed.subSteps.entries()) {
        const subStepId = randomUUID();
        subSteps.push({
          id: subStepId,
          stepId,
          order: subIndex + 1,
          title: subSeed.title,
          body: subSeed.body,
        });

        for (const [actionIndex, action] of subSeed.actions.entries()) {
          actions.push({
            id: randomUUID(),
            subStepId,
            order: actionIndex + 1,
            instruction: action.instruction,
            externalUrl: action.externalUrl ?? null,
            templateRef: action.templateRef ?? null,
            example: action.example ?? null,
          });
        }
      }

      for (const [checkpointIndex, checkpoint] of stepSeed.checkpoints.entries()) {
        checkpoints.push({
          id: randomUUID(),
          stepId,
          order: checkpointIndex + 1,
          label: checkpoint.label,
          isRequired: checkpoint.isRequired ?? true,
        });
      }

      for (const resource of stepSeed.resources ?? []) {
        resources.push({
          id: randomUUID(),
          stepId,
          type: resource.type,
          title: resource.title,
          url: resource.url ?? null,
          body: resource.body ?? null,
        });
      }
    }
  }

  await tx.journey.create({
    data: {
      id: journeyId,
      businessModelId: business.id,
      name: seed.name,
      budgetTier: seed.budgetTier as BudgetTier,
      experienceTier: seed.experienceTier as ExperienceTier,
      version: 1,
    },
  });

  // L'ordre compte : chaque niveau référence le précédent.
  await tx.phase.createMany({ data: phases });
  await tx.step.createMany({ data: steps });
  await tx.subStep.createMany({ data: subSteps });
  await tx.action.createMany({ data: actions });
  await tx.checkpoint.createMany({ data: checkpoints });
  if (resources.length > 0) await tx.resource.createMany({ data: resources });

  return {
    name: seed.name,
    phases: seed.phases.length,
    steps: steps.length,
    actions: actions.length,
    skipped: false,
  };
}
