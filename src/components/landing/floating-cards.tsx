'use client';

import { useRef } from 'react';
import { motion, useReducedMotion, useScroll, useTransform } from 'motion/react';

/**
 * Deux cartes de jalon en lévitation autour du téléphone (pattern 4).
 * Parallaxe opposée, amplitude 40 px maximum, `transform` uniquement.
 */
export function FloatingCards() {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const yUp = useTransform(scrollYProgress, [0, 1], [30, -30]);
  const yDown = useTransform(scrollYProgress, [0, 1], [-24, 24]);

  return (
    <div ref={ref} className="pointer-events-none absolute inset-0" aria-hidden>
      <motion.div
        style={reduced ? undefined : { y: yUp }}
        className="absolute -left-10 top-6 w-44 -rotate-3 rounded-2xl border border-white/15 bg-plan-700/70 px-4 py-3 backdrop-blur sm:-left-24 lg:-left-28"
      >
        <p className="text-[10px] text-white/50">Jalon franchi</p>
        <p className="mt-1 font-display text-sm font-bold text-white">Premier client</p>
        <p className="mt-2 text-[10px] text-white/40">Déclaré par l’utilisateur</p>
      </motion.div>

      <motion.div
        style={reduced ? undefined : { y: yDown }}
        className="absolute -left-6 bottom-6 w-40 rotate-2 rounded-2xl border border-white/15 bg-plan-700/70 px-4 py-3 backdrop-blur sm:-left-20 lg:-left-24"
      >
        <p className="text-[10px] text-white/50">Étape 12</p>
        <p className="mt-1 font-display text-sm font-bold text-white">Script de contact</p>
        <div className="mt-2 h-1 overflow-hidden rounded-full bg-white/15">
          <div className="h-full w-2/3 rounded-full bg-niveau" />
        </div>
      </motion.div>
    </div>
  );
}
