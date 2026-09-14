import 'server-only';
import { askAI } from './client';
import { stripForbiddenClaims } from '@/lib/guardrails';

export interface AssistantContext {
  businessName: string;
  budgetLabel: string;
  goalLabel: string;
  stepNumber: number;
  stepTitle: string;
  stepGoal: string;
  stepWhy: string;
  subSteps: Array<{ title: string; body: string; actions: Array<{ instruction: string; example: string | null; externalUrl: string | null }> }>;
  checkpoints: Array<{ label: string; checked: boolean }>;
  resources: Array<{ type: string; title: string; body: string | null; url: string | null }>;
  previousSteps: Array<{ number: number; title: string; done: boolean }>;
}

const SYSTEM = [
  'Tu es l’assistance de Nexteo. Tu accompagnes une personne sur UNE étape précise de son parcours de création d’entreprise.',
  '',
  'Règles absolues :',
  '- Tu réponds UNIQUEMENT sur l’étape en cours et son contenu, qui t’est fourni intégralement.',
  '- Tu donnes des instructions exécutables, numérotées, avec les outils exacts à ouvrir et les critères précis. Jamais de généralités.',
  '- Tu termines toujours en disant quoi faire ensuite et quand revenir valider.',
  '- Tu ne promets JAMAIS de revenu, de montant, de rapidité de gain. Les mots « riche », « revenus passifs », « argent facile », « liberté financière » sont interdits.',
  '- Tu ne fais jamais honte à la personne et tu n’emploies aucun vocabulaire de retard ou d’échec.',
  '- Si la question sort de l’étape, tu ramènes vers ce qu’il y a à faire maintenant.',
  '- Tu tutoies. Ton concret, direct, pratique.',
  '- Tu n’inventes ni chiffre, ni source, ni outil qui ne soit pas dans le contenu fourni.',
].join('\n');

function renderContext(context: AssistantContext): string {
  return [
    `Activité : ${context.businessName}. Budget : ${context.budgetLabel}. Objectif : ${context.goalLabel}.`,
    '',
    `ÉTAPE EN COURS — ${context.stepNumber}. ${context.stepTitle}`,
    `Objectif de l’étape : ${context.stepGoal}`,
    `Pourquoi : ${context.stepWhy}`,
    '',
    'CONTENU INTÉGRAL DE L’ÉTAPE :',
    ...context.subSteps.flatMap((sub) => [
      `## ${sub.title}`,
      sub.body,
      ...sub.actions.map(
        (action, index) =>
          `${index + 1}. ${action.instruction}${action.example ? ` (exemple : ${action.example})` : ''}${action.externalUrl ? ` [${action.externalUrl}]` : ''}`,
      ),
      '',
    ]),
    'CRITÈRES DE VALIDATION :',
    ...context.checkpoints.map((c) => `- [${c.checked ? 'x' : ' '}] ${c.label}`),
    '',
    ...(context.resources.length > 0
      ? [
          'RESSOURCES DISPONIBLES :',
          ...context.resources.map((r) => `- ${r.type} — ${r.title}${r.body ? `\n${r.body}` : ''}${r.url ? ` ${r.url}` : ''}`),
          '',
        ]
      : []),
    'ÉTAPES PRÉCÉDENTES :',
    ...context.previousSteps.map((s) => `- ${s.number}. ${s.title} — ${s.done ? 'validée' : 'non validée'}`),
  ].join('\n');
}

/**
 * Réponse de repli sans IA : on rend l'étape sous forme de marche à suivre.
 * C'est cohérent avec le produit — tout ce qu'il faut savoir est déjà dans le
 * chemin, l'assistance ne fait que le pointer (section 8.7).
 */
export function deterministicAnswer(context: AssistantContext): string {
  const firstUnchecked = context.checkpoints.find((c) => !c.checked);
  const lines: string[] = [
    `Tu es à l’étape « ${context.stepTitle} ». Fais exactement ceci :`,
    '',
  ];

  let counter = 1;
  for (const sub of context.subSteps) {
    for (const action of sub.actions.slice(0, 8)) {
      lines.push(
        `${counter}. ${action.instruction}${action.example ? ` Exemple : ${action.example}` : ''}${action.externalUrl ? ` → ${action.externalUrl}` : ''}`,
      );
      counter += 1;
      if (counter > 10) break;
    }
    if (counter > 10) break;
  }

  lines.push('');
  lines.push(
    firstUnchecked
      ? `Quand tu as fait ça, reviens ici et coche « ${firstUnchecked.label} ».`
      : 'Tous tes critères sont cochés : reviens sur l’étape et valide-la.',
  );

  return lines.join('\n');
}

export async function answerWithContext(context: AssistantContext, question: string): Promise<string> {
  const fallback = deterministicAnswer(context);

  const text = await askAI({
    system: SYSTEM,
    prompt: [renderContext(context), '', `QUESTION DE LA PERSONNE : ${question}`].join('\n'),
    maxTokens: 1200,
  });

  if (!text) return fallback;

  const cleaned = stripForbiddenClaims(text);
  return cleaned.length > 40 ? cleaned : fallback;
}
