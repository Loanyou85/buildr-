'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import type { PromptStatus } from '@prisma/client';
import { db } from '@/server/db';
import { requireUser } from '@/server/auth';
import { can, FEATURES, FREE_CUSTOM_PROMPTS_PER_MONTH } from '@/server/features';
import { genererPack, genererPromptSurMesure, reparer, type Reparation } from '@/server/prompts';

/** Crée le pack séquencé de l'idée choisie. */
export async function creerPack(): Promise<void> {
  const user = await requireUser();
  const idea = await db.idea.findFirst({ where: { userId: user.id, status: 'selected' } });
  if (!idea) redirect('/mes-idees');

  await genererPack(user.id, idea.id);
  revalidatePath('/app/prompts');
  redirect('/app/prompts');
}

/** Fait avancer l'état d'un prompt : à faire, copié, exécuté, validé. */
export async function marquerPrompt(formData: FormData): Promise<void> {
  const user = await requireUser();
  const promptId = String(formData.get('promptId') ?? '');
  const statut = String(formData.get('status') ?? 'copied') as PromptStatus;

  const prompt = await db.generatedPrompt.findFirst({
    where: { id: promptId, pack: { userId: user.id } },
  });
  if (!prompt) return;

  await db.generatedPrompt.update({
    where: { id: prompt.id },
    data: {
      status: statut,
      copiedAt: statut === 'copied' ? new Date() : prompt.copiedAt,
      executedAt: statut === 'executed' || statut === 'validated' ? new Date() : prompt.executedAt,
    },
  });
  revalidatePath('/app/prompts');
}

/** Pouce haut ou bas. Ces retours alimentent l'amélioration des gabarits. */
export async function noterPrompt(formData: FormData): Promise<void> {
  const user = await requireUser();
  const promptId = String(formData.get('promptId') ?? '');
  const note = Number(formData.get('rating') ?? 0);

  await db.generatedPrompt.updateMany({
    where: { id: promptId, pack: { userId: user.id } },
    data: { rating: note > 0 ? 1 : -1 },
  });
  revalidatePath('/app/prompts');
}

export interface SurMesureState {
  error?: string;
  promptId?: string;
}

/** Générateur à la demande : trois par mois en gratuit, illimité au-dessus. */
export async function genererSurMesure(
  _prev: SurMesureState,
  formData: FormData,
): Promise<SurMesureState> {
  const user = await requireUser();
  const demande = String(formData.get('demande') ?? '').trim();
  if (demande.length < 10) return { error: 'Décris ce que tu veux ajouter, en une phrase au moins.' };

  const idea = await db.idea.findFirst({ where: { userId: user.id, status: 'selected' } });
  if (!idea) return { error: 'Choisis d’abord une idée.' };

  const packId = await genererPack(user.id, idea.id);

  const illimite = await can(user.id, FEATURES.promptsCustomUnlimited);
  if (!illimite) {
    const mois = new Date().toISOString().slice(0, 7);
    const abonnement = await db.subscription.findUnique({ where: { userId: user.id } });
    const utilises = abonnement?.customPromptsMonth === mois ? abonnement.customPromptsUsed : 0;

    if (utilises >= FREE_CUSTOM_PROMPTS_PER_MONTH) {
      return {
        error: `Tu as utilisé tes ${FREE_CUSTOM_PROMPTS_PER_MONTH} prompts du mois. L’offre Construction les rend illimités.`,
      };
    }
    await db.subscription.upsert({
      where: { userId: user.id },
      create: { userId: user.id, customPromptsMonth: mois, customPromptsUsed: 1 },
      update: { customPromptsMonth: mois, customPromptsUsed: utilises + 1 },
    });
  }

  const promptId = await genererPromptSurMesure(user.id, packId, demande);
  if (!promptId) {
    return { error: 'La génération n’a rien rendu d’exploitable. Reformule en une phrase plus précise.' };
  }

  revalidatePath('/app/prompts');
  return { promptId };
}

export interface ReparationState {
  reparation?: Reparation;
  error?: string;
}

/** Écran « Ça ne marche pas » (section 11.5). */
export async function demanderReparation(
  _prev: ReparationState,
  formData: FormData,
): Promise<ReparationState> {
  const user = await requireUser();
  const message = String(formData.get('message') ?? '').trim();
  const contexte = String(formData.get('contexte') ?? '').trim();

  if (message.length < 5) return { error: 'Colle le message d’erreur que tu vois.' };

  if (!(await can(user.id, FEATURES.promptsRepair))) {
    return {
      error:
        'Les prompts de réparation font partie des offres payantes. C’est ce qui évite d’abandonner quand ça casse.',
    };
  }

  const idea = await db.idea.findFirst({ where: { userId: user.id, status: 'selected' } });
  if (!idea) return { error: 'Choisis d’abord une idée.' };

  const reparation = await reparer(user.id, idea.id, message, contexte);
  if (!reparation) return { error: 'On n’a pas su quoi faire de ce message. Réessaie en collant l’erreur entière.' };
  return { reparation };
}
