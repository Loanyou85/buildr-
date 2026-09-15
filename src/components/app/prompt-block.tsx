'use client';

import { useState, useTransition } from 'react';
import { Badge } from '@/components/ui/badge';
import { marquerPrompt } from '@/server/actions/prompts';
import { cn } from '@/lib/utils';

const CIBLES: Record<string, string> = {
  claude_code: 'À coller dans Claude Code',
  replit: 'À coller dans Replit',
  claude_web: 'À coller sur claude.ai',
};

/**
 * Bloc de prompt (section 11.7).
 *
 * Jamais un bloc de texte nu : le prompt arrive avec son objectif, où le
 * coller, ce qu'on doit obtenir en retour, et comment vérifier.
 */
export function PromptBlock({
  promptId,
  title,
  objective,
  body,
  target,
  expectedOutcome,
  verification,
  status,
  numero,
}: {
  promptId?: string;
  title: string;
  objective: string;
  body: string;
  target: string;
  expectedOutcome: string;
  verification: string;
  status?: string;
  numero?: number;
}) {
  const [copie, setCopie] = useState(false);
  const [, demarrer] = useTransition();

  const copier = async () => {
    try {
      await navigator.clipboard.writeText(body);
    } catch {
      return;
    }
    setCopie(true);
    navigator.vibrate?.(10);
    setTimeout(() => setCopie(false), 1500);

    if (promptId) {
      const data = new FormData();
      data.set('promptId', promptId);
      data.set('status', 'copied');
      demarrer(() => {
        void marquerPrompt(data);
      });
    }
  };

  return (
    <article className="rounded-[--radius-card] border border-gris-700 bg-nuit-800/60 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-bold text-white">
            {numero ? <span className="text-gris-300 tabular">{numero}. </span> : null}
            {title}
          </h3>
          <p className="mt-1 text-xs text-gris-300">{objective}</p>
        </div>
        {status && status !== 'todo' ? (
          <Badge ton="neo" className="shrink-0">
            {status === 'copied' ? 'copié' : status === 'executed' ? 'exécuté' : 'validé'}
          </Badge>
        ) : null}
      </div>

      <div className="relative mt-4">
        <button
          type="button"
          onClick={copier}
          className={cn(
            'absolute right-2 top-2 z-10 rounded-lg border px-3 py-2 text-xs transition-colors',
            copie
              ? 'border-neo-500 bg-neo-500 text-white'
              : 'border-gris-700 bg-nuit-900 text-gris-300 hover:text-white',
          )}
        >
          {copie ? 'Copié' : 'Copier'}
        </button>
        <pre className="max-h-[320px] overflow-auto whitespace-pre-wrap break-words rounded-[--radius-bouton] border border-gris-700 bg-nuit-900 p-4 pr-24 font-mono text-[13px] leading-relaxed text-neo-100">
          {body}
        </pre>
      </div>

      <dl className="mt-4 space-y-2.5 text-xs">
        <div>
          <dt className="text-gris-300">Où le coller</dt>
          <dd className="mt-0.5 text-white">{CIBLES[target] ?? 'À coller dans Claude'}</dd>
        </div>
        <div>
          <dt className="text-gris-300">Ce que tu dois obtenir</dt>
          <dd className="mt-0.5 text-white">{expectedOutcome}</dd>
        </div>
        <div>
          <dt className="text-gris-300">Comment vérifier</dt>
          <dd className="mt-0.5 text-white">{verification}</dd>
        </div>
      </dl>
    </article>
  );
}
