import 'server-only';
import Anthropic from '@anthropic-ai/sdk';

/**
 * Accès au modèle, serveur uniquement (section 3). La clé n'est jamais
 * exposée au client : tous les appels passent par des Server Actions.
 *
 * Tout est optionnel. Sans clé, le produit fonctionne : le moteur d'idées est
 * déterministe et n'a pas besoin du modèle, et les écrans qui s'en servent le
 * disent franchement plutôt que d'inventer.
 */
let client: Anthropic | null = null;

export function aiEnabled(): boolean {
  return Boolean(process.env.ANTHROPIC_API_KEY?.trim());
}

export function getAi(): Anthropic | null {
  if (!aiEnabled()) return null;
  client ??= new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });
  return client;
}

export const AI_MODEL = process.env.ANTHROPIC_MODEL?.trim() || 'claude-sonnet-5';

/**
 * Un appel texte, avec une sortie bornée. Renvoie null plutôt que de lever :
 * aucun écran ne doit tomber parce que le modèle est indisponible.
 */
export async function askText(system: string, user: string, maxTokens = 1500): Promise<string | null> {
  const ai = getAi();
  if (!ai) return null;
  try {
    const response = await ai.messages.create({
      model: AI_MODEL,
      max_tokens: maxTokens,
      system,
      messages: [{ role: 'user', content: user }],
    });
    const text = response.content
      .filter((block): block is Anthropic.TextBlock => block.type === 'text')
      .map((block) => block.text)
      .join('\n')
      .trim();
    return text.length > 0 ? text : null;
  } catch {
    return null;
  }
}

/**
 * Un appel dont la sortie est validée avant d'être utilisée. Le modèle ne
 * décide de rien : sa sortie traverse un schéma strict, et tout ce qui ne
 * passe pas est jeté (section 11.4).
 */
export async function askJson<T>(
  system: string,
  user: string,
  parse: (value: unknown) => T | null,
  maxTokens = 2000,
): Promise<T | null> {
  const raw = await askText(
    `${system}\n\nRéponds uniquement avec du JSON valide, sans texte autour.`,
    user,
    maxTokens,
  );
  if (!raw) return null;
  const match = /\{[\s\S]*\}|\[[\s\S]*\]/.exec(raw);
  if (!match) return null;
  try {
    return parse(JSON.parse(match[0]));
  } catch {
    return null;
  }
}
