import Link from 'next/link';
import { CtaArrow } from '@/components/landing/cta-arrow';

/**
 * Mur de témoignages (pattern 9) : colonnes défilant verticalement à vitesses
 * différentes, en boucle.
 *
 * Garde-fou n° 1, non négociable : le contenu est réel ou il n'y a rien. Tant
 * qu'aucun utilisateur n'a partagé son aventure, le mur reste vide et invite à
 * être le premier. Aucun faux témoignage n'est généré, même « pour l'exemple ».
 */
export interface WallEntry {
  slug: string;
  name: string;
  business: string;
  excerpt: string;
}

export function TestimonialWall({ entries }: { entries: WallEntry[] }) {
  if (entries.length === 0) {
    return (
      <section className="bg-plan-900 py-24 text-white">
        <div className="mx-auto max-w-2xl px-5 text-center">
          <h2 className="font-display text-2xl font-extrabold leading-[1.12] tracking-[-0.02em] sm:text-3xl sm:leading-[1.08]">
            Aucune aventure partagée pour l’instant.
          </h2>
          <p className="prose-nexteo mx-auto mt-5 text-base text-white/60">
            Nexteo n’affiche que des parcours réels. Tant que personne n’a publié le sien, cet espace
            reste vide — et c’est volontaire. La première aventure publiée sera peut-être la tienne.
          </p>
          <Link
            href="/inscription"
            className="group mt-8 inline-flex h-12 items-center gap-2.5 rounded-xl border border-white/20 px-6 text-sm text-white transition-colors hover:border-acier hover:text-acier"
          >
            Trouver mon business
            <CtaArrow />
          </Link>
        </div>
      </section>
    );
  }

  const columns = [entries.filter((_, i) => i % 3 === 0), entries.filter((_, i) => i % 3 === 1), entries.filter((_, i) => i % 3 === 2)];
  const durations = ['48s', '38s', '56s'];

  return (
    <section className="bg-plan-900 py-24 text-white">
      <div className="mx-auto max-w-6xl px-5">
        <h2 className="font-display text-2xl font-extrabold leading-[1.12] tracking-[-0.02em] sm:text-3xl sm:leading-[1.08]">
          Des aventures réelles
        </h2>
        <p className="prose-nexteo mt-4 text-base text-white/60">
          Publiées par ceux qui les construisent. Chacun choisit ce qu’il montre.
        </p>

        <div className="column-wall mt-12 grid max-h-[560px] grid-cols-1 gap-4 overflow-hidden sm:grid-cols-3">
          {columns.map((column, index) => (
            <div key={index} className={index === 2 ? 'hidden sm:block' : ''}>
              <div className="column-scroll space-y-4" style={{ ['--column-duration' as string]: durations[index] }}>
                {[0, 1].map((copy) => (
                  <div key={copy} className="space-y-4" aria-hidden={copy === 1}>
                    {column.map((entry) => (
                      <Link
                        key={`${copy}-${entry.slug}`}
                        href={`/aventure/${entry.slug}`}
                        className="block rounded-card border border-white/10 bg-white/[0.03] p-5 transition-colors hover:border-acier"
                      >
                        <p className="text-sm text-white/50">{entry.business}</p>
                        <p className="prose-nexteo mt-2 text-sm text-white/80">{entry.excerpt}</p>
                        <p className="mt-3 text-xs text-white/40">{entry.name}</p>
                      </Link>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
