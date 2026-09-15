/**
 * Gabarits de prompts (section 11.4).
 *
 * Architecture hybride, non négociable : le corps du prompt est écrit ici, à
 * la main, avec des variables `{{ }}`. Le modèle ne réécrit jamais librement
 * un prompt de configuration — un prompt cassé casse le projet d'un
 * utilisateur qui n'a aucun moyen de s'en rendre compte.
 */
export interface PromptTemplateSeed {
  slug: string;
  /** Bloc du pack séquencé (section 11.3). */
  blockKey: string;
  order: number;
  title: string;
  objective: string;
  target: 'claude_code' | 'replit' | 'claude_web';
  body: string;
  expectedOutcome: string;
  verification: string;
  isRepair?: boolean;
}

export { BLOCKS } from '../../../src/lib/prompts/blocks';

/**
 * Rappel de contexte collé en tête de chaque prompt (règle 11.8 : chaque
 * prompt est autonome, l'utilisateur peut avoir fermé sa session entre deux
 * étapes).
 */
export const CONTEXTE = `Je construis un produit web appelé {{projectName}}.

En une phrase : {{ideaOneLiner}}
Mon client : {{targetAudience}}
Le problème que je règle : {{problem}}
Ce que fait le produit : {{solution}}
Prix envisagé : {{monthlyPrice}} € par mois.

Je ne sais pas coder. Écris le code à ma place, complet, sans me demander de
remplir des trous. Si tu as besoin d'une décision, prends la plus simple et
dis-moi en une ligne ce que tu as décidé.`;
