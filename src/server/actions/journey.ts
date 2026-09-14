'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { StepStatus, type Prisma } from '@prisma/client';
import { db } from '@/server/db';
import { requireUser } from '@/server/auth';
import { refreshJourneyState } from '@/server/journey';
import { detectAdjustments, type AdaptationSignal } from '@/lib/journey/adaptation';
import { milestoneSchema, outreachSchema } from '@/lib/validation/onboarding';
import { canSharePublicly } from '@/lib/guardrails';
import { slugify } from '@/lib/utils';

async function stepProgressFor(userId: string, stepId: string) {
  const progress = await db.stepProgress.findFirst({
    where: { stepId, userJourney: { userId } },
    include: { userJourney: true, checkpoints: true },
  });
  if (!progress) throw new Error('Étape introuvable pour cet utilisateur');
  return progress;
}

/** Démarrer une étape : c'est l'action du bouton « Commencer » de l'écran Aujourd'hui. */
export async function startStep(formData: FormData): Promise<void> {
  const user = await requireUser();
  const stepId = String(formData.get('stepId') ?? '');
  const progress = await stepProgressFor(user.id, stepId);

  if (progress.status === StepStatus.available) {
    await db.stepProgress.update({
      where: { id: progress.id },
      data: { status: StepStatus.in_progress, startedAt: progress.startedAt ?? new Date(), lastActivityAt: new Date() },
    });
  }

  revalidatePath('/app');
  redirect(`/app/etape/${stepId}`);
}

/** Cocher ou décocher un critère de validation. */
export async function toggleCheckpoint(formData: FormData): Promise<void> {
  const user = await requireUser();
  const checkpointId = String(formData.get('checkpointId') ?? '');
  const stepId = String(formData.get('stepId') ?? '');

  const progress = await stepProgressFor(user.id, stepId);
  const existing = progress.checkpoints.find((c) => c.checkpointId === checkpointId);

  if (existing) {
    await db.checkpointProgress.delete({ where: { id: existing.id } });
  } else {
    await db.checkpointProgress.create({
      data: { stepProgressId: progress.id, checkpointId },
    });
  }

  await db.stepProgress.update({
    where: { id: progress.id },
    data: {
      lastActivityAt: new Date(),
      status: progress.status === StepStatus.available ? StepStatus.in_progress : progress.status,
      startedAt: progress.startedAt ?? new Date(),
    },
  });

  await refreshJourneyState(progress.userJourneyId);
  revalidatePath(`/app/etape/${stepId}`);
  revalidatePath('/app');
  revalidatePath('/app/chemin');
}

/**
 * « J'ai terminé » : actif seulement quand tous les critères obligatoires sont
 * cochés (section 8.6). La vérification est refaite côté serveur — le bouton
 * désactivé n'est pas une sécurité.
 */
export async function completeStep(formData: FormData): Promise<void> {
  const user = await requireUser();
  const stepId = String(formData.get('stepId') ?? '');

  const step = await db.step.findUniqueOrThrow({
    where: { id: stepId },
    include: { checkpoints: true },
  });
  const progress = await stepProgressFor(user.id, stepId);

  const requiredIds = step.checkpoints.filter((c) => c.isRequired).map((c) => c.id);
  const checkedIds = new Set(progress.checkpoints.map((c) => c.checkpointId));
  const allChecked = requiredIds.every((id) => checkedIds.has(id));

  if (!allChecked) {
    redirect(`/app/etape/${stepId}?erreur=criteres`);
  }

  await db.stepProgress.update({
    where: { id: progress.id },
    data: { status: StepStatus.done, completedAt: new Date(), lastActivityAt: new Date() },
  });

  await refreshJourneyState(progress.userJourneyId);

  revalidatePath('/app');
  revalidatePath('/app/chemin');
  redirect(`/app/etape/${stepId}?franchie=1`);
}

/**
 * Signaux de prospection (étape 13 du parcours UGC). C'est la donnée qui
 * alimente la règle d'adaptation « taux de réponse anormalement bas ».
 */
export async function recordOutreach(formData: FormData): Promise<void> {
  const user = await requireUser();
  const parsed = outreachSchema.safeParse({
    stepId: String(formData.get('stepId') ?? ''),
    sent: Number(formData.get('sent') ?? 0),
    replies: Number(formData.get('replies') ?? 0),
  });
  if (!parsed.success) redirect('/app');

  const progress = await stepProgressFor(user.id, parsed.data.stepId);
  await db.stepProgress.update({
    where: { id: progress.id },
    data: {
      outreachSent: parsed.data.sent,
      outreachReplies: parsed.data.replies,
      lastActivityAt: new Date(),
    },
  });

  await runAdaptationRules(progress.userJourneyId);
  revalidatePath(`/app/etape/${parsed.data.stepId}`);
  revalidatePath('/app');
}

