import type { Plan } from '@prisma/client';

/**
 * Les trois offres du site.
 *
 * Les prix vivent ici, les droits vivent dans la table `FeatureFlag` :
 * changer un prix ne touche pas au gating, et ouvrir un droit ne demande pas
 * de toucher aux écrans.
 *
 * L'offre gratuite n'est pas une quatrième carte. C'est ce que l'utilisateur
 * a déjà — le diagnostic, ses trois idées, les deux premières phases — et on
 * le lui rappelle sous les offres plutôt que de lui donner un quatrième choix
 * au moment de décider.
 */
export interface Offer {
  plan: Plan;
  name: string;
  /** Prix mensuel en euros, centimes compris. */
  price: number;
  tagline: string;
  /** Ce que l'offre ajoute par rapport à la précédente. */
  features: string[];
  /** Une seule offre peut être mise en avant. */
  highlighted?: boolean;
}

/** Nombre de phases ouvertes sans payer (section 13). */
export const FREE_PHASE_LIMIT = 2;

/** Prompts à la demande inclus chaque mois dans l'offre gratuite. */
export const FREE_CUSTOM_PROMPTS_PER_MONTH = 3;

export const OFFERS: Offer[] = [
  {
    plan: 'depart',
    name: 'Départ',
    price: 7.99,
    tagline: 'Pour aller jusqu’à ton site en ligne.',
    features: [
      'Le parcours complet, les treize phases',
      'Le pack de prompts entier, dans l’ordre',
      'Les prompts de réparation quand ça casse',
      'Le suivi de ton projet d’une étape à l’autre',
    ],
  },
  {
    plan: 'construction',
    name: 'Construction',
    price: 18.99,
    tagline: 'Pour ajouter tout ce que tu veux à ton SaaS.',
    highlighted: true,
    features: [
      'Tout ce que contient Départ',
      'Le générateur de prompts sans limite',
      'Des prompts cohérents avec ce que tu as déjà construit',
      'L’assistance sur l’étape où tu es',
    ],
  },
  {
    plan: 'lancement',
    name: 'Lancement',
    price: 35.99,
    tagline: 'Pour vendre ce que tu as construit.',
    features: [
      'Tout ce que contient Construction',
      'Les trente scripts vidéo générés pour ton SaaS',
      'Le calendrier de publication sur un mois',
      'Tes jalons et ta carte partageable',
    ],
  },
];

/** Ce que garde quelqu'un qui ne paie pas. Affiché sous les offres. */
export const FREE_FEATURES: string[] = [
  'Le diagnostic complet',
  'Tes trois idées et leur justification',
  `Les ${FREE_PHASE_LIMIT} premières phases du parcours`,
  'Les quatre prompts de fondation',
  `${FREE_CUSTOM_PROMPTS_PER_MONTH} prompts à la demande par mois`,
];

export function offerFor(plan: Plan): Offer | null {
  return OFFERS.find((offer) => offer.plan === plan) ?? null;
}

/** Format français avec centimes : 7,99 €. */
export function formatPrice(value: number): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}
