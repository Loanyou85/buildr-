'use client';

import { useOptimistic, useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { basculerCritere, terminerEtape } from '@/server/actions/journey';
import { cn } from '@/lib/utils';

export interface CritereVue {
  id: string;
  label: string;
  isRequired: boolean;
  proofKind: 'none' | 'url' | 'text';
  coche: boolean;
  preuve: string | null;
}

/**
 * Checklist de validation (section 9.4). Le bouton « J'ai terminé » ne
 * s'active que lorsque tous les critères obligatoires sont cochés.
 *
 * La case affiche son état tout de suite, sans attendre le serveur : sur une
 * connexion moyenne, un aller-retour avant la coche donne l'impression que le
 * clic n'a pas marché.
 */
export function CheckpointList({ stepId, criteres }: { stepId: string; criteres: CritereVue[] }) {
  const [etat, basculerOptimiste] = useOptimistic(criteres, (courant, id: string) =>
    courant.map((c) => (c.id === id ? { ...c, coche: !c.coche } : c)),
  );
  const [, demarrer] = useTransition();
  const [erreur, setErreur] = useState<string | null>(null);
  const [preuves, setPreuves] = useState<Record<string, string>>(
    Object.fromEntries(criteres.map((c) => [c.id, c.preuve ?? ''])),
  );

  const basculer = (critere: CritereVue) => {
    const preuve = preuves[critere.id] ?? '';
    if (!critere.coche && critere.proofKind !== 'none' && preuve.trim().length === 0) {
      setErreur('Colle d’abord ce qui est demandé juste au-dessus.');
      return;
    }
    setErreur(null);

    const data = new FormData();
    data.set('stepId', stepId);
    data.set('checkpointId', critere.id);
    data.set('proof', preuve);

    demarrer(async () => {
      basculerOptimiste(critere.id);
      try {
        await basculerCritere(data);
      } catch {
        setErreur('L’enregistrement n’est pas passé. Recharge la page (Ctrl + Maj + R) et recommence.');
      }
    });
  };

  const restants = etat.filter((c) => c.isRequired && !c.coche).length;

  return (
    <section>
      <h2 className="text-base font-bold text-white">Pour valider cette étape</h2>
      <ul className="mt-4 space-y-2.5">
        {etat.map((critere) => (
          <li key={critere.id}>
            {critere.proofKind !== 'none' && !critere.coche ? (
              <div className="mb-2">
                <Input
                  value={preuves[critere.id] ?? ''}
                  onChange={(event) => {
                    // La valeur est lue tout de suite : React appelle la
                    // fonction de mise à jour plus tard, quand l'événement a
                    // déjà été vidé et que `currentTarget` vaut null.
                    const valeur = event.currentTarget.value;
                    setPreuves((p) => ({ ...p, [critere.id]: valeur }));
                  }}
                  placeholder={critere.proofKind === 'url' ? 'https://…' : 'Colle ici'}
                  inputMode={critere.proofKind === 'url' ? 'url' : 'text'}
                  aria-label={critere.label}
                />
              </div>
            ) : null}

            <button
              type="button"
              onClick={() => basculer(critere)}
              aria-pressed={critere.coche}
              className={cn(
                'tactile flex w-full items-start gap-3 rounded-[--radius-card] border px-4 py-3 text-left transition-colors',
                critere.coche ? 'border-neo-500/50 bg-neo-500/10' : 'border-gris-700 bg-nuit-800',
              )}
            >
              <span
                aria-hidden
                className={cn(
                  'mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-md border',
                  critere.coche ? 'border-neo-500 bg-neo-500' : 'border-gris-700',
                )}
              >
                {critere.coche ? (
                  <svg viewBox="0 0 16 16" className="h-3 w-3" fill="none">
                    <path
                      d="M3 8.5l3.2 3.2L13 5"
                      stroke="white"
                      strokeWidth="2.4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                ) : null}
              </span>
              <span className="text-sm text-white">
                {critere.label}
                {!critere.isRequired ? (
                  <span className="ml-2 text-xs text-gris-300">(facultatif)</span>
                ) : null}
                {critere.coche && critere.preuve ? (
                  <span className="mt-1 block break-all font-mono text-xs text-gris-300">
                    {critere.preuve}
                  </span>
                ) : null}
              </span>
            </button>
          </li>
        ))}
      </ul>

      {erreur ? (
        <p role="alert" className="mt-3 text-sm text-red-400">
          {erreur}
        </p>
      ) : null}

      <form action={terminerEtape} className="mt-6">
        <input type="hidden" name="stepId" value={stepId} />
        <Button type="submit" taille="bloc" disabled={restants > 0}>
          {restants > 0
            ? `Encore ${restants} case${restants > 1 ? 's' : ''} à cocher`
            : 'J’ai terminé cette étape'}
        </Button>
      </form>
    </section>
  );
}
