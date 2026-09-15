import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { complexiteEnMots, RAISONS_DE_REJET } from '@/lib/ideas/politique';
import { choisirIdee, rejeterIdee } from '@/server/actions/ideas';
import { cn } from '@/lib/utils';

export interface IdeaView {
  id: string;
  title: string;
  oneLiner: string;
  targetAudience: string;
  problem: string;
  solution: string;
  pricingModel: string;
  monthlyPrice: number;
  buildComplexity: number;
  timeToFirstEuro: number;
  rationale: string | null;
  sources: { dimension: string; evidence: string }[];
  breakdown: { dimension: string; value: number; explanation: string }[];
}

/**
 * Section 8.3 : chaque idée cite les éléments du profil qui l'ont produite,
 * et l'interface les affiche. Une idée sans lien démontrable ne s'affiche pas.
 */
export function IdeaCard({ idea, principale }: { idea: IdeaView; principale?: boolean }) {
  const forts = idea.breakdown.filter((d) => d.value >= 0.6).slice(0, 4);

  return (
    <Card actif={principale} className={cn('p-5', principale && 'border-neo-500/40')}>
      {principale ? (
        <Badge ton="neo" className="mb-3">
          Celle qui te ressemble le plus
        </Badge>
      ) : null}

      <h2 className="text-lg font-extrabold text-white">{idea.title}</h2>
      <p className="mt-2 text-sm text-gris-300">{idea.oneLiner}</p>

      <dl className="mt-5 space-y-3 border-t border-gris-700 pt-4 text-sm">
        <div>
          <dt className="text-xs uppercase tracking-wide text-gris-300">Ton client</dt>
          <dd className="mt-0.5 text-white">{idea.targetAudience}</dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wide text-gris-300">Ce qui ne va pas aujourd’hui</dt>
          <dd className="mt-0.5 text-gris-300">{idea.problem}</dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wide text-gris-300">Ce que tu construis</dt>
          <dd className="mt-0.5 text-gris-300">{idea.solution}</dd>
        </div>
      </dl>

      <div className="mt-5 flex flex-wrap gap-2">
        {/* Le vert ne sort que sur un montant. */}
        <Badge ton="revenu">{idea.monthlyPrice} € par mois et par client</Badge>
        <Badge>{complexiteEnMots(idea.buildComplexity)}</Badge>
        <Badge>Premier euro vers la semaine {idea.timeToFirstEuro}</Badge>
      </div>

      <section className="mt-5 rounded-card border border-gris-700 bg-nuit-900/60 p-4">
        <h3 className="text-sm font-bold text-white">Pourquoi elle sort pour toi</h3>
        {idea.rationale ? <p className="mt-2 text-sm text-gris-300">{idea.rationale}</p> : null}
        <ul className="mt-3 space-y-1.5">
          {idea.sources.slice(0, 4).map((source, index) => (
            <li key={index} className="flex gap-2 text-sm text-gris-300">
              <span aria-hidden className="mt-2 h-1 w-1 shrink-0 rounded-full bg-neo-500" />
              {source.evidence}
            </li>
          ))}
          {forts.map((d) => (
            <li key={d.dimension} className="flex gap-2 text-sm text-gris-300">
              <span aria-hidden className="mt-2 h-1 w-1 shrink-0 rounded-full bg-neo-500" />
              {d.explanation}
            </li>
          ))}
        </ul>
      </section>

      <form action={choisirIdee} className="mt-5">
        <input type="hidden" name="ideaId" value={idea.id} />
        <Button type="submit" taille="bloc" variant={principale ? 'principal' : 'secondaire'}>
          {principale ? 'Je construis celle-là' : 'Je préfère celle-ci'}
        </Button>
      </form>

      <details className="mt-3">
        <summary className="cursor-pointer list-none text-center text-xs text-gris-300 underline underline-offset-4">
          Cette idée ne me va pas
        </summary>
        <form action={rejeterIdee} className="mt-3 space-y-2">
          <input type="hidden" name="ideaId" value={idea.id} />
          {RAISONS_DE_REJET.map((raison) => (
            <button
              key={raison.value}
              type="submit"
              name="raison"
              value={raison.value}
              className="tactile w-full rounded-champ border border-gris-700 px-4 py-3 text-left text-sm text-gris-300 hover:border-neo-500/30 hover:text-white"
            >
              {raison.label}
            </button>
          ))}
        </form>
      </details>
    </Card>
  );
}
