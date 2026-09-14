import { evaluateHardConstraints } from './constraints';
import { DIMENSION_SCORERS } from './dimensions';
import {
  DIMENSIONS,
  type BusinessScore,
  type Dimension,
  type DimensionScore,
  type EliminatedBusiness,
  type RankedRecommendations,
  type ScorableBusiness,
  type ScoringProfile,
  type ScoringResult,
} from './types';

/**
 * Poids par défaut, utilisés quand un business model n'en déclare pas.
 * Les poids réels viennent de la base (`BusinessModel.scoringWeights`) :
 * ajouter un business model est une insertion, jamais une modification de code.
 */
export const DEFAULT_WEIGHTS: Record<Dimension, number> = {
  skills: 1.2,
  interests: 1,
  behavior: 1.3,
  personality: 0.8,
  budget: 1.1,
  time: 1.1,
  risk: 0.7,
  marketDemand: 1,
  monetizationSpeed: 1.2,
  acquisition: 1,
  constraints: 0.9,
};

function normalizedWeights(business: ScorableBusiness): Record<Dimension, number> {
  const raw = {} as Record<Dimension, number>;
  for (const dimension of DIMENSIONS) {
    const declared = business.weights[dimension];
    raw[dimension] = typeof declared === 'number' && declared >= 0 ? declared : DEFAULT_WEIGHTS[dimension];
  }
  const total = DIMENSIONS.reduce((sum, d) => sum + raw[d], 0);
  if (total === 0) {
    const equal = 1 / DIMENSIONS.length;
    return DIMENSIONS.reduce((acc, d) => ({ ...acc, [d]: equal }), {} as Record<Dimension, number>);
  }
  return DIMENSIONS.reduce(
    (acc, d) => ({ ...acc, [d]: raw[d] / total }),
    {} as Record<Dimension, number>,
  );
}

/**
 * Score d'un business model pour un profil. **Fonction pure** : mêmes entrées,
 * même sortie, aucun accès réseau, aucune horloge. L'IA n'intervient ni ici ni
 * dans le classement (section 7).
 */
export function scoreBusiness(profile: ScoringProfile, business: ScorableBusiness): ScoringResult {
  const eliminations = evaluateHardConstraints(profile, business);
  if (eliminations.length > 0) {
    return {
      businessId: business.id,
      slug: business.slug,
      name: business.name,
      eliminated: true,
      reasons: eliminations,
    } satisfies EliminatedBusiness;
  }

  const weights = normalizedWeights(business);
  const breakdown: DimensionScore[] = DIMENSIONS.map((dimension) => {
    const { score, reason } = DIMENSION_SCORERS[dimension](profile, business);
    const bounded = Math.max(0, Math.min(1, score));
    const weight = weights[dimension];
    return {
      dimension,
      score: round(bounded, 4),
      weight: round(weight, 4),
      contribution: round(bounded * weight * 100, 2),
      reason,
    };
  });

  const score = round(
    breakdown.reduce((sum, d) => sum + d.contribution, 0),
    2,
  );

  return {
    businessId: business.id,
    slug: business.slug,
    name: business.name,
    score,
    breakdown,
    eliminated: false,
  } satisfies BusinessScore;
}

/**
 * Classe tous les business models du référentiel. Sortie : les trois meilleurs
 * scores, dont un présenté comme recommandation principale (section 7).
 */
export function rankBusinesses(
  profile: ScoringProfile,
  businesses: ScorableBusiness[],
  options: { take?: number; exclude?: string[] } = {},
): RankedRecommendations {
  const take = options.take ?? 3;
  const excluded = new Set(options.exclude ?? []);

  const results = businesses
    .filter((b) => !excluded.has(b.id))
    .map((business) => scoreBusiness(profile, business));

  const ranked = results
    .filter((r): r is BusinessScore => !r.eliminated)
    // Départage déterministe : à score égal, l'ordre alphabétique du slug tranche.
    .sort((a, b) => b.score - a.score || a.slug.localeCompare(b.slug))
    .slice(0, take);

  const eliminated = results.filter((r): r is EliminatedBusiness => r.eliminated);

  return {
    ranked,
    primary: ranked[0] ?? null,
    alternatives: ranked.slice(1),
    eliminated,
  };
}

/** Les dimensions qui portent le plus la décision, pour l'explication. */
export function topDimensions(breakdown: DimensionScore[], count = 3): DimensionScore[] {
  return [...breakdown].sort((a, b) => b.contribution - a.contribution).slice(0, count);
}

/** Les dimensions les plus faibles : ce sont les points de vigilance honnêtes. */
export function weakDimensions(breakdown: DimensionScore[], count = 2): DimensionScore[] {
  return [...breakdown]
    .filter((d) => d.weight > 0.02)
    .sort((a, b) => a.score - b.score)
    .slice(0, count);
}

function round(value: number, decimals: number): number {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}
