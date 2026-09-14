import { PrismaClient } from '@prisma/client';
import { runSeed } from '../../../../../prisma/seed/run';

/**
 * Initialisation du référentiel en production, sans terminal.
 *
 * Peupler la base est indispensable : sans business models ni parcours, le
 * moteur n'a rien à recommander. Cette route rejoue le même seed que
 * `npm run db:seed`, elle est idempotente, et elle ne touche jamais à un
 * parcours déjà démarré par un utilisateur.
 *
 * Elle est fermée par défaut : sans `SEED_SECRET`, elle refuse de s'exécuter.
 */
export const maxDuration = 300;

export async function POST(request: Request) {
  const secret = process.env.SEED_SECRET;
  if (!secret) {
    return Response.json(
      { error: 'SEED_SECRET n’est pas défini : la route d’initialisation est fermée.' },
      { status: 503 },
    );
  }

  const provided = request.headers.get('authorization')?.replace(/^Bearer /, '');
  if (provided !== secret) {
    return Response.json({ error: 'Secret invalide.' }, { status: 401 });
  }

  // `force` réécrit aussi les parcours déjà démarrés : à n'utiliser que pour
  // corriger le contenu lui-même, car la progression en cours est perdue.
  let force = false;
  try {
    const body: unknown = await request.json();
    force = typeof body === 'object' && body !== null && (body as { force?: unknown }).force === true;
  } catch {
    // Pas de corps de requête : comportement par défaut, sans écrasement.
  }

  const db = new PrismaClient();
  try {
    const summary = await runSeed(db, { force });
    return Response.json({
      ok: true,
      message: 'Référentiel initialisé. Tu peux maintenant supprimer SEED_SECRET.',
      summary,
    });
  } catch (error) {
    console.error('[initialiser] seed échoué', error);
    return Response.json(
      { error: error instanceof Error ? error.message : 'Seed échoué' },
      { status: 500 },
    );
  } finally {
    await db.$disconnect();
  }
}
