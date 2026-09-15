import Link from 'next/link';
import { AppShell } from '@/components/app/app-shell';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { db } from '@/server/db';
import { requireUser } from '@/server/auth';
import { planFor } from '@/server/features';
import { deconnecter } from '@/server/actions/auth';
import { ouvrirPortail } from '@/server/actions/plan';
import { supprimerCompte } from '@/server/actions/account';
import { offerFor, formatPrice } from '@/lib/offers';
import { formatDateFr } from '@/lib/utils';
import { DECLARED_LABEL } from '@/lib/guardrails';

export const dynamic = 'force-dynamic';

export const metadata = { title: 'Mon compte — Nexteo' };

export default async function ComptePage({
  searchParams,
}: {
  searchParams: Promise<{ portail?: string }>;
}) {
  const { portail } = await searchParams;
  const user = await requireUser();

  const [compte, abonnement, plan, jalons] = await Promise.all([
    db.user.findUniqueOrThrow({
      where: { id: user.id },
      select: { email: true, name: true, createdAt: true, dataRetentionMonths: true },
    }),
    db.subscription.findUnique({ where: { userId: user.id } }),
    planFor(user.id),
    db.userMilestone.findMany({
      where: { userId: user.id },
      include: { milestone: true },
      orderBy: { milestone: { order: 'asc' } },
    }),
  ]);

  const offre = offerFor(plan);

  return (
    <AppShell actif="/app/compte">
      <h1 className="text-xl font-extrabold text-white">Mon compte</h1>
      <p className="mt-2 text-sm text-gris-300">
        {compte.name} — {compte.email}
      </p>

      <section className="mt-8">
        <h2 className="text-base font-bold text-white">Mon offre</h2>
        <div className="mt-3 rounded-[--radius-card] border border-gris-700 bg-nuit-800 p-4">
          <p className="text-sm text-white">
            {offre ? `${offre.name} — ${formatPrice(offre.price)} par mois` : 'Offre gratuite'}
          </p>
          {abonnement?.currentPeriodEnd ? (
            <p className="mt-1 text-xs text-gris-300">
              {abonnement.cancelAtPeriodEnd ? 'Se termine le ' : 'Prochain prélèvement le '}
              {formatDateFr(abonnement.currentPeriodEnd)}
            </p>
          ) : null}

          {portail === 'indisponible' ? (
            <p className="mt-3 text-xs text-gris-300">
              Le portail de facturation n’est pas disponible : aucun paiement n’a encore été
              enregistré sur ce compte.
            </p>
          ) : null}

          <div className="mt-4 flex flex-wrap gap-2">
            {offre ? (
              <form action={ouvrirPortail}>
                <Button type="submit" taille="sm" variant="secondaire">
                  Gérer mon abonnement
                </Button>
              </form>
            ) : (
              <Button asChild taille="sm">
                <Link href="/offres">Voir les offres</Link>
              </Button>
            )}
          </div>
        </div>
      </section>

      <section className="mt-8">
        <h2 className="text-base font-bold text-white">Mes jalons</h2>
        {jalons.length === 0 ? (
          <p className="mt-2 text-sm text-gris-300">Aucun pour l’instant. Le premier arrive vite.</p>
        ) : (
          <ul className="mt-3 space-y-2">
            {jalons.map((jalon) => (
              <li
                key={jalon.id}
                className="flex items-center justify-between gap-3 rounded-[--radius-card] border border-gris-700 bg-nuit-800 px-4 py-3"
              >
                <span className="text-sm text-white">{jalon.milestone.label}</span>
                <span className="flex items-center gap-2">
                  {jalon.declaredValue ? (
                    <Badge ton="revenu">{jalon.declaredValue} €</Badge>
                  ) : null}
                  <span className="text-xs text-gris-300">{formatDateFr(jalon.reachedAt)}</span>
                </span>
              </li>
            ))}
          </ul>
        )}
        <p className="mt-2 text-xs text-gris-300">
          {DECLARED_LABEL}. Un montant n’est vérifié que si un compte de paiement est connecté en
          lecture.
        </p>
      </section>

      <section className="mt-8">
        <h2 className="text-base font-bold text-white">Une autre idée</h2>
        <p className="mt-2 text-sm text-gris-300">
          Tu peux refaire le diagnostic quand tu veux. Le SaaS que tu construis et ta progression
          restent intacts.
        </p>
        <Button asChild taille="sm" variant="secondaire" className="mt-3">
          <Link href="/mes-idees">Revoir mes idées</Link>
        </Button>
      </section>

      <section className="mt-8">
        <h2 className="text-base font-bold text-white">Mes données</h2>
        <p className="mt-2 text-sm text-gris-300">
          Compte créé le {formatDateFr(compte.createdAt)}. Conservation : {compte.dataRetentionMonths}{' '}
          mois après ta dernière visite. Hébergement dans l’Union européenne.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Button asChild taille="sm" variant="secondaire">
            <a href="/api/compte/export">Exporter mes données</a>
          </Button>
        </div>
      </section>

      <section className="mt-10 border-t border-gris-700 pt-6">
        <form action={deconnecter}>
          <Button type="submit" taille="bloc" variant="secondaire">
            Me déconnecter
          </Button>
        </form>

        <details className="mt-6">
          <summary className="cursor-pointer list-none text-center text-xs text-gris-300 underline underline-offset-4">
            Supprimer mon compte
          </summary>
          <form action={supprimerCompte} className="mt-4 space-y-3">
            <p className="text-xs text-gris-300">
              La suppression efface réellement ton compte, ton diagnostic, tes idées, ton parcours et
              tes scripts. Elle est immédiate et définitive. Tape SUPPRIMER pour confirmer.
            </p>
            <input
              name="confirmation"
              required
              placeholder="SUPPRIMER"
              className="min-h-[52px] w-full rounded-[--radius-bouton] border border-gris-700 bg-nuit-800 px-4 text-base text-white"
            />
            <Button type="submit" taille="bloc" variant="danger">
              Supprimer définitivement
            </Button>
          </form>
        </details>
      </section>
    </AppShell>
  );
}
