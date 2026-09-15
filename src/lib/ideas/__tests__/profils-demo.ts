import type { ProfileInput } from '../types';

/**
 * Les trois profils de démonstration de la section 15. Ils servent à la fois
 * de jeu de test et de données de démonstration en base.
 *
 * Exigence explicite du cahier des charges : « si les trois profils produisent
 * des idées interchangeables, le moteur est raté ». Le test correspondant est
 * donc un test de qualité produit, pas un test unitaire ordinaire.
 */
export const PROFIL_KINE: ProfileInput = {
  domains: [
    { slug: 'kinesitherapie', yearsExposure: 3, source: 'etudes' },
    { slug: 'cabinet-medical', yearsExposure: 1, source: 'entourage' },
  ],
  skills: [
    { slug: 'enseignement', level: 4 },
    { slug: 'organisation', level: 3 },
    { slug: 'relation-client', level: 3 },
  ],
  interests: ['sante', 'sport'],
  // « Je ne sais jamais si le patient a fait ses exercices entre deux séances. »
  frictionSignals: ['notes-eleves', 'suivi-dossier'],
  hoursPerWeek: 5,
  budget: 0,
  technicalLevel: 1,
  goalRevenue: 800,
  timeHorizon: 6,
  riskTolerance: 'low',
  showsFace: false,
  prefersSolo: false,
  reachableCount: 12,
};

export const PROFIL_SERVEUR: ProfileInput = {
  domains: [
    { slug: 'restauration', yearsExposure: 4, source: 'metier' },
    { slug: 'boulangerie', yearsExposure: 1, source: 'entourage' },
  ],
  skills: [
    { slug: 'organisation', level: 4 },
    { slug: 'relation-client', level: 4 },
    { slug: 'negociation', level: 2 },
  ],
  interests: ['cuisine'],
  // « Le planning se fait le dimanche soir sur un tableur que personne ne comprend. »
  frictionSignals: ['planning', 'tableur'],
  hoursPerWeek: 15,
  budget: 300,
  technicalLevel: 2,
  goalRevenue: 1500,
  timeHorizon: 6,
  riskTolerance: 'medium',
  showsFace: true,
  prefersSolo: false,
  reachableCount: 15,
};

export const PROFIL_LOGISTIQUE: ProfileInput = {
  domains: [
    { slug: 'transport-livraison', yearsExposure: 2, source: 'metier' },
    { slug: 'entrepot-logistique', yearsExposure: 2, source: 'etudes' },
  ],
  skills: [
    { slug: 'organisation', level: 4 },
    { slug: 'analyse-chiffres', level: 3 },
    { slug: 'tableur', level: 3 },
  ],
  interests: ['technologie'],
  // « Les preuves de livraison sont des photos perdues dans le téléphone du chauffeur. »
  frictionSignals: ['tournees', 'photos-chantier', 'suivi-dossier'],
  hoursPerWeek: 10,
  budget: 150,
  technicalLevel: 2,
  goalRevenue: 1200,
  timeHorizon: 9,
  riskTolerance: 'medium',
  showsFace: false,
  prefersSolo: true,
  reachableCount: 8,
};

export const PROFILS_DEMO = {
  kine: PROFIL_KINE,
  serveur: PROFIL_SERVEUR,
  logistique: PROFIL_LOGISTIQUE,
} as const;
