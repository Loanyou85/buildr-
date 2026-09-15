/**
 * Les dix blocs du pack séquencé (section 11.3), dans l'ordre du parcours.
 * Partagé par le seed, qui écrit les gabarits, et par le moteur, qui ordonne
 * le pack — une seule source pour les deux.
 */
export const BLOCKS: { key: string; label: string; phaseKey: string }[] = [
  { key: 'fondations', label: 'Fondations', phaseKey: 'generer' },
  { key: 'donnees', label: 'Données', phaseKey: 'base-de-donnees' },
  { key: 'comptes', label: 'Comptes', phaseKey: 'comptes-utilisateurs' },
  { key: 'coeur', label: 'Cœur du produit', phaseKey: 'generer' },
  { key: 'ecrans', label: 'Écrans', phaseKey: 'generer' },
  { key: 'paiement', label: 'Paiement', phaseKey: 'encaisser' },
  { key: 'mise-en-ligne', label: 'Mise en ligne', phaseKey: 'en-ligne' },
  { key: 'vente', label: 'Page de vente', phaseKey: 'page-de-vente' },
  { key: 'emails', label: 'E-mails', phaseKey: 'publier-vendre' },
  { key: 'finitions', label: 'Finitions', phaseKey: 'premier-euro' },
  { key: 'reparation', label: 'Réparation', phaseKey: 'generer' },
];

export const BLOCK_LABELS: Record<string, string> = Object.fromEntries(
  BLOCKS.map((b) => [b.key, b.label]),
);
