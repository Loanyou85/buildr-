'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';

/**
 * Franchissement d'étape : un seul moment, satisfaisant sans être infantile
 * (section 5.2). L'onde part du point franchi vers l'étape suivante, qui se
 * déverrouille. 600 ms maximum, puis l'écran redevient calme.
 */
export function MilestoneCelebration({ stepNumber, stepTitle }: { stepNumber: number; stepTitle: string }) {
  const reduced = useReducedMotion();
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(false), reduced ? 1200 : 2600);
    return () => clearTimeout(timer);
  }, [reduced]);

  return (
    <AnimatePresence>
      {visible ? (
        <motion.div
          initial={reduced ? false : { opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduced ? 0 : 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="relative mb-6 overflow-hidden rounded-card border border-niveau/40 bg-niveau-50 px-5 py-4"
          role="status"
        >
          {!reduced ? (
            <motion.span
              aria-hidden
              initial={{ scale: 0, opacity: 0.4 }}
              animate={{ scale: 3, opacity: 0 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="absolute left-6 top-1/2 size-16 -translate-y-1/2 rounded-full bg-niveau/30"
            />
          ) : null}
          <p className="relative text-sm font-medium text-niveau">Étape {stepNumber} franchie</p>
          <p className="relative mt-1 text-base text-encre">{stepTitle}</p>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
