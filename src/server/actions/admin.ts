'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import type { BudgetTier, Difficulty, ExperienceTier, ResourceType } from '@prisma/client';
import { db } from '@/server/db';
import { requireUser } from '@/server/auth';
import { assertNoForbiddenClaims } from '@/lib/guardrails';

async function requireAdmin() {
  const user = await requireUser();
  if (user.role !== 'admin') throw new Error('Réservé aux administrateurs');
  return user;
}

export async function createJourney(formData: FormData): Promise<void> {
  await requireAdmin();
  const businessModelId = String(formData.get('businessModelId') ?? '');
  const name = String(formData.get('name') ?? '').trim();
  assertNoForbiddenClaims(name, 'nom du parcours');

  const budgetTier = String(formData.get('budgetTier') ?? 'zero') as BudgetTier;
  const experienceTier = String(formData.get('experienceTier') ?? 'beginner') as ExperienceTier;

  const existing = await db.journey.findFirst({
    where: { businessModelId, budgetTier, experienceTier },
    orderBy: { version: 'desc' },
  });

  const journey = await db.journey.create({
    data: {
      businessModelId,
      name,
      budgetTier,
      experienceTier,
      version: (existing?.version ?? 0) + 1,
    },
  });

  revalidatePath('/admin');
  redirect(`/admin/parcours/${journey.id}`);
}

/** Dupliquer un parcours pour en faire une variante (section 8.9). */
export async function duplicateJourney(formData: FormData): Promise<void> {
  await requireAdmin();
  const journeyId = String(formData.get('journeyId') ?? '');
  const budgetTier = String(formData.get('budgetTier') ?? 'low') as BudgetTier;
  const experienceTier = String(formData.get('experienceTier') ?? 'beginner') as ExperienceTier;

  const source = await db.journey.findUniqueOrThrow({
    where: { id: journeyId },
    include: {
      phases: {
        orderBy: { order: 'asc' },
        include: {
          steps: {
            orderBy: { order: 'asc' },
            include: {
              subSteps: { orderBy: { order: 'asc' }, include: { actions: { orderBy: { order: 'asc' } } } },
              checkpoints: { orderBy: { order: 'asc' } },
              resources: true,
            },
          },
        },
      },
    },
  });

  const existing = await db.journey.findFirst({
    where: { businessModelId: source.businessModelId, budgetTier, experienceTier },
    orderBy: { version: 'desc' },
  });

  const copy = await db.journey.create({
    data: {
      businessModelId: source.businessModelId,
      name: `${source.name} (variante)`,
      budgetTier,
      experienceTier,
      version: (existing?.version ?? 0) + 1,
      phases: {
        create: source.phases.map((phase) => ({
          order: phase.order,
          title: phase.title,
          goal: phase.goal,
          steps: {
            create: phase.steps.map((step) => ({
              order: step.order,
              number: step.number,
              title: step.title,
              goal: step.goal,
              why: step.why,
              estimatedMinutes: step.estimatedMinutes,
              difficulty: step.difficulty,
              unlockConditions: step.unlockConditions ?? undefined,
              subSteps: {
                create: step.subSteps.map((sub) => ({
                  order: sub.order,
                  title: sub.title,
                  body: sub.body,
                  actions: {
                    create: sub.actions.map((action) => ({
                      order: action.order,
                      instruction: action.instruction,
                      externalUrl: action.externalUrl,
                      templateRef: action.templateRef,
                      example: action.example,
                    })),
                  },
                })),
              },
              checkpoints: {
                create: step.checkpoints.map((c) => ({ order: c.order, label: c.label, isRequired: c.isRequired })),
              },
              resources: {
                create: step.resources.map((r) => ({ type: r.type, title: r.title, url: r.url, body: r.body })),
              },
            })),
          },
        })),
      },
    },
  });

  revalidatePath('/admin');
  redirect(`/admin/parcours/${copy.id}`);
}

export async function createPhase(formData: FormData): Promise<void> {
  await requireAdmin();
  const journeyId = String(formData.get('journeyId') ?? '');
  const title = String(formData.get('title') ?? '').trim();
  const goal = String(formData.get('goal') ?? '').trim();
  assertNoForbiddenClaims(`${title} ${goal}`, 'phase');

  const last = await db.phase.findFirst({ where: { journeyId }, orderBy: { order: 'desc' } });
  await db.phase.create({
    data: { journeyId, order: (last?.order ?? 0) + 1, title, goal },
  });

  revalidatePath(`/admin/parcours/${journeyId}`);
}

