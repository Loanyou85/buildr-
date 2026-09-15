'use client';

import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

const PROMESSES = [
  {
    titre: 'Trouve ton idée.',
    texte:
      'Une idée construite à partir de ton profil : ce que tu sais faire, les milieux que tu connais de l’intérieur, tes contraintes. Pas une liste d’idées génériques.',
    ecran: ['Ton idée', 'Suivi de séances pour cabinets de kiné', '— parce que tu connais ce milieu'],
  },
  {
    titre: 'Construis-le sans coder.',
    texte:
      'De la page blanche au site en ligne qui encaisse, avec Claude, GitHub, Vercel et Stripe. Tous les prompts à copier-coller, dans l’ordre, y compris ceux qui réparent quand ça casse.',
    ecran: ['Phase 5 sur 13', 'Mettre en ligne', 'Copier le prompt →'],
  },
  {
    titre: 'Vends-le.',
    texte:
      'Trente scripts de vidéos générés pour ton produit, prêts à tourner, un par jour pendant un mois. Les six premiers se tournent avant d’avoir le moindre utilisateur.',
    ecran: ['Jour 1 sur 30', 'Le problème', '« Si tu es kiné, tu perds… »'],
  },
];

/**
 * Bloc collant (section 5.1.5) : le téléphone reste fixe pendant que son
 * écran change au défilement, pour montrer les trois promesses.
 */
export function Scrollytelling() {
  const ref = useRef<HTMLDivElement>(null);
  const [actif, setActif] = useState(0);

  useEffect(() => {
    const noeud = ref.current;
    if (!noeud) return;
    const sections = Array.from(noeud.querySelectorAll<HTMLElement>('[data-promesse]'));

    const observateur = new IntersectionObserver(
      (entrees) => {
        for (const entree of entrees) {
          if (entree.isIntersecting) {
            setActif(Number((entree.target as HTMLElement).dataset.promesse));
          }
        }
      },
      { rootMargin: '-45% 0px -45% 0px' },
    );

    for (const section of sections) observateur.observe(section);
    return () => observateur.disconnect();
  }, []);

  const courante = PROMESSES[actif] ?? PROMESSES[0]!;

  return (
    <div ref={ref} className="md:grid md:grid-cols-2 md:gap-12">
      <div className="md:sticky md:top-24 md:h-[60vh] md:self-start">
        <div className="sticky top-20 z-10 mx-auto w-[220px] py-4 md:static md:w-[260px] md:py-0">
          <div className="relative rounded-[32px] border border-gris-700 bg-nuit-800 p-4">
            <div aria-hidden className="halo-neo absolute -inset-10 -z-10 rounded-full" />
            <p className="text-xs uppercase tracking-wide text-gris-300">{courante.ecran[0]}</p>
            <p className="mt-3 text-base font-bold leading-snug text-white">{courante.ecran[1]}</p>
            <p className="mt-2 text-xs text-neo-100">{courante.ecran[2]}</p>
            <div className="mt-6 h-1 w-full overflow-hidden rounded-full bg-nuit-700">
              <div
                className="h-full rounded-full bg-neo-500 transition-[width] duration-500"
                style={{
                  width: `${((actif + 1) / PROMESSES.length) * 100}%`,
                  transitionTimingFunction: 'var(--ease-nexteo)',
                }}
              />
            </div>
          </div>
        </div>
      </div>

      <ol className="mt-8 space-y-24 md:mt-0 md:space-y-[40vh]">
        {PROMESSES.map((promesse, index) => (
          <li
            key={promesse.titre}
            data-promesse={index}
            className={cn(
              'transition-opacity duration-300',
              actif === index ? 'opacity-100' : 'opacity-50',
            )}
          >
            <p className="font-display text-sm font-extrabold tabular text-neo-500">
              {String(index + 1).padStart(2, '0')}
            </p>
            <h3 className="mt-2 text-lg font-extrabold text-white">{promesse.titre}</h3>
            <p className="mt-2 text-sm text-gris-300">{promesse.texte}</p>
          </li>
        ))}
      </ol>
    </div>
  );
}
