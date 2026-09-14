'use client';

import { useRef } from 'react';
import { motion, useReducedMotion, useScroll, useTransform } from 'motion/react';

interface PhoneScreen {
  day: number;
  business: string;
  goal: string;
  tasks: string[];
  minutes: number;
  percent: number;
}

const DEFAULT_SCREEN: PhoneScreen = {
  day: 17,
  business: 'Agence UGC',
  goal: 'Obtenir tes premiers clients',
  tasks: ['Trouver 10 prospects', 'Personnaliser le message', 'Envoyer 10 messages'],
  minutes: 58,
  percent: 42,
};

/**
 * Mockup du téléphone montrant l'écran « Aujourd'hui » (pattern 4).
 * Translation liée au scroll, amplitude 40 px maximum, rotation Y de 3 degrés.
 * Recréé de zéro : aucun fichier ni visuel tiers n'est utilisé.
 */
export function PhoneMockup({
  day,
  screen,
  parallax = true,
}: {
  day?: number;
  screen?: Partial<PhoneScreen>;
  parallax?: boolean;
}) {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  // Sur mobile, les parallaxes sont réduites de moitié (section 5.3).
  const amplitude = typeof window !== 'undefined' && window.innerWidth < 640 ? 20 : 40;
  const y = useTransform(scrollYProgress, [0, 1], [amplitude, -amplitude]);

  const content: PhoneScreen = { ...DEFAULT_SCREEN, ...screen, day: day ?? screen?.day ?? DEFAULT_SCREEN.day };

  return (
    <motion.div
      ref={ref}
      style={reduced || !parallax ? undefined : { y, rotateY: 3 }}
      className="relative mx-auto w-[280px] rounded-[2.25rem] border border-white/15 bg-plan-700/40 p-2.5 shadow-[0_24px_80px_rgba(0,0,0,0.45)] backdrop-blur"
    >
      <div className="overflow-hidden rounded-[1.75rem] bg-beton-100 px-5 py-6 text-encre">
        <div className="flex items-baseline justify-between">
          <p className="tabular font-display text-[11px] font-bold tracking-[0.08em] text-beton-600">
            JOUR {content.day}
          </p>
          <p className="text-[11px] text-beton-600">{content.business}</p>
        </div>

        <p className="mt-6 text-[11px] text-beton-600">Ton objectif</p>
        <p className="mt-1 font-display text-base font-bold leading-tight tracking-[-0.02em]">
          {content.goal}
        </p>

        <p className="mt-6 text-[11px] text-beton-600">À faire maintenant</p>
        <ol className="mt-2 space-y-2">
          {content.tasks.map((task, index) => (
            <li key={task} className="flex items-baseline gap-2.5 text-[13px]">
              <span className="tabular w-3 shrink-0 font-display text-[11px] font-bold text-beton-300">
                {index + 1}
              </span>
              <span>{task}</span>
            </li>
          ))}
        </ol>

        <p className="tabular mt-5 text-[11px] text-beton-600">Temps estimé : {content.minutes} min</p>

        <div className="mt-5 rounded-xl bg-signal py-2.5 text-center text-[13px] font-medium text-white">
          Commencer
        </div>

        <div className="mt-5 border-t border-beton-300 pt-3">
          <div className="flex items-baseline justify-between text-[10px] text-beton-600">
            <span>Progression</span>
            <span className="tabular">{content.percent} %</span>
          </div>
          <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-beton-300/60">
            <div className="h-full rounded-full bg-acier" style={{ width: `${content.percent}%` }} />
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export type { PhoneScreen };
