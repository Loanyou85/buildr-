'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { Button } from '@/components/ui/button';
import { Textarea, Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { PromptBlock } from '@/components/app/prompt-block';
import { demanderReparation, type ReparationState } from '@/server/actions/prompts';

function Envoyer() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" taille="bloc" variant="secondaire" disabled={pending}>
      {pending ? 'On lit ton erreur…' : 'Trouve-moi quoi faire'}
    </Button>
  );
}

/**
 * « Ça ne marche pas » (section 11.5). Présent à chaque étape.
 *
 * Un utilisateur sans compétence technique dont le déploiement échoue
 * abandonne en dix minutes s'il n'a pas de réponse. C'est pour ça que ce
 * bouton existe partout, et pas dans une page d'aide.
 */
export function RepairPanel({ contexte }: { contexte: string }) {
  const [state, action] = useActionState<ReparationState, FormData>(demanderReparation, {});

  return (
    <details className="rounded-[--radius-card] border border-gris-700 bg-nuit-800/60 p-4">
      <summary className="tactile flex cursor-pointer list-none items-center justify-between text-sm font-bold text-white">
        Ça ne marche pas
        <span aria-hidden className="text-gris-300">
          +
        </span>
      </summary>

      <p className="mt-3 text-xs text-gris-300">
        Colle le message que tu vois, en entier, même si tu n’y comprends rien. C’est justement le
        but.
      </p>

      <form action={action} className="mt-4 space-y-3">
        <input type="hidden" name="contexte" value={contexte} />
        <Textarea name="message" rows={5} placeholder="Colle ici le message d’erreur" required />
        <Input name="contexte" placeholder="Ce que tu faisais (facultatif)" />
        <Envoyer />
      </form>

      {state.error ? (
        <p role="alert" className="mt-3 text-sm text-red-400">
          {state.error}
        </p>
      ) : null}

      {state.reparation ? (
        <div className="mt-5 space-y-4">
          {state.reparation.motif ? (
            <div className="rounded-[--radius-card] border border-gris-700 bg-nuit-900 p-4">
              <Badge ton="neo">{state.reparation.motif.category}</Badge>
              <p className="mt-2 text-sm font-bold text-white">{state.reparation.motif.label}</p>
              <p className="mt-1 text-xs text-gris-300">{state.reparation.motif.explanation}</p>
            </div>
          ) : (
            <p className="text-xs text-gris-300">
              Cette erreur ne ressemble à aucune de celles qu’on connaît. Voici un prompt qui donne à
              Claude tout le contexte de ton projet et lui demande de la lire.
            </p>
          )}

          <PromptBlock
            title={state.reparation.title}
            objective="Coller ce prompt là où tu construis."
            body={state.reparation.body}
            target="claude_code"
            expectedOutcome={state.reparation.expectedOutcome}
            verification={state.reparation.verification}
          />
        </div>
      ) : null}
    </details>
  );
}
