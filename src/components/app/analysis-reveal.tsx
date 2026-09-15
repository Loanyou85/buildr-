'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion, useReducedMotion } from 'motion/react';
import { CtaArrow } from '@/components/landing/cta-arrow';

interface Stat {
  value: number;
  label: string;
}

/**
 * Séquence de révélation avant les offres. Les chiffres montent un par un,
 * puis l'action apparaît. Un seul moment, pas une boucle : on ne fait pas
 * patienter l'utilisateur pour le plaisir de le faire patienter.
 */
export function AnalysisReveal({
  businessName,
  stats,
  journey,
  startedJourneys,
}: {
  businessName: string;
  stats: Stat[];
  journey: { steps: number; actions: number; resources: number };
  startedJourneys: number;
}) {
  const reduced = useReducedMotion();
  const [revealed, setRevealed] = useState(reduced ? stats.length : 0);
  const done = revealed >= stats.length;

  useEffect(() => {
    if (reduced || done) return;
    const timer = setTimeout(() => setRevealed((n) => n + 1), revealed === 0 ? 350 : 900);
    return () => clearTimeout(timer);
  }, [revealed, done, reduced]);

  return (
    <div className="relative min-h-dvh overflow-hidden bg-plan-900 text-white">
      <div
        className="glow-acier pointer-events-none absolute left-1/2 top-1/3 size-[760px] -translate-x-1/2 -translate-y-1/2"
        aria-hidden
      />

      <main className="relative mx-auto flex min-h-dvh max-w-3xl flex-col justify-center px-5 py-16">
        <p className="text-sm text-white/50">Analyse terminée</p>
        <h1 className="mt-3 font-display text-3xl font-extrabold leading-[1.08] tracking-[-0.02em] sm:text-4xl">
          Ton chemin vers
          <br />
          {businessName} est tracé.
        </h1>

        <div className="mt-12 space-y-6">
          {stats.map((stat, index) => (
            <StatLine key={stat.label} stat={stat} active={index < revealed} reduced={Boolean(reduced)} />
          ))}
        </div>

        <motion.div
          initial={false}
          animate={{ opacity: done ? 1 : 0, y: done ? 0 : 10 }}
          transition={{ duration: reduced ? 0 : 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="mt-14"
        >
          <p className="prose-nexteo text-base text-white/70">
            Ce parcours contient <strong className="font-medium text-white">{journey.steps} étapes</strong>,{' '}
            <strong className="font-medium text-white">{journey.actions} actions</strong> à exécuter une par
            une et <strong className="font-medium text-white">{journey.resources} modèles et scripts</strong>{' '}
            prêts à l’emploi.
          </p>

          {/*
            Compteur d'usage réel. Il n'apparaît qu'au-delà d'un seuil où il dit
            quelque chose : afficher « 1 parcours démarré » ne rassure personne,
            et gonfler le chiffre serait un mensonge.
          */}
          {startedJourneys >= 50 ? (
            <p className="mt-3 text-sm text-white/50">
              {startedJourneys} parcours ont été démarrés sur Nexteo.
            </p>
          ) : null}

          <Link
            href="/garantie"
            tabIndex={done ? 0 : -1}
            className="group mt-8 inline-flex h-13 items-center gap-2.5 rounded-xl bg-signal px-7 text-base font-medium text-white transition-colors hover:bg-[#f06f12]"
          >
            Voir mon parcours
            <CtaArrow />
          </Link>
        </motion.div>
      </main>
    </div>
  );
}

function StatLine({ stat, active, reduced }: { stat: Stat; active: boolean; reduced: boolean }) {
  const [display, setDisplay] = useState(reduced && active ? stat.value : 0);

  useEffect(() => {
    if (!active) return;
    if (reduced) {
      setDisplay(stat.value);
      return;
    }

    const duration = 700;
    const start = performance.now();
    let frame = 0;

    function tick(now: number) {
      const progress = Math.min(1, (now - start) / duration);
      // Decelerate : rapide au départ, s'arrête net sur la valeur.
      setDisplay(Math.round(stat.value * (1 - (1 - progress) ** 3)));
      if (progress < 1) frame = requestAnimationFrame(tick);
    }

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [active, reduced, stat.value]);

  return (
    <motion.div
      initial={false}
      animate={{ opacity: active ? 1 : 0.15, x: active || reduced ? 0 : -8 }}
      transition={{ duration: reduced ? 0 : 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="flex items-baseline gap-5"
    >
      <span className="tabular w-20 shrink-0 text-right font-display text-4xl font-extrabold tracking-[-0.02em] sm:w-28">
        {display}
      </span>
      <span className="text-base text-white/60">{stat.label}</span>
    </motion.div>
  );
}
