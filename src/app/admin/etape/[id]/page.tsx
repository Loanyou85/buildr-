import Link from 'next/link';
import { notFound } from 'next/navigation';
import { db } from '@/server/db';
import { Button } from '@/components/ui/button';
import { Input, Textarea } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  createAction,
  createCheckpoint,
  createResource,
  createSubStep,
  updateStep,
} from '@/server/actions/admin';

export const dynamic = 'force-dynamic';

/** Éditeur d'étape : sous-étapes, actions, critères, ressources (section 8.9). */
export default async function AdminStepPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const step = await db.step.findUnique({
    where: { id },
    include: {
      phase: { include: { journey: true } },
      subSteps: { orderBy: { order: 'asc' }, include: { actions: { orderBy: { order: 'asc' } } } },
      checkpoints: { orderBy: { order: 'asc' } },
      resources: true,
    },
  });
  if (!step) notFound();

  return (
    <>
      <Link href={`/admin/parcours/${step.phase.journeyId}`} className="text-sm text-beton-600 hover:text-encre">
        ← {step.phase.journey.name}
      </Link>

      <h1 className="mt-4 text-2xl">
        <span className="tabular mr-2 text-beton-300">{step.number}</span>
        {step.title}
      </h1>

      <section className="mt-8 rounded-card border border-beton-300 bg-blanc p-5">
        <h2 className="text-lg text-encre">L’étape</h2>
        <form action={updateStep} className="mt-4 space-y-3">
          <input type="hidden" name="stepId" value={step.id} />
          <Input type="text" name="title" defaultValue={step.title} required />
          <Textarea name="goal" rows={2} defaultValue={step.goal} required />
          <Textarea name="why" rows={3} defaultValue={step.why} required />
          <div className="flex flex-wrap items-center gap-3">
            <Input
              type="number"
              name="estimatedMinutes"
              min={5}
              max={600}
              defaultValue={step.estimatedMinutes}
              className="tabular w-32"
            />
            <select
              name="difficulty"
              defaultValue={step.difficulty}
              className="h-11 rounded-xl border border-beton-300 bg-blanc px-3 text-sm"
            >
              <option value="easy">Accessible</option>
              <option value="medium">Demande de la rigueur</option>
              <option value="hard">Exigeante</option>
            </select>
            <Button type="submit" variant="acier" size="sm">
              Enregistrer
            </Button>
          </div>
        </form>
      </section>

      <section className="mt-10">
        <h2 className="text-lg text-encre">Sous-étapes et actions</h2>
        <p className="mt-2 text-sm text-beton-600">
          Une action doit être exécutable par quelqu’un qui n’a jamais rien fait de tel. Donne la règle, le
          critère et l’exemple.
        </p>

        <div className="mt-4 space-y-4">
          {step.subSteps.map((subStep) => (
            <div key={subStep.id} className="rounded-card border border-beton-300 bg-blanc p-5">
              <p className="text-base text-encre">
                <span className="tabular mr-2 text-beton-300">{subStep.order}.</span>
                {subStep.title}
              </p>
              <pre className="prose-buildr mt-2 whitespace-pre-wrap font-sans text-xs text-beton-600">
                {subStep.body}
              </pre>

              <ol className="mt-4 space-y-2">
                {subStep.actions.map((action) => (
                  <li key={action.id} className="flex gap-3 text-sm">
                    <span className="tabular w-5 shrink-0 text-beton-300">{action.order}</span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-encre">{action.instruction}</span>
                      {action.example ? (
                        <span className="block text-xs text-beton-600">Exemple : {action.example}</span>
                      ) : null}
                      {action.externalUrl ? (
                        <span className="block text-xs text-acier">{action.externalUrl}</span>
                      ) : null}
                    </span>
                  </li>
                ))}
              </ol>

              <details className="mt-4">
                <summary className="cursor-pointer list-none text-sm text-acier">+ Ajouter une action</summary>
                <form action={createAction} className="mt-3 space-y-2">
                  <input type="hidden" name="subStepId" value={subStep.id} />
                  <input type="hidden" name="stepId" value={step.id} />
                  <Textarea name="instruction" rows={2} required placeholder="Instruction exacte" />
                  <Input type="text" name="example" placeholder="Exemple (facultatif)" />
                  <Input type="url" name="externalUrl" placeholder="Lien vers l’outil (facultatif)" />
                  <Input type="text" name="templateRef" placeholder="Référence de modèle (facultatif)" />
                  <Button type="submit" variant="outline" size="sm">
                    Ajouter
                  </Button>
                </form>
              </details>
            </div>
          ))}
        </div>

        <details className="mt-4 rounded-card border border-beton-300 bg-blanc">
          <summary className="cursor-pointer list-none px-5 py-3.5 text-sm text-acier">
            + Ajouter une sous-étape
          </summary>
          <form action={createSubStep} className="space-y-3 border-t border-beton-300 p-5">
            <input type="hidden" name="stepId" value={step.id} />
            <Input type="text" name="title" required placeholder="Titre de la sous-étape" />
            <Textarea name="body" rows={6} placeholder="Corps en markdown : titres, listes, tableaux, citations" />
            <Button type="submit" variant="acier" size="sm">
              Ajouter
            </Button>
          </form>
        </details>
      </section>

      <section className="mt-10">
        <h2 className="text-lg text-encre">Critères de validation</h2>
        <ul className="mt-4 space-y-2">
          {step.checkpoints.map((checkpoint) => (
            <li
              key={checkpoint.id}
              className="flex items-center justify-between gap-3 rounded-card border border-beton-300 bg-blanc px-5 py-3"
            >
              <span className="text-sm text-encre">{checkpoint.label}</span>
              {checkpoint.isRequired ? <Badge variant="acier">Obligatoire</Badge> : <Badge>Facultatif</Badge>}
            </li>
          ))}
        </ul>

        <form action={createCheckpoint} className="mt-3 flex flex-wrap items-end gap-3">
          <input type="hidden" name="stepId" value={step.id} />
          <Input type="text" name="label" required placeholder="Nouveau critère" className="w-80" />
          <label className="flex items-center gap-2 text-sm text-beton-600">
            <input type="checkbox" name="isRequired" defaultChecked className="size-4 accent-[#3E7BFA]" />
            Obligatoire
          </label>
          <Button type="submit" variant="outline" size="sm">
            Ajouter
          </Button>
        </form>
      </section>

      <section className="mt-10">
        <h2 className="text-lg text-encre">Ressources, modèles et scripts</h2>
        <ul className="mt-4 space-y-2">
          {step.resources.map((resource) => (
            <li key={resource.id} className="rounded-card border border-beton-300 bg-blanc px-5 py-3">
              <div className="flex items-center gap-3">
                <Badge>{resource.type}</Badge>
                <span className="text-sm text-encre">{resource.title}</span>
              </div>
              {resource.body ? (
                <pre className="prose-buildr mt-2 whitespace-pre-wrap font-sans text-xs text-beton-600">
                  {resource.body}
                </pre>
              ) : null}
            </li>
          ))}
        </ul>

        <form action={createResource} className="mt-3 space-y-2 rounded-card border border-beton-300 bg-blanc p-5">
          <input type="hidden" name="stepId" value={step.id} />
          <div className="flex flex-wrap gap-3">
            <select name="type" className="h-11 rounded-xl border border-beton-300 bg-blanc px-3 text-sm">
              <option value="template">Modèle</option>
              <option value="script">Script</option>
              <option value="checklist">Checklist</option>
              <option value="link">Lien</option>
              <option value="example">Exemple</option>
            </select>
            <Input type="text" name="title" required placeholder="Titre" className="w-72" />
          </div>
          <Textarea name="body" rows={4} placeholder="Contenu (modèle remplissable, script…)" />
          <Input type="url" name="url" placeholder="Lien (facultatif)" />
          <Button type="submit" variant="outline" size="sm">
            Ajouter
          </Button>
        </form>
      </section>
    </>
  );
}
