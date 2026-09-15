import Link from 'next/link';
import { redirect } from 'next/navigation';
import { AppShell } from '@/components/app/app-shell';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { PromptBlock } from '@/components/app/prompt-block';
import { db } from '@/server/db';
import { requireUser } from '@/server/auth';
import { can, FEATURES } from '@/server/features';
import { creerPack } from '@/server/actions/prompts';
import { BLOCK_LABELS } from '@/lib/prompts/blocks';

export const dynamic = 'force-dynamic';

export const metadata = { title: 'Mes prompts — Nexteo' };

/**
 * Vue « Mes prompts » (section 11.7) : le pack entier, filtrable par bloc.
 *
 * Section 11.1 : le pack reste court volontairement. Une bibliothèque de trois
 * cents prompts non ordonnés est moins utile qu'une quarantaine dans le bon
 * ordre — le volume vient du générateur à la demande, pas d'ici.
 */
export default async function PromptsPage({
  searchParams,
}: {
  searchParams: Promise<{ bloc?: string }>;
}) {
  const { bloc } = await searchParams;
  const user = await requireUser();

  const idea = await db.idea.findFirst({ where: { userId: user.id, status: 'selected' } });
  if (!idea) redirect('/mes-idees');

  const pack = await db.promptPack.findFirst({
    where: { userId: user.id, ideaId: idea.id },
    orderBy: { version: 'desc' },
    include: { prompts: { orderBy: { order: 'asc' }, include: { template: true } } },
  });

  const packComplet = await can(user.id, FEATURES.promptsPack);
  const fondations = await can(user.id, FEATURES.promptsFoundation);

  if (!pack) {
    return (
      <AppShell actif="/app/prompts">
        <h1 className="text-xl font-extrabold text-white">Ton pack de prompts.</h1>
        <p className="mt-2 text-sm text-gris-300">
          Une quarantaine de prompts, dans l’ordre exact du parcours, remplis avec ton idée. Il n’y
          a rien à choisir : tu les exécutes l’un après l’autre.
        </p>
        <form action={creerPack} className="mt-6">
          <Button type="submit" taille="bloc">
            Générer mon pack
          </Button>
        </form>
      </AppShell>
    );
  }

  const visibles = pack.prompts.filter((prompt) => {
    if (prompt.isCustom) return true;
    if (packComplet) return true;
    // Offre gratuite : les quatre prompts de fondation, et rien d'autre.
    return fondations && prompt.template?.blockKey === 'fondations';
  });

  const blocs = [...new Set(visibles.map((p) => p.template?.blockKey ?? 'sur-mesure'))];
  const filtres = bloc ? visibles.filter((p) => (p.template?.blockKey ?? 'sur-mesure') === bloc) : visibles;
  const caches = pack.prompts.length - visibles.length;

  return (
    <AppShell actif="/app/prompts">
      <h1 className="text-xl font-extrabold text-white">Ton pack de prompts.</h1>
      <p className="mt-2 text-sm text-gris-300">
        {visibles.length} prompts, dans l’ordre. Copie, colle, reviens.
      </p>

      <div className="-mx-4 mt-5 overflow-x-auto px-4">
        <div className="flex w-max gap-2 pb-1">
          <Link
            href="/app/prompts"
            className={`tactile flex items-center rounded-full border px-4 text-xs ${
              bloc ? 'border-gris-700 text-gris-300' : 'border-neo-500 bg-neo-500/15 text-white'
            }`}
          >
            Tout
          </Link>
          {blocs.map((key) => (
            <Link
              key={key}
              href={`/app/prompts?bloc=${key}`}
              className={`tactile flex items-center whitespace-nowrap rounded-full border px-4 text-xs ${
                bloc === key ? 'border-neo-500 bg-neo-500/15 text-white' : 'border-gris-700 text-gris-300'
              }`}
            >
              {BLOCK_LABELS[key] ?? 'Sur mesure'}
            </Link>
          ))}
        </div>
      </div>

      {filtres.length === 0 ? (
        <EmptyState
          className="mt-6"
          title="Rien dans ce bloc"
          description="Choisis un autre bloc, ou reviens à la liste entière."
        />
      ) : (
        <div className="mt-6 space-y-4">
          {filtres.map((prompt) => (
            <div key={prompt.id}>
              {prompt.isCustom ? <Badge ton="neo" className="mb-2">Sur mesure</Badge> : null}
              <PromptBlock
                promptId={prompt.id}
                numero={prompt.order}
                title={prompt.title}
                objective={prompt.objective}
                body={prompt.body}
                target={prompt.target}
                expectedOutcome={prompt.expectedOutcome}
                verification={prompt.verification}
                status={prompt.status}
              />
            </div>
          ))}
        </div>
      )}

      {caches > 0 ? (
        <div className="mt-8 rounded-card border border-dashed border-gris-700 p-4">
          <p className="text-sm font-bold text-white">{caches} prompts de plus dans ton pack.</p>
          <p className="mt-1 text-xs text-gris-300">
            Données, comptes, cœur du produit, écrans, paiement, mise en ligne, page de vente,
            e-mails, finitions. Ils sont déjà générés pour ton idée.
          </p>
          <Button asChild variant="secondaire" taille="sm" className="mt-3">
            <Link href="/offres">Ouvrir le pack entier</Link>
          </Button>
        </div>
      ) : null}

      <div className="mt-8">
        <Button asChild variant="secondaire" taille="bloc">
          <Link href="/app/ajouter">Ajouter quelque chose à mon SaaS</Link>
        </Button>
      </div>
    </AppShell>
  );
}