/**
 * Applique les règles d'adaptation (section 10). Un ajustement est une
 * amélioration de l'étape en cours : il ne modifie jamais la progression.
 */
export async function runAdaptationRules(userJourneyId: string): Promise<void> {
  const userJourney = await db.userJourney.findUnique({
    where: { id: userJourneyId },
    include: {
      steps: { include: { step: { include: { checkpoints: true } }, checkpoints: true } },
    },
  });
  if (!userJourney) return;

  const signals: AdaptationSignal[] = userJourney.steps.map((progress) => ({
    stepId: progress.stepId,
    stepNumber: progress.step.number,
    stepTitle: progress.step.title,
    status: progress.status,
    startedAt: progress.startedAt,
    lastActivityAt: progress.lastActivityAt,
    outreachSent: progress.outreachSent,
    outreachReplies: progress.outreachReplies,
    checkpointsTotal: progress.step.checkpoints.length,
    checkpointsChecked: progress.checkpoints.length,
  }));

  for (const proposal of detectAdjustments(signals)) {
    await db.adjustment.upsert({
      where: {
        userJourneyId_stepId_reason: {
          userJourneyId,
          stepId: proposal.stepId,
          reason: proposal.reason,
        },
      },
      update: { suggestion: proposal.suggestion },
      create: {
        userJourneyId,
        stepId: proposal.stepId,
        reason: proposal.reason,
        suggestion: proposal.suggestion,
      },
    });
  }
}

export async function acceptAdjustment(formData: FormData): Promise<void> {
  const user = await requireUser();
  const adjustmentId = String(formData.get('adjustmentId') ?? '');
  await db.adjustment.updateMany({
    where: { id: adjustmentId, userJourney: { userId: user.id } },
    data: { acceptedAt: new Date() },
  });
  revalidatePath('/app');
}

export async function dismissAdjustment(formData: FormData): Promise<void> {
  const user = await requireUser();
  const adjustmentId = String(formData.get('adjustmentId') ?? '');
  await db.adjustment.updateMany({
    where: { id: adjustmentId, userJourney: { userId: user.id } },
    data: { dismissedAt: new Date() },
  });
  revalidatePath('/app');
}

/** Jalon franchi : déclaré par l'utilisateur, jamais vérifié (garde-fou n° 3). */
export async function recordMilestone(formData: FormData): Promise<void> {
  const user = await requireUser();
  const rawValue = String(formData.get('declaredValue') ?? '').trim();
  const parsed = milestoneSchema.safeParse({
    key: String(formData.get('key') ?? ''),
    declaredValue: rawValue.length > 0 ? Number(rawValue) : undefined,
  });
  if (!parsed.success) redirect('/app/jalons?erreur=valeur');

  const milestone = await db.milestone.findUnique({ where: { key: parsed.data.key } });
  if (!milestone) redirect('/app/jalons');

  await db.userMilestone.upsert({
    where: { userId_milestoneId: { userId: user.id, milestoneId: milestone.id } },
    update: { declaredValue: parsed.data.declaredValue ?? null },
    create: {
      userId: user.id,
      milestoneId: milestone.id,
      declaredValue: parsed.data.declaredValue ?? null,
      // `verificationStatus` reste `declared` : aucune source de paiement
      // n'est connectée, donc `verified` est structurellement inatteignable.
    },
  });

  revalidatePath('/app/jalons');
  redirect(`/app/jalons?franchi=${milestone.key}`);
}

/** Publier son aventure. Bloqué avant 18 ans (garde-fou n° 5). */
export async function toggleAdventureVisibility(formData: FormData): Promise<void> {
  const user = await requireUser();
  const profile = await db.profile.findUnique({ where: { userId: user.id } });

  if (!canSharePublicly(profile?.age)) {
    redirect('/app/compte?erreur=partage-mineur');
  }

  const wantsPublic = String(formData.get('isPublic') ?? '') === 'true';
  const story = String(formData.get('story') ?? '').slice(0, 5000);
  const base = user.name ?? user.email?.split('@')[0] ?? 'aventure';

  const existing = await db.adventure.findUnique({ where: { userId: user.id } });
  if (existing) {
    await db.adventure.update({
      where: { userId: user.id },
      data: { isPublic: wantsPublic, story: story.length > 0 ? story : existing.story },
    });
  } else {
    await db.adventure.create({
      data: {
        userId: user.id,
        slug: `${slugify(base)}-${Math.random().toString(36).slice(2, 7)}`,
        isPublic: wantsPublic,
        story: story.length > 0 ? story : null,
      } satisfies Prisma.AdventureUncheckedCreateInput,
    });
  }

  revalidatePath('/app/compte');
  revalidatePath('/aventures');
}
