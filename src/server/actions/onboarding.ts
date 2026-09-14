'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import type { Prisma } from '@prisma/client';
import { db } from '@/server/db';
import { requireUser } from '@/server/auth';
import { QUESTIONS, TOTAL_QUESTIONS, indexOfQuestion } from '@/lib/onboarding/questions';
import { ageGate } from '@/lib/guardrails';
import { extractSignals } from '@/lib/ai/signals';

async function profileFor(userId: string) {
  return db.profile.upsert({ where: { userId }, update: {}, create: { userId } });
}

/**
 * Sauvegarde une réponse et avance d'un écran. Écrire à chaque réponse permet
 * la reprise : l'utilisateur ne perd jamais ce qu'il a déjà donné (section 8.2).
 */
export async function saveAnswer(formData: FormData): Promise<void> {
  const user = await requireUser();
  const key = String(formData.get('key') ?? '');
  const index = indexOfQuestion(key);
  const question = QUESTIONS[index];
  if (!question) throw new Error('Question inconnue');

  const profile = await profileFor(user.id);
  const raw = formData.getAll('value').map(String).filter((v) => v.length > 0);

  // Garde-fou n° 5 : en dessous de 16 ans, on ne crée rien et on supprime le
  // compte. Le blocage est en base, pas en CSS.
  if (question.key === 'age') {
    const age = Number(raw[0]);
    if (Number.isFinite(age) && ageGate(age) === 'refused') {
      await db.user.delete({ where: { id: user.id } });
      redirect('/trop-jeune');
    }
  }

  const data: Prisma.ProfileUpdateInput = { onboardingStep: key };

  switch (question.kind) {
    case 'number': {
      const value = Number(raw[0]);
      if (Number.isFinite(value)) {
        Object.assign(data, { [question.field]: Math.round(value) });
      }
      break;
    }
    case 'choice': {
      if (raw[0]) Object.assign(data, { [question.field]: raw[0] });
      break;
    }
    case 'boolean': {
      Object.assign(data, { [question.field]: raw[0] === 'true' });
      break;
    }
    case 'text': {
      if (question.field === 'habit') {
        const answer = raw[0] ?? '';
        if (answer.trim().length > 0) {
          await db.habitAnswer.upsert({
            where: { profileId_questionKey: { profileId: profile.id, questionKey: question.key } },
            update: { answer },
            create: { profileId: profile.id, questionKey: question.key, answer },
          });
        }
      } else if (raw[0]) {
        Object.assign(data, { [question.field]: raw[0] });
      }
      break;
    }
    case 'skills': {
      const levels = raw
        .map((entry) => entry.split(':'))
        .filter((parts): parts is [string, string] => parts.length === 2)
        .map(([slug, level]) => ({ slug, level: Math.max(0, Math.min(5, Number(level) || 0)) }));

      const skills = await db.skill.findMany({ where: { slug: { in: levels.map((l) => l.slug) } } });
      await db.userSkill.deleteMany({ where: { profileId: profile.id } });
      if (skills.length > 0) {
        await db.userSkill.createMany({
          data: skills.map((skill) => ({
            profileId: profile.id,
            skillId: skill.id,
            level: levels.find((l) => l.slug === skill.slug)?.level ?? 3,
          })),
        });
      }
      break;
    }
    case 'interests': {
      const interests = await db.interest.findMany({ where: { slug: { in: raw } } });
      await db.userInterest.deleteMany({ where: { profileId: profile.id } });
      if (interests.length > 0) {
        await db.userInterest.createMany({
          data: interests.map((interest) => ({ profileId: profile.id, interestId: interest.id })),
        });
      }
      break;
    }
    case 'multi': {
      Object.assign(data, { [question.field]: raw });
      break;
    }
  }

  await db.profile.update({ where: { id: profile.id }, data });

  const nextIndex = index + 1;
  if (nextIndex >= TOTAL_QUESTIONS) {
    await completeOnboarding(user.id);
    redirect('/recommandation');
  }

  revalidatePath('/onboarding');
  redirect(`/onboarding?q=${nextIndex}`);
}

/**
 * Fin d'onboarding : les réponses libres deviennent des signaux structurés.
 * L'IA nuance, elle ne décide pas — sans clé, l'heuristique locale suffit.
 */
async function completeOnboarding(userId: string): Promise<void> {
  const profile = await db.profile.findUnique({ where: { userId }, include: { habits: true } });
  if (!profile) return;

  const answers = profile.habits.map((habit) => ({
    question: QUESTIONS.find((q) => q.key === habit.questionKey)?.title ?? habit.questionKey,
    answer: habit.answer,
  }));

  const signals = await extractSignals(answers);

  await db.profile.update({
    where: { id: profile.id },
    data: { onboardingCompleted: true, derivedSignals: signals as Prisma.InputJsonValue },
  });
}

/** Retour à la question précédente : autorisé, mais jamais mis en avant. */
export async function goToQuestion(formData: FormData): Promise<void> {
  await requireUser();
  const index = Number(formData.get('index') ?? 0);
  redirect(`/onboarding?q=${Math.max(0, index)}`);
}
