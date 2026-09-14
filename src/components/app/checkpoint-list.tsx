'use client';

import { useOptimistic, useState, useTransition } from 'react';
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
 * La case se remplit **immédiatement** au clic, sans attendre le serveur : une
 * validation qui met une seconde à réagir donne l'impression que rien ne s'est
 * passé. Si l'enregistrement échoue, la case revient en arrière et l'erreur est
 * affichée — un clic ne doit jamais rester sans réponse.
 */
export function CheckpointList({
  stepId,
  checkpoints,
  checkedIds,
  isDone,
  error,
}: {
  stepId: string;
  checkpoints: CheckpointRow[];
  checkedIds: string[];
  isDone: boolean;
  error?: boolean;
}) {
  const reduced = useReducedMotion();
  const [isPending, startTransition] = useTransition();
  const [failure, setFailure] = useState<string | null>(null);

  const [optimisticChecked, applyOptimistic] = useOptimistic(
    checkedIds,
    (current: string[], checkpointId: string) =>
      current.includes(checkpointId)
        ? current.filter((id) => id !== checkpointId)
        : [...current, checkpointId],
  );

  const checked = new Set(optimisticChecked);
  const canComplete = checkpoints
    .filter((checkpoint) => checkpoint.isRequired)
    .every((checkpoint) => checked.has(checkpoint.id));

  function toggle(checkpointId: string, wasChecked: boolean) {
    if (isDone) return;
    setFailure(null);

    if (!wasChecked && typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate?.(10);
    }

    startTransition(async () => {
      applyOptimistic(checkpointId);

      const formData = new FormData();
      formData.set('stepId', stepId);
      formData.set('checkpointId', checkpointId);

      try {
        await toggleCheckpoint(formData);
      } catch {
        // Cas le plus courant : la page a été ouverte avant un redéploiement,
        // et le serveur ne reconnaît plus l'action. Recharger suffit.
        setFailure(
          'Cette validation n’a pas été enregistrée. Recharge la page (Ctrl + Maj + R, ou Cmd + Maj + R sur Mac) et réessaie.',
        );
      }
    });
  }

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
              <button
                type="button"
                disabled={isDone}
                onClick={() => toggle(checkpoint.id, isChecked)}
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
                <span className={cn('text-base', isChecked ? 'text-beton-600 line-through' : 'text-encre')}>
                  {checkpoint.label}
                  {!checkpoint.isRequired ? (
                    <span className="ml-2 text-xs text-beton-600">facultatif</span>
                  ) : null}
                </span>
              </button>
            </li>
          );
        })}
      </ul>

      {failure ? (
        <p className="prose-nexteo mt-4 rounded-card border border-beton-300 bg-blanc p-4 text-sm text-encre">
          {failure}
        </p>
      ) : null}

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
          <Button type="submit" variant="signal" size="lg" disabled={!canComplete || isPending}>
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
