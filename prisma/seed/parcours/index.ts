import { PHASES_1_3 } from './phases-1-3';
import { PHASES_4_6 } from './phases-4-6';
import { PHASES_7_9 } from './phases-7-9';
import { PHASES_10_13 } from './phases-10-13';
import type { PhaseSeed } from './types';

/** Le parcours unique de la section 9, dans l'ordre de ses treize phases. */
export const PARCOURS: PhaseSeed[] = [...PHASES_1_3, ...PHASES_4_6, ...PHASES_7_9, ...PHASES_10_13];

export type { ActionSeed, CheckpointSeed, PhaseSeed, StepSeed, SubStepSeed } from './types';
