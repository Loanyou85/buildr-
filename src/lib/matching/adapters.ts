import type { BusinessModel, BusinessTag, Profile } from '@prisma/client';
import type { Dimension, ScorableBusiness, ScoringProfile } from './types';
import { DIMENSIONS } from './types';

type ProfileWithRelations = Profile & {
  skills: Array<{ level: number; skill: { slug: string } }>;
  interests: Array<{ interest: { slug: string } }>;
};

/**
 * Traduit les lignes Prisma en entrées du moteur. Toutes les valeurs
 * manquantes reçoivent un défaut explicite : le moteur ne doit jamais voir
 * `null`, sinon le score devient dépendant de l'ordre de remplissage.
 */
export function toScoringProfile(profile: ProfileWithRelations): ScoringProfile {
  const skills: Record<string, number> = {};
  for (const entry of profile.skills) skills[entry.skill.slug] = entry.level;

  return {
    skills,
    interests: profile.interests.map((i) => i.interest.slug),
    hoursPerWeek: profile.hoursPerWeek ?? 5,
    hoursPerDay: profile.hoursPerDay ?? 1,
    initialBudget: profile.initialBudget ?? 0,
    monthlyBudget: profile.monthlyBudget ?? 0,
    financialGoal: profile.financialGoal ?? 1000,
    timeHorizon: profile.timeHorizon ?? 6,
    riskTolerance: profile.riskTolerance ?? 'medium',
    workMode: profile.workMode ?? 'remote',
    showsFace: profile.showsFace ?? false,
    createsContent: profile.createsContent ?? false,
    prefersSolo: profile.prefersSolo ?? true,
    likesStrangers: profile.likesStrangers ?? false,
    likesSelling: profile.likesSelling ?? false,
    likesCreating: profile.likesCreating ?? false,
    likesAnalyzing: profile.likesAnalyzing ?? false,
    likesRepetition: profile.likesRepetition ?? false,
    prefersFreedom: profile.prefersFreedom ?? true,
    derivedSignals: isSignalRecord(profile.derivedSignals) ? profile.derivedSignals : undefined,
  };
}

export function toScorableBusiness(
  business: BusinessModel & { tags: BusinessTag[] },
): ScorableBusiness {
  return {
    id: business.id,
    slug: business.slug,
    name: business.name,
    difficulty: business.difficulty,
    minBudget: business.minBudget,
    maxBudget: business.maxBudget,
    hoursPerWeekMin: business.hoursPerWeekMin,
    hoursPerWeekMax: business.hoursPerWeekMax,
    timeToFirstClientDays: business.timeToFirstClientDays,
    requiresFace: business.requiresFace,
    requiresContent: business.requiresContent,
    requiresSelling: business.requiresSelling,
    requiresLocalPresence: business.requiresLocalPresence,
    weights: parseWeights(business.scoringWeights),
    tags: business.tags.map((t) => ({ dimension: t.dimension, key: t.key, weight: t.weight })),
  };
}

function parseWeights(value: unknown): Partial<Record<Dimension, number>> {
  if (typeof value !== 'object' || value === null) return {};
  const source = value as Record<string, unknown>;
  const weights: Partial<Record<Dimension, number>> = {};
  for (const dimension of DIMENSIONS) {
    const raw = source[dimension];
    if (typeof raw === 'number' && Number.isFinite(raw) && raw >= 0) weights[dimension] = raw;
  }
  return weights;
}

function isSignalRecord(value: unknown): value is Record<string, number> {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) return false;
  return Object.values(value as Record<string, unknown>).every((v) => typeof v === 'number');
}
