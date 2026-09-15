import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { AppShell } from '@/components/app/app-shell';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckpointList, type CritereVue } from '@/components/app/checkpoint-list';
import { PromptBlock } from '@/components/app/prompt-block';
import { RepairPanel } from '@/components/app/repair-panel';
import { db } from '@/server/db';
import { requireUser } from '@/server/auth';
import { parcoursDe, phaseDeLEtape } from '@/server/journey';
import { can, FEATURES, FREE_PHASE_LIMIT } from '@/server/features';
import { formatMinutes } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export default async function EtapePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireUser();
  const parcours = await parcoursDe(user.id);
  if (!parcours) redirect('/mes-idees');

  const step = await db.step.findUnique({
    where: { id },
    include: {
      phase: true,
      subSteps: { orderBy: { order: 'asc' }, include: { actions: { orderBy: { order: 'asc' } } } },
      checkpoints: { orderBy: { order: 'asc' } },
    },
  });
  if (!step) notFound();

  const phase = phaseDeLEtape(parcours, step.id);
  if (phase > FREE_PHASE_LIMIT && !(await can(user.id, FEATURES.journeyFull))) redirect('/offres');

  const progres = await db.stepProgress.findUnique({
    where: { userJourneyId_stepId: { userJourneyId: parcours.id, stepId: step.id } },
    include: { checkpoints: true },
  });
  if (!progres || progres.status === 'locked') redirect('/app/chemin');

  const coches = new Map(progres.checkpoints.map((c) => [c.checkpointId, c.proofValue]));
  const criteres: CritereVue[] = step.checkpoints.map((c) => ({
    id: c.id,
    label: c.label,
    isRequired: c.isRequired,
    proofKind: c.proofKind,
    coche: coches.has(c.id),
    preuve: coches.get(c.id) ?? null,
  }));

  // Les prompts de l'étape viennent du pack, jamais du contenu de l'étape :
  // c'est le moteur qui les remplit avec les variables du projet.
  const slugs = step.subSteps
    .flatMap((sub) => sub.actions)
    .map((action) => action.promptTemplateSlug)
    .filter((slug): slug is string => Boolean(slug));

  const pack = parcours.idea
    ? await db.promptPack.findFirst({
        where: { userId: user.id, ideaId: parcours.idea.id },
        orderBy: { version: 'desc' },
        include: {
          prompts: { where: { template: { slug: { in: slugs } } }, include: { template: true } },
        },
      })
    : null;

  const parSlug = new Map(
    (pack?.prompts ?? []).map((prompt) => [prompt.template?.slug ?? '', prompt]),
  );

  const peutReparer = await can(user.id, FEATURES.promptsRepair);

  return (
    <AppShell actif="/app/chemin">
      <Link href="/app/chemin" className="text-xs text-gris-300 underline underline-offset-4">
        ← Le chemin
      </Link>

      <p className="mt-4 text-xs uppercase tracking-wide text-gris-300">
        Phase {step.phase.order} — {step.phase.title}
      </p>
      <h1 className="mt-2 text-xl font-extrabold text-white">
        <span className="text-gris-300 tabular">{step.number}. </span>
        {step.title}
      </h1>
      <p className="mt-2 text-sm text-gris-300">{step.goal}</p>

      <div className="mt-4 flex flex-wrap gap-2">
        <Badge>{formatMinutes(step.estimatedMinutes)}</Badge>
        {step.techPath ? (
          <Badge ton="neo">
            {step.techPath === 'navigateur' ? 'Chemin navigateur' : 'Chemin ordinateur'}
          </Badge>
        ) : null}
      </div>

      <p className="mt-5 rounded-card border border-gris-700 bg-nuit-800 p-4 text-sm text-gris-300">
        <span className="text-white">Pourquoi cette étape.</span> {step.why}
      </p>

      <div className="mt-10 space-y-10">
        {step.subSteps.map((sub) => (
          <section key={sub.id}>
            <h2 className="text-base font-bold text-white">{sub.title}</h2>
            <div className="prose-nexteo mt-2 whitespace-pre-wrap text-sm leading-relaxed text-gris-300">
              {sub.body}
            </div>

            <ol className="mt-5 space-y-3">
              {sub.actions.map((action, index) => {
                const prompt = action.promptTemplateSlug ? parSlug.get(action.promptTemplateSlug) : null;
                return (
                  <li key={action.id}>
                    <div className="flex gap-3">
                      <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full border border-gris-700 text-xs tabular text-gris-300">
                        {index + 1}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm text-white">{action.instruction}</p>
                        {action.externalUrl ? (
                          <a
                            href={action.externalUrl}
                            target="_blank"
                            rel="noreferrer noopener"
                            className="mt-1 inline-block break-all text-xs text-neo-100 underline underline-offset-4"
                          >
                            Ouvrir le site
                          </a>
                        ) : null}
                      </div>
                    </div>

                    {prompt ? (
                      <div className="mt-3 pl-9">
                        <PromptBlock
                          promptId={prompt.id}
                          title={prompt.title}
                          objective={prompt.objective}
                          body={prompt.body}
                          target={prompt.target}
                          expectedOutcome={prompt.expectedOutcome}
                          verification={prompt.verification}
                          status={prompt.status}
                        />
                      </div>
                    ) : action.promptTemplateSlug ? (
                      <div className="mt-3 rounded-card border border-dashed border-gris-700 p-4 pl-9 text-xs text-gris-300">
                        Ce prompt fait partie de ton pack.{' '}
                        <Link href="/app/prompts" className="text-neo-100 underline underline-offset-4">
                          Génère-le d’abord
                        </Link>
                        .
                      </div>
                    ) : null}
                  </li>
                );
              })}
            </ol>
          </section>
        ))}
      </div>

      <div className="mt-12">
        <CheckpointList stepId={step.id} criteres={criteres} />
      </div>

      <div className="mt-8">
        {peutReparer ? (
          <RepairPanel contexte={`étape ${step.number} — ${step.title}`} />
        ) : (
          <div className="rounded-card border border-dashed border-gris-700 p-4">
            <p className="text-sm font-bold text-white">Ça ne marche pas ?</p>
            <p className="mt-1 text-xs text-gris-300">
              Colle ton erreur, et le système te rend un prompt de réparation contextualisé avec ton
              projet. C’est dans les offres payantes.
            </p>
            <Button asChild variant="secondaire" taille="sm" className="mt-3">
              <Link href="/offres">Voir les offres</Link>
            </Button>
          </div>
        )}
      </div>
    </AppShell>
  );
}
