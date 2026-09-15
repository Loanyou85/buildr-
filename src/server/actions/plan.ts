'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { Plan } from '@prisma/client';
import { db } from '@/server/db';
import { requireUser } from '@/server/auth';
import { OFFERS } from '@/lib/offers';

/** Un prestataire de paiement est-il configuré ? */
export async function paymentsEnabled(): Promise<boolean> {
  return Boolean(process.env.STRIPE_SECRET_KEY);
}

/**
 * Choix d'une offre.
 *
 * L'offre gratuite s'active immédiatement. Une offre payante enregistre
 * l'intention et s'arrête là tant qu'aucun prestataire de paiement n'est
 * branché : on ne fait jamais croire à un paiement qui n'a pas eu lieu.
 * Quand Stripe sera configuré, c'est ici que part la session de paiement — et
 * c'est le retour du webhook qui fera passer `plan` à la valeur choisie.
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

  await db.subscription.upsert({
    where: { userId: user.id },
    update: { intendedPlan: offer.plan, intendedAt: new Date() },
    create: { userId: user.id, plan: Plan.free, intendedPlan: offer.plan, intendedAt: new Date() },
  });

  if (!(await paymentsEnabled())) {
    redirect(`/offres?paiement=indisponible&offre=${offer.plan}`);
  }

  // Point de branchement du prestataire de paiement : créer la session ici et
  // rediriger vers son tunnel. Rien d'autre ne bouge dans l'application.
  redirect(`/offres?paiement=indisponible&offre=${offer.plan}`);
}
