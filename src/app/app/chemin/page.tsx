import { redirect } from 'next/navigation';
import Link from 'next/link';
import { auth } from '@/server/auth';
import { loadUserJourney } from '@/server/journey';
import { AppShell } from '@/components/app/app-shell';
import { AssistantLauncher } from '@/components/app/assistant-launcher';
import { ProgressBar } from '@/components/ui/progress-bar';
import { PathView } from '@/components/app/path-view';
import { progressLabel } from '@/lib/journey/progress';

export const dynamic = 'force-dynamic';

/**
 * Le chemin (section 8.5) : la visualisation de la montée. Les étapes
 * franchies en vert, l'étape actuelle mise en avant, les suivantes verrouillées
 * mais visibles pour donner envie. Sur mobile, on monte du bas vers le haut.
 */
export default async function PathPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/connexion');

  const userJourney = await loadUserJourney(session.user.id);
  if (!userJourney) redirect('/recommandation');

  const progressByStepId = new Map(userJourney.steps.map((p) => [p.stepId, p]));
  const phases = userJourney.journey.phases.map((phase) => ({
    id: phase.id,
    title: phase.title,
    goal: phase.goal,
    steps: phase.steps.map((step) => {
      const progress = progressByStepId.get(step.id);
      const required = step.checkpoints.filter((c) => c.isRequired).length;
      const checked = progress?.checkpoints.length ?? 0;
      return {
        id: step.id,
        number: step.number,
        title: step.title,
        estimatedMinutes: step.estimatedMinutes,
        status: progress?.status ?? 'locked',
        checkedRatio: required > 0 ? Math.min(1, checked / required) : 0,
      };
    }),
  }));

  return (
    <AppShell active="/app/chemin" aside={<AssistantLauncher stepId={userJourney.currentStepId} />}>
      <div className="flex items-baseline justify-between gap-4">
        <h1 className="text-2xl">Le chemin</h1>
        <p className="tabular text-sm text-beton-600">{userJourney.progressPercent} %</p>
      </div>
      <p className="mt-2 text-sm text-beton-600">
        {userJourney.journey.businessModel.name} · {progressLabel(userJourney.progressPercent)}
      </p>
      <ProgressBar value={userJourney.progressPercent} className="mt-4" label="Progression du parcours" />

      <PathView phases={phases} currentStepId={userJourney.currentStepId} />

      <p className="mt-10 text-sm text-beton-600">
        Les étapes verrouillées se débloquent quand la précédente est validée.{' '}
        <Link href="/app" className="text-acier underline-offset-4 hover:underline">
          Retourner à ce qu’il faut faire aujourd’hui
        </Link>
        .
      </p>
    </AppShell>
  );
}
