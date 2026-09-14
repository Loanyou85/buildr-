'use client';

import Link from 'next/link';
import { motion, useReducedMotion } from 'motion/react';
import { cn, formatMinutes } from '@/lib/utils';

type StepStatus = 'locked' | 'available' | 'in_progress' | 'done';

interface PathStep {
  id: string;
  number: number;
  title: string;
  estimatedMinutes: number;
  status: StepStatus;
  checkedRatio: number;
}

interface PathPhase {
  id: string;
  title: string;
  goal: string;
  steps: PathStep[];
}

/**
 * La montée. L'ordre visuel part du bas (les débuts) vers le haut (la suite),
 * comme le schéma de la section 2 : la sensation recherchée est « je monte ».
 * Aucune animation d'entrée au scroll : c'est le réflexe générique à éviter
 * dans l'app (section 5.2).
 */
export function PathView({ phases, currentStepId }: { phases: PathPhase[]; currentStepId: string | null }) {
  const reduced = useReducedMotion();
  const ordered = [...phases].reverse();

  return (
    <div className="mt-10 space-y-10">
      {ordered.map((phase) => (
        <section key={phase.id}>
          <div className="mb-4 flex items-baseline gap-3">
            <h2 className="text-lg text-encre">{phase.title}</h2>
            <span className="h-px flex-1 bg-beton-300" aria-hidden />
          </div>
          <p className="prose-buildr mb-5 text-sm text-beton-600">{phase.goal}</p>

          <ol className="space-y-2">
            {[...phase.steps].reverse().map((step) => {
              const isCurrent = step.id === currentStepId;
              const locked = step.status === 'locked';
              const done = step.status === 'done';

              const content = (
                <div
                  className={cn(
                    'flex items-center gap-4 rounded-card border px-4 py-3.5 transition-colors',
                    done && 'border-niveau/40 bg-niveau-50',
                    isCurrent && !done && 'border-acier bg-blanc',
                    !done && !isCurrent && !locked && 'border-beton-300 bg-blanc hover:border-acier',
                    locked && 'border-dashed border-beton-300 bg-transparent',
                  )}
                >
                  <span
                    className={cn(
                      'tabular flex size-8 shrink-0 items-center justify-center rounded-full font-display text-sm font-bold',
                      done && 'bg-niveau text-white',
                      isCurrent && !done && 'bg-acier text-white',
                      !done && !isCurrent && 'bg-beton-100 text-beton-600',
                    )}
                    aria-hidden
                  >
                    {done ? '✓' : step.number}
                  </span>

                  <span className="min-w-0 flex-1">
                    <span className={cn('block truncate text-base', locked ? 'text-beton-600' : 'text-encre')}>
                      {step.title}
                    </span>
                    <span className="tabular mt-0.5 block text-xs text-beton-600">
                      {done
                        ? 'Franchie'
                        : locked
                          ? 'Se débloque à l’étape précédente'
                          : formatMinutes(step.estimatedMinutes)}
                    </span>
                  </span>

                  {isCurrent && !done ? (
                    <span className="shrink-0 rounded-full bg-acier-50 px-2.5 py-1 text-xs font-medium text-acier">
                      Étape en cours
                    </span>
                  ) : null}
                </div>
              );

              return (
                <motion.li
                  key={step.id}
                  initial={false}
                  animate={
                    isCurrent && !reduced
                      ? { scale: 1 }
                      : { scale: 1 }
                  }
                >
                  {locked ? (
                    <div aria-disabled className="cursor-default opacity-70">
                      {content}
                    </div>
                  ) : (
                    <Link href={`/app/etape/${step.id}`} className="block">
                      {content}
                    </Link>
                  )}
                </motion.li>
              );
            })}
          </ol>
        </section>
      ))}
    </div>
  );
}