export async function createStep(formData: FormData): Promise<void> {
  await requireAdmin();
  const phaseId = String(formData.get('phaseId') ?? '');
  const title = String(formData.get('title') ?? '').trim();
  const goal = String(formData.get('goal') ?? '').trim();
  const why = String(formData.get('why') ?? '').trim();
  assertNoForbiddenClaims(`${title} ${goal} ${why}`, 'étape');

  const phase = await db.phase.findUniqueOrThrow({ where: { id: phaseId } });
  const lastInPhase = await db.step.findFirst({ where: { phaseId }, orderBy: { order: 'desc' } });
  const lastInJourney = await db.step.findFirst({
    where: { phase: { journeyId: phase.journeyId } },
    orderBy: { number: 'desc' },
  });

  const previousNumber = lastInJourney?.number;

  const step = await db.step.create({
    data: {
      phaseId,
      order: (lastInPhase?.order ?? 0) + 1,
      number: (previousNumber ?? 0) + 1,
      title,
      goal,
      why,
      estimatedMinutes: Number(formData.get('estimatedMinutes') ?? 30) || 30,
      difficulty: (String(formData.get('difficulty') ?? 'easy') as Difficulty),
      unlockConditions: previousNumber ? { requiresStepNumbers: [previousNumber] } : { requiresStepNumbers: [] },
    },
  });

  revalidatePath(`/admin/parcours/${phase.journeyId}`);
  redirect(`/admin/etape/${step.id}`);
}

export async function updateStep(formData: FormData): Promise<void> {
  await requireAdmin();
  const stepId = String(formData.get('stepId') ?? '');
  const title = String(formData.get('title') ?? '').trim();
  const goal = String(formData.get('goal') ?? '').trim();
  const why = String(formData.get('why') ?? '').trim();
  assertNoForbiddenClaims(`${title} ${goal} ${why}`, 'étape');

  await db.step.update({
    where: { id: stepId },
    data: {
      title,
      goal,
      why,
      estimatedMinutes: Number(formData.get('estimatedMinutes') ?? 30) || 30,
      difficulty: (String(formData.get('difficulty') ?? 'easy') as Difficulty),
    },
  });

  revalidatePath(`/admin/etape/${stepId}`);
}

export async function createSubStep(formData: FormData): Promise<void> {
  await requireAdmin();
  const stepId = String(formData.get('stepId') ?? '');
  const title = String(formData.get('title') ?? '').trim();
  const body = String(formData.get('body') ?? '');
  assertNoForbiddenClaims(`${title} ${body}`, 'sous-étape');

  const last = await db.subStep.findFirst({ where: { stepId }, orderBy: { order: 'desc' } });
  await db.subStep.create({ data: { stepId, order: (last?.order ?? 0) + 1, title, body } });

  revalidatePath(`/admin/etape/${stepId}`);
}

export async function createAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const subStepId = String(formData.get('subStepId') ?? '');
  const stepId = String(formData.get('stepId') ?? '');
  const instruction = String(formData.get('instruction') ?? '').trim();
  assertNoForbiddenClaims(instruction, 'action');

  const last = await db.action.findFirst({ where: { subStepId }, orderBy: { order: 'desc' } });
  await db.action.create({
    data: {
      subStepId,
      order: (last?.order ?? 0) + 1,
      instruction,
      example: String(formData.get('example') ?? '').trim() || null,
      externalUrl: String(formData.get('externalUrl') ?? '').trim() || null,
      templateRef: String(formData.get('templateRef') ?? '').trim() || null,
    },
  });

  revalidatePath(`/admin/etape/${stepId}`);
}

export async function createCheckpoint(formData: FormData): Promise<void> {
  await requireAdmin();
  const stepId = String(formData.get('stepId') ?? '');
  const label = String(formData.get('label') ?? '').trim();
  assertNoForbiddenClaims(label, 'critère de validation');

  const last = await db.checkpoint.findFirst({ where: { stepId }, orderBy: { order: 'desc' } });
  await db.checkpoint.create({
    data: {
      stepId,
      order: (last?.order ?? 0) + 1,
      label,
      isRequired: formData.get('isRequired') === 'on',
    },
  });

  revalidatePath(`/admin/etape/${stepId}`);
}

export async function createResource(formData: FormData): Promise<void> {
  await requireAdmin();
  const stepId = String(formData.get('stepId') ?? '');
  const title = String(formData.get('title') ?? '').trim();
  const body = String(formData.get('body') ?? '');
  assertNoForbiddenClaims(`${title} ${body}`, 'ressource');

  await db.resource.create({
    data: {
      stepId,
      type: (String(formData.get('type') ?? 'template') as ResourceType),
      title,
      body: body.trim() || null,
      url: String(formData.get('url') ?? '').trim() || null,
    },
  });

  revalidatePath(`/admin/etape/${stepId}`);
}

/** Réordonner : le glisser-déposer du client envoie la liste ordonnée d'identifiants. */
export async function reorderSteps(formData: FormData): Promise<void> {
  await requireAdmin();
  const journeyId = String(formData.get('journeyId') ?? '');
  const ids = String(formData.get('order') ?? '')
    .split(',')
    .map((id) => id.trim())
    .filter(Boolean);

  await db.$transaction(
    ids.map((id, index) =>
      db.step.update({ where: { id }, data: { order: index + 1, number: index + 1 } }),
    ),
  );

  revalidatePath(`/admin/parcours/${journeyId}`);
}

export async function toggleJourneyActive(formData: FormData): Promise<void> {
  await requireAdmin();
  const journeyId = String(formData.get('journeyId') ?? '');
  const journey = await db.journey.findUniqueOrThrow({ where: { id: journeyId } });
  await db.journey.update({ where: { id: journeyId }, data: { isActive: !journey.isActive } });
  revalidatePath('/admin');
}
