import { Plan } from '@prisma/client';
import { db } from '@/server/db';

/**
 * Feature gating par table (section 12). Aucun prix codé en dur, aucune
 * dépendance à un prestataire de paiement : les paiements ne sont pas dans le
 * MVP, l'architecture les accueille sans refonte.
 */
export const FEATURES = {
  diagnostic: 'diagnostic.full',
  recommendation: 'recommendation.view',
  journeyPreview: 'journey.preview',
  journeyFull: 'journey.full',
  assistant: 'assistant.contextual',
  notifications: 'notifications.reminders',
  adventures: 'adventure.public',
  history: 'history.full',
  multipleJourneys: 'journey.multiple',
  journeyVariants: 'journey.variants',
  unlimitedAssistant: 'assistant.unlimited',
} as const;

export type FeatureKey = (typeof FEATURES)[keyof typeof FEATURES];

export { FREE_STEP_LIMIT } from '@/lib/offers';

export async function planFor(userId: string): Promise<Plan> {
  const sub = await db.subscription.findUnique({ where: { userId } });
  return sub?.status === 'active' ? sub.plan : Plan.free;
}

export async function can(userId: string, key: FeatureKey): Promise<boolean> {
  const [plan, flag] = await Promise.all([
    planFor(userId),
    db.featureFlag.findUnique({ where: { key } }),
  ]);
  // Une clé inconnue est fermée par défaut : on n'ouvre jamais par omission.
  if (!flag) return false;
  return flag.plans.includes(plan);
}
