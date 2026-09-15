'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import type { TechPath } from '@prisma/client';
import { db } from '@/server/db';
import { requireUser } from '@/server/auth';
import { parcoursDe, recalculerDeverrouillage, phaseDeLEtape } from '@/server/journey';
import { can, FEATURES, FREE_PHASE_LIMIT } from '@/server/features';

async function progres(stepId: string) {
  const user = await requireUser();
  const parcours = await parcoursDe(user.id);
  if (!parcours) redirect('/mes-idees');

  // Gating serveur : masquer un bouton n'est pas une sécurité.
  const phase = phaseDeLEtape(parcours, stepId);
  if (phase > FREE_PHASE_LIMIT && !(await can(user.id, FEATURES.journeyFull))) {
    redirect('/offres');
  }

  const ligne = await db.stepProgress.findUnique({
    where: { userJourneyId_stepId: { userJourneyId: parcours.id, stepId } },
  });
  if (!ligne) redirect('/app/chemin');
  return { user, parcours, ligne };
}

/** Coche ou décoche un critère. Le décochage est permis : c'est une correction. */
export async function basculerCritere(formData: FormData): Promise<void> {
  const stepId = String(formData.get('stepId') ?? '');
  const checkpointId = String(formData.get('checkpointId') ?? '');
  const preuve = String(formData.get('proof') ?? '').trim();

  const { ligne } = await progres(stepId);

  const existant = await db.checkpointProgress.findUnique({
    where: { stepProgressId_checkpointId: { stepProgressId: ligne.id, checkpointId } },
  });

  if (existant) {
    await db.checkpointProgress.delete({ where: { id: existant.id } });
  } else {
    const critere = await db.checkpoint.findUniqueOrThrow({ where: { id: checkpointId } });
    if (critere.proofKind !== 'none' && preuve.length === 0) {
      revalidatePath(`/app/etape/${stepId}`);
      return;
    }
    await db.checkpointProgress.create({
      data: { stepProgressId: ligne.id, checkpointId, proofValue: preuve || null },
    });

    // Une preuve alimente l'état du projet : c'est elle qui rend cohérents les
    // prompts générés ensuite.
    if (critere.proofField && preuve) {
      await db.projectState.upsert({
        where: { userJourneyId: ligne.userJourneyId },
        create: { userJourneyId: ligne.userJourneyId, [critere.proofField]: preuve },
        update: { [critere.proofField]: preuve },
      });
    }
  }

  if (ligne.status === 'available') {
    await db.stepProgress.update({
      where: { id: ligne.id },
      data: { status: 'in_progress', startedAt: ligne.startedAt ?? new Date(), lastActivityAt: new Date() },
    });
  }

  revalidatePath(`/app/etape/${stepId}`);
}

/** Valide une étape. Le bouton ne s'active que si tous les critères obligatoires sont cochés. */
export async function terminerEtape(formData: FormData): Promise<void> {
  const stepId = String(formData.get('stepId') ?? '');
  const { parcours, ligne } = await progres(stepId);

  const [obligatoires, coches] = await Promise.all([
    db.checkpoint.findMany({ where: { stepId, isRequired: true }, select: { id: true } }),
    db.checkpointProgress.findMany({ where: { stepProgressId: ligne.id }, select: { checkpointId: true } }),
  ]);

  const faits = new Set(coches.map((c) => c.checkpointId));
  if (obligatoires.some((c) => !faits.has(c.id))) {
    revalidatePath(`/app/etape/${stepId}`);
    return;
  }

  await db.stepProgress.update({
    where: { id: ligne.id },
    data: { status: 'done', completedAt: new Date(), lastActivityAt: new Date() },
  });
  await recalculerDeverrouillage(parcours.id);

  await accorderJalons(parcours.id);

  revalidatePath('/app');
  revalidatePath('/app/chemin');

  const suivant = await db.userJourney.findUniqueOrThrow({
    where: { id: parcours.id },
    select: { currentStepId: true },
  });
  redirect(suivant.currentStepId ? `/app/etape/${suivant.currentStepId}` : '/app/chemin');
}

/** Choix du chemin technique, au début de la phase 4 (section 9.2). */
export async function choisirChemin(formData: FormData): Promise<void> {
  const user = await requireUser();
  const techPath = String(formData.get('techPath') ?? 'navigateur') as TechPath;
  const parcours = await parcoursDe(user.id);
  if (!parcours) redirect('/mes-idees');

  await db.userJourney.update({ where: { id: parcours.id }, data: { techPath } });
  await recalculerDeverrouillage(parcours.id);
  revalidatePath('/app/chemin');
  revalidatePath('/app');
}

/**
 * Jalons : accordés quand l'étape correspondante est validée. Un montant
 * déclaré reste `declared` — `verified` n'existe que si un compte de paiement
 * est connecté en lecture (garde-fou n° 4).
 */
async function accorderJalons(userJourneyId: string): Promise<void> {
  const parcours = await db.userJourney.findUniqueOrThrow({
    where: { id: userJourneyId },
    include: {
      steps: { include: { step: { include: { phase: true } } } },
    },
  });

  const phasesFaites = new Set(
    parcours.steps.filter((s) => s.status === 'done').map((s) => s.step.phase.key),
  );

  const correspondances: [string, string][] = [
    ['en-ligne', 'site-en-ligne'],
    ['encaisser', 'paiement-branche'],
    ['premier-euro', 'premier-euro'],
  ];

  for (const [phaseKey, milestoneKey] of correspondances) {
    if (!phasesFaites.has(phaseKey)) continue;
    const toutesFaites = parcours.steps
      .filter((s) => s.step.phase.key === phaseKey)
      .every((s) => s.status === 'done');
    if (!toutesFaites) continue;

    const milestone = await db.milestone.findUnique({ where: { key: milestoneKey } });
    if (!milestone) continue;
    await db.userMilestone.upsert({
      where: { userId_milestoneId: { userId: parcours.userId, milestoneId: milestone.id } },
      create: { userId: parcours.userId, milestoneId: milestone.id },
      update: {},
    });
  }
}
