'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import type { Prisma } from '@prisma/client';
import { db } from '@/server/db';
import { requireUser } from '@/server/auth';
import { toScorableBusiness, toScoringProfile } from '@/lib/matching/adapters';
import { rankBusinesses } from '@/lib/matching/score';
import { buildRationale } from '@/lib/matching/explain';
import { DIMENSION_LABELS, type BusinessScore } from '@/lib/matching/types';
import { askAI } from '@/lib/ai/client';
import { stripForbiddenClaims } from '@/lib/guardrails';
import { instantiateJourney } from '@/server/journey';
import { rejectionSchema } from '@/lib/validation/onboarding';
import { MAX_REJECTIONS } from '@/lib/recommendation-policy';

/**
 * Calcule et enregistre les recommandations. Le classement est déterministe :
 * l'IA n'intervient qu'ensuite, pour rédiger l'explication (section 7).
 */
export async function computeRecommendations(userId: string) {
  const profile = await db.profile.findUnique({
    where: { userId },
    include: { skills: { include: { skill: true } }, interests: { include: { interest: true } } },
  });
  if (!profile) return null;

  const rejected = await db.recommendation.findMany({
    where: { userId, status: 'rejected' },
    select: { businessModelId: true },
  });

  const businesses = await db.businessModel.findMany({ where: { isActive: true }, include: { tags: true } });

  const result = rankBusinesses(
    toScoringProfile(profile),
    businesses.map(toScorableBusiness),
    { exclude: rejected.map((r) => r.businessModelId) },
  );

  if (!result.primary) return result;

  // On remplace les propositions en attente, on ne touche jamais aux acceptées
  // ni aux refusées : elles font partie de l'historique de décision.
  await db.recommendation.deleteMany({ where: { userId, status: 'proposed' } });

  for (const [index, ranked] of result.ranked.entries()) {
    const rationale = index === 0 ? await writeRationale(ranked) : buildRationale(ranked);
    await db.recommendation.create({
      data: {
        userId,
        businessModelId: ranked.businessId,
        score: ranked.score,
        rank: index + 1,
        breakdown: ranked.breakdown as unknown as Prisma.InputJsonValue,
        rationale,
      },
    });
  }

  return result;
}

/** Explication en langage naturel, rédigée à partir du breakdown, jamais inventée. */
async function writeRationale(result: BusinessScore): Promise<string> {
  const deterministic = buildRationale(result);

  const text = await askAI({
    system: [
      'Tu écris en français, à la deuxième personne du singulier, pour un produit qui accompagne la création d’entreprise.',
      'Ton : concret, ambitieux, honnête, pratique. Jamais guru, jamais culpabilisant.',
      'INTERDIT ABSOLU : promettre un revenu, un montant, une rapidité de gain, ou employer « riche », « revenus passifs », « argent facile », « liberté financière ».',
      'Tu reformules UNIQUEMENT les raisons fournies. Tu n’inventes aucun fait, aucun chiffre.',
      'Trois à quatre phrases, pas de liste, pas de titre.',
    ].join('\n'),
    prompt: [
      `Activité recommandée : ${result.name}.`,
      'Raisons calculées par le moteur, par dimension :',
      ...result.breakdown
        .filter((d) => d.weight > 0.05)
        .sort((a, b) => b.contribution - a.contribution)
        .slice(0, 5)
        .map((d) => `- ${DIMENSION_LABELS[d.dimension]} (${Math.round(d.score * 100)} %) : ${d.reason}`),
    ].join('\n'),
    maxTokens: 400,
  });

  if (!text) return deterministic;

  // Garde-fou n° 2 appliqué à la sortie de l'IA : la phrase fautive est
  // retirée, jamais réécrite en silence.
  const cleaned = stripForbiddenClaims(text);
  return cleaned.length > 40 ? cleaned : deterministic;
}

export async function acceptRecommendation(formData: FormData): Promise<void> {
  const user = await requireUser();
  const recommendationId = String(formData.get('recommendationId') ?? '');

  const recommendation = await db.recommendation.findFirst({
    where: { id: recommendationId, userId: user.id },
  });
  if (!recommendation) throw new Error('Recommandation introuvable');

  await db.recommendation.update({
    where: { id: recommendation.id },
    data: { status: 'accepted' },
  });

  const userJourney = await instantiateJourney(user.id, recommendation.businessModelId);
  if (!userJourney) {
    // Aucun parcours publié pour ce business : on ne laisse pas l'utilisateur
    // dans le vide, on le renvoie vers la recommandation avec le cas signalé.
    await db.recommendation.update({ where: { id: recommendation.id }, data: { status: 'proposed' } });
    redirect('/recommandation?erreur=parcours-indisponible');
  }

  revalidatePath('/app');
  redirect('/app');
}

export async function rejectRecommendation(formData: FormData): Promise<void> {
  const user = await requireUser();
  const parsed = rejectionSchema.safeParse({
    recommendationId: String(formData.get('recommendationId') ?? ''),
    reason: String(formData.get('reason') ?? ''),
  });

  if (!parsed.success) {
    redirect('/recommandation?erreur=raison-requise');
  }

  await db.recommendation.updateMany({
    where: { id: parsed.data.recommendationId, userId: user.id },
    data: { status: 'rejected', rejectionReason: parsed.data.reason },
  });

  const rejections = await db.recommendation.count({ where: { userId: user.id, status: 'rejected' } });
  if (rejections >= MAX_REJECTIONS) {
    // On arrête de proposer des alternatives à l'infini : on repose les
    // questions qui pèsent le plus dans le score (section 7).
    redirect('/recommandation?revoir=1');
  }

  await computeRecommendations(user.id);
  revalidatePath('/recommandation');
  redirect('/recommandation');
}

/** Choisir explicitement une alternative affichée. */
export async function chooseAlternative(formData: FormData): Promise<void> {
  await acceptRecommendation(formData);
}
