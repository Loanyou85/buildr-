import type Stripe from 'stripe';
import { Plan, SubscriptionStatus } from '@prisma/client';
import { db } from '@/server/db';
import { getStripe, planForPriceId } from '@/server/stripe';

/**
 * Webhook Stripe. C'est **le seul endroit** qui accorde un accès payant :
 * une redirection de retour peut être falsifiée, une signature Stripe non.
 */
export async function POST(request: Request) {
  const stripe = getStripe();
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!stripe || !secret) {
    return new Response('Stripe non configuré', { status: 503 });
  }

  const signature = request.headers.get('stripe-signature');
  if (!signature) return new Response('Signature manquante', { status: 400 });

  // La signature porte sur le corps brut : il ne doit pas être reparsé avant.
  const payload = await request.text();

  let event: Stripe.Event;
  try {
    event = await stripe.webhooks.constructEventAsync(payload, signature, secret);
  } catch (error) {
    console.error('[stripe] signature invalide', error);
    return new Response('Signature invalide', { status: 400 });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        if (session.mode !== 'subscription' || session.payment_status === 'unpaid') break;

        const userId = session.client_reference_id ?? session.metadata?.userId;
        const subscriptionId =
          typeof session.subscription === 'string' ? session.subscription : session.subscription?.id;
        if (!userId || !subscriptionId) break;

        const subscription = await stripe.subscriptions.retrieve(subscriptionId);
        await applySubscription(userId, subscription);
        break;
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        const userId = subscription.metadata?.userId ?? (await userIdForCustomer(subscription.customer));
        if (!userId) break;
        await applySubscription(userId, subscription);
        break;
      }

      default:
        break;
    }
  } catch (error) {
    // Renvoyer 500 fait réessayer Stripe : mieux vaut une nouvelle tentative
    // qu'un abonnement payé sans accès accordé.
    console.error(`[stripe] traitement de ${event.type} échoué`, error);
    return new Response('Traitement échoué', { status: 500 });
  }

  return Response.json({ received: true });
}

async function userIdForCustomer(customer: string | { id: string } | null): Promise<string | null> {
  const customerId = typeof customer === 'string' ? customer : customer?.id;
  if (!customerId) return null;
  const row = await db.subscription.findUnique({
    where: { stripeCustomerId: customerId },
    select: { userId: true },
  });
  return row?.userId ?? null;
}

/** Traduit l'état Stripe en droits dans l'application. */
async function applySubscription(userId: string, subscription: Stripe.Subscription): Promise<void> {
  const item = subscription.items.data[0];
  const plan = planForPriceId(item?.price.id) ?? Plan.free;

  const active = subscription.status === 'active' || subscription.status === 'trialing';
  const status: SubscriptionStatus =
    subscription.status === 'past_due' || subscription.status === 'unpaid'
      ? SubscriptionStatus.past_due
      : active
        ? SubscriptionStatus.active
        : SubscriptionStatus.canceled;

  const periodEnd = item?.current_period_end ?? null;

  await db.subscription.upsert({
    where: { userId },
    update: {
      // Un abonnement résilié ou impayé ramène au plan gratuit : l'accès suit
      // l'état réel du paiement, jamais l'intention.
      plan: active ? plan : Plan.free,
      status,
      stripeSubscriptionId: subscription.id,
      stripeCustomerId:
        typeof subscription.customer === 'string' ? subscription.customer : subscription.customer.id,
      currentPeriodEnd: periodEnd ? new Date(periodEnd * 1000) : null,
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
      intendedPlan: null,
      intendedAt: null,
    },
    create: {
      userId,
      plan: active ? plan : Plan.free,
      status,
      stripeSubscriptionId: subscription.id,
      stripeCustomerId:
        typeof subscription.customer === 'string' ? subscription.customer : subscription.customer.id,
      currentPeriodEnd: periodEnd ? new Date(periodEnd * 1000) : null,
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
    },
  });
}
