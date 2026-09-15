import type { Plan } from '@prisma/client';
import type { Offer } from '@/lib/offers';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { choosePlan } from '@/server/actions/plan';
import { cn } from '@/lib/utils';

/**
 * Les trois offres. Une seule porte l'orange — celle qu'on recommande — parce
 * que l'orange ne désigne jamais qu'une chose : l'action à faire maintenant.
 */
export function OfferCards({ offers, currentPlan }: { offers: Offer[]; currentPlan: Plan }) {
  return (
    <div className="mt-10 grid items-start gap-4 lg:grid-cols-3">
      {offers.map((offer) => {
        const isCurrent = offer.plan === currentPlan;
        return (
          <section
            key={offer.plan}
            className={cn(
              'flex h-full flex-col rounded-card border bg-blanc p-6',
              offer.highlighted ? 'border-acier shadow-[0_8px_30px_rgba(16,24,40,0.06)]' : 'border-beton-300',
            )}
          >
            <div className="flex items-center gap-2">
              <h2 className="text-lg text-encre">{offer.name}</h2>
              {offer.highlighted ? <Badge variant="acier">Le plus choisi</Badge> : null}
              {isCurrent ? <Badge variant="niveau">Ton offre</Badge> : null}
            </div>

            <p className="prose-nexteo mt-2 text-sm text-beton-600">{offer.tagline}</p>

            <p className="mt-5 flex items-baseline gap-1.5">
              <span className="tabular font-display text-3xl font-extrabold tracking-[-0.02em] text-encre">
                {offer.price === 0 ? 'Gratuit' : `${offer.price} €`}
              </span>
              {offer.price > 0 ? <span className="text-sm text-beton-600">par mois</span> : null}
            </p>

            <ul className="mt-6 flex-1 space-y-2.5">
              {offer.features.map((feature) => (
                <li key={feature} className="flex items-start gap-2.5 text-sm text-encre">
                  <span className="mt-0.5 text-niveau" aria-hidden>
                    ✓
                  </span>
                  <span>{feature}</span>
                </li>
              ))}
            </ul>

            {offer.limit ? <p className="mt-4 text-xs text-beton-600">{offer.limit}</p> : null}

            <form action={choosePlan} className="mt-6">
              <input type="hidden" name="plan" value={offer.plan} />
              <Button
                type="submit"
                variant={offer.highlighted ? 'signal' : 'outline'}
                size="lg"
                className="w-full"
                disabled={isCurrent && offer.price === 0}
              >
                {isCurrent && offer.price === 0
                  ? 'Ton offre actuelle'
                  : offer.price === 0
                    ? 'Commencer gratuitement'
                    : `Choisir ${offer.name}`}
              </Button>
            </form>
          </section>
        );
      })}
    </div>
  );
}
