'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

/**
 * Erreur pendant le diagnostic. C'est l'endroit le plus coûteux du site pour
 * une page morte : quelqu'un qui arrive de TikTok et voit un écran figé à la
 * première question ne revient pas. On lui dit ce qui se passe, et on lui
 * laisse deux sorties.
 */
export default function DiagnosticError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[nexteo/diagnostic]', error);
  }, [error]);

  return (
    <main className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-4">
      <h1 className="text-xl font-extrabold text-white">Ta réponse n’est pas passée.</h1>
      <p className="mt-3 text-sm text-gris-300">
        Le problème vient de nous. Tes réponses précédentes sont gardées : reprends là où tu en
        étais, tu ne recommences pas depuis le début.
      </p>

      <div className="mt-8 space-y-3">
        <Button type="button" taille="bloc" onClick={reset}>
          Réessayer
        </Button>
        <Button asChild taille="bloc" variant="secondaire">
          <Link href="/diagnostic">Reprendre le diagnostic</Link>
        </Button>
      </div>

      {error.digest ? (
        <p className="mt-8 text-center font-mono text-xs text-gris-300">Incident {error.digest}</p>
      ) : null}
    </main>
  );
}
