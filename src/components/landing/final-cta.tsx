import Link from 'next/link';
import { CtaArrow } from '@/components/landing/cta-arrow';

/** Bloc CTA final (pattern 11) : fond sombre, glow, trois badges sous le bouton. */
export function FinalCta() {
  return (
    <section className="relative overflow-hidden bg-plan-900 py-28 text-white">
      <div
        className="glow-acier pointer-events-none absolute left-1/2 top-1/2 size-[700px] -translate-x-1/2 -translate-y-1/2"
        aria-hidden
      />
      <div className="relative mx-auto max-w-2xl px-5 text-center">
        <h2 className="font-display text-4xl font-extrabold leading-[1.02] tracking-[-0.02em]">
          Ton business. Construis-le.
        </h2>
        <p className="prose-nexteo mx-auto mt-6 text-lg text-white/70">
          Commence par le diagnostic. En une quinzaine de minutes, tu sauras quelle activité te
          correspond et quelle est ta première étape.
        </p>

        <Link
          href="/inscription"
          className="group mt-10 inline-flex h-13 items-center gap-2.5 rounded-xl bg-signal px-8 text-base font-medium text-white transition-colors hover:bg-[#f06f12]"
        >
          Trouver mon business
          <CtaArrow />
        </Link>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-white/50">
          <span>Diagnostic gratuit</span>
          <span>Aucune carte bancaire</span>
          <span>Suppression du compte en un clic</span>
        </div>
      </div>
    </section>
  );
}
