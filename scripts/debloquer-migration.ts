import { PrismaClient } from '@prisma/client';

/**
 * Débloque la migration de bascule restée en échec.
 *
 * Contexte : la première version de `20260915120000_nexteo_saas` ajoutait des
 * colonnes obligatoires à des tables déjà remplies. Sur une base semée, elle
 * s'arrêtait en cours de route et Postgres gardait la trace de cet échec.
 * Prisma refuse alors d'appliquer quoi que ce soit (P3009) tant que quelqu'un
 * n'a pas déclaré à la main que la migration était annulée — ce qui bloque
 * définitivement les déploiements suivants.
 *
 * Ce script fait cette déclaration, et uniquement pour cette migration-là,
 * nommée en toutes lettres. La version actuelle repart d'une table rase : la
 * rejouer aboutit quel que soit l'état de la base.
 *
 * Il ne fait rien sur une base qui n'a jamais rencontré le problème, et il ne
 * touchera jamais à une migration future : débloquer automatiquement
 * n'importe quel échec serait dangereux, puisque rien ne garantit qu'une
 * migration interrompue puisse être rejouée sans risque.
 */
const MIGRATION = '20260915120000_nexteo_saas';

async function main(): Promise<void> {
  const url = process.env.DIRECT_URL?.trim() || process.env.DATABASE_URL?.trim();
  if (!url) {
    console.log('Aucune base configurée, rien à débloquer.');
    return;
  }

  const db = new PrismaClient({ datasources: { db: { url } } });
  try {
    const corrigees = await db.$executeRawUnsafe(
      `UPDATE "_prisma_migrations"
         SET "rolled_back_at" = now()
       WHERE "migration_name" = $1
         AND "finished_at" IS NULL
         AND "rolled_back_at" IS NULL`,
      MIGRATION,
    );
    if (corrigees > 0) {
      console.log(`Migration ${MIGRATION} marquée annulée : elle va être rejouée.`);
    }
  } catch {
    // Base neuve : le journal de migrations n'existe pas encore. C'est normal.
  } finally {
    await db.$disconnect();
  }
}

main().catch((error) => {
  // Ne jamais faire échouer un déploiement à cause du déblocage lui-même :
  // si la base est injoignable, `migrate deploy` le dira mieux que nous.
  console.warn('Déblocage impossible, on continue :', error instanceof Error ? error.message : error);
});
