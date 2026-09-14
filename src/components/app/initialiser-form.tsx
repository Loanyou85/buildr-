'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface JourneyResult {
  name: string;
  phases: number;
  steps: number;
  actions: number;
  skipped: boolean;
}

interface SeedResponse {
  ok?: boolean;
  error?: string;
  summary?: {
    skills: number;
    interests: number;
    milestones: number;
    featureFlags: number;
    businessModels: number;
    journeys: JourneyResult[];
    businessModelsWithoutJourney: string[];
  };
}

type State =
  | { kind: 'idle' }
  | { kind: 'pending' }
  | { kind: 'done'; summary: NonNullable<SeedResponse['summary']> }
  | { kind: 'error'; message: string };

export function InitialiserForm() {
  const [state, setState] = useState<State>({ kind: 'idle' });

  async function submit(formData: FormData) {
    const secret = String(formData.get('secret') ?? '').trim();
    if (!secret) return;

    setState({ kind: 'pending' });

    try {
      const response = await fetch('/api/admin/initialiser', {
        method: 'POST',
        headers: { Authorization: `Bearer ${secret}` },
      });
      const data: SeedResponse = await response.json();

      if (!response.ok || !data.summary) {
        setState({
          kind: 'error',
          message:
            response.status === 401
              ? 'Le secret ne correspond pas à celui configuré sur le serveur. Vérifie que tu as bien copié la valeur de SEED_SECRET, sans espace avant ou après.'
              : response.status === 503
                ? 'La variable SEED_SECRET n’est pas définie sur le serveur, la route est donc fermée. Ajoute-la dans les variables d’environnement, redéploie, puis reviens ici.'
                : `${data.error ?? 'L’initialisation a échoué.'} Tu peux relancer sans risque : l’opération est atomique, elle ne laisse jamais la base à moitié remplie.`,
        });
        return;
      }

      setState({ kind: 'done', summary: data.summary });
    } catch {
      setState({
        kind: 'error',
        message: 'La connexion au serveur a échoué. Réessaie dans un instant.',
      });
    }
  }

  if (state.kind === 'done') {
    const total = state.summary.journeys.reduce(
      (acc, journey) => ({
        steps: acc.steps + journey.steps,
        actions: acc.actions + journey.actions,
      }),
      { steps: 0, actions: 0 },
    );

    return (
      <section className="mt-8 rounded-card border border-niveau/40 bg-niveau-50 p-6">
        <p className="text-lg text-encre">C’est fait. Ta base est prête.</p>

        <dl className="mt-5 divide-y divide-niveau/20 border-y border-niveau/20 text-sm">
          {[
            ['Business models', state.summary.businessModels],
            ['Compétences', state.summary.skills],
            ['Intérêts', state.summary.interests],
            ['Parcours publiés', state.summary.journeys.length],
            ['Étapes au total', total.steps],
            ['Actions exécutables', total.actions],
          ].map(([label, value]) => (
            <div key={String(label)} className="flex justify-between gap-4 py-2.5">
              <dt className="text-beton-600">{label}</dt>
              <dd className="tabular text-encre">{value}</dd>
            </div>
          ))}
        </dl>

        <p className="prose-buildr mt-5 text-sm text-encre">
          Dernière chose, importante : retourne dans les variables d’environnement de ton hébergeur
          et <strong className="font-medium">supprime SEED_SECRET</strong>, puis redéploie. Cette page
          sera alors définitivement fermée.
        </p>
      </section>
    );
  }

  return (
    <>
      <form action={submit} className="mt-8 rounded-card border border-beton-300 bg-blanc p-6">
        <label htmlFor="secret" className="text-sm font-medium text-encre">
          Colle ici la valeur de SEED_SECRET
        </label>
        <p className="mt-1 text-sm text-beton-600">
          C’est la variable d’environnement que tu as ajoutée chez ton hébergeur.
        </p>
        <Input
          id="secret"
          name="secret"
          type="password"
          required
          autoComplete="off"
          placeholder="••••••••••••••••"
          className="mt-3"
        />
        <Button type="submit" variant="signal" size="lg" className="mt-4" disabled={state.kind === 'pending'}>
          {state.kind === 'pending' ? 'Initialisation en cours…' : 'Initialiser'}
        </Button>
        {state.kind === 'pending' ? (
          <p className="mt-3 text-sm text-beton-600">
            Ça prend une dizaine de secondes. Ne ferme pas la page.
          </p>
        ) : null}
      </form>

      {state.kind === 'error' ? (
        <p className="prose-buildr mt-4 rounded-card border border-beton-300 bg-blanc p-4 text-sm text-encre">
          {state.message}
        </p>
      ) : null}
    </>
  );
}
