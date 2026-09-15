import { redirect } from 'next/navigation';
import Link from 'next/link';
import { auth } from '@/server/auth';
import { db } from '@/server/db';
import { OFFERS, offerFor } from '@/lib/offers';
import { OfferCards } from '@/components/app/offer-cards';
import { stripeMode } from '@/server/stripe';
import { GUARANTEE_DAYS, GUARANTEE_PROMISE } from '@/lib/guarantee';

export const dynamic = 'force-dynamic';

/**
 * Les offres, présentées juste après la recommandation : l'utilisateur sait
 * déjà quelle activité lui correspond et ce que contient le parcours. Il paie
 * en sachant ce qu'il achète, ce qui est aussi ce que promet la landing —
 * le diagnostic reste gratuit.
 */
export default async function OffersPage({
  searchParams,
}: {
  searchParams: Promise<{ paiement?: string; offre?: string; raison?: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect('/connexion');

  const { paiement, offre, raison } = await searchParams;

  const [subscription, userJourney] = await Promise.all([
    db.subscription.findUnique({ where: { userId: session.user.id } }),
    db.userJourney.findFirst({
      where: { userId: session.user.id },
      orderBy: { startedAt: 'desc' },
      include: { journey: { include: { businessModel: true } } },
    }),
  ]);

  const mode = stripeMode();
  const businessName = userJourney?.journey.businessModel.name ?? null;
  const pending = offre ? offerFor(offre as never) : null;

  return (
    <div className="min-h-dvh bg-beton-100">
      <main className="mx-auto max-w-5xl px-5 py-14">
        {businessName ? (
          <p className="text-sm text-beton-600">Ton activité : {businessName}</p>
        ) : null}
        <h1 className="mt-2 text-3xl">Jusqu’où veux-tu aller ?</h1>
        <p className="prose-nexteo mt-4 text-lg text-beton-600">
          Ton parcours est prêt. Tu peux commencer gratuitement et voir par toi-même, ou prendre le
          chemin complet tout de suite.
        </p>

        {/*
          Avertissement réservé à l'administrateur : un visiteur n'a rien à
          faire de cette information, mais toi tu dois la voir avant d'annoncer
          l'ouverture des paiements.
        */}
        {session.user.role === 'admin' && mode !== 'production' ? (
          <p className="mt-6 rounded-card border border-signal/40 bg-signal-50 p-4 text-sm text-encre">
            {mode === 'test'
              ? 'Paiements en mode test : les cartes réelles seront refusées et les cartes de test ouvriront l’accès sans débit. Remplace STRIPE_SECRET_KEY par une clé sk_live_ pour encaisser pour de vrai.'
              : 'Aucune clé Stripe configurée : choisir une offre payante enregistre l’intention sans rien débiter.'}
          </p>
        ) : null}

        {raison === 'plusieurs-parcours' ? (
          <p className="mt-6 rounded-card border border-beton-300 bg-blanc p-4 text-sm text-encre">
            Suivre une deuxième activité en parallèle fait partie de l’offre Illimité. Ton parcours
            actuel reste intact quoi qu’il arrive.
          </p>
        ) : null}

        {paiement === 'annule' ? (
          <p className="mt-6 rounded-card border border-beton-300 bg-blanc p-4 text-sm text-encre">
            Paiement interrompu, rien n’a été débité. Tu peux reprendre quand tu veux, ou commencer
            avec l’offre Découverte.
          </p>
        ) : null}

        {paiement === 'indisponible' && pending ? (
          <p className="prose-nexteo mt-6 rounded-card border border-beton-300 bg-blanc p-4 text-sm text-encre">
            Ton choix de l’offre {pending.name} est enregistré, mais le paiement n’est pas encore
            ouvert — aucun montant ne t’a été débité. Tu peux commencer avec l’offre Découverte en
            attendant : ta progression sera conservée quand tu passeras à l’offre complète.
          </p>
        ) : null}

        <OfferCards offers={OFFERS} currentPlan={subscription?.plan ?? 'free'} />

        <p className="prose-nexteo mt-8 rounded-card border border-niveau/40 bg-niveau-50 p-4 text-sm text-encre">
          <strong className="font-medium">Garantie {GUARANTEE_DAYS} jours.</strong> {GUARANTEE_PROMISE}{' '}
          <Link href="/garantie" className="text-acier underline-offset-4 hover:underline">
            Voir les conditions
          </Link>
          .
        </p>

        <p className="prose-nexteo mt-6 text-sm text-beton-600">
          Sans engagement, résiliable à tout moment. Ta progression et tes données restent les tiennes,
          exportables et supprimables depuis{' '}
          <Link href="/app/compte" className="text-acier underline-offset-4 hover:underline">
            ton compte
          </Link>
          .
        </p>
      </main>
    </div>
  );
}
