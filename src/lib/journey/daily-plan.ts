/**
 * Plan du jour : découpe l'étape courante en tâches qui tiennent dans le temps
 * quotidien déclaré. C'est ce que l'écran « Aujourd'hui » affiche, et c'est la
 * réponse permanente à « qu'est-ce que je dois faire maintenant ? ».
 */
export interface PlanTaskInput {
  id: string;
  label: string;
  estimatedMinutes: number;
  done: boolean;
}

export interface DailyTask {
  id: string;
  label: string;
  estimatedMinutes: number;
  done: boolean;
}

export interface DailyPlanResult {
  tasks: DailyTask[];
  estimatedMinutes: number;
  /** Nombre de tâches restantes après celles du jour. */
  remainingAfter: number;
}

export function buildDailyPlan(
  candidates: PlanTaskInput[],
  availableMinutes: number,
  options: { minTasks?: number; maxTasks?: number } = {},
): DailyPlanResult {
  const minTasks = options.minTasks ?? 1;
  const maxTasks = options.maxTasks ?? 5;
  const pending = candidates.filter((task) => !task.done);

  const tasks: DailyTask[] = [];
  let total = 0;

  for (const task of pending) {
    const wouldExceed = total + task.estimatedMinutes > availableMinutes;
    if (tasks.length >= maxTasks) break;
    if (wouldExceed && tasks.length >= minTasks) break;
    tasks.push({ ...task });
    total += task.estimatedMinutes;
  }

  return {
    tasks,
    estimatedMinutes: total,
    remainingAfter: Math.max(0, pending.length - tasks.length),
  };
}
