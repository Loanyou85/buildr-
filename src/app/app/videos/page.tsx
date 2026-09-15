import Link from 'next/link';
import { redirect } from 'next/navigation';
import { AppShell } from '@/components/app/app-shell';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { db } from '@/server/db';
import { requireUser } from '@/server/auth';
import { can, FEATURES } from '@/server/features';
import { genererScripts, marquerScript, regenererUnScript } from '@/server/actions/videos';
import { ANGLE_LABELS, MENTION_PARTENARIAT, TOTAL_SCRIPTS } from '@/lib/videos/angles';
import { cn } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export const metadata = { title: 'Mes trente vidéos — Nexteo' };

export default async function VideosPage() {
  const user = await requireUser();
  const idea = await db.idea.findFirst({ where: { userId: user.id, status: 'selected' } });
  if (!idea) redirect('/mes-idees');

  if (!(await can(user.id, FEATURES.videoScripts))) {
    return (
      <AppShell actif="/app">
        <h1 className="text-xl font-extrabold text-white">Trente scripts, un par jour.</h1>
        <p className="mt-2 text-sm text-gris-300">
          Le plus dur dans la publication quotidienne n’est pas de filmer, c’est de décider quoi
          dire. Les trente scripts sont écrits pour ton produit, avec l’accroche, le texte mot pour
          mot, le plan de tournage, la légende et le commentaire à épingler.
        </p>
        <p className="mt-3 text-sm text-gris-300">
          Les six premiers se tournent avant même d’avoir un seul utilisateur.
        </p>
        <Button asChild taille="bloc" className="mt-6">
          <Link href="/offres">Voir les offres</Link>
        </Button>
      </AppShell>
    );
  }

  const scripts = await db.videoScript.findMany({
    where: { userId: user.id, ideaId: idea.id },
    orderBy: { dayNumber: 'asc' },
  });

  if (scripts.length === 0) {
    return (
      <AppShell actif="/app">
        <h1 className="text-xl font-extrabold text-white">Trente scripts, un par jour.</h1>
        <p className="mt-2 text-sm text-gris-300">
          Écrits pour « {idea.title} », et pour ton public. Une à deux minutes de génération.
        </p>
        <form action={genererScripts} className="mt-6">
          <Button type="submit" taille="bloc">
            Générer mes {TOTAL_SCRIPTS} scripts
          </Button>
        </form>
      </AppShell>
    );
  }

  const tournes = scripts.filter((s) => s.status !== 'todo').length;

  return (
    <AppShell actif="/app">
      <h1 className="text-xl font-extrabold text-white">Ton mois de contenu.</h1>
      <p className="mt-2 text-sm text-gris-300 tabular">
        {tournes} sur {scripts.length} tournés ou publiés.
      </p>

      <p className="mt-4 rounded-[--radius-card] border border-gris-700 bg-nuit-800 p-4 text-xs text-gris-300">
        {MENTION_PARTENARIAT}
      </p>

      <div className="mt-6 space-y-3">
        {scripts.map((script) => {
          const plan = (script.shotPlan as { at: string; shot: string }[]) ?? [];
          const incruste = (script.onScreenText as { at: string; text: string }[]) ?? [];

          return (
            <details
              key={script.id}
              className={cn(
                'rounded-[--radius-card] border bg-nuit-800 p-4',
                script.status === 'published' ? 'border-neo-500/30' : 'border-gris-700',
              )}
            >
              <summary className="tactile flex cursor-pointer list-none items-center justify-between gap-3">
                <span className="min-w-0">
                  <span className="flex items-center gap-2">
                    <span className="font-display text-sm font-extrabold tabular text-neo-500">
                      J{script.dayNumber}
                    </span>
                    <Badge>{ANGLE_LABELS[script.angle]}</Badge>
                    {script.status !== 'todo' ? (
                      <Badge ton="neo">{script.status === 'filmed' ? 'tourné' : 'publié'}</Badge>
                    ) : null}
                  </span>
                  <span className="mt-1.5 block truncate text-sm text-white">{script.hook}</span>
                </span>
                <span aria-hidden className="shrink-0 text-gris-300">
                  +
                </span>
              </summary>

              <div className="mt-4 space-y-4 text-sm">
                <div>
                  <p className="text-xs uppercase tracking-wide text-gris-300">Accroche</p>
                  <p className="mt-1 text-white">{script.hook}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-gris-300">
                    Ce que tu dis — {script.durationSeconds} secondes
                  </p>
                  <p className="mt-1 whitespace-pre-wrap text-gris-300">{script.body}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-gris-300">Plan de tournage</p>
                  <ul className="mt-1 space-y-1">
                    {plan.map((item, index) => (
                      <li key={index} className="text-gris-300">
                        <span className="font-mono text-xs text-neo-100">{item.at}</span> — {item.shot}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-gris-300">Texte à l’écran</p>
                  <ul className="mt-1 space-y-1">
                    {incruste.map((item, index) => (
                      <li key={index} className="text-gris-300">
                        <span className="font-mono text-xs text-neo-100">{item.at}</span> — {item.text}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-gris-300">Légende</p>
                  <p className="mt-1 text-gris-300">{script.caption}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-gris-300">Commentaire à épingler</p>
                  <p className="mt-1 text-gris-300">{script.pinnedComment}</p>
                </div>

                <div className="flex flex-wrap gap-2 pt-2">
                  <form action={marquerScript}>
                    <input type="hidden" name="scriptId" value={script.id} />
                    <input type="hidden" name="status" value={script.status === 'todo' ? 'filmed' : 'published'} />
                    <Button type="submit" taille="sm" variant="secondaire">
                      {script.status === 'todo' ? 'Marquer tourné' : 'Marquer publié'}
                    </Button>
                  </form>
                  <form action={regenererUnScript}>
                    <input type="hidden" name="scriptId" value={script.id} />
                    <Button type="submit" taille="sm" variant="fantome">
                      Régénérer celui-ci
                    </Button>
                  </form>
                </div>
              </div>
            </details>
          );
        })}
      </div>

      <form action={genererScripts} className="mt-8">
        <Button type="submit" variant="fantome" taille="sm" className="w-full">
          Tout régénérer
        </Button>
      </form>
    </AppShell>
  );
}
