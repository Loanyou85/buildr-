'use client';

import { useEffect, useRef } from 'react';
import { useFormStatus } from 'react-dom';
import { Button } from '@/components/ui/button';

/**
 * Déclenche l'envoi tout seul, et reste un bouton visible si le JavaScript
 * n'a pas chargé : personne ne doit rester bloqué sur un écran d'attente.
 */
export function AutoSubmit({ label }: { label: string }) {
  const ref = useRef<HTMLButtonElement>(null);
  const { pending } = useFormStatus();
  const lance = useRef(false);

  useEffect(() => {
    if (lance.current) return;
    lance.current = true;
    ref.current?.click();
  }, []);

  return (
    <Button ref={ref} type="submit" taille="bloc" variant="secondaire" disabled={pending}>
      {pending ? 'On classe…' : label}
    </Button>
  );
}
