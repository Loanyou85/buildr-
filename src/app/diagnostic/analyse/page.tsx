import { redirect } from 'next/navigation';
import { TopBar } from '@/components/shell/top-bar';
import { currentProfile } from '@/server/diagnostic';
import { terminerDiagnostic } from '@/server/actions/diagnostic';
import { AutoSubmit } from '@/components/diagnostic/auto-submit';

export const dynamic = 'force-dynamic';

export const metadata = { title: 'On classe tes idées — Nexteo' };

const ETAPES = [
  'On relit ce que tu as répondu.',
  'On repère les milieux que tu connais de l’intérieur.',
  'On écarte ce qui ne se construit pas avec le parcours.',
  'On classe ce qui reste.',
];

/**
 * Écran de transition. Section 5.2 : une barre indéterminée avec le détail de
 * ce qui se passe, jamais un cercle qui tourne.
 */
export default async function AnalysePage() {
  const profile = await currentProfile();
  if (!profile) redirect('/diagnostic');

  return (
    <>
      <TopBar />
      <main className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-4">
        <h1 className="text-xl font-extrabold text-white">On te construit trois idées.</h1>
        <p className="mt-2 text-sm text-gris-300">Une dizaine de secondes, pas plus.</p>

        <div className="my-8 h-1.5 w-full overflow-hidden rounded-full bg-nuit-700">
          <div className="glisser h-full w-1/3 rounded-full bg-neo-500" />
        </div>

        <ul className="space-y-2.5">
          {ETAPES.map((etape) => (
            <li key={etape} className="flex gap-2.5 text-sm text-gris-300">
              <span aria-hidden className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-neo-500" />
              {etape}
            </li>
          ))}
        </ul>

        <form action={terminerDiagnostic} className="mt-10">
          <AutoSubmit label="Voir mes idées" />
        </form>
      </main>
    </>
  );
}
