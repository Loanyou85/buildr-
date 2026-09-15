import { redirect } from 'next/navigation';
import { auth } from '@/server/auth';
import { db } from '@/server/db';
import { DIMENSIONS } from '@/lib/matching/types';
import { TOTAL_QUESTIONS } from '@/lib/onboarding/questions';
import { AnalysisReveal } from '@/components/app/analysis-reveal';

export const dynamic = 'force-dynamic';

/**
 * L'écran qui précède les offres : de gros chiffres qui montent, le temps de
 * faire sentir le travail accompli.
 *
 * Garde-fou n° 1 : **tous ces chiffres sont lus en base au moment du rendu**.
 * Aucun n'est inventé, aucun n'est arrondi à la hausse. Le compteur d'usage
 * n'apparaît que s'il a quelque chose de vrai à dire — tant que personne n'a
 * démarré de parcours, il reste absent plutôt que de mentir.
 */
export default async function AnalysisPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/connexion');

  const userJourney = await db.userJourney.findFirst({
    where: { userId: session.user.id },
    orderBy: { startedAt: 'desc' },
    include: { journey: { include: { businessModel: true } } },
  });
  if (!userJourney) redirect('/recommandation');

  const journeyId = userJourney.journeyId;

  const [answeredHabits, profile, businessCount, stepCount, actionCount, resourceCount, startedJourneys] =
    await Promise.all([
      db.habitAnswer.count({ where: { profile: { userId: session.user.id } } }),
      db.profile.findUnique({ where: { userId: session.user.id } }),
      db.businessModel.count({ where: { isActive: true } }),
      db.step.count({ where: { phase: { journeyId } } }),
      db.action.count({ where: { subStep: { step: { phase: { journeyId } } } } }),
      db.resource.count({ where: { step: { phase: { journeyId } } } }),
      db.userJourney.count(),
    ]);

  // Réponses réellement enregistrées, pas le nombre de questions posées.
  const answeredFields = profile
    ? (
        [
          profile.age,
          profile.status,
          profile.city,
          profile.educationLevel,
          profile.hoursPerWeek,
          profile.hoursPerDay,
          profile.initialBudget,
          profile.monthlyBudget,
          profile.financialGoal,
          profile.timeHorizon,
          profile.riskTolerance,
          profile.workMode,
          profile.showsFace,
          profile.createsContent,
          profile.likesStrangers,
          profile.likesSelling,
          profile.likesCreating,
          profile.likesAnalyzing,
          profile.likesRepetition,
          profile.prefersSolo,
          profile.prefersFreedom,
        ] as Array<unknown>
      ).filter((value) => value !== null && value !== undefined).length
    : 0;

  const skillCount = await db.userSkill.count({ where: { profile: { userId: session.user.id } } });
  const interestCount = await db.userInterest.count({ where: { profile: { userId: session.user.id } } });

  return (
    <AnalysisReveal
      businessName={userJourney.journey.businessModel.name}
      stats={[
        {
          value: Math.min(TOTAL_QUESTIONS, answeredFields + answeredHabits + (skillCount > 0 ? 2 : 0)),
          label: 'réponses analysées',
        },
        { value: skillCount + interestCount, label: 'compétences et centres d’intérêt croisés' },
        { value: businessCount, label: 'activités comparées' },
        { value: DIMENSIONS.length, label: 'dimensions pesées pour te départager' },
      ]}
      journey={{ steps: stepCount, actions: actionCount, resources: resourceCount }}
      startedJourneys={startedJourneys}
    />
  );
}
