import { redirect } from 'next/navigation';
import Link from 'next/link';
import { auth } from '@/server/auth';
import { db } from '@/server/db';
import { loadToday } from '@/server/today';
import { AppShell } from '@/components/app/app-shell';
import { AssistantLauncher } from '@/components/app/assistant-launcher';
import { Button } from '@/components/ui/button';
import { ProgressBar } from '@/components/ui/progress-bar';
import { AdjustmentCard } from '@/components/app/adjustment-card';
import { startStep } from '@/server/actions/journey';
import { formatMinutes } from '@/lib/utils';

export const dynamic = 'force-dynamic';

/**
 * Écran « Aujourd'hui » — le plus important du produit (section 8.4).
 * Extrêmement simple : l'objectif, trois tâches, le temps, un bouton.
 * C'est le seul endroit de l'écran où l'orange signal apparaît.
 */
export default async function TodayPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/connexion');

  const profile = await db.profile.findUnique({ where: { userId: session.user.id } });
  if (!profile?.onboardingCompleted) redirect('/onboarding');

  const today = await loadToday(session.user.id);
  if (!today) redirect('/recommandation');

  if (today.finished) {
    return (
      <AppShell active="/app" aside={<AssistantLauncher stepId={null} />}>
        <p className="text-sm text-beton-600">{today.businessName}</p>
        <h1 className="mt-2 text-2xl">Tu as terminé le parcours.</h1>
        <p className="prose-buildr mt-3 text-base text-beton-600">
          Tu es allé au bout des {today.progressPercent} % du chemin. La suite se construit sur ce que tu
          as mis en place : regarde tes jalons et ce que tu veux consolider.
        </p>
        <div className="mt-8">
          <Button asChild variant="signal" size="lg">
            <Link href="/app/jalons">Voir mes jalons</Link>
          </Button>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell active="/app" aside={<AssistantLauncher stepId={today.step.id} />}>
      <div className="flex items-baseline justify-between gap-4">
        <p className="tabular font-display text-sm font-bold tracking-[0.08em] text-beton-600">
          JOUR {today.day}
        </p>
        <p className="text-sm text-beton-600">{today.businessName}</p>
      </div>

      <div className="mt-8">
        <p className="text-sm text-beton-600">Ton objectif</p>
        <h1 className="mt-1 text-2xl">{today.step.goal}</h1>
      </div>

      {today.adjustment ? <AdjustmentCard id={today.adjustment.id} suggestion={today.adjustment.suggestion} /> : null}

      <section className="mt-10">
        <p className="text-sm text-beton-600">À faire maintenant</p>
        <ol className="mt-4 space-y-3">
          {today.tasks.map((task, index) => (
            <li key={task.id} className="flex items-baseline gap-4">
              <span className="tabular w-5 shrink-0 font-display text-sm font-bold text-beton-300">
                {index + 1}
              </span>
              <span className="text-lg text-encre">{task.label}</span>
            </li>
          ))}
        </ol>
        {today.remainingAfter > 0 ? (
          <p className="mt-4 text-sm text-beton-600">
            {today.remainingAfter} autre{today.remainingAfter > 1 ? 's' : ''} après ça, sur cette étape.
          </p>
        ) : null}
      </section>

      <p className="tabular mt-8 text-sm text-beton-600">
        Temps estimé : {formatMinutes(today.estimatedMinutes)}
      </p>

      <form action={startStep} className="mt-8">
        <input type="hidden" name="stepId" value={today.step.id} />
        <Button type="submit" variant="signal" size="lg">
          {today.step.status === 'in_progress' ? 'Continuer' : 'Commencer'}
        </Button>
      </form>

      <div className="mt-16 border-t border-beton-300 pt-6">
        <div className="flex items-baseline justify-between gap-4">
          <p className="text-sm text-beton-600">
            Étape {today.step.number} · {today.phaseTitle}
          </p>
          <p className="tabular text-sm text-beton-600">{today.progressPercent} %</p>
        </div>
        <ProgressBar value={today.progressPercent} className="mt-3" label="Progression du parcours" />
      </div>
    </AppShell>
  );
}
