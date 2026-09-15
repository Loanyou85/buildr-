import Link from 'next/link';
import { redirect } from 'next/navigation';
import { TopBar } from '@/components/shell/top-bar';
import { Button } from '@/components/ui/button';
import { Card, CardText, CardTitle } from '@/components/ui/card';
import { IdeaCard, type IdeaView } from '@/components/ideas/idea-card';
import { db } from '@/server/db';
import { currentProfile } from '@/server/diagnostic';
import { redigerJustification } from '@/server/ideas';
import { MAX_REJETS } from '@/lib/ideas/politique';

export const dynamic = 'force-dynamic';

export const metadata = { title: 'Tes trois idées — Nexteo' };

export default async function MesIdeesPage({
  searchParams,
}: {
  searchParams: Promise<{ completer?: string }>;
}) {
  const { completer } = await searchParams;
  const profile = await currentProfile();
  if (!profile) redirect('/diagnostic');
  if (!profile.completedAt) redirect('/diagnostic');

  const filtre = profile.userId ? { userId: profile.userId } : { anonId: profile.anonId! };
  const idees = await db.idea.findMany({
    where: { ...filtre, status: 'proposed' },
    orderBy: { rank: 'asc' },
    include: { sources: true },
  });

  if (idees.length === 0) {
    return (
      <>
        <TopBar />
        <main className="mx-auto max-w-md px-4 py-10">
          <h1 className="text-xl font-extrabold text-white">On n’a plus d’idée à te proposer.</h1>
          <p className="mt-3 text-sm text-gris-300">
            Tu les as toutes écartées. Reprends le diagnostic en ajoutant un milieu que tu connais :
            c’est là que le moteur trouve ce qu’il te propose.
          </p>
          <Button asChild taille="bloc" className="mt-6">
            <Link href="/diagnostic?q=2">Compléter mon profil</Link>
          </Button>
        </main>
      </>
    );
  }

  // La justification est rédigée à la lecture, une fois, puis conservée.
  // Sans modèle disponible, les explications déterministes suffisent.
  await Promise.all(idees.filter((i) => !i.rationale).map((i) => redigerJustification(i.id)));
  const fraiches = await db.idea.findMany({
    where: { ...filtre, status: 'proposed' },
    orderBy: { rank: 'asc' },
    include: { sources: true },
  });

  const vues: IdeaView[] = fraiches.map((idea) => ({
    id: idea.id,
    title: idea.title,
    oneLiner: idea.oneLiner,
    targetAudience: idea.targetAudience,
    problem: idea.problem,
    solution: idea.solution,
    pricingModel: idea.pricingModel,
    monthlyPrice: idea.monthlyPrice,
    buildComplexity: idea.buildComplexity,
    timeToFirstEuro: idea.timeToFirstEuro,
    rationale: idea.rationale,
    sources: idea.sources.map((s) => ({ dimension: s.dimension, evidence: s.evidence })),
    breakdown: (idea.breakdown as IdeaView['breakdown']) ?? [],
  }));

  const [principale, ...autres] = vues;

  return (
    <>
      <TopBar />
      <main className="mx-auto max-w-md px-4 pb-16 pt-6">
        <h1 className="text-xl font-extrabold text-white">Trois idées, construites à partir de tes réponses.</h1>
        <p className="mt-2 text-sm text-gris-300">
          Aucune ne sort d’une liste toute faite. Chacune cite ce que tu as répondu.
        </p>

        {completer ? (
          <Card className="mt-6 border-neo-500/30">
            <CardTitle>Tu en as écarté {MAX_REJETS}.</CardTitle>
            <CardText className="mt-2">
              Régénérer encore ne donnerait que la suivante du même classement. Ajoute un milieu que tu
              connais, ou précise ce qui t’agace : c’est de là que viennent les idées.
            </CardText>
            <Button asChild variant="secondaire" taille="bloc" className="mt-4">
              <Link href="/diagnostic?q=2">Compléter mon profil</Link>
            </Button>
          </Card>
        ) : null}

        {principale ? (
          <div className="mt-6">
            <IdeaCard idea={principale} principale />
          </div>
        ) : null}

        {autres.length > 0 ? (
          <>
            <h2 className="mt-10 text-base font-bold text-white">Les deux autres</h2>
            <div className="mt-4 space-y-4">
              {autres.map((idea) => (
                <IdeaCard key={idea.id} idea={idea} />
              ))}
            </div>
          </>
        ) : null}

        <p className="mt-10 text-center text-xs text-gris-300">
          Tu peux revenir sur ce choix plus tard. Rien n’est figé.
        </p>
      </main>
    </>
  );
}
