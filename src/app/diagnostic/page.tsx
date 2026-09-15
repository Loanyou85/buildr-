import Link from 'next/link';
import { redirect } from 'next/navigation';
import { TopBar } from '@/components/shell/top-bar';
import { StickyAction } from '@/components/shell/sticky-action';
import { ProgressBar } from '@/components/ui/progress-bar';
import { Button } from '@/components/ui/button';
import { QuestionScreen, ValiderQuestion, type Choix } from '@/components/diagnostic/question-screen';
import { QUESTIONS } from '@/lib/diagnostic/questions';
import { currentProfile, referentiel } from '@/server/diagnostic';
import { repondre, revenir } from '@/server/actions/diagnostic';

export const dynamic = 'force-dynamic';

export const metadata = { title: 'Trouve ton idée — Nexteo' };

export default async function DiagnosticPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const params = await searchParams;
  const demande = Number(params.q ?? 0);
  const index = Number.isFinite(demande) ? Math.max(0, Math.min(QUESTIONS.length - 1, demande)) : 0;
  const question = QUESTIONS[index]!;

  const profile = await currentProfile();
  // Un diagnostic déjà terminé mène aux idées, pas à la première question.
  if (profile?.completedAt && !params.q) redirect('/mes-idees');

  let options: Choix[] = question.options ?? [];
  if (question.source) {
    const lignes = await referentiel(question.source);
    options = lignes.map((ligne) => ({
      value: ligne.slug,
      label: ligne.label,
      hint: 'family' in ligne ? (ligne.family as string) : undefined,
    }));
  }

  const percent = Math.round(((index + 1) / QUESTIONS.length) * 100);
  const choixUnique = question.kind === 'choice';

  return (
    <>
      <TopBar />
      <main className="mx-auto max-w-md px-4 pb-28 pt-6">
        <div className="mb-6">
          <ProgressBar value={percent} />
          <p className="mt-2 text-xs text-gris-300 tabular">
            Question {index + 1} sur {QUESTIONS.length}
          </p>
        </div>

        <form action={repondre}>
          <input type="hidden" name="key" value={question.key} />

          <h1 className="text-xl font-extrabold text-white">{question.title}</h1>
          {question.help ? <p className="mt-2 text-sm text-gris-300">{question.help}</p> : null}

          <div className="mt-6">
            <QuestionScreen question={question} options={options} />
          </div>

          {choixUnique ? null : (
            <StickyAction>
              <ValiderQuestion label={question.optional ? 'Continuer' : 'Suivant'} />
            </StickyAction>
          )}
        </form>

        {choixUnique ? (
          <p className="mt-6 text-center text-xs text-gris-300">Touche une réponse pour continuer.</p>
        ) : null}

        <div className="mt-8 flex flex-col items-center gap-3 border-t border-gris-700/60 pt-6">
          {index > 0 ? (
            <form action={revenir}>
              <input type="hidden" name="index" value={index} />
              <Button type="submit" variant="fantome" taille="sm">
                ← Question précédente
              </Button>
            </form>
          ) : null}

          {/* Une porte d'entrée pour qui revient : sans ça, quelqu'un qui a
              déjà un compte n'a d'autre choix que de refaire le diagnostic. */}
          <Link href="/connexion" className="tactile flex items-center text-xs text-gris-300 underline underline-offset-4">
            J’ai déjà un compte
          </Link>
        </div>
      </main>
    </>
  );
}
