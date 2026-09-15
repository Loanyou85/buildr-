/**
 * Section 8.4 : après deux rejets, on propose de compléter le profil plutôt
 * que de régénérer à l'infini. Régénérer sans nouvelle information ne peut
 * produire que la quatrième idée du même classement.
 */
export const MAX_REJETS = 2;

export const RAISONS_DE_REJET = [
  { value: 'pas-mon-secteur', label: 'Ce n’est pas un milieu que je connais' },
  { value: 'pas-envie', label: 'Ça ne me donne pas envie' },
  { value: 'deja-fait', label: 'Ça existe déjà et je ne vois pas ma place' },
  { value: 'trop-complique', label: 'Ça me paraît trop compliqué à construire' },
  { value: 'pas-de-clients', label: 'Je ne vois pas à qui je le vendrais' },
] as const;

export function complexiteEnMots(niveau: number): string {
  if (niveau <= 2) return 'Simple à construire';
  if (niveau === 3) return 'Quelques écrans de plus que la moyenne';
  return 'La limite haute du parcours';
}
