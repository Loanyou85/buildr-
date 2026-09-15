import 'server-only';
import Stripe from 'stripe';
import type { Plan } from '@prisma/client';

/**
 * Stripe, côté serveur uniquement. Tout est optionnel : sans clé, le produit
 * fonctionne, l'écran des offres enregistre l'intention et le dit franchement.
 */
let client: Stripe | null = null;

export function stripeEnabled(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY);
}

export function getStripe(): Stripe | null {
  if (!stripeEnabled()) return null;
  client ??= new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2026-08-26.dahlia' });
  return client;
}

/** Identifiant de tarif Stripe correspondant à une offre. */
export function priceIdFor(plan: Plan): string | null {
  const byPlan: Partial<Record<Plan, string | undefined>> = {
    pro: process.env.STRIPE_PRICE_PRO,
    illimite: process.env.STRIPE_PRICE_ILLIMITE,
  };
  const id = byPlan[plan]?.trim();
  return id && id.length > 0 ? id : null;
}

/** Retrouve l'offre à partir d'un identifiant de tarif, au retour du webhook. */
export function planForPriceId(priceId: string | null | undefined): Plan | null {
  if (!priceId) return null;
  if (priceId === process.env.STRIPE_PRICE_PRO?.trim()) return 'pro';
  if (priceId === process.env.STRIPE_PRICE_ILLIMITE?.trim()) return 'illimite';
  return null;
}
