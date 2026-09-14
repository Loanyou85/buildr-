'use client';

import { useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';

/** Accordéon FAQ (pattern 10) : ouverture avec transition de hauteur, 240 ms. */
const QUESTIONS: Array<{ question: string; answer: string }> = [
  {
    question: 'Est-ce que c’est une formation ?',
    answer:
      'Non. Il n’y a aucune vidéo à regarder, aucun module à suivre. Nexteo te donne une activité adaptée à ta situation, puis un parcours d’exécution : à chaque étape, tu lis ce qu’il faut faire, tu le fais, tu valides, tu avances.',
  },
  {
    question: 'Qu’est-ce que je dois savoir faire pour commencer ?',
    answer:
      'Rien en particulier. Le diagnostic prend en compte ce que tu sais déjà faire, et le parcours s’adapte : à niveau débutant, chaque action est détaillée jusqu’au clic. Une partie des activités du référentiel démarre sans budget et sans compétence technique.',
  },
  {
    question: 'Combien de temps ça prend ?',
    answer:
      'Tu déclares le temps dont tu disposes, et le plan du jour est calé dessus. Le parcours UGC, par exemple, mène au premier client en une trentaine d’étapes, dont la plupart tiennent en moins d’une heure. Le rythme dépend de toi, pas d’un calendrier imposé.',
  },
  {
    question: 'Est-ce que Nexteo promet un résultat ?',
    answer:
      'Non, et c’est délibéré. Aucun écran, aucune notification, aucun texte ne promet un revenu ou une rapidité de gain. Ce que Nexteo garantit, c’est de toujours te dire quoi faire ensuite, et de te faire valider chaque étape avant la suivante.',
  },
  {
    question: 'Qu’est-ce qui se passe si l’activité proposée ne me plaît pas ?',
    answer:
      'Tu peux la refuser en expliquant pourquoi, et le moteur en tient compte pour la proposition suivante. Après deux refus, on ne génère pas une troisième alternative : on reprend ensemble les questions qui pèsent le plus dans le calcul, parce que c’est ça qui change le résultat.',
  },
  {
    question: 'Que deviennent mes données ?',
    answer:
      'Elles sont hébergées dans l’Union européenne et conservées 36 mois après ta dernière activité. Tu peux exporter l’intégralité de ce qui a été collecté, en un fichier, et supprimer ton compte définitivement depuis ton espace, sans passer par le support.',
  },
  {
    question: 'Est-ce accessible aux mineurs ?',
    answer:
      'Pas avant 16 ans : le service collecte des informations sur la situation personnelle et financière. Entre 16 et 18 ans, tout le produit fonctionne, sauf la publication publique d’une aventure.',
  },
];

export function Faq() {
  const reduced = useReducedMotion();
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section className="bg-plan-900 py-24 text-white">
      <div className="mx-auto max-w-3xl px-5">
        <h2 className="font-display text-3xl font-extrabold leading-[1.08] tracking-[-0.02em]">
          Les questions qu’on nous pose
        </h2>

        <div className="mt-12 divide-y divide-white/10 border-y border-white/10">
          {QUESTIONS.map((item, index) => (
            <div key={item.question}>
              <button
                type="button"
                onClick={() => setOpen(open === index ? null : index)}
                aria-expanded={open === index}
                className="flex w-full items-center justify-between gap-4 py-5 text-left"
              >
                <span className="text-base text-white">{item.question}</span>
                <span className="shrink-0 text-white/40" aria-hidden>
                  {open === index ? '−' : '+'}
                </span>
              </button>

              <AnimatePresence initial={false}>
                {open === index ? (
                  <motion.div
                    initial={reduced ? false : { height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={reduced ? { opacity: 0 } : { height: 0, opacity: 0 }}
                    transition={{ duration: reduced ? 0 : 0.24, ease: [0.22, 1, 0.36, 1] }}
                    className="overflow-hidden"
                  >
                    <p className="prose-nexteo pb-5 text-sm text-white/60">{item.answer}</p>
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
