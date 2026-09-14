'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { db } from '@/server/db';
import { requireUser, signOut } from '@/server/auth';

/**
 * RGPD (garde-fou n° 4) : export et suppression fonctionnels dès le MVP.
 * L'export contient tout ce qui a été collecté, pas un résumé.
 */
export async function exportMyData(): Promise<string> {
  const user = await requireUser();

  const data = await db.user.findUnique({
    where: { id: user.id },
    include: {
      profile: {
        include: {
          skills: { include: { skill: true } },
          interests: { include: { interest: true } },
          habits: true,
        },
      },
      recommendations: { include: { businessModel: { select: { slug: true, name: true } } } },
      userJourneys: {
        include: {
          journey: { select: { name: true, budgetTier: true, experienceTier: true } },
          steps: { include: { checkpoints: true } },
          adjustments: true,
          dailyPlans: true,
        },
      },
      milestones: { include: { milestone: true } },
      adventures: { include: { shares: true } },
      notifications: true,
      notificationPref: true,
      assistantThreads: { include: { messages: true } },
      subscription: true,
      accounts: { select: { provider: true, type: true } },
    },
  });

  return JSON.stringify(
    {
      exportedAt: new Date().toISOString(),
      note: 'Export intégral de tes données Nexteo, conformément à ton droit d’accès et de portabilité.',
      data,
    },
    null,
    2,
  );
}

/** Suppression définitive. Les relations sont en cascade : rien ne survit. */
export async function deleteMyAccount(formData: FormData): Promise<void> {
  const user = await requireUser();
  const confirmation = String(formData.get('confirmation') ?? '').trim().toLowerCase();

  if (confirmation !== 'supprimer') {
    redirect('/app/compte?erreur=confirmation');
  }

  await db.user.delete({ where: { id: user.id } });
  await signOut({ redirectTo: '/' });
}

export async function updateNotificationPrefs(formData: FormData): Promise<void> {
  const user = await requireUser();
  const hour = Number(formData.get('reminderHour') ?? 9);

  await db.notificationPref.upsert({
    where: { userId: user.id },
    update: {
      dailyReminder: formData.get('dailyReminder') === 'on',
      inactivityReminder: formData.get('inactivityReminder') === 'on',
      reminderHour: Number.isFinite(hour) ? Math.max(0, Math.min(23, Math.round(hour))) : 9,
      channel: (String(formData.get('channel') ?? 'email') as 'email' | 'browser' | 'both'),
    },
    create: { userId: user.id },
  });

  revalidatePath('/app/compte');
}
