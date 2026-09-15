'use server';

import { redirect } from 'next/navigation';
import { db } from '@/server/db';
import { requireUser, signOut } from '@/server/auth';

/**
 * Export et suppression (garde-fou n° 5). Ces deux fonctions ne sont pas
 * optionnelles : le règlement européen les impose, et la suppression doit
 * effacer réellement, pas masquer.
 */
export async function exporterDonnees(userId: string) {
  const [user, profile, idees, parcours, scripts, packs] = await Promise.all([
    db.user.findUniqueOrThrow({
      where: { id: userId },
      select: {
        email: true,
        name: true,
        createdAt: true,
        consentAcceptedAt: true,
        consentVersion: true,
        dataRetentionMonths: true,
      },
    }),
    db.profile.findUnique({
      where: { userId },
      include: {
        skills: { include: { skill: true } },
        domains: { include: { domain: true } },
        interests: { include: { interest: true } },
        frictions: true,
      },
    }),
    db.idea.findMany({ where: { userId }, include: { sources: true } }),
    db.userJourney.findMany({
      where: { userId },
      include: { steps: { include: { checkpoints: true } }, projectState: true },
    }),
    db.videoScript.findMany({ where: { userId } }),
    db.promptPack.findMany({ where: { userId }, include: { prompts: true } }),
  ]);

  return {
    exporteLe: new Date().toISOString(),
    compte: user,
    profil: profile,
    idees,
    parcours,
    scriptsVideo: scripts,
    packsDePrompts: packs,
  };
}

export async function supprimerCompte(formData: FormData): Promise<void> {
  const user = await requireUser();
  if (String(formData.get('confirmation') ?? '').trim().toUpperCase() !== 'SUPPRIMER') {
    redirect('/app/compte?confirmation=manquante');
  }

  // Les suppressions en cascade du schéma emportent profil, idées, parcours,
  // prompts, scripts et abonnement.
  await db.user.delete({ where: { id: user.id } });
  await signOut({ redirectTo: '/' });
}
