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

export type StripeMode = 'absent' | 'test' | 'production';

/**
 * Mode réellement actif, déduit du préfixe de la clé secrète.
 *
 * C'est la seule source fiable : le tableau de bord se souvient du dernier
 * interrupteur utilisé, pas de ce qui tourne en production. Laisser une clé de
 * test en production est l'erreur la plus coûteuse du branchement — les vraies
 * cartes sont refusées, et les cartes de test ouvrent l'accès gratuitement.
 */
export function stripeMode(): StripeMode {
  const key = process.env.STRIPE_SECRET_KEY?.trim();
  if (!key) return 'absent';
  if (key.startsWith('sk_test_') || key.startsWith('rk_test_')) return 'test';
  return 'production';
}

/** Variable d'environnement portant l'identifiant de tarif de chaque offre. */
const PRICE_ENV: Partial<Record<Plan, string>> = {
  depart: 'STRIPE_PRICE_DEPART',
  construction: 'STRIPE_PRICE_CONSTRUCTION',
  lancement: 'STRIPE_PRICE_LANCEMENT',
};

/** Identifiant de tarif Stripe correspondant à une offre. */
export function priceIdFor(plan: Plan): string | null {
  const name = PRICE_ENV[plan];
  if (!name) return null;
  const id = process.env[name]?.trim();
  return id && id.length > 0 ? id : null;
}

/** Retrouve l'offre à partir d'un identifiant de tarif, au retour du webhook. */
export function planForPriceId(priceId: string | null | undefined): Plan | null {
  if (!priceId) return null;
  for (const [plan, name] of Object.entries(PRICE_ENV)) {
    const configured = process.env[name]?.trim();
    if (configured && configured === priceId) return plan as Plan;
  }
  return null;
}
