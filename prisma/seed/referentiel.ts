import type { Plan } from '@prisma/client';

/** Jalons du parcours (section 7.8). */
export const MILESTONES = [
  { key: 'idee-choisie', label: 'Idée choisie', order: 1 },
  { key: 'site-en-ligne', label: 'Site en ligne', order: 2 },
  { key: 'paiement-branche', label: 'Paiement branché', order: 3 },
  { key: 'premier-euro', label: 'Premier euro', order: 4 },
] as const;

const TOUS: Plan[] = ['free', 'depart', 'construction', 'lancement'];
const PAYANTS: Plan[] = ['depart', 'construction', 'lancement'];
const HAUT: Plan[] = ['construction', 'lancement'];
const LANCEMENT: Plan[] = ['lancement'];

/**
 * Feature gating par table (section 13). Aucun droit écrit en dur dans le
 * code, aucun prix ici : les prix vivent dans src/lib/offers.ts.
 *
 * Le point de bascule est placé juste après la restitution des idées :
 * l'utilisateur a reçu quelque chose de concret et de personnalisé avant
 * qu'on lui demande quoi que ce soit.
 */
export const FEATURE_FLAGS: { key: string; label: string; plans: Plan[] }[] = [
  { key: 'diagnostic.full', label: 'Le diagnostic complet', plans: TOUS },
  { key: 'ideas.view', label: 'Les trois idées et leur justification', plans: TOUS },
  { key: 'journey.preview', label: 'L’aperçu du parcours complet', plans: TOUS },
  { key: 'journey.starter', label: 'Les deux premières phases du parcours', plans: TOUS },
  { key: 'prompts.foundation', label: 'Les quatre prompts de fondation', plans: TOUS },
  { key: 'prompts.custom.limited', label: 'Trois prompts à la demande par mois', plans: TOUS },

  { key: 'journey.full', label: 'Le parcours complet, treize phases', plans: PAYANTS },
  { key: 'prompts.pack', label: 'Le pack de prompts entier', plans: PAYANTS },
  { key: 'prompts.repair', label: 'Les prompts de réparation', plans: PAYANTS },
  { key: 'project.state', label: 'Le suivi de l’état du projet', plans: PAYANTS },

  { key: 'prompts.custom.unlimited', label: 'Le générateur de prompts illimité', plans: HAUT },
  { key: 'support.contextual', label: 'L’assistance contextuelle', plans: HAUT },

  { key: 'videos.scripts', label: 'Les trente scripts vidéo', plans: LANCEMENT },
  { key: 'milestones.share', label: 'La carte de jalon partageable', plans: LANCEMENT },
  { key: 'adventure.public', label: 'Le profil public d’aventure', plans: LANCEMENT },
];
