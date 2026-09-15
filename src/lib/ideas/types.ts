/**
 * Types du moteur d'idées (section 8).
 *
 * Aucun import Prisma ici : le moteur est une fonction pure, testable sans
 * base de données. Les adaptateurs font la traduction (`adapters.ts`).
 */

export type DomainSource = 'metier' | 'etudes' | 'passion' | 'entourage';
export type PayerType = 'business' | 'professional' | 'consumer';
export type RiskTolerance = 'low' | 'medium' | 'high';

export const DIMENSIONS = [
  'problemAccess',
  'customerAccess',
  'noCodeFeasibility',
  'timeToRevenue',
  'willingnessToPay',
  'timeFit',
  'budgetFit',
  'personalFit',
] as const;

export type Dimension = (typeof DIMENSIONS)[number];

export const DIMENSION_LABELS: Record<Dimension, string> = {
  problemAccess: 'Accès au problème',
  customerAccess: 'Accès aux premiers clients',
  noCodeFeasibility: 'Faisabilité sans coder',
  timeToRevenue: 'Temps jusqu’au premier euro',
  willingnessToPay: 'Disposition à payer',
  timeFit: 'Compatibilité temps',
  budgetFit: 'Compatibilité budget',
  personalFit: 'Compatibilité personnelle',
};

/** Poids par dimension. Ils viennent de la base, jamais du code (section 8.2). */
export type Weights = Record<Dimension, number>;

export interface ProfileDomain {
  slug: string;
  yearsExposure: number;
  source: DomainSource;
}

export interface ProfileSkill {
  slug: string;
  /** 0 à 5. */
  level: number;
}

export interface ProfileInput {
  domains: ProfileDomain[];
  skills: ProfileSkill[];
  interests: string[];
  /**
   * Signaux normalisés extraits des réponses libres « ce qui l'agace ».
   * C'est le seul endroit où l'IA intervient en amont : elle transforme du
   * texte en clés, elle ne note rien (section 8.2).
   */
  frictionSignals: string[];
  hoursPerWeek: number;
  budget: number;
  /** 0 à 5. Pilote aussi le chemin technique proposé (section 9.2). */
  technicalLevel: number;
  /** Objectif de revenu mensuel, en euros. */
  goalRevenue: number;
  /** Horizon, en mois. */
  timeHorizon: number;
  riskTolerance: RiskTolerance;
  showsFace: boolean;
  prefersSolo: boolean;
  /** Combien de personnes concernées il peut appeler demain. */
  reachableCount: number;
}

export interface BlueprintTag {
  /** skill | interest | friction */
  dimension: string;
  key: string;
  weight: number;
}

export interface BlueprintInput {
  slug: string;
  title: string;
  /** Secteurs auxquels l'idée appartient. */
  domains: string[];
  tags: BlueprintTag[];
  monthlyPrice: number;
  /** 1 (trivial) à 5 (limite haute du parcours). */
  buildComplexity: number;
  weeksToFirstEuro: number;
  payerType: PayerType;
  hoursPerWeekMin: number;
  monthlyFixedCost: number;
  requiresComplexCode: boolean;
  requiresRegulatedLicense: boolean;
  requiresPhysicalStock: boolean;
  requiresTeam: boolean;
  requiresFace: boolean;
  requiresOutbound: boolean;
}

export interface DimensionScore {
  dimension: Dimension;
  /** 0 à 1. */
  value: number;
  weight: number;
  /** value × weight, avant normalisation. */
  contribution: number;
  /** Phrase courte, affichée telle quelle dans la restitution. */
  explanation: string;
}

/** Traçabilité obligatoire (section 8.3). */
export interface Evidence {
  dimension: Dimension;
  evidence: string;
}

export interface ScoredIdea {
  slug: string;
  /** 0 à 100. */
  score: number;
  breakdown: DimensionScore[];
  evidences: Evidence[];
  eliminated: boolean;
  /** Contraintes dures violées, vide si l'idée passe. */
  eliminationReasons: string[];
}
