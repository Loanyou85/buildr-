import { db } from '@/server/db';

export const dynamic = 'force-dynamic';

/**
 * État du site, en un appel.
 *
 * Quand quelque chose ne marche pas en production, la première question est
 * toujours la même : est-ce que la base répond, et est-ce qu'elle contient le
 * contenu ? Sans cette page, il faut aller lire des journaux ; avec, il suffit
 * d'ouvrir une adresse.
 *
 * On ne renvoie aucun message d'erreur brut : le code d'erreur suffit à
 * savoir quoi faire, et n'expose ni adresse de serveur ni identifiant.
 */
export async function GET() {
  const debut = Date.now();

  try {
    const [phases, etapes, archetypes, gabarits, motifs, droits] = await Promise.all([
      db.phase.count(),
      db.step.count(),
      db.ideaBlueprint.count(),
      db.promptTemplate.count(),
      db.errorPattern.count(),
      db.featureFlag.count(),
    ]);

    const complet = phases === 13 && archetypes > 0 && gabarits > 0 && droits > 0;

    return Response.json(
      {
        base: 'joignable',
        millisecondes: Date.now() - debut,
        contenu: complet ? 'complet' : 'incomplet',
        details: { phases, etapes, archetypes, gabarits, motifs, droits },
        // Ce qui est branché, sans révéler la moindre valeur.
        configuration: {
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
        },
      },
      { status: complet ? 200 : 503 },
    );
  } catch (error) {
    const code =
      typeof error === 'object' && error !== null && 'code' in error
        ? String((error as { code: unknown }).code)
        : 'inconnu';

    return Response.json(
      {
        base: 'injoignable',
        millisecondes: Date.now() - debut,
        code,
        // P1001 : serveur injoignable. P2021 : table absente, donc migration
        // non appliquée. P1017 : connexion fermée par le serveur.
        piste:
          code === 'P1001'
            ? 'La base ne répond pas depuis le serveur. Vérifie DATABASE_URL.'
            : code === 'P2021' || code === 'P2022'
              ? 'Les tables manquent : la migration n’a pas été appliquée.'
              : 'Voir les journaux du serveur.',
      },
      { status: 503 },
    );
  }
}
