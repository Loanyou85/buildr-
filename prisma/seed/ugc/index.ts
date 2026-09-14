import type { JourneySeed } from './types';
import { phase1 } from './phase-1-positionnement';
import { phase2 } from './phase-2-offre';
import { phase3 } from './phase-3-identite';
import { phase4 } from './phase-4-prospection';
import { phase5 } from './phase-5-conversion';
import { phase6 } from './phase-6-livraison';

/**
 * Parcours de démonstration entièrement détaillé (section 14) : agence UGC,
 * budget 0 €, niveau débutant, du jour 1 au premier client. 22 étapes, scripts
 * et templates réels. C'est ce parcours qui démontre la profondeur du moteur.
 */
export const ugcJourney: JourneySeed = {
  name: 'Agence UGC — de zéro au premier client',
  budgetTier: 'zero',
  experienceTier: 'beginner',
  phases: [phase1, phase2, phase3, phase4, phase5, phase6],
};

/**
 * Variante budget 300 € : mêmes phases, instructions condensées et outils
 * payants. Elle existe pour prouver que les variantes sont des données, pas
 * des `if` dans le code (section 6.4).
 */
export const ugcJourneyLowBudget: JourneySeed = {
  name: 'Agence UGC — démarrage avec outils payants',
  budgetTier: 'low',
  experienceTier: 'intermediate',
  phases: [
    {
      title: phase1.title,
      goal: phase1.goal,
      steps: phase1.steps,
    },
    phase2,
    {
      title: phase3.title,
      goal: phase3.goal,
      steps: phase3.steps.map((step) =>
        step.number === 9
          ? {
              ...step,
              subSteps: step.subSteps.map((sub) =>
                sub.title === 'Créer la page'
                  ? {
                      ...sub,
                      body: `${sub.body}\n\nAvec un budget, une page dédiée (Framer, Carrd) remplace Notion : le rendu est plus proche d’un site professionnel et le lien est plus court.`,
                    }
                  : sub,
              ),
            }
          : step,
      ),
    },
    phase4,
    phase5,
    phase6,
  ],
};

export type { JourneySeed } from './types';
