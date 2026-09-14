import 'server-only';
import { StepStatus } from '@prisma/client';
import { db } from '@/server/db';
import { buildDailyPlan, type DailyTask } from '@/lib/journey/daily-plan';
import { dayNumber } from '@/lib/utils';

export interface TodayView {
  userJourneyId: string;
  businessName: string;
  day: number;
  progressPercent: number;
  phaseTitle: string;
  step: {
    id: string;
    number: number;
    title: string;
    goal: string;
    estimatedMinutes: number;
    status: StepStatus;
  };
  tasks: DailyTask[];
  estimatedMinutes: number;
  remainingAfter: number;
  adjustment: { id: string; suggestion: string } | null;
  finished: boolean;
}

/**
 * Données de l'écran « Aujourd'hui » (section 8.4). Une seule question à
 * laquelle il répond : qu'est-ce que je dois faire maintenant ?
 */
export async function loadToday(userId: string): Promise<TodayView | null> {
  const userJourney = await db.userJourney.findFirst({
    where: { userId },
    orderBy: { startedAt: 'desc' },
    include: {
      journey: { include: { businessModel: true } },
      steps: { include: { checkpoints: true } },
      adjustments: {
        where: { dismissedAt: null },
        orderBy: { createdAt: 'desc' },
        take: 1,
      },
    },
  });
  if (!userJourney) return null;

  const currentProgress =
    userJourney.steps.find((p) => p.stepId === userJourney.currentStepId) ??
    userJourney.steps.find((p) => p.status !== StepStatus.done);

  const profile = await db.profile.findUnique({ where: { userId }, select: { hoursPerDay: true } });
  const availableMinutes = Math.max(20, (profile?.hoursPerDay ?? 1) * 60);

  if (!currentProgress) {
    return {
      userJourneyId: userJourney.id,
      businessName: userJourney.journey.businessModel.name,
      day: dayNumber(userJourney.startedAt),
      progressPercent: userJourney.progressPercent,
      phaseTitle: '',
      step: { id: '', number: 0, title: '', goal: '', estimatedMinutes: 0, status: StepStatus.done },
      tasks: [],
      estimatedMinutes: 0,
      remainingAfter: 0,
      adjustment: null,
      finished: true,
    };
  }

  const step = await db.step.findUniqueOrThrow({
    where: { id: currentProgress.stepId },
    include: {
      phase: true,
      checkpoints: { orderBy: { order: 'asc' } },
      subSteps: { orderBy: { order: 'asc' }, include: { actions: { orderBy: { order: 'asc' } } } },
    },
  });

  const checked = new Set(currentProgress.checkpoints.map((c) => c.checkpointId));

  // Le plan du jour découpe l'étape par sous-étape : c'est l'unité de travail
  // que l'utilisateur reconnaît, et elle tient dans une séance.
  const candidates = step.subSteps.map((sub, index) => {
    const relatedCheckpoint = step.checkpoints[index];
    return {
      id: sub.id,
      label: sub.title,
      estimatedMinutes: Math.max(10, Math.round(step.estimatedMinutes / Math.max(1, step.subSteps.length))),
      done: relatedCheckpoint ? checked.has(relatedCheckpoint.id) : false,
    };
  });

  const plan = buildDailyPlan(candidates, availableMinutes);
  const adjustment = userJourney.adjustments[0];

  return {
    userJourneyId: userJourney.id,
    businessName: userJourney.journey.businessModel.name,
    day: dayNumber(userJourney.startedAt),
    progressPercent: userJourney.progressPercent,
    phaseTitle: step.phase.title,
    step: {
      id: step.id,
      number: step.number,
      title: step.title,
      goal: step.goal,
      estimatedMinutes: step.estimatedMinutes,
      status: currentProgress.status,
    },
    tasks: plan.tasks,
    estimatedMinutes: plan.estimatedMinutes,
    remainingAfter: plan.remainingAfter,
    adjustment: adjustment ? { id: adjustment.id, suggestion: adjustment.suggestion } : null,
    finished: false,
  };
}
