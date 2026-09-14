'use client';

import { useEffect, useRef, useState } from 'react';
import { useInView, useReducedMotion } from 'motion/react';

/**
 * Compteurs animés (pattern 8) : les chiffres montent quand la section entre
 * dans le viewport, une seule fois, easing decelerate.
 *
 * Garde-fou n° 1 : ces chiffres décrivent le contenu du produit — nombre
 * d'étapes, d'actions, d'activités au référentiel. Jamais un résultat
 * d'utilisateur, jamais un revenu.
 */
const STATS: Array<{ value: number; suffix?: string; label: string }> = [
  { value: 15, label: 'activités au référentiel' },
  { value: 22, label: 'étapes dans le parcours UGC' },
  { value: 166, label: 'actions exécutables, écrites une par une' },
  { value: 11, label: 'dimensions croisées par le moteur' },
];

function Counter({ value, suffix }: { value: number; suffix?: string }) {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  const [display, setDisplay] = useState(reduced ? value : 0);

  useEffect(() => {
    if (!inView || reduced) return;
    const duration = 900;
    const start = performance.now();
    let frame = 0;

    function tick(now: number) {
      const progress = Math.min(1, (now - start) / duration);
      // Decelerate : rapide au début, ralentit à l'arrivée.
      const eased = 1 - (1 - progress) ** 3;
      setDisplay(Math.round(value * eased));
      if (progress < 1) frame = requestAnimationFrame(tick);
    }

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [inView, reduced, value]);

  return (
    <span ref={ref} className="tabular">
      {display}
      {suffix}
    </span>
  );
}

export function Counters() {
  return (
    <section className="border-y border-white/10 bg-plan-900 py-16 text-white">
      <div className="mx-auto grid max-w-5xl grid-cols-2 gap-8 px-5 sm:grid-cols-4">
        {STATS.map((stat) => (
          <div key={stat.label}>
            <p className="font-display text-3xl font-extrabold tracking-[-0.02em]">
              <Counter value={stat.value} suffix={stat.suffix} />
            </p>
            <p className="mt-2 text-sm text-white/50">{stat.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
