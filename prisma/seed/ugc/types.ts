import type { BudgetTier, Difficulty, ExperienceTier, ResourceType } from '@prisma/client';

export interface ActionSeed {
  instruction: string;
  externalUrl?: string;
  templateRef?: string;
  example?: string;
}

export interface SubStepSeed {
  title: string;
  /** markdown */
  body: string;
  actions: ActionSeed[];
}

export interface CheckpointSeed {
  label: string;
  isRequired?: boolean;
}

export interface ResourceSeed {
  type: ResourceType;
  title: string;
  url?: string;
  body?: string;
}

export interface StepSeed {
  number: number;
  title: string;
  goal: string;
  why: string;
  estimatedMinutes: number;
  difficulty?: Difficulty;
  subSteps: SubStepSeed[];
  checkpoints: CheckpointSeed[];
  resources?: ResourceSeed[];
}

export interface PhaseSeed {
  title: string;
  goal: string;
  steps: StepSeed[];
}

export interface JourneySeed {
  name: string;
  budgetTier: BudgetTier;
  experienceTier: ExperienceTier;
  phases: PhaseSeed[];
}
