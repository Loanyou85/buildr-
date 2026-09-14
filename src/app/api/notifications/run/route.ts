import { scheduleReminders, sendDueNotifications } from '@/server/notifications';

/**
 * Point d'entrée pour une tâche planifiée. Protégé par un secret partagé :
 * en l'absence de `CRON_SECRET`, la route n'est ouverte qu'en développement.
 */
export async function POST(request: Request) {
  const secret = process.env.CRON_SECRET;
  const provided = request.headers.get('authorization')?.replace('Bearer ', '');

  if (secret) {
    if (provided !== secret) return new Response('Non autorisé', { status: 401 });
  } else if (process.env.NODE_ENV === 'production') {
    return new Response('CRON_SECRET requis en production', { status: 503 });
  }

  const scheduled = await scheduleReminders();
  const sent = await sendDueNotifications();
  return Response.json({ ...scheduled, ...sent });
}
