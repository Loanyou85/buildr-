import 'server-only';
import { Plan } from '@prisma/client';
import { db } from '@/server/db';

/**
 * Feature gating par table (section 13). Aucun droit écrit en dur ici : cette
 * liste ne fait que nommer les clés, ce sont les lignes de `FeatureFlag` qui
 * disent quelles offres y ont droit.
 */
export const FEATURES = {
  diagnostic: 'diagnostic.full',
  ideas: 'ideas.view',
  journeyPreview: 'journey.preview',
  journeyStarter: 'journey.starter',
  journeyFull: 'journey.full',
  promptsFoundation: 'prompts.foundation',
  promptsPack: 'prompts.pack',
  promptsRepair: 'prompts.repair',
  promptsCustomLimited: 'prompts.custom.limited',
  promptsCustomUnlimited: 'prompts.custom.unlimited',
  projectState: 'project.state',
  support: 'support.contextual',
  videoScripts: 'videos.scripts',
  milestoneShare: 'milestones.share',
  adventurePublic: 'adventure.public',
} as const;

export type FeatureKey = (typeof FEATURES)[keyof typeof FEATURES];

export async function planFor(userId: string): Promise<Plan> {
  const sub = await db.subscription.findUnique({ where: { userId } });
  return sub?.status === 'active' ? sub.plan : Plan.free;
}

/**
 * Le seul point d'entrée du gating, et il est serveur. Masquer un bouton
 * n'est pas une sécurité : cette fonction est appelée dans l'action, pas
 * seulement dans la vue.
 */
export async function can(userId: string, key: FeatureKey): Promise<boolean> {
  const [plan, flag] = await Promise.all([
    planFor(userId),
    db.featureFlag.findUnique({ where: { key } }),
  ]);
  // Une clé inconnue est fermée. On n'ouvre jamais par omission.
  if (!flag) return false;
  return flag.plans.includes(plan);
}

export async function assertCan(userId: string, key: FeatureKey): Promise<void> {
  if (!(await can(userId, key))) throw new Error(`FEATURE_LOCKED:${key}`);
}

/** Toutes les clés ouvertes pour un utilisateur, en une requête. */
export async function featuresFor(userId: string): Promise<Set<string>> {
  const plan = await planFor(userId);
  const flags = await db.featureFlag.findMany({ where: { plans: { has: plan } }, select: { key: true } });
  return new Set(flags.map((f) => f.key));
}

export { FREE_PHASE_LIMIT, FREE_CUSTOM_PROMPTS_PER_MONTH } from '@/lib/offers';
