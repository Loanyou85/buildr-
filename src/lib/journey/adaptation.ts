import type { AdjustmentReason } from '@prisma/client';

/**
 * Règles d'adaptation (section 10). Le parcours n'est pas une checklist figée :
 * quand un signal d'exécution est anormal, on propose une amélioration de
 * l'étape en cours. **Jamais un retour en arrière, jamais un reproche.**
 */
export interface AdaptationSignal {
  stepId: string;
  stepNumber: number;
  stepTitle: string;
  status: 'locked' | 'available' | 'in_progress' | 'done';
  startedAt: Date | null;
  lastActivityAt: Date | null;
  outreachSent: number | null;
  outreachReplies: number | null;
  checkpointsTotal: number;
  checkpointsChecked: number;
}

export interface AdaptationProposal {
  stepId: string;
  reason: AdjustmentReason;
  /** Texte affiché tel quel à l'utilisateur. */
  suggestion: string;
}

const DAY = 86_400_000;

/** Volume minimum avant de juger un taux de réponse (cf. étape 13 du parcours UGC). */
const MIN_OUTREACH_FOR_JUDGEMENT = 30;
const LOW_REPLY_RATE = 0.05;
const STALLED_DAYS = 3;
const PARTIAL_CHECKLIST_DAYS = 7;

export function detectAdjustments(signals: AdaptationSignal[], now: Date = new Date()): AdaptationProposal[] {
  const proposals: AdaptationProposal[] = [];

  for (const signal of signals) {
    if (signal.status === 'done' || signal.status === 'locked') continue;

    // Règle 1 — taux de réponse anormalement bas sur la prospection.
    if (
      signal.outreachSent !== null &&
      signal.outreachSent >= MIN_OUTREACH_FOR_JUDGEMENT &&
      (signal.outreachReplies ?? 0) / signal.outreachSent < LOW_REPLY_RATE
    ) {
      proposals.push({
        stepId: signal.stepId,
        reason: 'low_reply_rate',
        suggestion: [
          `On fait une pause sur la prospection. Sur ${signal.outreachSent} messages envoyés, tu as ${signal.outreachReplies ?? 0} réponses : le problème n’est pas le volume, c’est ce que le message propose.`,
          'Reprends ton offre et ton angle pendant 30 minutes, puis repars avec les 20 messages restants. C’est la façon la plus rapide de débloquer cette étape.',
        ].join(' '),
      });
      continue;
    }

    // Règle 2 — étape commencée puis abandonnée depuis plus de trois jours.
    const lastActivity = signal.lastActivityAt ?? signal.startedAt;
    if (signal.status === 'in_progress' && lastActivity && now.getTime() - lastActivity.getTime() > STALLED_DAYS * DAY) {
      const days = Math.floor((now.getTime() - lastActivity.getTime()) / DAY);
      proposals.push({
        stepId: signal.stepId,
        reason: 'stalled_step',
        suggestion: [
          `Ça fait ${days} jours sur l’étape « ${signal.stepTitle} ». C’est souvent le signe qu’elle est trop grosse pour une seule séance.`,
          'On la découpe : fais uniquement la première action aujourd’hui, 15 minutes suffisent. Le reste suivra tout seul.',
        ].join(' '),
      });
      continue;
    }

    // Règle 3 — checklist partiellement cochée depuis plus d'une semaine.
    if (
      signal.checkpointsChecked > 0 &&
      signal.checkpointsChecked < signal.checkpointsTotal &&
      lastActivity &&
      now.getTime() - lastActivity.getTime() > PARTIAL_CHECKLIST_DAYS * DAY
    ) {
      const missing = signal.checkpointsTotal - signal.checkpointsChecked;
      proposals.push({
        stepId: signal.stepId,
        reason: 'partial_checklist',
        suggestion: [
          `Il te reste ${missing} critère${missing > 1 ? 's' : ''} à valider sur cette étape, et rien n’a bougé depuis une semaine.`,
          'Souvent, ce qui reste est le point le plus dur. Ouvre l’assistance sur cette étape : elle te donnera la marche à suivre exacte pour le débloquer.',
        ].join(' '),
      });
    }
  }

  return proposals;
}
