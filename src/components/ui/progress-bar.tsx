'use client';

import { motion, useReducedMotion } from 'motion/react';
import { cn } from '@/lib/utils';

/**
 * Barre de progression principale. Remplissage avec ressort, jamais linéaire
 * (section 5.2). Elle ne recule jamais : la valeur est bornée par le parent.
 */
export function ProgressBar({
  value,
  className,
  tone = 'acier',
  label,
}: {
  value: number;
  className?: string;
  tone?: 'acier' | 'niveau';
  label?: string;
}) {
  const reduced = useReducedMotion();
  const clamped = Math.max(0, Math.min(100, value));

  return (
    <div
      className={cn('h-2 w-full overflow-hidden rounded-full bg-beton-300/60', className)}
      role="progressbar"
      aria-valuenow={Math.round(clamped)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label ?? 'Progression'}
    >
      <motion.div
        className={cn('h-full rounded-full', tone === 'niveau' ? 'bg-niveau' : 'bg-acier')}
        initial={{ width: reduced ? `${clamped}%` : 0 }}
        animate={{ width: `${clamped}%` }}
        transition={reduced ? { duration: 0 } : { type: 'spring', stiffness: 120, damping: 20, mass: 0.6 }}
      />
    </div>
  );
}
