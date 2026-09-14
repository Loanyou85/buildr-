import Link from 'next/link';
import { notFound } from 'next/navigation';
import { db } from '@/server/db';
import { Button } from '@/components/ui/button';
import { Input, Textarea } from '@/components/ui/input';
import { createPhase, createStep, duplicateJourney } from '@/server/actions/admin';
import { StepReorder } from '@/components/app/step-reorder';
import { formatMinutes } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export default async function AdminJourneyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const journey = await db.journey.findUnique({
    where: { id },
    include: {
      businessModel: true,
      phases: {
        orderBy: { order: 'asc' },
        include: {
          steps: {
            orderBy: { order: 'asc' },
            include: { _count: { select: { subSteps: true, checkpoints: true, resources: true } } },
          },
        },
      },
    },
  });
  if (!journey) notFound();

  return (
    <>
      <Link href="/admin" className="text-sm text-beton-600 hover:text-encre">
        ← Tous les parcours
      </Link>

      <h1 className="mt-4 text-2xl">{journey.name}</h1>
      <p className="mt-2 text-sm text-beton-600">
        {journey.businessModel.name} · budget {journey.budgetTier} · niveau {journey.experienceTier} · v
        {journey.version}
      </p>

      <form action={duplicateJourney} className="mt-6 flex flex-wrap items-end gap-3 rounded-card border border-beton-300 bg-blanc p-5">
        <input type="hidden" name="journeyId" value={journey.id} />
        <p className="w-full text-sm text-encre">Dupliquer en variante</p>
        <label className="flex flex-col gap-1.5">
          <span className="text-xs text-beton-600">Budget</span>
          <select name="budgetTier" className="h-11 rounded-xl border border-beton-300 bg-blanc px-3 text-sm">
            <option value="zero">0 €</option>
            <option value="low">≈ 300 €</option>
            <option value="high">≈ 2 000 €</option>
          </select>
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-xs text-beton-600">Niveau</span>
          <select name="experienceTier" className="h-11 rounded-xl border border-beton-300 bg-blanc px-3 text-sm">
            <option value="beginner">Débutant</option>
            <option value="intermediate">Intermédiaire</option>
            <option value="advanced">Avancé</option>
          </select>
        </label>
        <Button type="submit" variant="outline" size="sm">
          Dupliquer
        </Button>
      </form>

      <div className="mt-10 space-y-10">
        {journey.phases.map((phase) => (
          <section key={phase.id}>
            <div className="flex items-baseline gap-3">
              <h2 className="text-lg text-encre">
                <span className="tabular mr-2 text-beton-300">{phase.order}</span>
                {phase.title}
              </h2>
              <span className="h-px flex-1 bg-beton-300" aria-hidden />
            </div>
            <p className="prose-buildr mt-2 text-sm text-beton-600">{phase.goal}</p>

            <StepReorder
              journeyId={journey.id}
              steps={phase.steps.map((step) => ({
                id: step.id,
                number: step.number,
                title: step.title,
                detail: `${formatMinutes(step.estimatedMinutes)} · ${step._count.subSteps} sous-étapes · ${step._count.checkpoints} critères · ${step._count.resources} ressources`,
              }))}
            />

            <details className="mt-3 rounded-card border border-beton-300 bg-blanc">
              <summary className="cursor-pointer list-none px-5 py-3.5 text-sm text-acier">
                + Ajouter une étape à cette phase
              </summary>
              <form action={createStep} className="space-y-3 border-t border-beton-300 p-5">
                <input type="hidden" name="phaseId" value={phase.id} />
                <Input type="text" name="title" required placeholder="Titre de l’étape" />
                <Textarea name="goal" required rows={2} placeholder="Objectif : ce que l’utilisateur obtient en sortant de l’étape" />
                <Textarea name="why" required rows={2} placeholder="Pourquoi cette étape compte" />
                <div className="flex flex-wrap gap-3">
                  <Input type="number" name="estimatedMinutes" min={5} max={600} defaultValue={30} className="w-32" />
                  <select name="difficulty" className="h-11 rounded-xl border border-beton-300 bg-blanc px-3 text-sm">
                    <option value="easy">Accessible</option>
                    <option value="medium">Demande de la rigueur</option>
                    <option value="hard">Exigeante</option>
                  </select>
                  <Button type="submit" variant="acier" size="sm">
                    Créer l’étape
                  </Button>
                </div>
              </form>
            </details>
          </section>
        ))}
      </div>

      <section className="mt-12 rounded-card border border-beton-300 bg-blanc p-5">
        <h2 className="text-lg text-encre">Nouvelle phase</h2>
        <form action={createPhase} className="mt-4 space-y-3">
          <input type="hidden" name="journeyId" value={journey.id} />
          <Input type="text" name="title" required placeholder="Titre de la phase" />
          <Textarea name="goal" required rows={2} placeholder="Objectif de la phase" />
          <Button type="submit" variant="acier" size="sm">
            Ajouter la phase
          </Button>
        </form>
      </section>
    </>
  );
}
