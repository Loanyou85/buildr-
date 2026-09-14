'use client';

import { useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { recordMilestone } from '@/server/actions/journey';
import { DECLARED_LABEL } from '@/lib/guardrails';
import { ShareCard } from '@/components/app/share-card';
import { cn, formatDateFr, formatEuros } from '@/lib/utils';

interface MilestoneRow {
  id: string;
  key: string;
  label: string;
  reachedAt: string | null;
  declaredValue: number | null;
  verificationStatus: 'declared' | 'verified' | null;
}

export function MilestoneList({
  milestones,
  businessName,
  justReachedKey,
  canSharePublicly,
}: {
  milestones: MilestoneRow[];
  businessName: string | null;
  justReachedKey: string | null;
  canSharePublicly: boolean;
}) {
  const reduced = useReducedMotion();
  const [declaring, setDeclaring] = useState<string | null>(null);
  const justReached = milestones.find((m) => m.key === justReachedKey && m.reachedAt);

  return (
    <div className="mt-10">
      {/*
        Franchissement de jalon : le seul moment célébratoire du produit
        (section 5.2). La carte partageable se compose à l'écran.
      */}
      <AnimatePresence>
        {justReached ? (
          <motion.div
            initial={reduced ? false : { opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduced ? 0 : 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="mb-10"
          >
            <ShareCard
              milestoneLabel={justReached.label}
              businessName={businessName}
              declaredValue={justReached.declaredValue}
              reachedAt={justReached.reachedAt!}
              canSharePublicly={canSharePublicly}
            />
          </motion.div>
        ) : null}
      </AnimatePresence>

      <ol className="space-y-3">
        {milestones.map((milestone) => {
          const reached = Boolean(milestone.reachedAt);
          return (
            <li
              key={milestone.id}
              className={cn(
                'rounded-card border px-5 py-4',
                reached ? 'border-niveau/40 bg-niveau-50' : 'border-beton-300 bg-blanc',
              )}
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-base text-encre">{milestone.label}</p>
                  {reached ? (
                    <p className="tabular mt-1 text-sm text-beton-600">
                      {formatDateFr(new Date(milestone.reachedAt!))}
                      {milestone.declaredValue !== null ? ` · ${formatEuros(milestone.declaredValue)}` : ''}
                    </p>
                  ) : (
                    <p className="mt-1 text-sm text-beton-600">Pas encore franchi</p>
                  )}
                </div>

                {reached ? (
                  <Badge variant="niveau">{DECLARED_LABEL}</Badge>
                ) : declaring === milestone.key ? null : (
                  <Button variant="outline" size="sm" onClick={() => setDeclaring(milestone.key)}>
                    Je l’ai franchi
                  </Button>
                )}
              </div>

              {declaring === milestone.key && !reached ? (
                <form action={recordMilestone} className="mt-4 flex flex-wrap items-end gap-3">
                  <input type="hidden" name="key" value={milestone.key} />
                  <label className="flex flex-col gap-1.5">
                    <span className="text-xs text-beton-600">Montant, si tu veux le noter (facultatif)</span>
                    <Input type="number" name="declaredValue" min={0} className="tabular w-40" />
                  </label>
                  <Button type="submit" variant="acier" size="sm">
                    Enregistrer
                  </Button>
                  <Button type="button" variant="ghost" size="sm" onClick={() => setDeclaring(null)}>
                    Annuler
                  </Button>
                </form>
              ) : null}
            </li>
          );
        })}
      </ol>

      <p className="prose-buildr mt-8 text-xs text-beton-600">
        Les montants que tu notes sont déclaratifs. Buildr ne les vérifie pas et ne les présente jamais
        comme vérifiés.
      </p>
    </div>
  );
}
