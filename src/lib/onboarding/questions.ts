/**
 * Onboarding : une question par écran, et **rien à taper** (section 8.2).
 * Chaque réponse est une carte à cliquer. Un choix unique enchaîne tout seul
 * sur la question suivante ; un choix multiple attend « Continuer ».
 *
 * Les questions sont des données : l'ordre, les libellés et les tranches
 * changent sans toucher aux écrans.
 */
export type QuestionKind = 'choice' | 'multi' | 'skills' | 'interests' | 'slider';

export interface QuestionOption {
  value: string;
  label: string;
  hint?: string;
}

export interface Question {
  key: string;
  kind: QuestionKind;
  /** Champ du profil alimenté, ou `habit` pour une réponse d'habitude. */
  field: string;
  title: string;
  help?: string;
  options?: QuestionOption[];
  /** La valeur choisie est un nombre à enregistrer tel quel. */
  numeric?: boolean;
  /** Bornes de la barre à glisser, pour `kind: 'slider'`. */
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
  optional?: boolean;
  /** Section affichée dans la barre de progression. */
  section: 'toi' | 'temps' | 'moyens' | 'objectif' | 'façon' | 'habitudes';
}

export const QUESTIONS: Question[] = [
  {
    key: 'age',
    kind: 'choice',
    field: 'age',
    numeric: true,
    section: 'toi',
    title: 'Quel âge as-tu ?',
    help: 'On demande ça en premier parce que le service n’est pas accessible avant 16 ans.',
    options: [
      { value: '15', label: 'Moins de 16 ans' },
      { value: '17', label: '16 ou 17 ans' },
      { value: '21', label: '18 à 24 ans' },
      { value: '29', label: '25 à 34 ans' },
      { value: '39', label: '35 à 44 ans' },
      { value: '50', label: '45 ans ou plus' },
    ],
  },
  {
    /*
     * Une seule question pour sept réponses. Chacune de ces cases décide de
     * l'élimination ou non de toute une famille d'activités : ne pas vouloir
     * apparaître à l'image écarte l'UGC, refuser le terrain écarte le service
     * local. C'est la question la plus lourde du tunnel, et elle tient sur un
     * écran.
     */
    key: 'readiness',
    kind: 'multi',
    field: 'readiness',
    section: 'façon',
    title: 'Qu’est-ce que tu es prêt à faire ?',
    help: 'Coche tout ce que tu acceptes. Ce que tu laisses décoché écarte des activités plutôt que de te les proposer quand même.',
    options: [
      { value: 'showsFace', label: 'Apparaître à l’image', hint: 'Face caméra, dans des vidéos' },
      { value: 'createsContent', label: 'Produire du contenu régulièrement' },
      { value: 'likesStrangers', label: 'Contacter des inconnus' },
      { value: 'likesSelling', label: 'Vendre, parler prix, négocier' },
      { value: 'likesCreating', label: 'Créer, fabriquer quelque chose' },
      { value: 'likesAnalyzing', label: 'Analyser des chiffres' },
      { value: 'likesRepetition', label: 'Répéter la même tâche chaque jour' },
      { value: 'localWork', label: 'Me déplacer, travailler près de chez moi' },
    ],
  },
  {
    key: 'skills',
    kind: 'skills',
    field: 'skills',
    section: 'toi',
    title: 'Qu’est-ce que tu sais déjà faire ?',
    help: 'Choisis tout ce que tu sais faire, même moyennement. Plusieurs réponses possibles.',
  },
  {
    key: 'interests',
    kind: 'interests',
    field: 'interests',
    section: 'toi',
    title: 'Quels sujets t’intéressent vraiment ?',
    help: 'Pas ceux qui font sérieux : ceux sur lesquels tu passes du temps sans t’en rendre compte.',
  },
  {
    key: 'hoursPerWeek',
    kind: 'choice',
    field: 'hoursPerWeek',
    numeric: true,
    section: 'temps',
    title: 'Combien de temps par semaine peux-tu y consacrer ?',
    help: 'Sois honnête. Un parcours calé sur un temps réel se tient ; un parcours calé sur un temps rêvé s’abandonne.',
    options: [
      { value: '3', label: 'Moins de 5 heures' },
      { value: '8', label: '5 à 10 heures' },
      { value: '15', label: '10 à 20 heures' },
      { value: '25', label: '20 à 35 heures' },
      { value: '40', label: 'Plus de 35 heures', hint: 'À plein temps' },
    ],
  },
  {
    key: 'initialBudget',
    kind: 'choice',
    field: 'initialBudget',
    numeric: true,
    section: 'moyens',
    title: 'De combien disposes-tu pour démarrer ?',
    help: 'Zéro est une réponse valable : plusieurs parcours sont conçus pour démarrer sans dépenser.',
    options: [
      { value: '0', label: 'Rien du tout', hint: 'Des parcours existent pour ça' },
      { value: '150', label: 'Moins de 300 €' },
      { value: '600', label: '300 à 1 000 €' },
      { value: '2000', label: '1 000 à 3 000 €' },
      { value: '5000', label: 'Plus de 3 000 €' },
    ],
  },
  {
    key: 'financialGoal',
    kind: 'slider',
    field: 'financialGoal',
    numeric: true,
    section: 'objectif',
    title: 'Quel revenu mensuel vises-tu ?',
    help: 'Fais glisser le curseur. Un objectif sert à choisir un rythme, pas à te promettre un résultat.',
    min: 0,
    max: 50_000,
    step: 500,
    unit: '€ par mois',
  },
  {
    key: 'timeHorizon',
    kind: 'choice',
    field: 'timeHorizon',
    numeric: true,
    section: 'objectif',
    title: 'Dans quel délai ?',
    help: 'Dernière question. C’est elle qui écarte les activités trop lentes pour toi.',
    options: [
      { value: '3', label: 'Dans 3 mois' },
      { value: '6', label: 'Dans 6 mois' },
      { value: '12', label: 'Dans un an' },
      { value: '24', label: 'Je ne suis pas pressé' },
    ],
  },
];

export const SECTION_LABELS: Record<Question['section'], string> = {
  toi: 'Toi',
  temps: 'Ton temps',
  moyens: 'Tes moyens',
  objectif: 'Ton objectif',
  façon: 'Ta façon de travailler',
  habitudes: 'Tes habitudes',
};

export function questionAt(index: number): Question | undefined {
  return QUESTIONS[index];
}

export function indexOfQuestion(key: string): number {
  return QUESTIONS.findIndex((q) => q.key === key);
}

export const TOTAL_QUESTIONS = QUESTIONS.length;
