import Link from 'next/link';
import { redirect } from 'next/navigation';
import { AppShell } from '@/components/app/app-shell';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ProgressBar } from '@/components/ui/progress-bar';
import { requireUser } from '@/server/auth';
import { parcoursDe, etapesApplicables } from '@/server/journey';
import { can, FEATURES, FREE_PHASE_LIMIT } from '@/server/features';
import { choisirChemin } from '@/server/actions/journey';
import { formatMinutes, cn } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export const metadata = { title: 'Le chemin — Nexteo' };

export default async function CheminPage() {
  const user = await requireUser();
  const parcours = await parcoursDe(user.id);
  if (!parcours) redirect('/mes-idees');

  const complet = await can(user.id, FEATURES.journeyFull);
  const applicables = new Set(etapesApplicables(parcours).map((e) => e.id));
  const parId = new Map(parcours.steps.map((s) => [s.stepId, s]));

  return (
    <AppShell actif="/app/chemin">
      <h1 className="text-xl font-extrabold text-white">Treize phases, de l’idée au premier euro.</h1>
      <div className="mt-4">
        <ProgressBar value={parcours.progressPercent} />
      </div>

      <form action={choisirChemin} className="mt-6 rounded-card border border-gris-700 bg-nuit-800 p-4">
        <p className="text-sm font-bold text-white">Ton chemin technique</p>
        <p className="mt-1 text-xs text-gris-300">
          Les deux mènent au même endroit. Tu peux changer quand tu veux, rien n’est perdu.
        </p>
        <div className="mt-3 grid grid-cols-2 gap-2">
          {(['navigateur', 'ordinateur'] as const).map((chemin) => (
            <button
              key={chemin}
              type="submit"
              name="techPath"
              value={chemin}
              className={cn(
                'tactile rounded-champ border px-3 py-2 text-xs',
                parcours.techPath === chemin
                  ? 'border-neo-500 bg-neo-500/15 text-white'
                  : 'border-gris-700 text-gris-300',
              )}
            >
              {chemin === 'navigateur' ? 'Dans le navigateur' : 'Sur mon ordinateur'}
            </button>
          ))}
        </div>
      </form>

      <ol className="mt-8 space-y-8">
        {parcours.journey.phases.map((phase) => {
          const verrouilleeParOffre = phase.order > FREE_PHASE_LIMIT && !complet;
          const etapes = phase.steps.filter((s) => applicables.has(s.id));

          return (
            <li key={phase.id}>
              <div className="flex items-baseline gap-3">
                <span className="font-display text-sm font-extrabold tabular text-neo-500">
                  {String(phase.order).padStart(2, '0')}
                </span>
                <h2 className="text-base font-bold text-white">{phase.title}</h2>
              </div>
              <p className="mt-1 pl-8 text-xs text-gris-300">{phase.outcome}</p>

              <ul className="mt-3 space-y-2 pl-8">
                {etapes.map((step) => {
                  const statut = parId.get(step.id)?.status ?? 'locked';
                  const faite = statut === 'done';
                  const ouverte = !verrouilleeParOffre && statut !== 'locked';

                  return (
                    <li key={step.id}>
                      {ouverte ? (
                        <Link
                          href={`/app/etape/${step.id}`}
                          className={cn(
                            'tactile flex items-center justify-between gap-3 rounded-card border px-4 py-3',
                            faite ? 'border-gris-700 bg-nuit-800/50' : 'border-neo-500/30 bg-nuit-800',
                          )}
                        >
                          <span>
                            <span className={cn('block text-sm', faite ? 'text-gris-300' : 'text-white')}>
                              {step.title}
                            </span>
                            <span className="mt-0.5 block text-xs text-gris-300">
                              {formatMinutes(step.estimatedMinutes)}
                            </span>
                          </span>
                          {faite ? <Badge>Fait</Badge> : <span aria-hidden className="text-gris-300">→</span>}
                        </Link>
                      ) : (
                        <div className="flex items-center justify-between gap-3 rounded-card border border-gris-700 px-4 py-3 opacity-60">
                          <span className="text-sm text-gris-300">{step.title}</span>
                          <span className="text-xs text-gris-300">
                            {verrouilleeParOffre ? 'offre' : 'à venir'}
                          </span>
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>

              {verrouilleeParOffre ? (
                <div className="mt-3 pl-8">
                  <Button asChild variant="secondaire" taille="sm">
                    <Link href="/offres">Ouvrir la suite du parcours</Link>
                  </Button>
                </div>
              ) : null}
            </li>
          );
        })}
      </ol>
    </AppShell>
  );
}
