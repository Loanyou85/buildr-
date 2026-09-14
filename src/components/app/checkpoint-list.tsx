'use client';

import { motion, useReducedMotion } from 'motion/react';
import { Button } from '@/components/ui/button';
import { completeStep, toggleCheckpoint } from '@/server/actions/journey';
import { cn } from '@/lib/utils';

interface CheckpointRow {
  id: string;
  label: string;
  isRequired: boolean;
}

/**
 * Checklist de validation (section 8.6). Le bouton « J'ai terminé » n'est actif
 * que si tous les critères obligatoires sont cochés — et le serveur le
 * revérifie de toute façon.
 *
 * Validation d'une tâche : la case se remplit avec un ressort court, le texte
 * passe en gris et se barre, léger retour haptique sur mobile (section 5.2).
 */
export function CheckpointList({
  stepId,
  checkpoints,
  checkedIds,
  canComplete,
  isDone,
  error,
}: {
  stepId: string;
  checkpoints: CheckpointRow[];
  checkedIds: string[];
  canComplete: boolean;
  isDone: boolean;
  error?: boolean;
}) {
  const reduced = useReducedMotion();
  const checked = new Set(checkedIds);

  return (
    <section className="mt-12 border-t border-beton-300 pt-8">
      <h2 className="text-lg text-encre">Valider cette étape</h2>
      <p className="mt-2 text-sm text-beton-600">
        Coche ce que tu as réellement fait. Cette liste est la seule chose qui débloque la suite.
      </p>

      <ul className="mt-5 space-y-1">
        {checkpoints.map((checkpoint) => {
          const isChecked = checked.has(checkpoint.id);
          return (
            <li key={checkpoint.id}>
              <form action={toggleCheckpoint}>
                <input type="hidden" name="stepId" value={stepId} />
                <input type="hidden" name="checkpointId" value={checkpoint.id} />
                <button
                  type="submit"
                  disabled={isDone}
                  onClick={() => {
                    if (!isChecked && typeof navigator !== 'undefined' && 'vibrate' in navigator) {
                      navigator.vibrate?.(10);
                    }
                  }}
                  className="flex w-full items-start gap-3 rounded-xl px-2 py-2.5 text-left transition-colors hover:bg-beton-100 disabled:hover:bg-transparent"
                  aria-pressed={isChecked}
                >
                  <motion.span
                    initial={false}
                    animate={{ scale: isChecked && !reduced ? [1, 1.12, 1] : 1 }}
                    transition={{ duration: reduced ? 0 : 0.32, ease: [0.22, 1, 0.36, 1] }}
                    className={cn(
                      'mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-md border text-xs',
                      isChecked ? 'border-niveau bg-niveau text-white' : 'border-beton-300 bg-blanc',
                    )}
                    aria-hidden
                  >
                    {isChecked ? '✓' : ''}
                  </motion.span>
                  <span
                    className={cn(
                      'text-base',
                      isChecked ? 'text-beton-600 line-through' : 'text-encre',
                    )}
                  >
                    {checkpoint.label}
                    {!checkpoint.isRequired ? (
                      <span className="ml-2 text-xs text-beton-600">facultatif</span>
                    ) : null}
                  </span>
                </button>
              </form>
            </li>
          );
        })}
      </ul>

      {error ? (
        <p className="mt-4 text-sm text-encre">
          Il reste des critères obligatoires à cocher. C’est ce qui garantit que l’étape suivante partira
          sur des bases solides.
        </p>
      ) : null}

      {isDone ? (
        <p className="mt-6 text-sm text-niveau">Étape franchie. La suivante est ouverte.</p>
      ) : (
        <form action={completeStep} className="mt-6">
          <input type="hidden" name="stepId" value={stepId} />
          <Button type="submit" variant="signal" size="lg" disabled={!canComplete}>
            J’ai terminé
          </Button>
          {!canComplete ? (
            <p className="mt-2 text-sm text-beton-600">
              Coche les critères obligatoires pour débloquer ce bouton.
            </p>
          ) : null}
        </form>
      )}
    </section>
  );
}
