import Link from 'next/link';
import { db } from '@/server/db';
import { EmptyState } from '@/components/ui/empty-state';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatDateFr } from '@/lib/utils';

export const dynamic = 'force-dynamic';

/**
 * Aventures (section 8.8). Ce n'est pas un feed social : ce sont des parcours.
 * Garde-fou n° 1 : rien n'est inventé. Tant qu'aucun utilisateur réel n'a
 * partagé, l'état vide invite à être le premier.
 */
export default async function AdventuresPage() {
  const adventures = await db.adventure.findMany({
    where: { isPublic: true },
    orderBy: { startedAt: 'desc' },
    include: {
      user: {
        select: {
          name: true,
          userJourneys: {
            take: 1,
            orderBy: { startedAt: 'desc' },
            include: { journey: { include: { businessModel: true } } },
          },
          milestones: { include: { milestone: true } },
        },
      },
    },
  });

  return (
    <div className="min-h-dvh bg-beton-100">
      <header className="border-b border-beton-300 bg-blanc">
        <div className="mx-auto flex h-14 max-w-4xl items-center justify-between px-5">
          <Link href="/" className="font-display text-base font-bold tracking-[-0.02em] text-encre">
            NEXTEO
          </Link>
          <Button asChild variant="outline" size="sm">
            <Link href="/connexion">Commencer</Link>
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-5 py-12">
        <h1 className="text-3xl">Les aventures</h1>
        <p className="prose-nexteo mt-4 text-lg text-beton-600">
          Des parcours réels, partagés par ceux qui les construisent. Point de départ, activité choisie,
          étapes franchies, difficultés rencontrées. Chacun choisit ce qu’il montre.
        </p>

        {adventures.length === 0 ? (
          <EmptyState
            className="mt-12"
            title="Aucune aventure publiée pour l’instant."
            description="Nexteo n’affiche que des parcours réels. Tant que personne n’a partagé le sien, cette page reste vide — et la première aventure publiée sera la tienne si tu le souhaites."
            action={
              <Button asChild variant="outline" size="sm">
                <Link href="/connexion">Commencer mon aventure</Link>
              </Button>
            }
          />
        ) : (
          <ul className="mt-10 space-y-3">
            {adventures.map((adventure) => {
              const journey = adventure.user.userJourneys[0];
              return (
                <li key={adventure.id}>
                  <Link
                    href={`/aventure/${adventure.slug}`}
                    className="block rounded-card border border-beton-300 bg-blanc p-5 transition-colors hover:border-acier"
                  >
                    <div className="flex flex-wrap items-center gap-3">
                      <p className="text-base text-encre">{adventure.user.name ?? 'Une aventure'}</p>
                      {journey ? <Badge variant="acier">{journey.journey.businessModel.name}</Badge> : null}
                      {adventure.isDemo ? <Badge variant="demo">Exemple</Badge> : null}
                    </div>
                    <p className="tabular mt-2 text-sm text-beton-600">
                      Démarrée le {formatDateFr(adventure.startedAt)} ·{' '}
                      {adventure.user.milestones.length} jalon
                      {adventure.user.milestones.length > 1 ? 's' : ''} franchi
                      {adventure.user.milestones.length > 1 ? 's' : ''}
                    </p>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </main>
    </div>
  );
}
