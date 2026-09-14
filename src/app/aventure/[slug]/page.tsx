import Link from 'next/link';
import { notFound } from 'next/navigation';
import { db } from '@/server/db';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DECLARED_LABEL } from '@/lib/guardrails';
import { formatDateFr, formatEuros } from '@/lib/utils';

export const dynamic = 'force-dynamic';

/** Profil public d'aventure : une timeline, pas un tableau de résultats. */
export default async function AdventurePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const adventure = await db.adventure.findFirst({
    where: { slug, isPublic: true },
    include: {
      user: {
        select: {
          name: true,
          milestones: { include: { milestone: true }, orderBy: { reachedAt: 'asc' } },
          userJourneys: {
            take: 1,
            orderBy: { startedAt: 'desc' },
            include: {
              journey: { include: { businessModel: true } },
              steps: { where: { status: 'done' }, include: { step: true }, orderBy: { completedAt: 'asc' } },
            },
          },
        },
      },
    },
  });
  if (!adventure) notFound();

  const journey = adventure.user.userJourneys[0];

  return (
    <div className="min-h-dvh bg-beton-100">
      <header className="border-b border-beton-300 bg-blanc">
        <div className="mx-auto flex h-14 max-w-3xl items-center justify-between px-5">
          <Link href="/aventures" className="text-sm text-beton-600 hover:text-encre">
            ← Les aventures
          </Link>
          <Button asChild variant="outline" size="sm">
            <Link href="/connexion">Commencer</Link>
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-5 py-12">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-3xl">{adventure.user.name ?? 'Une aventure'}</h1>
          {adventure.isDemo ? <Badge variant="demo">Exemple de démonstration</Badge> : null}
        </div>

        {journey ? (
          <p className="mt-3 text-base text-beton-600">
            {journey.journey.businessModel.name} · démarrée le {formatDateFr(adventure.startedAt)} ·{' '}
            <span className="tabular">{journey.progressPercent} %</span> du parcours
          </p>
        ) : null}

        {adventure.story ? (
          <section className="mt-8">
            <h2 className="text-lg text-encre">Son histoire</h2>
            <p className="prose-buildr mt-3 whitespace-pre-wrap text-base text-encre">{adventure.story}</p>
          </section>
        ) : null}

        {adventure.user.milestones.length > 0 ? (
          <section className="mt-10">
            <h2 className="text-lg text-encre">Jalons franchis</h2>
            <ul className="mt-4 space-y-2">
              {adventure.user.milestones.map((milestone) => (
                <li
                  key={milestone.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-card border border-niveau/40 bg-niveau-50 px-5 py-3.5"
                >
                  <span className="text-base text-encre">{milestone.milestone.label}</span>
                  <span className="tabular flex items-center gap-2 text-sm text-beton-600">
                    {formatDateFr(milestone.reachedAt)}
                    {milestone.declaredValue !== null ? ` · ${formatEuros(milestone.declaredValue)}` : ''}
                    <Badge variant="outline">{DECLARED_LABEL}</Badge>
                  </span>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {journey && journey.steps.length > 0 ? (
          <section className="mt-10">
            <h2 className="text-lg text-encre">Les étapes franchies</h2>
            <ol className="mt-4 space-y-2">
              {journey.steps.map((progress) => (
                <li key={progress.id} className="flex items-baseline gap-3 text-sm">
                  <span className="tabular w-6 shrink-0 text-beton-300">{progress.step.number}</span>
                  <span className="text-encre">{progress.step.title}</span>
                  {progress.completedAt ? (
                    <span className="tabular ml-auto text-beton-600">{formatDateFr(progress.completedAt)}</span>
                  ) : null}
                </li>
              ))}
            </ol>
          </section>
        ) : null}

        <p className="prose-buildr mt-12 text-xs text-beton-600">
          Les montants indiqués sont déclarés par la personne elle-même. Buildr ne les vérifie pas.
        </p>
      </main>
    </div>
  );
}
