import 'server-only';
import { askAI } from './client';

/**
 * Transforme les réponses libres d'onboarding en signaux structurés 0-1
 * (section 7, « l'IA intervient en amont »). Elle ne score pas : elle nuance.
 * Sans clé API, une heuristique lexicale locale prend le relais.
 */
export interface DerivedSignals {
  interest_alignment?: number;
  execution_appetite?: number;
  content_comfort?: number;
  commercial_comfort?: number;
  technical_comfort?: number;
}

const LEXICON: Array<{ signal: keyof DerivedSignals; words: string[] }> = [
  { signal: 'content_comfort', words: ['vidéo', 'video', 'montage', 'photo', 'filmer', 'instagram', 'tiktok', 'écrire', 'ecrire', 'contenu'] },
  { signal: 'commercial_comfort', words: ['vendre', 'vente', 'client', 'négocier', 'negocier', 'convaincre', 'conseiller', 'organiser pour'] },
  { signal: 'technical_comfort', words: ['ordinateur', 'code', 'logiciel', 'excel', 'tableur', 'réparer', 'reparer', 'configurer', 'installer'] },
  { signal: 'execution_appetite', words: ['tous les jours', 'chaque semaine', 'régulièrement', 'regulierement', 'habitude', 'discipline', 'sport'] },
];

/** Repli local : lisible, reproductible, sans réseau. */
export function heuristicSignals(answers: string[]): DerivedSignals {
  const text = answers.join(' ').toLowerCase();
  const signals: DerivedSignals = {};

  for (const { signal, words } of LEXICON) {
    const hits = words.filter((word) => text.includes(word)).length;
    if (hits > 0) signals[signal] = Math.min(1, 0.5 + hits * 0.15);
  }

  // Une réponse développée traduit un engagement ; une réponse d'un mot, non.
  const averageLength = answers.length > 0 ? text.length / answers.length : 0;
  signals.execution_appetite = Math.min(1, Math.max(signals.execution_appetite ?? 0.5, averageLength > 80 ? 0.7 : 0.45));

  return signals;
}

export async function extractSignals(
  answers: Array<{ question: string; answer: string }>,
): Promise<DerivedSignals> {
  const texts = answers.map((a) => a.answer).filter((a) => a.trim().length > 0);
  if (texts.length === 0) return {};

  const fallback = heuristicSignals(texts);

  const raw = await askAI({
    system: [
      'Tu analyses des réponses libres pour en extraire des signaux numériques.',
      'Tu réponds UNIQUEMENT par un objet JSON, sans texte autour.',
      'Clés autorisées : interest_alignment, execution_appetite, content_comfort, commercial_comfort, technical_comfort.',
      'Chaque valeur est un nombre entre 0 et 1. Omets une clé si la réponse ne dit rien à son sujet.',
      'Tu ne recommandes aucune activité et tu n’attribues aucun score de business : ce n’est pas ton rôle.',
    ].join('\n'),
    prompt: answers.map((a) => `Question : ${a.question}\nRéponse : ${a.answer}`).join('\n\n'),
    maxTokens: 300,
  });

  if (!raw) return fallback;

  try {
    const jsonStart = raw.indexOf('{');
    const jsonEnd = raw.lastIndexOf('}');
    if (jsonStart === -1 || jsonEnd === -1) return fallback;
    const parsed: unknown = JSON.parse(raw.slice(jsonStart, jsonEnd + 1));
    if (typeof parsed !== 'object' || parsed === null) return fallback;

    const result: DerivedSignals = { ...fallback };
    for (const [key, value] of Object.entries(parsed as Record<string, unknown>)) {
      if (key in fallback || ['interest_alignment', 'execution_appetite', 'content_comfort', 'commercial_comfort', 'technical_comfort'].includes(key)) {
        if (typeof value === 'number' && Number.isFinite(value)) {
          result[key as keyof DerivedSignals] = Math.max(0, Math.min(1, value));
        }
      }
    }
    return result;
  } catch {
    return fallback;
  }
}
