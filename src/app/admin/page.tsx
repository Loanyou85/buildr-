import Link from 'next/link';
import { db } from '@/server/db';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { createJourney, toggleJourneyActive } from '@/server/actions/admin';

export const dynamic = 'force-dynamic';

const BUDGET_LABEL: Record<string, string> = { zero: '0 €', low: '≈ 300 €', high: '≈ 2 000 €' };
const EXPERIENCE_LABEL: Record<string, string> = {
  beginner: 'débutant',
  intermediate: 'intermédiaire',
  advanced: 'avancé',
};

/** Admin (section 8.9) : créer et modifier les parcours, sans toucher au code. */
export default async function AdminPage() {
  const businessModels = await db.businessModel.findMany({
    orderBy: { name: 'asc' },
    include: {
      journeys: {
        orderBy: [{ budgetTier: 'asc' }, { experienceTier: 'asc' }],
        include: { _count: { select: { phases: true, userJourneys: true } } },
      },
    },
  });

  return (
    <>
      <h1 className="text-2xl">Parcours</h1>
      <p className="prose-buildr mt-2 text-sm text-beton-600">
        Un business model porte plusieurs parcours, selon le budget et le niveau. Ajouter un parcours ne
        demande aucune modification de code.
      </p>

      <section className="mt-8 rounded-card border border-beton-300 bg-blanc p-5">
        <h2 className="text-lg text-encre">Nouveau parcours</h2>
        <form action={createJourney} className="mt-4 flex flex-wrap items-end gap-3">
          <label className="flex flex-col gap-1.5">
            <span className="text-xs text-beton-600">Business model</span>
            <select
              name="businessModelId"
              required
              className="h-11 rounded-xl border border-beton-300 bg-blanc px-3 text-sm"
            >
              {businessModels.map((business) => (
                <option key={business.id} value={business.id}>
                  {business.name}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-xs text-beton-600">Nom</span>
            <Input type="text" name="name" required className="w-72" />
          </label>
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
          <Button type="submit" variant="acier">
            Créer
          </Button>
        </form>
      </section>

      <div className="mt-10 space-y-8">
        {businessModels.map((business) => (
          <section key={business.id}>
            <div className="flex items-baseline gap-3">
              <h2 className="text-lg text-encre">{business.name}</h2>
              <span className="h-px flex-1 bg-beton-300" aria-hidden />
              <span className="text-xs text-beton-600">{business.slug}</span>
            </div>

            {business.journeys.length === 0 ? (
              <p className="mt-3 text-sm text-beton-600">
                Aucun parcours publié. Ce business peut être recommandé mais ne peut pas encore être démarré.
              </p>
            ) : (
              <ul className="mt-3 space-y-2">
                {business.journeys.map((journey) => (
                  <li
                    key={journey.id}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-card border border-beton-300 bg-blanc px-5 py-3.5"
                  >
                    <div className="min-w-0">
                      <Link href={`/admin/parcours/${journey.id}`} className="text-base text-encre hover:text-acier">
                        {journey.name}
                      </Link>
                      <p className="mt-1 flex flex-wrap items-center gap-2 text-xs text-beton-600">
                        <span>{BUDGET_LABEL[journey.budgetTier]}</span>
                        <span>·</span>
                        <span>{EXPERIENCE_LABEL[journey.experienceTier]}</span>
                        <span>·</span>
                        <span>v{journey.version}</span>
                        <span>·</span>
                        <span>{journey._count.phases} phases</span>
                        <span>·</span>
                        <span>{journey._count.userJourneys} utilisateurs</span>
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      {journey.isActive ? <Badge variant="niveau">Actif</Badge> : <Badge>Inactif</Badge>}
                      <form action={toggleJourneyActive}>
                        <input type="hidden" name="journeyId" value={journey.id} />
                        <Button type="submit" variant="ghost" size="sm">
                          {journey.isActive ? 'Désactiver' : 'Activer'}
                        </Button>
                      </form>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        ))}
      </div>
    </>
  );
}
