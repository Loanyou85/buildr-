import Link from 'next/link';
import { Logo } from '@/components/brand/logo';
import { db } from '@/server/db';
import { SmoothScroll } from '@/components/landing/smooth-scroll';
import { Hero } from '@/components/landing/hero';
import { Marquee } from '@/components/landing/marquee';
import { Scrollytelling } from '@/components/landing/scrollytelling';
import { Bento } from '@/components/landing/bento';
import { Comparison } from '@/components/landing/comparison';
import { Counters } from '@/components/landing/counters';
import { TestimonialWall, type WallEntry } from '@/components/landing/testimonial-wall';
import { Faq } from '@/components/landing/faq';
import { FinalCta } from '@/components/landing/final-cta';

export const dynamic = 'force-dynamic';

/**
 * Landing publique (section 8.1). Territoire spectaculaire : fond sombre,
 * glows, mockups flottants, mouvement. L'app, elle, reste sobre — les deux ne
 * se contaminent pas (section 4.4).
 */
export default async function LandingPage() {
  // Garde-fou n° 1 : le mur lit les aventures réelles. S'il n'y en a pas, il
  // reste vide. Aucun témoignage n'est inventé pour remplir la page.
  const adventures = await db.adventure.findMany({
    where: { isPublic: true, story: { not: null } },
    orderBy: { startedAt: 'desc' },
    take: 12,
    include: {
      user: {
        select: {
          name: true,
          userJourneys: {
            take: 1,
            orderBy: { startedAt: 'desc' },
            include: { journey: { include: { businessModel: { select: { name: true } } } } },
          },
        },
      },
    },
  });

  const entries: WallEntry[] = adventures.map((adventure) => ({
    slug: adventure.slug,
    name: adventure.user.name ?? 'Une aventure',
    business: adventure.user.userJourneys[0]?.journey.businessModel.name ?? 'Parcours en cours',
    excerpt: (adventure.story ?? '').slice(0, 220),
  }));

  return (
    <div className="bg-plan-900">
      <SmoothScroll />

      <header className="absolute inset-x-0 top-0 z-30">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
          <Logo className="text-white" />
          <nav className="flex items-center gap-5">
            <Link href="/aventures" className="text-sm text-white/60 transition-colors hover:text-white">
              Les aventures
            </Link>
            <Link
              href="/connexion"
              className="rounded-xl border border-white/20 px-4 py-2 text-sm text-white transition-colors hover:border-acier hover:text-acier"
            >
              Se connecter
            </Link>
          </nav>
        </div>
      </header>

      <Hero />
      <Marquee />
      <Scrollytelling />
      <Bento />
      <Counters />
      <Comparison />
      <TestimonialWall entries={entries} />
      <Faq />
      <FinalCta />

      <footer className="border-t border-white/10 bg-plan-900 py-10 text-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-5">
          <Logo className="text-white/70" markClassName="size-5" wordClassName="text-sm" />
          <p className="text-xs text-white/40">
            Nexteo n’est pas une promesse de revenu. C’est un parcours d’exécution.
          </p>
        </div>
      </footer>
    </div>
  );
}
