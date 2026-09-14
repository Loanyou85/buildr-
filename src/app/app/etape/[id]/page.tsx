import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { auth } from '@/server/auth';
import { db } from '@/server/db';
import { AppShell } from '@/components/app/app-shell';
import { AssistantLauncher } from '@/components/app/assistant-launcher';
import { Badge } from '@/components/ui/badge';
import { CheckpointList } from '@/components/app/checkpoint-list';
import { StepBody } from '@/components/app/step-body';
import { MilestoneCelebration } from '@/components/app/milestone-celebration';
import { OutreachTracker } from '@/components/app/outreach-tracker';
import { can, FEATURES, FREE_STEP_LIMIT } from '@/server/features';
import { formatMinutes } from '@/lib/utils';

export const dynamic = 'force-dynamic';

const DIFFICULTY_LABEL: Record<string, string> = {
  easy: 'Accessible',
  medium: 'Demande de la rigueur',
  hard: 'Exigeante',
};

/** Étape détaillée (section 8.6) : sous-étapes, actions, checklist, validation. */
export default async function StepPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ franchie?: string; erreur?: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect('/connexion');

  const { id } = await params;
  const { franchie, erreur } = await searchParams;

  const step = await db.step.findUnique({
    where: { id },
    include: {
      phase: { include: { journey: { include: { businessModel: true } } } },
      subSteps: { orderBy: { order: 'asc' }, include: { actions: { orderBy: { order: 'asc' } } } },
      checkpoints: { orderBy: { order: 'asc' } },
      resources: true,
    },
  });
  if (!step) notFound();

  const progress = await db.stepProgress.findFirst({
    where: { stepId: id, userJourney: { userId: session.user.id } },
    include: { checkpoints: true, userJourney: true },
  });
  if (!progress) redirect('/app');

  if (progress.status === 'locked') {
    redirect('/app/chemin');
  }

  // Gating (section 12) : le gratuit donne l'aperçu et les premières étapes.
  const hasFullAccess = await can(session.user.id, FEATURES.journeyFull);
  const beyondFreeLimit = !hasFullAccess && step.number > FREE_STEP_LIMIT;

  const checkedIds = progress.checkpoints.map((c) => c.checkpointId);
  const requiredIds = step.checkpoints.filter((c) => c.isRequired).map((c) => c.id);
  const canComplete = requiredIds.every((cid) => checkedIds.includes(cid));

  // Étape de prospection : on collecte les signaux qui alimentent la règle
  // d'adaptation « taux de réponse anormalement bas » (section 10).
  const isOutreachStep = /message|prospect|contact/i.test(step.title) && step.number >= 10;

  return (
    <AppShell active="/app/chemin" aside={<AssistantLauncher stepId={step.id} />}>
      {franchie ? <MilestoneCelebration stepNumber={step.number} stepTitle={step.title} /> : null}

      <Link href="/app/chemin" className="text-sm text-beton-600 underline-offset-4 hover:text-encre hover:underline">
        ← Le chemin
      </Link>

      <div className="mt-6 flex flex-wrap items-center gap-2">
        <Badge variant="acier">Étape {step.number}</Badge>
        <Badge>{step.phase.title}</Badge>
        <Badge>{DIFFICULTY_LABEL[step.difficulty] ?? step.difficulty}</Badge>
        <Badge>{formatMinutes(step.estimatedMinutes)}</Badge>
        {progress.status === 'done' ? <Badge variant="niveau">Franchie</Badge> : null}
      </div>

      <h1 className="mt-4 text-2xl">{step.title}</h1>
      <p className="prose-buildr mt-3 text-lg text-encre">{step.goal}</p>

      <section className="mt-6 rounded-card border border-beton-300 bg-blanc p-5">
        <p className="text-sm font-medium text-encre">Pourquoi cette étape</p>
        <p className="prose-buildr mt-2 text-sm text-beton-600">{step.why}</p>
      </section>

      {beyondFreeLimit ? (
        <section className="mt-10 rounded-card border border-beton-300 bg-blanc p-6">
          <p className="text-lg text-encre">Cette étape fait partie du parcours complet</p>
          <p className="prose-buildr mt-2 text-sm text-beton-600">
            Les {FREE_STEP_LIMIT} premières étapes sont accessibles librement. La suite du parcours, avec
            ses scripts, ses templates et l’assistance sur chaque étape, fait partie de Buildr Pro.
          </p>
          <p className="mt-4 text-sm text-beton-600">
            Tu gardes ta progression et tes {step.number - 1} étapes déjà ouvertes, quoi qu’il arrive.
          </p>
        </section>
      ) : (
        <>
          <StepBody subSteps={step.subSteps} resources={step.resources} />

          {isOutreachStep ? (
            <OutreachTracker
              stepId={step.id}
              sent={progress.outreachSent}
              replies={progress.outreachReplies}
            />
          ) : null}

          <CheckpointList
            stepId={step.id}
            checkpoints={step.checkpoints}
            checkedIds={checkedIds}
            canComplete={canComplete}
            isDone={progress.status === 'done'}
            error={erreur === 'criteres'}
          />
        </>
      )}
    </AppShell>
  );
}
