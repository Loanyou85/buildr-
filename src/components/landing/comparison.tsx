'use client';

import { motion, useReducedMotion } from 'motion/react';

/**
 * Tableau comparatif (pattern 7) : Buildr à gauche, « faire seul » à droite,
 * ligne par ligne, révélé au scroll. Aucune comparaison avec un concurrent
 * nommé, aucune promesse de résultat.
 */
const ROWS: Array<{ subject: string; buildr: string; alone: string }> = [
  { subject: 'Choisir une activité', buildr: 'Un moteur croise onze dimensions et explique son choix', alone: 'Des heures de vidéos et une intuition' },
  { subject: 'Savoir quoi faire aujourd’hui', buildr: 'Une étape, trois actions, un temps estimé', alone: 'Une liste de choses à faire qui s’allonge' },
  { subject: 'Le niveau de détail', buildr: 'Chaque action exécutable, avec sa règle et son exemple', alone: '« Il faut créer du contenu »' },
  { subject: 'Savoir si c’est validé', buildr: 'Des critères à cocher avant de débloquer la suite', alone: 'Le doute permanent' },
  { subject: 'Quand ça coince', buildr: 'Le parcours détecte et propose un ajustement', alone: 'On persévère dans ce qui ne marche pas' },
  { subject: 'La progression', buildr: 'Une barre qui ne recule jamais', alone: 'L’impression de tourner en rond' },
];

export function Comparison() {
  const reduced = useReducedMotion();

  return (
    <section className="bg-plan-900 py-24 text-white">
      <div className="mx-auto max-w-4xl px-5">
        <h2 className="font-display text-3xl font-extrabold leading-[1.08] tracking-[-0.02em]">
          Avec un parcours, ou seul
        </h2>

        <div className="mt-12 overflow-x-auto">
          <table className="w-full min-w-[640px] border-collapse text-left">
            <thead>
              <tr className="text-sm text-white/50">
                <th className="w-1/4 pb-4 font-normal" />
                <th className="w-2/5 pb-4 font-medium text-white">Avec Buildr</th>
                <th className="pb-4 font-normal">En construisant seul</th>
              </tr>
            </thead>
            <tbody>
              {ROWS.map((row, index) => (
                <motion.tr
                  key={row.subject}
                  initial={reduced ? false : { opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-80px' }}
                  transition={{ duration: reduced ? 0 : 0.35, delay: reduced ? 0 : index * 0.05, ease: [0.22, 1, 0.36, 1] }}
                  className="border-t border-white/10 align-top"
                >
                  <td className="py-4 pr-4 text-sm text-white/50">{row.subject}</td>
                  <td className="py-4 pr-4 text-sm text-white">{row.buildr}</td>
                  <td className="py-4 text-sm text-white/40">{row.alone}</td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
