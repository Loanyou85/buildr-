'use client';

import { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

/**
 * Apparition à l'entrée dans l'écran, une seule fois.
 *
 * Volontairement écrit à la main plutôt qu'avec une bibliothèque d'animation :
 * la landing tient un budget de 200 Ko de JavaScript (section 2.2), et entre
 * une belle animation et un chargement rapide sur mobile, la section 16 dit
 * de choisir la vitesse. Environ un kilooctet ici, contre plusieurs dizaines.
 */
export function Reveal({
  children,
  delay = 0,
  className,
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const noeud = ref.current;
    if (!noeud) return;

    // Le réglage système prime : on affiche tout, tout de suite.
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      noeud.style.opacity = '1';
      noeud.style.transform = 'none';
      return;
    }

    const observateur = new IntersectionObserver(
      (entrees) => {
        for (const entree of entrees) {
          if (!entree.isIntersecting) continue;
          const cible = entree.target as HTMLElement;
          cible.style.transitionDelay = `${delay}ms`;
          cible.style.opacity = '1';
          cible.style.transform = 'none';
          observateur.unobserve(cible);
        }
      },
      { rootMargin: '0px 0px -12% 0px' },
    );

    observateur.observe(noeud);
    return () => observateur.disconnect();
  }, [delay]);

  return (
    <div
      ref={ref}
      className={cn('transition-[opacity,transform] duration-500', className)}
      style={{
        opacity: 0,
        transform: 'translate3d(0, 16px, 0)',
        transitionTimingFunction: 'var(--ease-nexteo)',
      }}
    >
      {children}
    </div>
  );
}
