import { PrismaClient } from '@prisma/client';

export const db = new PrismaClient();

/** Adresse unique par exécution : deux lancements ne doivent pas se gêner. */
export function adresseDeTest(prefixe = 'e2e'): string {
  return `${prefixe}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}@nexteo.test`;
}

export async function supprimerCompteDeTest(email: string): Promise<void> {
  await db.user.deleteMany({ where: { email } });
}

/** Nettoie les comptes laissés par une exécution précédente. */
export async function nettoyerComptesDeTest(): Promise<void> {
  await db.user.deleteMany({ where: { email: { endsWith: '@nexteo.test' } } });
}
