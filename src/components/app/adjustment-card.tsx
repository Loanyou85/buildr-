'use client';

import { useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { Button } from '@/components/ui/button';
import { acceptAdjustment, dismissAdjustment } from '@/server/actions/journey';

/**
 * Un ajustement est présenté comme une amélioration de l'étape en cours, jamais
 * comme un retour en arrière (section 10). Pas d'orange ici : le signal reste
 * réservé à la prochaine action.
 */
export function AdjustmentCard({ id, suggestion }: { id: string; suggestion: string }) {
  const reduced = useReducedMotion();
  const [open, setOpen] = useState(true);
  if (!open) return null;

  return (
    <motion.aside
      initial={reduced ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: reduced ? 0 : 0.24, ease: [0.22, 1, 0.36, 1] }}
      className="mt-8 rounded-card border border-acier/30 bg-acier-50 p-5"
    >
      <p className="text-sm font-medium text-acier">Une amélioration à faire sur cette étape</p>
      <p className="prose-buildr mt-2 text-sm text-encre">{suggestion}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        <form action={acceptAdjustment}>
          <input type="hidden" name="adjustmentId" value={id} />
          <Button type="submit" variant="acier" size="sm">
            Je m’en occupe
          </Button>
        </form>
        <form action={dismissAdjustment} onSubmit={() => setOpen(false)}>
          <input type="hidden" name="adjustmentId" value={id} />
          <Button type="submit" variant="ghost" size="sm">
            Plus tard
          </Button>
        </form>
      </div>
    </motion.aside>
  );
}
