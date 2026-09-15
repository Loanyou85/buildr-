import { randomUUID } from 'node:crypto';
import { cookies } from 'next/headers';
import { db } from '@/server/db';

export const dynamic = 'force-dynamic';

/**
 * État du site, en un appel.
 *
 * Quand quelque chose ne marche pas en production, les questions sont toujours
 * les mêmes : est-ce que la base répond, est-ce qu'elle accepte une écriture,
 * est-ce que le contenu est là, est-ce que la session se pose. Sans cette
 * page il faut aller lire des journaux. Avec, il suffit d'ouvrir une adresse.
 *
 * Aucune valeur de configuration n'est renvoyée, et tout message d'erreur est
 * nettoyé de ce qui pourrait ressembler à une adresse de connexion ou à une
 * clé avant d'être affiché.
 */
function nettoyer(message: string): string {
  return message
    .replace(/postgres(?:ql)?:\/\/\S+/gi, '[adresse de base masquée]')
    .replace(/\b(?:sk|pk|rk|whsec)_[A-Za-z0-9_]+/g, '[clé masquée]')
    .replace(/\b[\w.-]+@[\w.-]+\.\w+\b/g, '[adresse masquée]')
    .slice(0, 400);
}

function decrire(error: unknown): { code: string; message: string } {
  const code =
    typeof error === 'object' && error !== null && 'code' in error
      ? String((error as { code: unknown }).code)
      : 'inconnu';
  const message = error instanceof Error ? nettoyer(error.message) : 'erreur non identifiée';
  return { code, message };
}

const PISTES: Record<string, string> = {
  P1001: 'La base ne répond pas depuis le serveur. Vérifie DATABASE_URL.',
  P1002: 'La base a mis trop de temps à répondre.',
  P1017: 'La base a fermé la connexion. Souvent un répartiteur de connexions mal configuré.',
  P2021: 'Une table manque : la migration n’a pas été appliquée.',
  P2022: 'Une colonne manque : la migration n’a pas été appliquée.',
  P2002: 'Une contrainte d’unicité a été violée.',
};

export async function GET() {
  const debut = Date.now();
  const rapport: Record<string, unknown> = {};

  // 1. Lecture.
  try {
    const [phases, etapes, archetypes, gabarits, motifs, droits] = await Promise.all([
      db.phase.count(),
      db.step.count(),
      db.ideaBlueprint.count(),
      db.promptTemplate.count(),
      db.errorPattern.count(),
      db.featureFlag.count(),
    ]);
    rapport.lecture = 'ok';
    rapport.contenu = phases === 13 && archetypes > 0 && gabarits > 0 ? 'complet' : 'incomplet';
    rapport.details = { phases, etapes, archetypes, gabarits, motifs, droits };
  } catch (error) {
    const { code, message } = decrire(error);
    rapport.lecture = 'échec';
    rapport.lectureErreur = { code, message, piste: PISTES[code] ?? 'Voir les journaux du serveur.' };
  }

  // 2. Écriture : exactement ce que fait la première question du diagnostic.
  //    C'est le premier appel serveur du parcours, et donc le premier endroit
  //    où une base en lecture seule ou mal branchée se manifeste.
  let profilTemporaire: string | null = null;
  try {
    const profil = await db.profile.create({ data: { anonId: `sante-${randomUUID()}` } });
    profilTemporaire = profil.id;
    await db.profile.update({ where: { id: profil.id }, data: { age: 21 } });
    rapport.ecriture = 'ok';
  } catch (error) {
    const { code, message } = decrire(error);
    rapport.ecriture = 'échec';
    rapport.ecritureErreur = { code, message, piste: PISTES[code] ?? 'Voir les journaux du serveur.' };
  } finally {
    if (profilTemporaire) {
      await db.profile.delete({ where: { id: profilTemporaire } }).catch(() => undefined);
    }
  }

  // 3. Session : la lecture des cookies, dont dépend tout le diagnostic anonyme.
  try {
    (await cookies()).get('nexteo_diagnostic');
    rapport.cookies = 'ok';
  } catch (error) {
    rapport.cookies = 'échec';
    rapport.cookiesErreur = decrire(error);
  }

  rapport.millisecondes = Date.now() - debut;
  rapport.configuration = {
    ia: Boolean(process.env.ANTHROPIC_API_KEY?.trim()),
    stripe: Boolean(process.env.STRIPE_SECRET_KEY?.trim()),
    webhookStripe: Boolean(process.env.STRIPE_WEBHOOK_SECRET?.trim()),
    tarifs: [
      process.env.STRIPE_PRICE_DEPART,
      process.env.STRIPE_PRICE_CONSTRUCTION,
      process.env.STRIPE_PRICE_LANCEMENT,
    ].filter((v) => Boolean(v?.trim())).length,
    secretAuth: Boolean(process.env.AUTH_SECRET?.trim()),
    urlAuth: Boolean(process.env.AUTH_URL?.trim()),
    baseDirecteDistincte: Boolean(
      process.env.DIRECT_URL?.trim() && process.env.DIRECT_URL !== process.env.DATABASE_URL,
    ),
  };

  const bon = rapport.lecture === 'ok' && rapport.ecriture === 'ok' && rapport.contenu === 'complet';
  return Response.json({ etat: bon ? 'ok' : 'problème', ...rapport }, { status: bon ? 200 : 503 });
}
