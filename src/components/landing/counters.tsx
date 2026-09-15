'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * Compteurs (section 5.1.8) : montent à l'entrée dans l'écran, une seule fois.
 *
 * Ce ne sont pas des chiffres de vanité. Ce sont des faits vérifiables sur le
 * contenu du produit, lus en base au rendu — garde-fou n° 3 : aucun faux
 * chiffre, nulle part.
 */
export function Counters({ items }: { items: { value: number; label: string }[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const noeud = ref.current;
    if (!noeud) return;
    const observateur = new IntersectionObserver(
      ([entree]) => {
        if (entree?.isIntersecting) {
          setVisible(true);
          observateur.disconnect();
        }
      },
      { rootMargin: '0px 0px -20% 0px' },
    );
    observateur.observe(noeud);
    return () => observateur.disconnect();
  }, []);

  return (
    <div ref={ref} className="grid grid-cols-2 gap-4 sm:grid-cols-4">
      {items.map((item) => (
        <div key={item.label} className="rounded-card border border-gris-700 bg-nuit-800 p-4">
          <Chiffre valeur={item.value} demarre={visible} />
          <p className="mt-1 text-xs text-gris-300">{item.label}</p>
        </div>
      ))}
    </div>
  );
}

function Chiffre({ valeur, demarre }: { valeur: number; demarre: boolean }) {
  const [affiche, setAffiche] = useState(0);

  useEffect(() => {
    if (!demarre) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setAffiche(valeur);
      return;
    }
    const duree = 600;
    const debut = performance.now();
    let frame = 0;
    const avancer = (maintenant: number) => {
      const t = Math.min(1, (maintenant - debut) / duree);
      // Sortie douce, jamais au-delà de 600 ms (section 5.3).
      setAffiche(Math.round(valeur * (1 - (1 - t) ** 3)));
      if (t < 1) frame = requestAnimationFrame(avancer);
    };
    frame = requestAnimationFrame(avancer);
    return () => cancelAnimationFrame(frame);
  }, [demarre, valeur]);

  return <p className="font-display text-xl font-extrabold tabular text-white">{affiche}</p>;
}
