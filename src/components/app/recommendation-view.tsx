'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, useReducedMotion } from 'motion/react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { acceptRecommendation, rejectRecommendation } from '@/server/actions/recommendation';
import { AnalysisStrip } from '@/components/app/analysis-strip';

interface Primary {
  id: string;
  name: string;
  summary: string;
  rationale: string;
  score: number;
  breakdown: Array<{ label: string; score: number; reason: string }>;
}

/**
 * « Ton business est prêt. » Le nom, puis pourquoi il correspond, puis les
 * faits, puis une seule action (section 8.3). L'orange n'apparaît qu'une fois.
 */
export function RecommendationView({
  stats,
  primary,
  facts,
  alternatives,
  rejectionCount,
  maxRejections,
  askToRevisit,
  error,
}: {
  stats: Array<{ value: number; label: string }>;
  primary: Primary;
  facts: Array<{ label: string; value: string }>;
  alternatives: Array<{ id: string; name: string; summary: string; score: number }>;
  rejectionCount: number;
  maxRejections: number;
  askToRevisit: boolean;
  error?: string;
}) {
  const reduced = useReducedMotion();
  const [rejecting, setRejecting] = useState(false);

  return (
    <div className="mx-auto max-w-2xl px-5 py-16">
      <motion.div
        initial={reduced ? false : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: reduced ? 0 : 0.35, ease: [0.22, 1, 0.36, 1] }}
      >
        <AnalysisStrip stats={stats} />

        <p className="mt-10 text-sm text-beton-600">Ton diagnostic est prêt.</p>
        <h1 className="mt-2 text-3xl">{primary.name}</h1>
        <p className="prose-nexteo mt-3 text-base text-beton-600">
          Une activité à ton image, avec laquelle aller chercher tes premiers revenus.
        </p>
        <p className="prose-nexteo mt-4 text-lg text-encre">{primary.summary}</p>
      </motion.div>

      {error === 'parcours-indisponible' ? (
        <p className="mt-6 rounded-card border border-beton-300 bg-blanc p-4 text-sm text-encre">
          Le parcours de cette activité n’est pas encore publié. Choisis une alternative ci-dessous : elles
          ont toutes un chemin complet.
        </p>
      ) : null}

      <section className="mt-10">
        <h2 className="text-lg text-encre">Pourquoi cette activité te correspond</h2>
        <p className="prose-nexteo mt-3 text-base text-beton-600">{primary.rationale}</p>

        <ul className="mt-6 space-y-3">
          {primary.breakdown.map((dimension) => (
            <li key={dimension.label} className="flex gap-4">
              <span className="tabular w-12 shrink-0 text-sm text-acier">{dimension.score} %</span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-medium text-encre">{dimension.label}</span>
                <span className="prose-nexteo block text-sm text-beton-600">{dimension.reason}</span>
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-10">
        <h2 className="text-lg text-encre">Les faits</h2>
        <dl className="mt-4 divide-y divide-beton-300 border-y border-beton-300">
          {facts.map((fact) => (
            <div key={fact.label} className="flex flex-wrap justify-between gap-2 py-3">
              <dt className="text-sm text-beton-600">{fact.label}</dt>
              <dd className="text-sm text-encre">{fact.value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <form action={acceptRecommendation} className="mt-10">
        <input type="hidden" name="recommendationId" value={primary.id} />
        <Button type="submit" variant="signal" size="lg">
          Commencer
        </Button>
      </form>

      {askToRevisit ? (
        <section className="mt-12 rounded-card border border-beton-300 bg-blanc p-6">
          <p className="text-lg text-encre">On reprend deux questions plutôt qu’une troisième proposition.</p>
          <p className="prose-nexteo mt-2 text-sm text-beton-600">
            Tu as écarté {rejectionCount} propositions. Continuer à en générer ne t’avancerait pas : ce qui
            change vraiment le résultat, ce sont tes réponses sur le temps, le budget et ce que tu acceptes
            de faire au quotidien.
          </p>
          <Link
            href="/onboarding?q=6"
            className="mt-4 inline-block text-sm text-acier underline-offset-4 hover:underline"
          >
            Revoir ces questions →
          </Link>
        </section>
      ) : (
        <section className="mt-12">
          {!rejecting ? (
            <button
              type="button"
              onClick={() => setRejecting(true)}
              className="inline-flex min-h-11 items-center text-sm text-beton-600 underline-offset-4 hover:text-encre hover:underline"
            >
              Cette activité ne me correspond pas
            </button>
          ) : (
            <form action={rejectRecommendation} className="rounded-card border border-beton-300 bg-blanc p-5">
              <input type="hidden" name="recommendationId" value={primary.id} />
              <label htmlFor="reason" className="text-sm font-medium text-encre">
                Qu’est-ce qui ne va pas ?
              </label>
              <p className="mt-1 text-sm text-beton-600">
                Ta réponse alimente le moteur : c’est ce qui rend la proposition suivante meilleure.
              </p>
              <Textarea id="reason" name="reason" rows={3} required minLength={10} className="mt-3" />
              <div className="mt-4 flex gap-2">
                <Button type="submit" variant="outline">
                  Proposer autre chose
                </Button>
                <Button type="button" variant="ghost" onClick={() => setRejecting(false)}>
                  Annuler
                </Button>
              </div>
              <p className="mt-3 text-xs text-beton-600">
                Il te reste {Math.max(0, maxRejections - rejectionCount)} changement
                {maxRejections - rejectionCount > 1 ? 's' : ''} avant qu’on reprenne tes réponses ensemble.
              </p>
            </form>
          )}
        </section>
      )}

      {alternatives.length > 0 && !askToRevisit ? (
        <section className="mt-12">
          <h2 className="text-lg text-encre">Les deux autres qui te correspondent</h2>
          <div className="mt-4 space-y-3">
            {alternatives.map((alternative) => (
              <Card key={alternative.id}>
                <CardContent className="flex flex-wrap items-start justify-between gap-4 p-5">
                  <div className="min-w-0 flex-1">
                    <p className="text-base text-encre">{alternative.name}</p>
                    <p className="prose-nexteo mt-1 text-sm text-beton-600">{alternative.summary}</p>
                  </div>
                  <form action={acceptRecommendation}>
                    <input type="hidden" name="recommendationId" value={alternative.id} />
                    <Button type="submit" variant="outline" size="sm">
                      Choisir
                    </Button>
                  </form>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
