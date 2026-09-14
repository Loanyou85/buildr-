/**
 * Calcul de la progression. Unique endroit du code qui écrit
 * `progressPercent` : la barre principale ne recule jamais (section 2 et 6.5).
 */
export interface ProgressInput {
  totalSteps: number;
  completedSteps: number;
  /** Checkpoints cochés sur l'étape en cours, sur le total de cette étape. */
  currentStepCheckedRatio?: number;
  /** Valeur déjà enregistrée en base. */
  previousPercent: number;
}

export function computeProgressPercent({
  totalSteps,
  completedSteps,
  currentStepCheckedRatio = 0,
  previousPercent,
}: ProgressInput): number {
  if (totalSteps <= 0) return previousPercent;

  const perStep = 100 / totalSteps;
  const partial = Math.max(0, Math.min(1, currentStepCheckedRatio)) * perStep;
  const computed = Math.round(completedSteps * perStep + partial);

  // Monotone par construction.
  return Math.max(previousPercent, Math.min(100, computed));
}

/** Libellé de progression, sans jamais parler d'échec ni de retard. */
export function progressLabel(percent: number): string {
  if (percent >= 100) return 'Parcours terminé';
  if (percent >= 75) return 'Dernière ligne droite';
  if (percent >= 40) return 'Bien engagé';
  if (percent > 0) return 'En route';
  return 'Prêt à démarrer';
}
