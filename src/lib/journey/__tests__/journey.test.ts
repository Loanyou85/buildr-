import { describe, expect, it } from 'vitest';
import { computeProgressPercent, progressLabel } from '../progress';
import { buildDailyPlan } from '../daily-plan';
import { isUnlocked, nextStatus, parseUnlockConditions } from '../unlock';
import { detectAdjustments, type AdaptationSignal } from '../adaptation';

describe('progression', () => {
  it('ne recule jamais, même si le calcul baisse', () => {
    const percent = computeProgressPercent({
      totalSteps: 22,
      completedSteps: 2,
      previousPercent: 40,
    });
    expect(percent).toBe(40);
  });

  it('avance quand une étape est terminée', () => {
    const before = computeProgressPercent({ totalSteps: 10, completedSteps: 2, previousPercent: 0 });
    const after = computeProgressPercent({ totalSteps: 10, completedSteps: 3, previousPercent: before });
    expect(after).toBeGreaterThan(before);
  });

  it('prend en compte les checkpoints cochés de l’étape en cours', () => {
    const none = computeProgressPercent({ totalSteps: 10, completedSteps: 1, previousPercent: 0 });
    const half = computeProgressPercent({
      totalSteps: 10,
      completedSteps: 1,
      currentStepCheckedRatio: 0.5,
      previousPercent: 0,
    });
    expect(half).toBeGreaterThan(none);
  });

  it('plafonne à 100', () => {
    expect(
      computeProgressPercent({ totalSteps: 5, completedSteps: 5, currentStepCheckedRatio: 1, previousPercent: 0 }),
    ).toBe(100);
  });

  it('n’emploie jamais de vocabulaire d’échec', () => {
    for (const percent of [0, 10, 50, 80, 100]) {
      const label = progressLabel(percent);
      expect(label).not.toMatch(/retard|échec|abandon/i);
    }
  });
});

describe('déblocage', () => {
  it('lit les conditions stockées en JSON', () => {
    expect(parseUnlockConditions({ requiresStepNumbers: [1, 2] })).toEqual({
      requiresStepNumbers: [1, 2],
      requiresCheckpoints: undefined,
    });
    expect(parseUnlockConditions(null)).toEqual({});
  });

  it('déverrouille quand les étapes requises sont terminées', () => {
    expect(
      isUnlocked({
        stepNumber: 3,
        conditions: { requiresStepNumbers: [2] },
        completedStepNumbers: [1, 2],
        checkedCheckpointIds: [],
      }),
    ).toBe(true);
  });

  it('garde verrouillé quand une étape requise manque', () => {
    expect(
      isUnlocked({
        stepNumber: 3,
        conditions: { requiresStepNumbers: [2] },
        completedStepNumbers: [1],
        checkedCheckpointIds: [],
      }),
    ).toBe(false);
  });

  it('une étape terminée le reste, quoi qu’il arrive', () => {
    expect(nextStatus('done', false)).toBe('done');
  });
});

describe('plan du jour', () => {
  const tasks = [
    { id: 'a', label: 'Trouver 10 prospects', estimatedMinutes: 25, done: false },
    { id: 'b', label: 'Personnaliser le message', estimatedMinutes: 18, done: false },
    { id: 'c', label: 'Envoyer 10 messages', estimatedMinutes: 15, done: false },
    { id: 'd', label: 'Mettre à jour le tableau', estimatedMinutes: 10, done: false },
  ];

  it('tient dans le temps disponible', () => {
    const plan = buildDailyPlan(tasks, 60);
    expect(plan.estimatedMinutes).toBeLessThanOrEqual(60);
    expect(plan.tasks.length).toBeGreaterThan(0);
  });

  it('propose au moins une tâche même si elle dépasse le temps disponible', () => {
    const plan = buildDailyPlan([{ id: 'x', label: 'Tourner 3 vidéos', estimatedMinutes: 240, done: false }], 30);
    expect(plan.tasks).toHaveLength(1);
  });

  it('ignore les tâches déjà faites', () => {
    const plan = buildDailyPlan([{ ...tasks[0]!, done: true }, tasks[1]!], 60);
    expect(plan.tasks.map((t) => t.id)).toEqual(['b']);
  });

  it('indique ce qui reste après le plan du jour', () => {
    const plan = buildDailyPlan(tasks, 30);
    expect(plan.remainingAfter).toBeGreaterThan(0);
  });
});

describe('adaptation', () => {
  const now = new Date('2026-03-10T09:00:00Z');
  const base: AdaptationSignal = {
    stepId: 'step-13',
    stepNumber: 13,
    stepTitle: 'Envoyer tes 50 messages',
    status: 'in_progress',
    startedAt: new Date('2026-03-09T09:00:00Z'),
    lastActivityAt: new Date('2026-03-09T09:00:00Z'),
    outreachSent: null,
    outreachReplies: null,
    checkpointsTotal: 4,
    checkpointsChecked: 0,
  };

  it('détecte un taux de réponse anormalement bas', () => {
    const [proposal] = detectAdjustments([{ ...base, outreachSent: 40, outreachReplies: 1 }], now);
    expect(proposal?.reason).toBe('low_reply_rate');
    expect(proposal?.suggestion).toContain('pause sur la prospection');
  });

  it('ne juge pas un taux de réponse avant 30 envois', () => {
    expect(detectAdjustments([{ ...base, outreachSent: 12, outreachReplies: 0 }], now)).toHaveLength(0);
  });

  it('détecte une étape abandonnée depuis plus de trois jours', () => {
    const [proposal] = detectAdjustments(
      [{ ...base, lastActivityAt: new Date('2026-03-05T09:00:00Z') }],
      now,
    );
    expect(proposal?.reason).toBe('stalled_step');
  });

  it('détecte une checklist partiellement cochée depuis plus d’une semaine', () => {
    const [proposal] = detectAdjustments(
      [
        {
          ...base,
          status: 'available',
          checkpointsChecked: 2,
          lastActivityAt: new Date('2026-03-01T09:00:00Z'),
        },
      ],
      now,
    );
    expect(proposal?.reason).toBe('partial_checklist');
  });

  it('ne propose rien sur une étape terminée', () => {
    expect(detectAdjustments([{ ...base, status: 'done', outreachSent: 50, outreachReplies: 0 }], now)).toHaveLength(0);
  });

  it('formule toujours une amélioration, jamais un reproche', () => {
    const proposals = detectAdjustments(
      [
        { ...base, outreachSent: 40, outreachReplies: 1 },
        { ...base, stepId: 'step-8', lastActivityAt: new Date('2026-03-01T09:00:00Z') },
      ],
      now,
    );
    expect(proposals.length).toBeGreaterThan(0);
    for (const proposal of proposals) {
      expect(proposal.suggestion).not.toMatch(/tu n’as pas|échec|retard|dommage/i);
    }
  });
});
