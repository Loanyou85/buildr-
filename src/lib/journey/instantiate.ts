import type { BudgetTier, ExperienceTier } from '@prisma/client';

/**
 * Choix du parcours adapté au profil (section 6.4). Le budget et le niveau
 * choisissent une ligne `Journey`, jamais une branche de code.
 */
export function budgetTierFor(initialBudget: number): BudgetTier {
  if (initialBudget >= 1500) return 'high';
  if (initialBudget >= 200) return 'low';
  return 'zero';
}

export function experienceTierFor(skillLevels: number[]): ExperienceTier {
  if (skillLevels.length === 0) return 'beginner';
  const average = skillLevels.reduce((sum, level) => sum + level, 0) / skillLevels.length;
  if (average >= 3.5) return 'advanced';
  if (average >= 2) return 'intermediate';
  return 'beginner';
}

/**
 * Ordre de repli quand la variante exacte n'existe pas encore : on descend vers
 * le parcours le plus détaillé et le moins coûteux plutôt que de ne rien
 * proposer. L'utilisateur a toujours un chemin.
 */
export function fallbackOrder(budget: BudgetTier, experience: ExperienceTier): Array<{ budgetTier: BudgetTier; experienceTier: ExperienceTier }> {
  const budgets: BudgetTier[] = budget === 'high' ? ['high', 'low', 'zero'] : budget === 'low' ? ['low', 'zero', 'high'] : ['zero', 'low', 'high'];
  const experiences: ExperienceTier[] =
    experience === 'advanced'
      ? ['advanced', 'intermediate', 'beginner']
      : experience === 'intermediate'
        ? ['intermediate', 'beginner', 'advanced']
        : ['beginner', 'intermediate', 'advanced'];

  const combos: Array<{ budgetTier: BudgetTier; experienceTier: ExperienceTier }> = [];
  for (const b of budgets) for (const e of experiences) combos.push({ budgetTier: b, experienceTier: e });
  return combos;
}
