'use client';

import { useEffect, useState } from 'react';
import { useReducedMotion } from 'motion/react';

interface Stat {
  value: number;
  label: string;
}

/**
 * Bandeau d'analyse, en tête du diagnostic.
 *
 * Il tenait sur un écran entier ; il est désormais posé au-dessus du résultat.
 * Un écran de moins avant le paywall, et le chiffre arrive au moment où il
 * sert : juste avant l'activité qu'il a servi à trouver.
 *
 * Garde-fou n° 1 : tous ces chiffres sont lus en base, aucun n'est inventé.
 */
export function AnalysisStrip({ stats }: { stats: Stat[] }) {
  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-3 rounded-card border border-beton-300 bg-blanc p-5 sm:grid-cols-4">
      {stats.map((stat, index) => (
        <Counter key={stat.label} stat={stat} delay={index * 120} />
      ))}
    </div>
  );
}

function Counter({ stat, delay }: { stat: Stat; delay: number }) {
  const reduced = useReducedMotion();
  const [display, setDisplay] = useState(reduced ? stat.value : 0);

  useEffect(() => {
    if (reduced) {
      setDisplay(stat.value);
      return;
    }

    let frame = 0;
    const timer = setTimeout(() => {
      const duration = 650;
      const start = performance.now();
      const tick = (now: number) => {
        const progress = Math.min(1, (now - start) / duration);
        setDisplay(Math.round(stat.value * (1 - (1 - progress) ** 3)));
        if (progress < 1) frame = requestAnimationFrame(tick);
      };
      frame = requestAnimationFrame(tick);
    }, delay);

    return () => {
      clearTimeout(timer);
      cancelAnimationFrame(frame);
    };
  }, [delay, reduced, stat.value]);

  return (
    <div>
      <p className="tabular font-display text-2xl font-extrabold tracking-[-0.02em] text-encre">
        {display}
      </p>
      <p className="mt-0.5 text-xs leading-snug text-beton-600">{stat.label}</p>
    </div>
  );
}
