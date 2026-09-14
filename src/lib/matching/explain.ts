import { topDimensions, weakDimensions } from './score';
import { DIMENSION_LABELS, type BusinessScore } from './types';

/**
 * Explication déterministe, rédigée depuis le `breakdown`. C'est le repli
 * quand l'IA n'est pas disponible — et la base de travail quand elle l'est.
 * Aucune promesse de revenu : on décrit un ajustement, pas un résultat.
 */
export function buildRationale(result: BusinessScore): string {
  const strengths = topDimensions(result.breakdown, 3);
  const weaknesses = weakDimensions(result.breakdown, 1);

  const strengthText = strengths.map((d) => d.reason).join(' ');
  const weakness = weaknesses[0];
  const weaknessText =
    weakness && weakness.score < 0.5
      ? ` Le point à surveiller : ${DIMENSION_LABELS[weakness.dimension]}. ${weakness.reason}`
      : '';

  return `${strengthText}${weaknessText}`.trim();
}

/** Faits affichés sous la recommandation (section 8.3). */
export function decisionFacts(result: BusinessScore): Array<{ label: string; value: string }> {
  return topDimensions(result.breakdown, 4).map((d) => ({
    label: DIMENSION_LABELS[d.dimension],
    value: `${Math.round(d.score * 100)} %`,
  }));
}
