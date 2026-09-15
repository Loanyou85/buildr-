import { redirect } from 'next/navigation';
import type { Prisma } from '@prisma/client';
import { auth } from '@/server/auth';
import { db } from '@/server/db';
import { QUESTIONS, SECTION_LABELS, TOTAL_QUESTIONS, indexOfQuestion } from '@/lib/onboarding/questions';
import { QuestionScreen } from '@/components/app/question-screen';

export const dynamic = 'force-dynamic';

/**
 * Onboarding (section 8.2) : une question par écran, jamais de formulaire long.
 * Sauvegarde à chaque réponse, reprise possible à tout moment.
 */
export default async function OnboardingPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect('/connexion');

  const profile = await db.profile.findUnique({
    where: { userId: session.user.id },
    include: { skills: { include: { skill: true } }, interests: { include: { interest: true } }, habits: true },
  });

  const { q } = await searchParams;
  // Reprise : on repart de la question suivant la dernière répondue.
  const resumeIndex = profile?.onboardingStep ? indexOfQuestion(profile.onboardingStep) + 1 : 0;
  const index = Math.max(0, Math.min(TOTAL_QUESTIONS - 1, q !== undefined ? Number(q) : resumeIndex));
  const question = QUESTIONS[index]!;

  const [skills, interests] = await Promise.all([
    question.kind === 'skills' ? db.skill.findMany({ orderBy: { category: 'asc' } }) : Promise.resolve([]),
    question.kind === 'interests' ? db.interest.findMany({ orderBy: { label: 'asc' } }) : Promise.resolve([]),
  ]);

  const currentValue = readCurrentValue(question.key, question.field, profile);

  return (
    <div className="min-h-dvh bg-beton-100">
      <QuestionScreen
        question={question}
        index={index}
        total={TOTAL_QUESTIONS}
        sectionLabel={SECTION_LABELS[question.section]}
        skills={skills}
        interests={interests}
        currentValue={currentValue}
        isFirst={index === 0}
      />
    </div>
  );
}

type ProfileWithRelations = Prisma.ProfileGetPayload<{
  include: { skills: { include: { skill: true } }; interests: { include: { interest: true } }; habits: true };
}> | null;

function readCurrentValue(
  key: string,
  field: string,
  profile: ProfileWithRelations,
): string | string[] | null {
  if (!profile) return null;

  if (field === 'readiness') {
    const checked: string[] = [];
    for (const key of [
      'showsFace',
      'createsContent',
      'likesStrangers',
      'likesSelling',
      'likesCreating',
      'likesAnalyzing',
      'likesRepetition',
    ] as const) {
      if (profile[key]) checked.push(key);
    }
    if (profile.workMode && profile.workMode !== 'remote') checked.push('localWork');
    return checked;
  }

  if (field === 'habit') {
    // Les réponses d'habitudes sont stockées jointes : on les redécoupe pour
    // pouvoir recocher les cases en cas de retour en arrière.
    const answer = profile.habits.find((h) => h.questionKey === key)?.answer;
    return answer ? answer.split('. ').filter(Boolean) : null;
  }
  if (field === 'skills') {
    return profile.skills.map((s) => s.skill.slug);
  }
  if (field === 'interests') {
    return profile.interests.map((i) => i.interest.slug);
  }

  const value = (profile as unknown as Record<string, unknown>)[field];
  if (value === null || value === undefined) return null;
  return String(value);
}
