import type { Plan } from '@prisma/client';

/**
 * Les trois offres (section 12). Les prix vivent ici, pas dans les écrans, et
 * les droits restent portés par la table `FeatureFlag` : changer une offre ne
 * demande pas de toucher au gating.
 */
export interface Offer {
  plan: Plan;
  name: string;
  /** Prix mensuel en euros. 0 pour l'offre gratuite. */
  price: number;
  tagline: string;
  /** Ce que l'offre ajoute par rapport à la précédente. */
  features: string[];
  /** Mise en avant : une seule offre peut l'être. */
  highlighted?: boolean;
  /** Ce que l'offre ne comprend pas, dit franchement. */
  limit?: string;
}

export const FREE_STEP_LIMIT = 3;

export const OFFERS: Offer[] = [
  {
    plan: 'free',
    name: 'Découverte',
    price: 0,
    tagline: 'Pour voir si le chemin te convient.',
    features: [
      'Le diagnostic complet',
      'Ta recommandation et son explication',
      'L’aperçu de tout le parcours',
      `Les ${FREE_STEP_LIMIT} premières étapes, en entier`,
    ],
    limit: `Le parcours s’arrête après l’étape ${FREE_STEP_LIMIT}.`,
  },
  {
    plan: 'pro',
    name: 'Parcours',
    price: 29,
    tagline: 'Pour construire ton activité jusqu’au premier client.',
    highlighted: true,
    features: [
      'Le parcours complet, toutes les étapes',
      'Tous les modèles, scripts et checklists',
      'L’assistance sur chaque étape',
      'Les rappels quotidiens et les relances',
      'Ton historique et tes jalons',
    ],
  },
  {
    plan: 'illimite',
    name: 'Illimité',
    price: 59,
    tagline: 'Pour mener plusieurs activités de front.',
    features: [
      'Tout ce que contient Parcours',
      'Plusieurs activités suivies en parallèle',
      'Toutes les variantes de parcours, selon ton budget et ton niveau',
      'L’assistance sans limite de questions',
    ],
  },
];

export function offerFor(plan: Plan): Offer {
  return OFFERS.find((offer) => offer.plan === plan) ?? OFFERS[0]!;
}

/** Nombre de questions à l'assistance incluses chaque mois dans l'offre Parcours. */
export const PRO_ASSISTANT_MONTHLY_LIMIT = 50;
