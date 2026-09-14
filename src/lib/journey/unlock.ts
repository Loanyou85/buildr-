import type { StepStatus } from '@prisma/client';

export interface UnlockConditions {
  /** Numéros d'étapes qui doivent être terminées. */
  requiresStepNumbers?: number[];
  /** Identifiants de checkpoints qui doivent être cochés. */
  requiresCheckpoints?: string[];
}

export function parseUnlockConditions(value: unknown): UnlockConditions {
  if (typeof value !== 'object' || value === null) return {};
  const source = value as Record<string, unknown>;
  const numbers = Array.isArray(source.requiresStepNumbers)
    ? source.requiresStepNumbers.filter((n): n is number => typeof n === 'number')
    : undefined;
  const checkpoints = Array.isArray(source.requiresCheckpoints)
    ? source.requiresCheckpoints.filter((c): c is string => typeof c === 'string')
    : undefined;
  return { requiresStepNumbers: numbers, requiresCheckpoints: checkpoints };
}

export interface StepUnlockInput {
  stepNumber: number;
  conditions: UnlockConditions;
  /** Numéros d'étapes déjà terminées. */
  completedStepNumbers: number[];
  checkedCheckpointIds: string[];
}

/** Une étape est disponible quand toutes ses conditions sont satisfaites. */
export function isUnlocked({ conditions, completedStepNumbers, checkedCheckpointIds }: StepUnlockInput): boolean {
  const completed = new Set(completedStepNumbers);
  const checked = new Set(checkedCheckpointIds);

  const stepsOk = (conditions.requiresStepNumbers ?? []).every((n) => completed.has(n));
  const checkpointsOk = (conditions.requiresCheckpoints ?? []).every((id) => checked.has(id));
  return stepsOk && checkpointsOk;
}

/**
 * Une étape terminée le reste. Le statut ne redescend jamais de `done` :
 * l'utilisateur ne doit jamais avoir l'impression de reculer (section 2).
 */
export function nextStatus(current: StepStatus, unlocked: boolean): StepStatus {
  if (current === 'done') return 'done';
  if (current === 'in_progress') return 'in_progress';
  return unlocked ? 'available' : 'locked';
}
