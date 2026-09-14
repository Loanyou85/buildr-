import 'server-only';
import Anthropic from '@anthropic-ai/sdk';

/**
 * Client IA — **serveur uniquement**. Aucune clé n'existe côté client
 * (section 3). Le produit fonctionne sans clé : chaque appelant fournit un
 * repli déterministe, parce que le chemin ne doit jamais dépendre du réseau.
 */
let client: Anthropic | null = null;

export function aiAvailable(): boolean {
  return Boolean(process.env.ANTHROPIC_API_KEY);
}

export function getAnthropic(): Anthropic | null {
  if (!aiAvailable()) return null;
  client ??= new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });
  return client;
}

export const AI_MODEL = process.env.ANTHROPIC_MODEL ?? 'claude-sonnet-4-5';

/** Appel texte simple, avec repli silencieux si l'IA n'est pas disponible. */
export async function askAI(params: {
  system: string;
  prompt: string;
  maxTokens?: number;
}): Promise<string | null> {
  const anthropic = getAnthropic();
  if (!anthropic) return null;

  try {
    const response = await anthropic.messages.create({
      model: AI_MODEL,
      max_tokens: params.maxTokens ?? 1024,
      system: params.system,
      messages: [{ role: 'user', content: params.prompt }],
    });
    const text = response.content
      .filter((block): block is Anthropic.TextBlock => block.type === 'text')
      .map((block) => block.text)
      .join('\n')
      .trim();
    return text.length > 0 ? text : null;
  } catch (error) {
    console.error('[ai] appel échoué, repli déterministe utilisé', error);
    return null;
  }
}
