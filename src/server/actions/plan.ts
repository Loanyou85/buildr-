'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { Plan } from '@prisma/client';
import { db } from '@/server/db';
import { requireUser } from '@/server/auth';
import { OFFERS } from '@/lib/offers';
import { getStripe, priceIdFor, stripeEnabled } from '@/server/stripe';
import { absoluteUrl } from '@/lib/site';

export async function paymentsEnabled(): Promise<boolean> {
  return stripeEnabled();
}

/**
 * Choix d'une offre.
 *
 * L'offre gratuite s'active immédiatement. Une offre payante ouvre un tunnel
 * de paiement Stripe ; c'est le webhook, et lui seul, qui accorde ensuite
 * l'accès. Tant qu'aucune clé n'est configurée, l'intention est enregistrée et
 * annoncée comme telle : on ne fait jamais croire à un paiement qui n'a pas eu
 * lieu.
 */
export async function choosePlan(formData: FormData): Promise<void> {
  const user = await requireUser();
  const raw = String(formData.get('plan') ?? '');
  const offer = OFFERS.find((o) => o.plan === raw);
  if (!offer) redirect('/offres');

  if (offer.price === 0) {
    await db.subscription.upsert({
      where: { userId: user.id },
      update: { plan: Plan.free, status: 'active', intendedPlan: null, intendedAt: null },
      create: { userId: user.id, plan: Plan.free },
    });
    revalidatePath('/app');
    redirect('/app');
  }

  const subscription = await db.subscription.upsert({
    where: { userId: user.id },
    update: { intendedPlan: offer.plan, intendedAt: new Date() },
    create: { userId: user.id, plan: Plan.free, intendedPlan: offer.plan, intendedAt: new Date() },
  });

  const stripe = getStripe();
  const priceId = priceIdFor(offer.plan);

  if (!stripe || !priceId) {
    redirect(`/offres?paiement=indisponible&offre=${offer.plan}`);
  }

  // Un client Stripe par utilisateur, réutilisé : l'historique de facturation
  // reste d'un seul tenant même après un changement d'offre.
  let customerId = subscription.stripeCustomerId;
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email ?? undefined,
      name: user.name ?? undefined,
      metadata: { userId: user.id },
    });
    customerId = customer.id;
    await db.subscription.update({
      where: { userId: user.id },
      data: { stripeCustomerId: customerId },
    });
  }

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    customer: customerId,
    line_items: [{ price: priceId, quantity: 1 }],
    locale: 'fr',
    allow_promotion_codes: true,
    // L'identifiant voyage avec la session : le webhook saura à qui accorder
    // l'accès sans dépendre de l'e-mail, qui peut changer.
    client_reference_id: user.id,
    subscription_data: { metadata: { userId: user.id, plan: offer.plan } },
    metadata: { userId: user.id, plan: offer.plan },
    success_url: absoluteUrl('/app?abonnement=actif'),
    cancel_url: absoluteUrl('/offres?paiement=annule'),
  });

  if (!session.url) redirect(`/offres?paiement=indisponible&offre=${offer.plan}`);
  redirect(session.url);
}

/**
 * Portail de facturation Stripe : changer de moyen de paiement, télécharger
 * ses factures, résilier. Rien de tout cela n'a à être réimplémenté ici.
 */
export async function openBillingPortal(): Promise<void> {
  const user = await requireUser();
  const stripe = getStripe();
  const subscription = await db.subscription.findUnique({ where: { userId: user.id } });

  if (!stripe || !subscription?.stripeCustomerId) {
    redirect('/offres');
  }

  const session = await stripe.billingPortal.sessions.create({
    customer: subscription.stripeCustomerId,
    return_url: absoluteUrl('/app/compte'),
  });

  redirect(session.url);
}
