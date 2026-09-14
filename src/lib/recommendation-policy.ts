/**
 * Politique de refus (section 7) : l'utilisateur peut refuser, mais le système
 * encourage l'exécution. Au-delà de deux refus, on reprend les questions
 * d'onboarding plutôt que de proposer des alternatives à l'infini.
 */
export const MAX_REJECTIONS = 2;
