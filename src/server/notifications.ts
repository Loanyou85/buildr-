import 'server-only';
import { NotificationType, StepStatus } from '@prisma/client';
import { db } from '@/server/db';
import { findForbiddenClaims } from '@/lib/guardrails';

/**
 * Notifications (section 13 du périmètre). Le ton ne fait jamais honte à
 * l'utilisateur (garde-fou n° 6) : chaque message est vérifié avant d'être
 * programmé, et un message fautif n'est pas envoyé.
 */
export interface NotificationPayload {
  title: string;
  body: string;
  url: string;
}

function assertTone(payload: NotificationPayload): NotificationPayload {
  const violations = [...findForbiddenClaims(payload.title), ...findForbiddenClaims(payload.body)];
  if (violations.length > 0) {
    throw new Error(`Notification refusée (garde-fou n° 2) : ${violations.map((v) => v.excerpt).join(', ')}`);
  }
  return payload;
}

export function dailyReminderPayload(stepTitle: string, minutes: number): NotificationPayload {
  return assertTone({
    title: 'Ta prochaine étape t’attend',
    body: `« ${stepTitle} » — environ ${minutes} minutes. Tu peux t’y mettre maintenant.`,
    url: '/app',
  });
}

export function inactivityPayload(stepTitle: string, days: number): NotificationPayload {
  return assertTone({
    title: 'On reprend où tu t’es arrêté',
    body: `Ça fait ${days} jours. L’étape « ${stepTitle} » est toujours là, et elle commence par une action de 15 minutes.`,
    url: '/app',
  });
}

/**
 * Programme les rappels. Conçue pour être appelée par une tâche planifiée
 * (route `/api/notifications/run`), pas par une requête utilisateur.
 */
export async function scheduleReminders(now: Date = new Date()): Promise<{ scheduled: number }> {
  const prefs = await db.notificationPref.findMany({
    where: { OR: [{ dailyReminder: true }, { inactivityReminder: true }] },
    include: {
      user: {
        include: {
          userJourneys: {
            orderBy: { startedAt: 'desc' },
            take: 1,
            include: { steps: { include: { step: true } } },
          },
        },
      },
    },
  });

  let scheduled = 0;

  for (const pref of prefs) {
    const journey = pref.user.userJourneys[0];
    if (!journey) continue;

    const current =
      journey.steps.find((p) => p.stepId === journey.currentStepId) ??
      journey.steps.find((p) => p.status !== StepStatus.done);
    if (!current) continue;

    const scheduledFor = new Date(now);
    scheduledFor.setHours(pref.reminderHour, 0, 0, 0);
    if (scheduledFor <= now) scheduledFor.setDate(scheduledFor.getDate() + 1);

    const lastActivity = current.lastActivityAt ?? current.startedAt ?? journey.startedAt;
    const inactiveDays = Math.floor((now.getTime() - lastActivity.getTime()) / 86_400_000);

    const type =
      pref.inactivityReminder && inactiveDays >= 3
        ? NotificationType.inactivity
        : pref.dailyReminder
          ? NotificationType.daily_reminder
          : null;
    if (!type) continue;

    const payload =
      type === NotificationType.inactivity
        ? inactivityPayload(current.step.title, inactiveDays)
        : dailyReminderPayload(current.step.title, current.step.estimatedMinutes);

    const already = await db.notification.findFirst({
      where: { userId: pref.userId, type, scheduledFor: { gte: new Date(now.getTime() - 12 * 3_600_000) } },
    });
    if (already) continue;

    await db.notification.create({
      data: { userId: pref.userId, type, payload: { ...payload }, scheduledFor },
    });
    scheduled += 1;
  }

  return { scheduled };
}

/**
 * Envoie les notifications dues. Sans clé Resend, l'envoi est journalisé :
 * la mécanique reste vérifiable de bout en bout en développement.
 */
export async function sendDueNotifications(now: Date = new Date()): Promise<{ sent: number }> {
  const due = await db.notification.findMany({
    where: { sentAt: null, scheduledFor: { lte: now } },
    include: { user: { select: { email: true } } },
    take: 100,
  });

  let sent = 0;
  for (const notification of due) {
    const payload = notification.payload as unknown as NotificationPayload;

    if (process.env.AUTH_RESEND_KEY) {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.AUTH_RESEND_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: process.env.EMAIL_FROM ?? 'Buildr <bonjour@buildr.app>',
          to: notification.user.email,
          subject: payload.title,
          text: `${payload.body}\n\n${process.env.AUTH_URL ?? 'http://localhost:3000'}${payload.url}`,
        }),
      });
      if (!response.ok) continue;
    } else {
      console.info(`[notifications] ${notification.user.email} — ${payload.title} : ${payload.body}`);
    }

    await db.notification.update({ where: { id: notification.id }, data: { sentAt: new Date() } });
    sent += 1;
  }

  return { sent };
}
