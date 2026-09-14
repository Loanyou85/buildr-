import { redirect } from 'next/navigation';
import Link from 'next/link';
import { auth } from '@/server/auth';
import { db } from '@/server/db';
import { computeRecommendations } from '@/server/actions/recommendation';
import { MAX_REJECTIONS } from '@/lib/recommendation-policy';
import { RecommendationView } from '@/components/app/recommendation-view';
import { DIMENSION_LABELS, type DimensionScore } from '@/lib/matching/types';
import { formatEuros } from '@/lib/utils';

export const dynamic = 'force-dynamic';

const DIFFICULTY_LABEL: Record<string, string> = {
  easy: 'Accessible',
  medium: 'Demande de la rigueur',
  hard: 'Exigeante',
};

/** Écran de recommandation (section 8.3) : « Ton business est prêt. » */
export default async function RecommendationPage({
  searchParams,
}: {
  searchParams: Promise<{ revoir?: string; erreur?: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect('/connexion');

  const profile = await db.profile.findUnique({ where: { userId: session.user.id } });
  if (!profile?.onboardingCompleted) redirect('/onboarding');

  const { revoir, erreur } = await searchParams;

  const existing = await db.userJourney.findFirst({ where: { userId: session.user.id } });
  if (existing && !revoir) redirect('/app');

  let recommendations = await db.recommendation.findMany({
    where: { userId: session.user.id, status: 'proposed' },
    orderBy: { rank: 'asc' },
    include: { businessModel: true },
  });

  if (recommendations.length === 0) {
    await computeRecommendations(session.user.id);
    recommendations = await db.recommendation.findMany({
      where: { userId: session.user.id, status: 'proposed' },
      orderBy: { rank: 'asc' },
      include: { businessModel: true },
    });
  }

  const rejectionCount = await db.recommendation.count({
    where: { userId: session.user.id, status: 'rejected' },
  });

  if (recommendations.length === 0) {
    return (
      <div className="mx-auto flex min-h-dvh max-w-2xl flex-col justify-center px-5 py-16">
        <h1 className="text-2xl">Aucune activité ne correspond à tes contraintes actuelles.</h1>
        <p className="prose-nexteo mt-4 text-base text-beton-600">
          Ce n’est pas un refus : c’est que les contraintes que tu as données (budget, temps disponible,
          ce que tu ne veux pas faire) écartent tout le référentiel. Reprends deux ou trois réponses et
          la proposition changera.
        </p>
        <Link
          href="/onboarding?q=6"
          className="mt-8 text-base text-acier underline-offset-4 hover:underline"
        >
          Revoir mes contraintes de temps et de budget →
        </Link>
      </div>
    );
  }

  const [primary, ...alternatives] = recommendations;
  if (!primary) redirect('/onboarding');

  const breakdown = primary.breakdown as unknown as DimensionScore[];
  const facts = [
    { label: 'Budget estimé', value: primary.businessModel.minBudget === 0 ? 'Démarrage sans budget' : `À partir de ${formatEuros(primary.businessModel.minBudget)}` },
    { label: 'Temps conseillé', value: `${primary.businessModel.hoursPerWeekMin} à ${primary.businessModel.hoursPerWeekMax} h par semaine` },
    { label: 'Difficulté', value: DIFFICULTY_LABEL[primary.businessModel.difficulty] ?? primary.businessModel.difficulty },
    { label: 'Modèle économique', value: primary.businessModel.economicModel },
    {
      label: 'Premier objectif',
      value: `Un premier client en environ ${primary.businessModel.timeToFirstClientDays} jours`,
    },
  ];

  return (
    <RecommendationView
      primary={{
        id: primary.id,
        name: primary.businessModel.name,
        summary: primary.businessModel.summary,
        rationale: primary.rationale ?? '',
        score: Math.round(primary.score),
        // On sélectionne les dimensions qui ont le plus pesé dans la décision
        // (contribution = score × poids), mais on les affiche triées par
        // score : c'est le pourcentage montré à l'écran, il doit décroître.
        breakdown: breakdown
          .filter((d) => d.weight > 0.04)
          .sort((a, b) => b.contribution - a.contribution)
          .slice(0, 5)
          .sort((a, b) => b.score - a.score)
          .map((d) => ({ label: DIMENSION_LABELS[d.dimension], score: Math.round(d.score * 100), reason: d.reason })),
      }}
      facts={facts}
      alternatives={alternatives.map((alt) => ({
        id: alt.id,
        name: alt.businessModel.name,
        summary: alt.businessModel.summary,
        score: Math.round(alt.score),
      }))}
      rejectionCount={rejectionCount}
      maxRejections={MAX_REJECTIONS}
      askToRevisit={revoir === '1'}
      error={erreur}
    />
  );
}
