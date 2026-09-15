/**
 * Vocabulaire fermé du moteur (section 8.1).
 *
 * Les réponses libres « ce qui t'agace » sont normalisées par l'IA vers ces
 * clés, et rien d'autre. Un vocabulaire fermé rend le scoring reproductible :
 * si le modèle pouvait inventer des clés, deux profils identiques
 * n'obtiendraient pas le même classement.
 */

export const DOMAINS = [
  { slug: 'kinesitherapie', label: 'Kinésithérapie et rééducation', family: 'Santé' },
  { slug: 'cabinet-medical', label: 'Cabinet médical et paramédical', family: 'Santé' },
  { slug: 'pharmacie', label: 'Pharmacie', family: 'Santé' },
  { slug: 'veterinaire', label: 'Vétérinaire', family: 'Santé' },
  { slug: 'restauration', label: 'Restauration', family: 'Commerce de bouche' },
  { slug: 'boulangerie', label: 'Boulangerie et pâtisserie', family: 'Commerce de bouche' },
  { slug: 'transport-livraison', label: 'Transport et livraison', family: 'Logistique' },
  { slug: 'entrepot-logistique', label: 'Entrepôt et logistique', family: 'Logistique' },
  { slug: 'batiment', label: 'Bâtiment et travaux', family: 'Artisanat' },
  { slug: 'plomberie-elec', label: 'Plomberie et électricité', family: 'Artisanat' },
  { slug: 'garage-auto', label: 'Garage et mécanique', family: 'Artisanat' },
  { slug: 'coiffure-beaute', label: 'Coiffure et esthétique', family: 'Services aux particuliers' },
  { slug: 'menage-proprete', label: 'Ménage et propreté', family: 'Services aux particuliers' },
  { slug: 'immobilier', label: 'Immobilier', family: 'Services aux entreprises' },
  { slug: 'comptabilite', label: 'Comptabilité et gestion', family: 'Services aux entreprises' },
  { slug: 'recrutement-rh', label: 'Recrutement et ressources humaines', family: 'Services aux entreprises' },
  { slug: 'education-soutien', label: 'Enseignement et soutien scolaire', family: 'Éducation' },
  { slug: 'formation-pro', label: 'Formation professionnelle', family: 'Éducation' },
  { slug: 'sport-coaching', label: 'Sport et coaching', family: 'Sport et loisirs' },
  { slug: 'evenementiel', label: 'Événementiel', family: 'Sport et loisirs' },
  { slug: 'tourisme-hebergement', label: 'Tourisme et hébergement', family: 'Sport et loisirs' },
  { slug: 'agriculture', label: 'Agriculture et élevage', family: 'Production' },
  { slug: 'artisanat-creation', label: 'Artisanat de création', family: 'Production' },
  { slug: 'commerce-detail', label: 'Commerce de détail', family: 'Commerce' },
  { slug: 'associatif', label: 'Associations et clubs', family: 'Autre' },
  { slug: 'photo-video', label: 'Photo et vidéo', family: 'Création' },
] as const;

export const SKILLS = [
  { slug: 'organisation', label: 'M’organiser et organiser les autres', category: 'Méthode' },
  { slug: 'tableur', label: 'Me débrouiller sur un tableur', category: 'Méthode' },
  { slug: 'analyse-chiffres', label: 'Lire des chiffres et en tirer quelque chose', category: 'Méthode' },
  { slug: 'gestion-projet', label: 'Mener un projet jusqu’au bout', category: 'Méthode' },
  { slug: 'vente', label: 'Vendre', category: 'Relation' },
  { slug: 'relation-client', label: 'M’occuper des clients', category: 'Relation' },
  { slug: 'negociation', label: 'Négocier', category: 'Relation' },
  { slug: 'parler-en-public', label: 'Parler devant des gens', category: 'Relation' },
  { slug: 'enseignement', label: 'Expliquer et transmettre', category: 'Relation' },
  { slug: 'ecriture', label: 'Écrire clairement', category: 'Création' },
  { slug: 'design', label: 'Avoir l’œil sur ce qui est beau', category: 'Création' },
  { slug: 'photo-video', label: 'Filmer et monter', category: 'Création' },
  { slug: 'reseaux-sociaux', label: 'Publier sur les réseaux', category: 'Création' },
  { slug: 'informatique', label: 'Me débrouiller avec un ordinateur', category: 'Technique' },
  { slug: 'bricolage', label: 'Réparer et bricoler', category: 'Technique' },
  { slug: 'langues', label: 'Parler une autre langue', category: 'Technique' },
] as const;

