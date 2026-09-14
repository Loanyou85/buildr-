'use client';

import { useEffect } from 'react';
import Lenis from 'lenis';

/**
 * Smooth scroll de la landing uniquement (section 3). L'app n'en a pas :
 * dans le produit, la navigation doit être instantanée.
 * Respecte `prefers-reduced-motion` : on ne l'installe simplement pas.
 */
export function SmoothScroll() {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const lenis = new Lenis({ duration: 1.1, smoothWheel: true });
    let frame = 0;

    function raf(time: number) {
      lenis.raf(time);
      frame = requestAnimationFrame(raf);
    }
    frame = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(frame);
      lenis.destroy();
    };
  }, []);

  return null;
}
