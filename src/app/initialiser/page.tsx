import type { Metadata } from 'next';
import { InitialiserForm } from '@/components/app/initialiser-form';

/**
 * Page d'initialisation du référentiel, à usage unique.
 *
 * Elle existe pour une raison simple : une base de production vide rend le
 * produit inutilisable — aucun business model à recommander, aucun parcours à
 * suivre — et tout le monde n'a pas envie d'ouvrir un terminal pour ça.
 *
 * La page ne donne aucun pouvoir par elle-même : elle ne fait qu'appeler la
 * route protégée, qui exige le secret et reste fermée tant que `SEED_SECRET`
 * n'est pas défini côté serveur.
 */
export const metadata: Metadata = {
  title: 'Initialiser Nexteo',
  robots: { index: false, follow: false },
};

export default function InitialiserPage() {
  return (
    <div className="mx-auto flex min-h-dvh max-w-xl flex-col justify-center px-5 py-16">
      <p className="font-display text-sm font-bold tracking-[0.02em] text-beton-600">NEXTEO</p>
      <h1 className="mt-4 text-2xl">Initialiser le référentiel</h1>
      <p className="prose-nexteo mt-3 text-base text-beton-600">
        Cette opération remplit la base avec les compétences, les intérêts, les business models et
        les parcours. Elle est à faire une seule fois, juste après la mise en ligne.
      </p>

      <InitialiserForm />

      <p className="prose-nexteo mt-10 text-xs text-beton-600">
        L’opération est sans risque : relancée, elle ne crée aucun doublon et ne touche jamais à un
        parcours déjà démarré par un utilisateur.
      </p>
    </div>
  );
}