export const INTERESTS = [
  { slug: 'sante', label: 'La santé et le corps' },
  { slug: 'sport', label: 'Le sport' },
  { slug: 'cuisine', label: 'La cuisine' },
  { slug: 'technologie', label: 'La technologie' },
  { slug: 'automobile', label: 'Les voitures' },
  { slug: 'immobilier', label: 'L’immobilier' },
  { slug: 'education', label: 'L’enseignement' },
  { slug: 'artisanat', label: 'L’artisanat' },
  { slug: 'nature', label: 'La nature et le vivant' },
  { slug: 'finance', label: 'L’argent et la gestion' },
  { slug: 'animaux', label: 'Les animaux' },
  { slug: 'image', label: 'L’image et la vidéo' },
  { slug: 'voyage', label: 'Le voyage' },
  { slug: 'musique', label: 'La musique' },
  { slug: 'mode', label: 'La mode' },
  { slug: 'jeux-video', label: 'Les jeux vidéo' },
] as const;

/**
 * Irritants normalisés. C'est vers ces clés, et uniquement celles-ci, que l'IA
 * traduit les réponses libres de la section 8.1.
 */
export const FRICTIONS = [
  { key: 'saisie-manuelle', label: 'Recopier les mêmes informations à la main' },
  { key: 'planning', label: 'Faire tenir un planning entre plusieurs personnes' },
  { key: 'rendez-vous', label: 'Poser, déplacer et rappeler des rendez-vous' },
  { key: 'no-show', label: 'Des gens qui ne viennent pas sans prévenir' },
  { key: 'relances-clients', label: 'Relancer des clients qui ne répondent pas' },
  { key: 'devis', label: 'Faire des devis' },
  { key: 'factures', label: 'Faire et suivre des factures' },
  { key: 'paiement-retard', label: 'Courir après un paiement' },
  { key: 'suivi-dossier', label: 'Savoir où en est un dossier' },
  { key: 'compte-rendu', label: 'Rédiger des comptes rendus' },
  { key: 'tableur', label: 'Un tableur bricolé que personne ne comprend' },
  { key: 'photos-chantier', label: 'Des photos de terrain perdues dans un téléphone' },
  { key: 'pointage-heures', label: 'Compter les heures de chacun' },
  { key: 'stock', label: 'Savoir ce qu’il reste en stock' },
  { key: 'commandes-fournisseurs', label: 'Passer et suivre les commandes fournisseurs' },
  { key: 'tournees', label: 'Organiser une tournée ou un trajet' },
  { key: 'reservations', label: 'Gérer des réservations' },
  { key: 'notes-eleves', label: 'Suivre la progression d’élèves ou d’adhérents' },
  { key: 'recrutement', label: 'Trouver et suivre des candidats' },
  { key: 'inventaire', label: 'Faire un inventaire' },
] as const;

export type DomainSlug = (typeof DOMAINS)[number]['slug'];
export type SkillSlug = (typeof SKILLS)[number]['slug'];
export type InterestSlug = (typeof INTERESTS)[number]['slug'];
export type FrictionKey = (typeof FRICTIONS)[number]['key'];

export const FRICTION_KEYS: readonly string[] = FRICTIONS.map((f) => f.key);
export const FRICTION_LABELS: Record<string, string> = Object.fromEntries(
  FRICTIONS.map((f) => [f.key, f.label]),
);
