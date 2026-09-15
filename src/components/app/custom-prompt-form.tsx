'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/input';
import { genererSurMesure, type SurMesureState } from '@/server/actions/prompts';

function Envoyer() {
  const { pending } = useFormStatus();
  return (
    <>
      {pending ? (
        <div className="mb-3 h-1.5 w-full overflow-hidden rounded-full bg-nuit-700">
          <div className="glisser h-full w-1/3 rounded-full bg-neo-500" />
        </div>
      ) : null}
      <Button type="submit" taille="bloc" disabled={pending}>
        {pending ? 'On écrit ton prompt…' : 'Écris-moi le prompt'}
      </Button>
    </>
  );
}

/** Générateur à la demande (section 11.6). */
export function CustomPromptForm() {
  const [state, action] = useActionState<SurMesureState, FormData>(genererSurMesure, {});

  return (
    <>
      <form action={action} className="space-y-3">
        <Textarea
          name="demande"
          rows={4}
          required
          minLength={10}
          placeholder="Par exemple : je veux que mes clients puissent exporter leurs données en Excel."
          aria-label="Ce que tu veux ajouter"
        />
        <Envoyer />
      </form>

      {state.error ? (
        <p role="alert" className="mt-4 text-sm text-red-400">
          {state.error}
        </p>
      ) : null}

      {state.promptId ? (
        <div className="mt-6 rounded-[--radius-card] border border-neo-500/30 bg-nuit-800 p-4">
          <p className="text-sm font-bold text-white">Ton prompt est prêt.</p>
          <p className="mt-1 text-xs text-gris-300">
            Il est ajouté à la fin de ton pack, cohérent avec ce que tu as déjà construit.
          </p>
          <Button asChild taille="bloc" className="mt-4">
            <Link href="/app/prompts?bloc=sur-mesure">L’ouvrir</Link>
          </Button>
        </div>
      ) : null}
    </>
  );
}
