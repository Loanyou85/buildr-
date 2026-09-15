/**
 * Contenu du parcours (section 9). Ce fichier décrit des données, pas du code :
 * le front-end ne connaît rien de tout cela, il lit la base.
 *
 * Exigence de la section 9.3 : chaque action doit être exécutable par
 * quelqu'un qui n'a jamais ouvert un terminal. « Déploie sur Vercel » est
 * interdit. Onze instructions numérotées, c'est le niveau attendu.
 */

export interface ActionSeed {
  instruction: string;
  externalUrl?: string;
  /** Slug d'un gabarit de prompt. Jamais le texte du prompt lui-même. */
  promptTemplateSlug?: string;
  /** Capture annotée servie depuis /public/guides. */
  screenshot?: string;
}

export interface SubStepSeed {
  title: string;
  /** Markdown court : ce qui se passe et pourquoi, avant les actions. */
  body: string;
  actions: ActionSeed[];
}

export interface CheckpointSeed {
  label: string;
  isRequired?: boolean;
  proofKind?: 'none' | 'url' | 'text';
  /** Champ de ProjectState alimenté par la preuve. */
  proofField?: 'projectName' | 'repoUrl' | 'deployUrl' | 'domainName';
}

export interface StepSeed {
  title: string;
  goal: string;
  why: string;
  estimatedMinutes: number;
  difficulty?: 'easy' | 'medium' | 'hard';
  /** Étape propre à un chemin technique. Absent = commune aux deux. */
  techPath?: 'navigateur' | 'ordinateur';
  subSteps: SubStepSeed[];
  checkpoints: CheckpointSeed[];
}

export interface PhaseSeed {
  key: string;
  title: string;
  goal: string;
  outcome: string;
  steps: StepSeed[];
}
