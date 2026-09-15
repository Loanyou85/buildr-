'use client';

import { useRef, useState } from 'react';
import { motion, useMotionValueEvent, useReducedMotion, useScroll } from 'motion/react';
import { PhoneMockup, type PhoneScreen } from '@/components/landing/phone-mockup';
import { cn } from '@/lib/utils';

/**
 * Section scrollytelling (pattern 5) : un bloc sticky sur plusieurs hauteurs
 * d'écran. Le téléphone reste fixe, son écran change au fil du scroll pour
 * montrer jour 1, jour 12, jour 47. C'est la démonstration centrale du produit.
 */
const SCREENS: Array<PhoneScreen & { title: string; caption: string }> = [
  {
    day: 1,
    business: 'Agence UGC',
    goal: 'Choisir ta niche',
    tasks: ['Lister tes terrains possibles', 'Filtrer avec les 4 critères', 'Écrire ta niche en une phrase'],
    minutes: 45,
    percent: 4,
    title: 'Jour 1 — tu sais par où commencer',
    caption:
      'Pas de tableau de bord à déchiffrer. Une étape, son objectif, trois actions et un bouton. Tu n’as rien à décider d’autre.',
  },
  {
    day: 12,
    business: 'Agence UGC',
    goal: 'Construire ton offre',
    tasks: ['Choisir ton livrable de base', 'Écrire le bénéfice', 'Fixer tes trois prix'],
    minutes: 50,
    percent: 27,
    title: 'Jour 12 — tu as quelque chose à vendre',
    caption:
      'Ton offre est chiffrée, tes prix sont écrits, tes réponses aux objections sont prêtes. Le parcours t’a fait produire, pas regarder des vidéos.',
  },
  {
    day: 47,
    business: 'Agence UGC',
    goal: 'Faire signer ton premier client',
    tasks: ['Obtenir l’accord écrit', 'Émettre l’acompte', 'Marquer le jalon'],
    minutes: 30,
    percent: 78,
    title: 'Jour 47 — ton premier client',
    caption:
      'Tu as prospecté, relancé, mené un rendez-vous et envoyé un devis. Chaque étape a été validée avant la suivante.',
  },
];

export function Scrollytelling() {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] });

  useMotionValueEvent(scrollYProgress, 'change', (value) => {
    const index = Math.min(SCREENS.length - 1, Math.floor(value * SCREENS.length));
    setActive(index);
  });

  const current = SCREENS[active]!;

  return (
    <section id="chemin" ref={ref} className="relative bg-plan-900 text-white" style={{ height: `${SCREENS.length * 100}vh` }}>
      <div className="sticky top-0 flex h-dvh items-center overflow-hidden">
        <div className="glow-acier pointer-events-none absolute left-1/4 top-1/2 size-[560px] -translate-y-1/2" aria-hidden />

        <div className="relative mx-auto grid w-full max-w-6xl items-center gap-12 px-5 lg:grid-cols-2">
          <div>
            <p className="text-sm text-white/50">La boucle du produit</p>
            <h2 className="mt-4 font-display text-2xl font-extrabold leading-[1.12] tracking-[-0.02em] sm:text-3xl sm:leading-[1.08]">
              Tu montes, une étape à la fois.
            </h2>

            <div className="mt-10 space-y-6">
              {SCREENS.map((screen, index) => (
                <button
                  key={screen.day}
                  type="button"
                  onClick={() => setActive(index)}
                  className={cn(
                    'block w-full border-l-2 py-2 pl-5 text-left transition-colors',
                    index === active ? 'border-signal' : 'border-white/15',
                  )}
                >
                  <p
                    className={cn(
                      'font-display text-lg font-bold tracking-[-0.02em] transition-colors',
                      index === active ? 'text-white' : 'text-white/40',
                    )}
                  >
                    {screen.title}
                  </p>
                  <motion.p
                    initial={false}
                    animate={{ opacity: index === active ? 1 : 0, height: index === active ? 'auto' : 0 }}
                    transition={{ duration: reduced ? 0 : 0.24, ease: [0.22, 1, 0.36, 1] }}
                    className="prose-nexteo overflow-hidden text-sm text-white/60"
                  >
                    <span className="block pt-2">{screen.caption}</span>
                  </motion.p>
                </button>
              ))}
            </div>
          </div>

          <div className="relative">
            <motion.div
              key={current.day}
              initial={reduced ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: reduced ? 0 : 0.3, ease: [0.22, 1, 0.36, 1] }}
            >
              <PhoneMockup screen={current} parallax={false} />
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
