'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[nexteo/app]', error);
  }, [error]);

  return (
    <main className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-4">
      <h1 className="text-xl font-extrabold text-white">Cet écran n’a pas pu s’afficher.</h1>
      <p className="mt-3 text-sm text-gris-300">
        Ta progression est enregistrée au fur et à mesure : rien n’est perdu.
      </p>
      <div className="mt-8 space-y-3">
        <Button type="button" taille="bloc" onClick={reset}>
          Réessayer
        </Button>
        <Button asChild taille="bloc" variant="secondaire">
          <Link href="/app">Revenir à ce que je dois faire</Link>
        </Button>
      </div>
      {error.digest ? (
        <p className="mt-8 text-center font-mono text-xs text-gris-300">Incident {error.digest}</p>
      ) : null}
    </main>
  );
}
