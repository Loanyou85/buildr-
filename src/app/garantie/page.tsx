import Link from 'next/link';
import { redirect } from 'next/navigation';
import { auth } from '@/server/auth';
import { CtaArrow } from '@/components/landing/cta-arrow';
import {
  GUARANTEE_CONDITIONS,
  GUARANTEE_DAYS,
  GUARANTEE_HEADLINE,
  GUARANTEE_LEGAL_NOTE,
  GUARANTEE_PROMISE,
} from '@/lib/guarantee';

export const dynamic = 'force-dynamic';

/**
 * La garantie, présentée juste avant les offres.
 *
 * Elle porte sur le produit et jamais sur un revenu : aucune phrase n'annonce
 * ni ne suggère un gain. Les conditions sont affichées en entier sur le même
 * écran que la promesse — une garantie dont les conditions attendent les
 * mentions légales n'est pas une garantie, c'est un argument de vente.
 */
export default async function GuaranteePage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/connexion');

  return (
    <div className="min-h-dvh bg-beton-100">
      <main className="mx-auto max-w-2xl px-5 py-16">
        <p className="text-sm text-beton-600">La garantie {GUARANTEE_DAYS} jours</p>
        <h1 className="mt-3 text-3xl">{GUARANTEE_HEADLINE}</h1>
        <p className="prose-nexteo mt-5 text-lg text-encre">{GUARANTEE_PROMISE}</p>

        <section className="mt-10 rounded-card border border-beton-300 bg-blanc">
          <p className="border-b border-beton-300 px-6 py-4 text-sm font-medium text-encre">
            Les conditions, en entier
          </p>
          <dl className="divide-y divide-beton-300">
            {GUARANTEE_CONDITIONS.map((condition) => (
              <div key={condition.title} className="px-6 py-4">
                <dt className="text-sm font-medium text-encre">{condition.title}</dt>
                <dd className="prose-nexteo mt-1 text-sm text-beton-600">{condition.detail}</dd>
              </div>
            ))}
          </dl>
        </section>

        <p className="prose-nexteo mt-6 text-xs text-beton-600">{GUARANTEE_LEGAL_NOTE}</p>

        <Link
          href="/offres"
          className="group mt-10 inline-flex h-13 items-center gap-2.5 rounded-xl bg-signal px-7 text-base font-medium text-white transition-colors hover:bg-[#f06f12]"
        >
          Voir les offres
          <CtaArrow />
        </Link>
      </main>
    </div>
  );
}
