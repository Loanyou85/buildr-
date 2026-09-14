import type { EliminationReason, ScorableBusiness, ScoringProfile } from './types';

/**
 * Contraintes dures (section 7). Un business éliminé n'est jamais scoré :
 * proposer une activité que l'utilisateur ne peut pas financer, pas tenir dans
 * son temps, ou qui exige un visage qu'il refuse de montrer, casse le produit.
 */
export function evaluateHardConstraints(
  profile: ScoringProfile,
  business: ScorableBusiness,
): EliminationReason[] {
  const reasons: EliminationReason[] = [];

  if (profile.initialBudget < business.minBudget) {
    reasons.push({
      constraint: 'budget',
      message: `Cette activité demande au minimum ${business.minBudget} € pour démarrer, tu en as ${profile.initialBudget} €.`,
    });
  }

  if (profile.hoursPerWeek < business.hoursPerWeekMin) {
    reasons.push({
      constraint: 'time',
      message: `Cette activité demande au minimum ${business.hoursPerWeekMin} h par semaine, tu en as ${profile.hoursPerWeek}.`,
    });
  }

  if (business.requiresFace && !profile.showsFace) {
    reasons.push({
      constraint: 'face',
      message: 'Cette activité exige d’apparaître à l’image, ce que tu ne souhaites pas.',
    });
  }

  if (business.requiresContent && !profile.createsContent) {
    reasons.push({
      constraint: 'content',
      message: 'Cette activité repose sur la production de contenu régulière, ce que tu ne souhaites pas faire.',
    });
  }

  if (business.requiresSelling && !profile.likesSelling && !profile.likesStrangers) {
    reasons.push({
      constraint: 'selling',
      message: 'Cette activité repose entièrement sur la vente directe, un terrain que tu écartes.',
    });
  }

  if (business.requiresLocalPresence && profile.workMode === 'remote') {
    reasons.push({
      constraint: 'local',
      message: 'Cette activité demande une présence sur le terrain, tu veux travailler à distance.',
    });
  }

  return reasons;
}
