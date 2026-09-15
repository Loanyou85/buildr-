import Link from 'next/link';
import { TopBar } from '@/components/shell/top-bar';
import { Button } from '@/components/ui/button';
import {
  GUARANTEE_CONDITIONS,
  GUARANTEE_DAYS,
  GUARANTEE_HEADLINE,
  GUARANTEE_LEGAL_NOTE,
  GUARANTEE_PROMISE,
  SUPPORT_EMAIL,
} from '@/lib/guarantee';

export const metadata = { title: `La garantie ${GUARANTEE_DAYS} jours — Nexteo` };

export default function GarantiePage() {
  return (
    <>
      <TopBar />
      <main className="mx-auto max-w-md px-4 pb-16 pt-8">
        <h1 className="text-xl font-extrabold text-white">{GUARANTEE_HEADLINE}</h1>
        <p className="mt-3 text-sm text-gris-300">{GUARANTEE_PROMISE}</p>

        <p className="mt-4 text-sm text-gris-300">
          Une garantie dont les conditions sont cachées se retourne contre celui qui l’annonce. Les
          voici, en entier, avant que tu décides.
        </p>

        <dl className="mt-8 space-y-5">
          {GUARANTEE_CONDITIONS.map((condition) => (
            <div key={condition.title} className="border-l-2 border-gris-700 pl-4">
              <dt className="text-sm font-bold text-white">{condition.title}</dt>
              <dd className="mt-1 text-sm text-gris-300">{condition.detail}</dd>
            </div>
          ))}
        </dl>

        <p className="mt-8 rounded-card border border-gris-700 bg-nuit-800 p-4 text-xs text-gris-300">
          {GUARANTEE_LEGAL_NOTE}
        </p>

        <p className="mt-4 text-xs text-gris-300">
          Une question avant de t’abonner ? Écris à{' '}
          <a href={`mailto:${SUPPORT_EMAIL}`} className="text-neo-100 underline underline-offset-4">
            {SUPPORT_EMAIL}
          </a>
          .
        </p>

        <Button asChild taille="bloc" className="mt-8">
          <Link href="/offres">Revenir aux offres</Link>
        </Button>
      </main>
    </>
  );
}
