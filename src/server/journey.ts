import 'server-only';
import type { StepStatus, TechPath } from '@prisma/client';
import { db } from '@/server/db';

/**
 * Instance de parcours et progression (sections 9 et 2.3).
 *
 * Deux règles tiennent tout le reste :
 *   - la progression ne recule jamais ;
 *   - une étape propre à un chemin technique n'existe pas pour l'autre, mais
 *     sa ligne de progression est créée quand même, pour qu'un changement de
 *     chemin n'efface rien.
 */

export async function parcoursActif() {
  return db.journey.findFirst({ where: { isActive: true }, orderBy: { version: 'desc' } });
}

/** Démarre le parcours d'un utilisateur sur l'idée qu'il vient de choisir. */
export async function demarrerParcours(userId: string, ideaId: string) {
  const journey = await parcoursActif();
  if (!journey) throw new Error('Aucun parcours actif en base.');

  const existant = await db.userJourney.findUnique({
    where: { userId_journeyId: { userId, journeyId: journey.id } },
  });
  if (existant) {
    // Changer d'idée ne réinitialise pas la progression : les premières phases
    // valent pour n'importe quelle idée.
    if (existant.ideaId !== ideaId) {
      await db.userJourney.update({ where: { id: existant.id }, data: { ideaId } });
    }
    return existant;
  }

  const steps = await db.step.findMany({
    where: { phase: { journeyId: journey.id } },
    orderBy: { number: 'asc' },
    select: { id: true, number: true, techPath: true },
  });

  const profile = await db.profile.findUnique({ where: { userId }, select: { technicalLevel: true } });
  // Section 9.2 : le chemin navigateur par défaut en dessous du niveau 2.
  const techPath: TechPath = (profile?.technicalLevel ?? 0) >= 2 ? 'ordinateur' : 'navigateur';

  const applicables = steps.filter((s) => s.techPath === null || s.techPath === techPath);
  const premier = applicables[0];

  const userJourney = await db.userJourney.create({
    data: {
      userId,
      journeyId: journey.id,
      ideaId,
      techPath,
      currentStepId: premier?.id ?? null,
      steps: {
        create: steps.map((step) => ({
          stepId: step.id,
          status: (step.id === premier?.id ? 'available' : 'locked') as StepStatus,
        })),
      },
      projectState: { create: {} },
    },
  });

  await db.userMilestone.upsert({
    where: {
      userId_milestoneId: {
        userId,
        milestoneId: (await db.milestone.findUniqueOrThrow({ where: { key: 'idee-choisie' } })).id,
      },
    },
    create: {
      userId,
      milestoneId: (await db.milestone.findUniqueOrThrow({ where: { key: 'idee-choisie' } })).id,
    },
    update: {},
  });

  return userJourney;
}

export async function parcoursDe(userId: string) {
  return db.userJourney.findFirst({
    where: { userId },
    orderBy: { startedAt: 'desc' },
    include: {
      idea: true,
      projectState: true,
      journey: {
        include: {
          phases: {
            orderBy: { order: 'asc' },
            include: { steps: { orderBy: { order: 'asc' } } },
          },
        },
      },
      steps: true,
    },
  });
}

export type ParcoursComplet = NonNullable<Awaited<ReturnType<typeof parcoursDe>>>;

/** Les étapes du chemin technique retenu, dans l'ordre. */
export function etapesApplicables(parcours: ParcoursComplet) {
  return parcours.journey.phases
    .flatMap((phase) => phase.steps.map((step) => ({ ...step, phase })))
    .filter((step) => step.techPath === null || step.techPath === parcours.techPath)
    .sort((a, b) => a.number - b.number);
}

export function progressionDe(parcours: ParcoursComplet): number {
  const applicables = etapesApplicables(parcours);
  if (applicables.length === 0) return 0;
  const parId = new Map(parcours.steps.map((s) => [s.stepId, s.status]));
  const faites = applicables.filter((s) => parId.get(s.id) === 'done').length;
  return Math.round((faites / applicables.length) * 100);
}

/**
 * Recalcule les déverrouillages après une validation. Une étape devient
 * disponible dès que celle qui la précède est faite — et une étape déjà
 * disponible ne se referme jamais.
 */
export async function recalculerDeverrouillage(userJourneyId: string): Promise<void> {
  const parcours = await db.userJourney.findUniqueOrThrow({
    where: { id: userJourneyId },
    include: {
      idea: true,
      projectState: true,
      journey: { include: { phases: { orderBy: { order: 'asc' }, include: { steps: { orderBy: { order: 'asc' } } } } } },
      steps: true,
    },
  });

  const applicables = etapesApplicables(parcours);
  const parId = new Map(parcours.steps.map((s) => [s.stepId, s]));

  let precedenteFaite = true;
  let courante: string | null = null;

  for (const step of applicables) {
    const progres = parId.get(step.id);
    if (!progres) continue;

    if (progres.status === 'done') {
      precedenteFaite = true;
      continue;
    }

    if (precedenteFaite) {
      if (progres.status === 'locked') {
        await db.stepProgress.update({ where: { id: progres.id }, data: { status: 'available' } });
      }
      courante ??= step.id;
      precedenteFaite = false;
    }
  }

  const percent = progressionDe(parcours);
  await db.userJourney.update({
    where: { id: userJourneyId },
    data: {
      currentStepId: courante,
      // Ne recule jamais (section 2.3).
      progressPercent: Math.max(parcours.progressPercent, percent),
      completedAt: percent >= 100 ? (parcours.completedAt ?? new Date()) : parcours.completedAt,
    },
  });
}

/** Numéro de phase d'une étape, pour le gating de l'offre gratuite. */
export function phaseDeLEtape(parcours: ParcoursComplet, stepId: string): number {
  for (const phase of parcours.journey.phases) {
    if (phase.steps.some((s) => s.id === stepId)) return phase.order;
  }
  return 1;
}
