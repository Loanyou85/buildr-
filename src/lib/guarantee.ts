/**
 * Garantie commerciale « 30 jours ».
 *
 * Elle porte sur le produit, pas sur un revenu : elle dit ce qui se passe si
 * le parcours ne donne rien, elle ne promet à aucun moment qu'il donnera
 * quelque chose. Les conditions vivent ici, en un seul endroit, pour que le
 * texte affiché soit toujours exactement celui qui engage.
 */
export const GUARANTEE_DAYS = 30;
export const GUARANTEE_CLAIM_WINDOW_DAYS = 15;
export const GUARANTEE_REFUND_DAYS = 14;

export const SUPPORT_EMAIL = process.env.NEXT_PUBLIC_SUPPORT_EMAIL ?? 'bonjour@nexteo.app';

export const GUARANTEE_HEADLINE = 'Si ça ne donne rien, tu es remboursé.';

export const GUARANTEE_PROMISE = `Tu suis le parcours pendant ${GUARANTEE_DAYS} jours. Si au bout de ces ${GUARANTEE_DAYS} jours tu n’as encaissé aucun euro, on te rembourse ton abonnement en entier.`;

export interface GuaranteeCondition {
  title: string;
  detail: string;
}

/**
 * Les conditions, dites franchement. Une garantie dont les conditions sont
 * cachées se retourne contre celui qui l'annonce : autant les écrire noir sur
 * blanc au moment où la personne décide.
 */
export const GUARANTEE_CONDITIONS: GuaranteeCondition[] = [
  {
    title: 'Pour qui',
    detail:
      'Tout abonnement payant, quelle que soit l’offre. L’offre gratuite n’est pas concernée, puisqu’il n’y a rien à rembourser.',
  },
  {
    title: 'À partir de quand',
    detail: `La garantie s’ouvre au ${GUARANTEE_DAYS}ᵉ jour suivant ton paiement, et reste ouverte ${GUARANTEE_CLAIM_WINDOW_DAYS} jours. C’est le temps qu’il faut pour que le parcours ait eu une chance de produire quelque chose.`,
  },
  {
    title: 'Ce qu’on te demande',
    detail:
      'D’avoir suivi le parcours : les étapes validées jusqu’à la fin de la phase de prospection. Un parcours qu’on n’a pas fait ne peut pas être jugé sur ses résultats.',
  },
  {
    title: 'Ce qu’on ne te demande pas',
    detail:
      'Aucun justificatif comptable, aucune capture d’écran. Tu déclares que tu n’as rien encaissé, et on te croit.',
  },
  {
    title: 'Comment demander',
    detail: `Un e-mail à ${SUPPORT_EMAIL} avec l’adresse de ton compte. Pas de formulaire, pas de justification à rédiger.`,
  },
  {
    title: 'Sous quel délai',
    detail: `Le remboursement est intégral et part sous ${GUARANTEE_REFUND_DAYS} jours, sur le moyen de paiement utilisé. Ton abonnement s’arrête à ce moment-là.`,
  },
];

/**
 * Mention légale obligatoire : une garantie commerciale s'ajoute aux droits
 * prévus par la loi, elle ne les remplace jamais.
 */
export const GUARANTEE_LEGAL_NOTE = `Cette garantie commerciale s’ajoute à tes droits légaux et ne s’y substitue pas. Ton abonnement reste par ailleurs résiliable à tout moment, sans motif et sans frais, depuis ton compte.`;
