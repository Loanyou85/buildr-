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
    case 'slider':
    case 'choice': {
      const raw0 = raw[0];
      if (raw0 === undefined) break;

      // Les valeurs numériques arrivent comme libellés de tranche : la tranche
      // porte un nombre représentatif, c'est lui qu'on enregistre.
      if (question.numeric) {
        const value = Number(raw0);
        if (!Number.isFinite(value)) break;

        if (question.field === 'skillLevel') {
          // Un seul niveau déclaré pour toutes les compétences cochées : une
          // question au lieu d'une par compétence.
          await db.userSkill.updateMany({
            where: { profileId: profile.id },
            data: { level: Math.max(0, Math.min(5, Math.round(value))) },
          });
          break;
        }

        const rounded = Math.round(value);
        Object.assign(data, { [question.field]: rounded });

        /*
         * Deux champs se déduisent plutôt que de coûter une question :
         * le temps quotidien découpe la semaine sur cinq jours, et le budget
         * mensuel s'estime au dixième du budget de départ. Les laisser à zéro
         * pénaliserait systématiquement les activités à acquisition payante.
         */
        if (question.field === 'hoursPerWeek') {
          Object.assign(data, { hoursPerDay: Math.max(1, Math.round(rounded / 5)) });
        }
        if (question.field === 'initialBudget') {
          Object.assign(data, { monthlyBudget: Math.round(rounded / 10 / 25) * 25 });
        }
        break;
      }

      if (raw0 === 'true' || raw0 === 'false') {
        Object.assign(data, { [question.field]: raw0 === 'true' });
        break;
      }

      Object.assign(data, { [question.field]: raw0 });
      break;
    }

    case 'multi': {
      if (question.field === 'readiness') {
        const checked = new Set(raw);
        // Une case décochée vaut un refus explicite, pas une absence de
        // réponse : c'est ce qui fait fonctionner les contraintes dures.
        Object.assign(data, {
          showsFace: checked.has('showsFace'),
          createsContent: checked.has('createsContent'),
          likesStrangers: checked.has('likesStrangers'),
          likesSelling: checked.has('likesSelling'),
          likesCreating: checked.has('likesCreating'),
          likesAnalyzing: checked.has('likesAnalyzing'),
          likesRepetition: checked.has('likesRepetition'),
          // Refuser le déplacement, c'est vouloir travailler à distance —
          // et cela écarte les activités qui exigent du terrain.
          workMode: checked.has('localWork') ? 'hybrid' : 'remote',
        });
        break;
      }

      if (question.field === 'habit') {
        // Les cases cochées forment la réponse : c'est ce texte que l'IA — ou
        // l'heuristique locale — analyse pour en tirer des signaux.
        const answer = raw.join('. ');
        if (answer.trim().length > 0) {
          await db.habitAnswer.upsert({
            where: { profileId_questionKey: { profileId: profile.id, questionKey: question.key } },
            update: { answer },
            create: { profileId: profile.id, questionKey: question.key, answer },
          });
        } else {
          await db.habitAnswer.deleteMany({
            where: { profileId: profile.id, questionKey: question.key },
          });
        }
        break;
      }
      Object.assign(data, { [question.field]: raw });
      break;
    }

    case 'skills': {
      const found = await db.skill.findMany({ where: { slug: { in: raw } } });
      await db.userSkill.deleteMany({ where: { profileId: profile.id } });
      if (found.length > 0) {
        await db.userSkill.createMany({
          // Niveau par défaut jusqu'à la question suivante, qui l'ajuste.
          data: found.map((skill) => ({ profileId: profile.id, skillId: skill.id, level: 3 })),
        });
      }
      break;
    }

    case 'interests': {
      const found = await db.interest.findMany({ where: { slug: { in: raw } } });
      await db.userInterest.deleteMany({ where: { profileId: profile.id } });
      if (found.length > 0) {
        await db.userInterest.createMany({
          data: found.map((interest) => ({ profileId: profile.id, interestId: interest.id })),
        });
      }
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
