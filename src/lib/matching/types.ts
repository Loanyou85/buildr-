/**
 * Types du moteur de recommandation (section 7).
 * Rien ici ne dépend de Prisma ni du réseau : `score.ts` reste une fonction pure.
 */

export const DIMENSIONS = [
  'skills',
  'interests',
  'behavior',
  'personality',
  'budget',
  'time',
  'risk',
  'marketDemand',
  'monetizationSpeed',
  'acquisition',
  'constraints',
] as const;

export type Dimension = (typeof DIMENSIONS)[number];

export const DIMENSION_LABELS: Record<Dimension, string> = {
  skills: 'compétences',
  interests: 'intérêts',
  behavior: 'comportement',
  personality: 'personnalité',
  budget: 'budget',
  time: 'temps disponible',
  risk: 'tolérance au risque',
  marketDemand: 'demande du marché',
  monetizationSpeed: 'vitesse de monétisation',
  acquisition: 'capacité d’acquisition',
  constraints: 'contraintes personnelles',
};

export type RiskTolerance = 'low' | 'medium' | 'high';
export type WorkMode = 'remote' | 'local' | 'hybrid';
export type Difficulty = 'easy' | 'medium' | 'hard';

export interface ScoringProfile {
  /** slug de compétence → niveau 0-5 */
  skills: Record<string, number>;
  /** slugs d'intérêts déclarés */
  interests: string[];
  hoursPerWeek: number;
  hoursPerDay: number;
  initialBudget: number;
  monthlyBudget: number;
  /** objectif de revenu mensuel, en euros */
  financialGoal: number;
  /** horizon, en mois */
  timeHorizon: number;
  riskTolerance: RiskTolerance;
  workMode: WorkMode;
  showsFace: boolean;
  createsContent: boolean;
  prefersSolo: boolean;
  likesStrangers: boolean;
  likesSelling: boolean;
  likesCreating: boolean;
  likesAnalyzing: boolean;
  likesRepetition: boolean;
  prefersFreedom: boolean;
  /**
   * Signaux extraits des réponses libres par l'IA, normalisés 0-1.
   * Ils pondèrent, ils ne décident pas.
   */
  derivedSignals?: Record<string, number>;
}

export interface BusinessTagInput {
  dimension: string;
  key: string;
  weight: number;
}

export interface ScorableBusiness {
  id: string;
  slug: string;
  name: string;
  difficulty: Difficulty;
  minBudget: number;
  maxBudget: number;
  hoursPerWeekMin: number;
  hoursPerWeekMax: number;
  timeToFirstClientDays: number;
  requiresFace: boolean;
  requiresContent: boolean;
  requiresSelling: boolean;
  requiresLocalPresence: boolean;
  /** Poids par dimension, issus de la base (`scoringWeights`). */
  weights: Partial<Record<Dimension, number>>;
  tags: BusinessTagInput[];
}

export interface DimensionScore {
  dimension: Dimension;
  /** 0-1 */
  score: number;
  /** poids normalisé appliqué */
  weight: number;
  /** contribution au score final, en points sur 100 */
  contribution: number;
  /** raison lisible par un humain, affichable telle quelle */
  reason: string;
}

export interface EliminationReason {
  constraint: 'budget' | 'time' | 'face' | 'content' | 'selling' | 'local';
  message: string;
}

export interface BusinessScore {
  businessId: string;
  slug: string;
  name: string;
  /** 0-100 */
  score: number;
  breakdown: DimensionScore[];
  eliminated: false;
}

export interface EliminatedBusiness {
  businessId: string;
  slug: string;
  name: string;
  eliminated: true;
  reasons: EliminationReason[];
}

export type ScoringResult = BusinessScore | EliminatedBusiness;

export interface RankedRecommendations {
  /** Meilleurs scores, du plus élevé au plus faible, éliminés exclus. */
  ranked: BusinessScore[];
  /** Le premier du classement, présenté comme recommandation principale. */
  primary: BusinessScore | null;
  /** Les suivants, présentés comme alternatives. */
  alternatives: BusinessScore[];
  eliminated: EliminatedBusiness[];
}
