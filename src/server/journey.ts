import { StepStatus, type Prisma } from '@prisma/client';
import { db } from '@/server/db';
import { budgetTierFor, experienceTierFor, fallbackOrder } from '@/lib/journey/instantiate';
import { computeProgressPercent } from '@/lib/journey/progress';
import { isUnlocked, parseUnlockConditions } from '@/lib/journey/unlock';

/**
 * Crée l'instance de parcours d'un utilisateur : un `StepProgress` par étape,
 * la première disponible, les autres verrouillées mais visibles (section 8.5).
 */
export async function instantiateJourney(userId: string, businessModelId: string) {
  const profile = await db.profile.findUnique({
    where: { userId },
    include: { skills: true },
  });

  const budgetTier = budgetTierFor(profile?.initialBudget ?? 0);
  const experienceTier = experienceTierFor(profile?.skills.map((s) => s.level) ?? []);

  const journeys = await db.journey.findMany({
    where: { businessModelId, isActive: true },
    include: { phases: { include: { steps: { orderBy: { order: 'asc' } } }, orderBy: { order: 'asc' } } },
    orderBy: { version: 'desc' },
  });

  if (journeys.length === 0) return null;

  const journey =
    fallbackOrder(budgetTier, experienceTier)
      .map((combo) => journeys.find((j) => j.budgetTier === combo.budgetTier && j.experienceTier === combo.experienceTier))
      .find(Boolean) ?? journeys[0]!;

  const steps = journey.phases.flatMap((phase) => phase.steps);
  if (steps.length === 0) return null;

  const existing = await db.userJourney.findUnique({
    where: { userId_journeyId: { userId, journeyId: journey.id } },
  });
  if (existing) return existing;

  const firstStep = steps.reduce((min, step) => (step.number < min.number ? step : min), steps[0]!);

  return db.userJourney.create({
    data: {
      userId,
      journeyId: journey.id,
      currentStepId: firstStep.id,
      progressPercent: 0,
      steps: {
        create: steps.map((step) => ({
          stepId: step.id,
          status: step.id === firstStep.id ? StepStatus.available : StepStatus.locked,
        })),
      },
    },
  });
}

export type UserJourneyWithContent = Prisma.UserJourneyGetPayload<{
  include: {
    journey: {
      include: {
        businessModel: true;
        phases: { include: { steps: { include: { checkpoints: true } } } };
      };
    };
    steps: { include: { checkpoints: true } };
  };
}>;

export async function loadUserJourney(userId: string): Promise<UserJourneyWithContent | null> {
  return db.userJourney.findFirst({
    where: { userId },
    orderBy: { startedAt: 'desc' },
    include: {
      journey: {
        include: {
          businessModel: true,
          phases: {
            orderBy: { order: 'asc' },
            include: { steps: { orderBy: { order: 'asc' }, include: { checkpoints: { orderBy: { order: 'asc' } } } } },
          },
        },
      },
      steps: { include: { checkpoints: true } },
    },
  });
}

/**
 * Recalcule les statuts de toutes les étapes et la progression globale.
 * Appelée après chaque validation. C'est le seul endroit qui écrit
 * `progressPercent` : la barre ne peut pas reculer ailleurs.
 */
export async function refreshJourneyState(userJourneyId: string): Promise<void> {
  const userJourney = await db.userJourney.findUnique({
    where: { id: userJourneyId },
    include: {
      journey: {
        include: {
          phases: {
            orderBy: { order: 'asc' },
            include: { steps: { orderBy: { order: 'asc' }, include: { checkpoints: true } } },
          },
        },
      },
      steps: { include: { checkpoints: true } },
    },
  });
  if (!userJourney) return;

  const steps = userJourney.journey.phases.flatMap((phase) => phase.steps);
  const progressByStepId = new Map(userJourney.steps.map((p) => [p.stepId, p]));

  const completedNumbers = steps
    .filter((step) => progressByStepId.get(step.id)?.status === StepStatus.done)
    .map((step) => step.number);
  const checkedCheckpointIds = userJourney.steps.flatMap((p) => p.checkpoints.map((c) => c.checkpointId));

  const updates: Prisma.PrismaPromise<unknown>[] = [];
  for (const step of steps) {
    const progress = progressByStepId.get(step.id);
    if (!progress || progress.status === StepStatus.done || progress.status === StepStatus.in_progress) continue;

    const unlocked = isUnlocked({
      stepNumber: step.number,
      conditions: parseUnlockConditions(step.unlockConditions),
      completedStepNumbers: completedNumbers,
      checkedCheckpointIds,
    });
    const target = unlocked ? StepStatus.available : StepStatus.locked;
    if (progress.status !== target) {
      updates.push(db.stepProgress.update({ where: { id: progress.id }, data: { status: target } }));
    }
  }

  // Étape courante : la première non terminée dans l'ordre du parcours.
  const ordered = [...steps].sort((a, b) => a.number - b.number);
  const current = ordered.find((step) => progressByStepId.get(step.id)?.status !== StepStatus.done);

  const currentProgress = current ? progressByStepId.get(current.id) : undefined;
  const currentRequired = current?.checkpoints.filter((c) => c.isRequired).length ?? 0;
  const currentChecked = currentProgress
    ? currentProgress.checkpoints.filter((cp) =>
        current?.checkpoints.some((c) => c.id === cp.checkpointId && c.isRequired),
      ).length
    : 0;

  const progressPercent = computeProgressPercent({
    totalSteps: steps.length,
    completedSteps: completedNumbers.length,
    currentStepCheckedRatio: currentRequired > 0 ? currentChecked / currentRequired : 0,
    previousPercent: userJourney.progressPercent,
  });

  updates.push(
    db.userJourney.update({
      where: { id: userJourney.id },
      data: {
        currentStepId: current?.id ?? userJourney.currentStepId,
        progressPercent,
        completedAt: completedNumbers.length === steps.length ? (userJourney.completedAt ?? new Date()) : null,
      },
    }),
  );

  await db.$transaction(updates);
}
