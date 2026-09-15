'use client';

import Link from 'next/link';
import { motion, useReducedMotion } from 'motion/react';
import { PhoneMockup } from '@/components/landing/phone-mockup';
import { FloatingCards } from '@/components/landing/floating-cards';
import { CtaArrow } from '@/components/landing/cta-arrow';

/**
 * Hero orchestré (section 5.1, pattern 1) : un seul moment de chargement,
 * séquencé. Stagger de 60 ms, translation de 16 px, opacité 0 → 1,
 * easing cubic-bezier(0.22, 1, 0.36, 1). Ne se rejoue pas au scroll.
 */
const EASE = [0.22, 1, 0.36, 1] as const;

export function Hero() {
  const reduced = useReducedMotion();

  const appear = (index: number) =>
    reduced
      ? { initial: false as const, animate: { opacity: 1, y: 0 } }
      : {
          initial: { opacity: 0, y: 16 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.5, delay: index * 0.06, ease: EASE },
        };

  return (
    <section className="relative overflow-hidden bg-plan-900 pb-24 pt-20 text-white sm:pb-32 sm:pt-28">
      {/* Glows radiaux générés en CSS, pas en image (pattern 2). */}
      <div
        className="glow-acier pointer-events-none absolute left-1/2 top-[-10%] size-[720px] -translate-x-1/2"
        aria-hidden
      />
      <div
        className="glow-signal pointer-events-none absolute right-[-10%] top-1/3 size-[420px]"
        aria-hidden
      />

      <div className="relative mx-auto max-w-6xl px-5">
        <div className="grid items-center gap-16 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <motion.p
              {...appear(0)}
              className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs text-white/70"
            >
              <span className="size-1.5 rounded-full bg-signal" aria-hidden />
              Un parcours, pas une formation
            </motion.p>

            <motion.h1
              {...appear(1)}
              className="mt-6 font-display text-4xl font-extrabold leading-[1.02] tracking-[-0.02em]"
            >
              Ton business.
              <br />
              Construis-le.
            </motion.h1>

            <motion.p {...appear(2)} className="prose-nexteo mt-6 text-lg text-white/70">
              Découvre l’activité qui te correspond, puis suis un parcours étape par étape pour la
              construire.
            </motion.p>

            <motion.div {...appear(3)} className="mt-10 flex flex-wrap items-center gap-4">
              <Link
                href="/inscription"
                className="group inline-flex h-13 items-center gap-2.5 rounded-xl bg-signal px-7 text-base font-medium text-white transition-colors hover:bg-[#f06f12]"
              >
                Trouver mon business
                <CtaArrow />
              </Link>
              <Link
                href="#chemin"
                className="text-base text-white/70 underline-offset-4 transition-colors hover:text-white hover:underline"
              >
                Découvrir les parcours
              </Link>
            </motion.div>

            <motion.p {...appear(4)} className="mt-6 text-sm text-white/50">
              Gratuit pour le diagnostic et les premières étapes. Aucune carte bancaire.
            </motion.p>
          </div>

          {/* Mockups flottants avec parallaxe (pattern 4). */}
          <motion.div {...appear(5)} className="relative mx-auto w-full max-w-sm">
            <FloatingCards />
            <PhoneMockup day={17} />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
