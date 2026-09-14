/**
 * Onboarding : une question par écran, jamais de formulaire long (section 8.2).
 * Les questions sont des données, donc l'ordre et le libellé changent sans
 * toucher aux écrans.
 */
export type QuestionKind =
  | 'number'
  | 'choice'
  | 'multi'
  | 'boolean'
  | 'skills'
  | 'interests'
  | 'text';

export interface QuestionOption {
  value: string;
  label: string;
  hint?: string;
}

export interface Question {
  key: string;
  kind: QuestionKind;
  /** Champ du profil alimenté, ou `habit` pour une réponse libre stockée à part. */
  field: string;
  title: string;
  help?: string;
  placeholder?: string;
  options?: QuestionOption[];
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
    kind: 'number',
    field: 'age',
    section: 'toi',
    title: 'Quel âge as-tu ?',
    help: 'On demande ça en premier parce que le service n’est pas accessible avant 16 ans.',
    min: 10,
    max: 99,
    unit: 'ans',
  },
  {
    key: 'status',
    kind: 'choice',
    field: 'status',
    section: 'toi',
    title: 'Quelle est ta situation aujourd’hui ?',
    options: [
      { value: 'student', label: 'Étudiant' },
      { value: 'employed', label: 'Salarié' },
      { value: 'unemployed', label: 'Sans emploi' },
      { value: 'freelance', label: 'Indépendant' },
      { value: 'entrepreneur', label: 'Déjà entrepreneur' },
      { value: 'other', label: 'Autre' },
    ],
  },
  {
    key: 'city',
    kind: 'text',
    field: 'city',
    section: 'toi',
    title: 'Tu habites où ?',
    help: 'Certaines activités se construisent sur le terrain, près de chez toi.',
    placeholder: 'Lyon',
    optional: true,
  },
  {
    key: 'educationLevel',
    kind: 'choice',
    field: 'educationLevel',
    section: 'toi',
    title: 'Jusqu’où es-tu allé dans tes études ?',
    help: 'Aucune réponse ne ferme de porte. Ça sert à calibrer le niveau de détail du parcours.',
    options: [
      { value: 'none', label: 'Pas de diplôme' },
      { value: 'highschool', label: 'Baccalauréat' },
      { value: 'bac2', label: 'Bac +2' },
      { value: 'bac3', label: 'Bac +3' },
      { value: 'bac5', label: 'Bac +5' },
      { value: 'phd', label: 'Doctorat' },
    ],
  },
  {
    key: 'skills',
    kind: 'skills',
    field: 'skills',
    section: 'toi',
    title: 'Qu’est-ce que tu sais déjà faire ?',
    help: 'Choisis ce que tu sais faire, même moyennement. Tu règleras le niveau juste après.',
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
    kind: 'number',
    field: 'hoursPerWeek',
    section: 'temps',
    title: 'Combien d’heures par semaine peux-tu y consacrer ?',
    help: 'Sois honnête. Un parcours calé sur un temps réel se tient ; un parcours calé sur un temps rêvé s’abandonne.',
    min: 1,
    max: 60,
    unit: 'h / semaine',
  },
  {
    key: 'hoursPerDay',
    kind: 'number',
    field: 'hoursPerDay',
    section: 'temps',
    title: 'Et par jour, en moyenne ?',
    help: 'C’est ce chiffre qui détermine la taille de ton plan quotidien.',
    min: 1,
    max: 12,
    unit: 'h / jour',
  },
  {
    key: 'initialBudget',
    kind: 'number',
    field: 'initialBudget',
    section: 'moyens',
    title: 'De combien disposes-tu pour démarrer ?',
    help: 'Zéro est une réponse valable : plusieurs parcours sont conçus pour démarrer sans dépenser.',
    min: 0,
    max: 20000,
    step: 50,
    unit: '€',
  },
  {
    key: 'monthlyBudget',
    kind: 'number',
    field: 'monthlyBudget',
    section: 'moyens',
    title: 'Combien peux-tu y remettre chaque mois ?',
    min: 0,
    max: 5000,
    step: 25,
    unit: '€ / mois',
  },
  {
    key: 'financialGoal',
    kind: 'number',
    field: 'financialGoal',
    section: 'objectif',
    title: 'Quel revenu mensuel vises-tu ?',
    help: 'Un objectif sert à choisir un rythme, pas à te promettre un résultat.',
    min: 200,
    max: 20000,
    step: 100,
    unit: '€ / mois',
  },
  {
    key: 'timeHorizon',
    kind: 'number',
    field: 'timeHorizon',
    section: 'objectif',
    title: 'Dans combien de mois ?',
    min: 1,
    max: 36,
    unit: 'mois',
  },
  {
    key: 'riskTolerance',
    kind: 'choice',
    field: 'riskTolerance',
    section: 'objectif',
    title: 'Comment te situes-tu face à l’incertitude ?',
    options: [
      { value: 'low', label: 'Je préfère le prévisible', hint: 'Activités à premiers revenus rapides' },
      { value: 'medium', label: 'Je peux accepter le flou un moment', hint: 'Le plus courant' },
      { value: 'high', label: 'Je suis prêt à parier sur le long terme', hint: 'Activités plus lentes, plus composées' },
    ],
  },
  {
    key: 'workMode',
    kind: 'choice',
    field: 'workMode',
    section: 'façon',
    title: 'Tu veux travailler où ?',
    options: [
      { value: 'remote', label: 'À distance uniquement' },
      { value: 'local', label: 'Sur le terrain, près de chez moi' },
      { value: 'hybrid', label: 'Les deux me vont' },
    ],
  },
  {
    key: 'showsFace',
    kind: 'boolean',
    field: 'showsFace',
    section: 'façon',
    title: 'Es-tu prêt à apparaître à l’image ?',
    help: 'Certaines activités l’exigent. Si tu réponds non, elles sont écartées, pas déguisées.',
  },
  {
    key: 'createsContent',
    kind: 'boolean',
    field: 'createsContent',
    section: 'façon',
    title: 'Es-tu prêt à produire du contenu régulièrement ?',
  },
  {
    key: 'likesStrangers',
    kind: 'boolean',
    field: 'likesStrangers',
    section: 'façon',
    title: 'Contacter des inconnus, ça te va ?',
  },
  {
    key: 'likesSelling',
    kind: 'boolean',
    field: 'likesSelling',
    section: 'façon',
    title: 'Et vendre, parler prix, négocier ?',
  },
  {
    key: 'likesCreating',
    kind: 'boolean',
    field: 'likesCreating',
    section: 'façon',
    title: 'Tu aimes créer, fabriquer quelque chose ?',
  },
  {
    key: 'likesAnalyzing',
    kind: 'boolean',
    field: 'likesAnalyzing',
    section: 'façon',
    title: 'Tu aimes analyser des chiffres et comprendre ce qui marche ?',
  },
  {
    key: 'likesRepetition',
    kind: 'boolean',
    field: 'likesRepetition',
    section: 'façon',
    title: 'Répéter la même tâche chaque jour, ça te dérange ?',
    help: 'Réponds « oui, ça me va » si la répétition ne te pose pas de problème.',
  },
  {
    key: 'prefersSolo',
    kind: 'boolean',
    field: 'prefersSolo',
    section: 'façon',
    title: 'Tu préfères travailler seul ?',
  },
  {
    key: 'prefersFreedom',
    kind: 'boolean',
    field: 'prefersFreedom',
    section: 'façon',
    title: 'Tu préfères organiser ton temps librement ?',
  },
  // Les questions ouvertes arrivent en fin de parcours, quand l'utilisateur est
  // déjà engagé (section 8.2). Elles sont analysées pour en extraire des
  // signaux, pas stockées comme de simples chaînes.
  {
    key: 'habit_friends_ask',
    kind: 'text',
    field: 'habit',
    section: 'habitudes',
    title: 'Qu’est-ce que tes amis te demandent souvent de faire pour eux ?',
    help: 'C’est souvent là que se cache une compétence que tu ne vois plus, parce qu’elle te paraît évidente.',
    placeholder: 'Retoucher leurs photos, les aider à choisir leur matériel, relire leurs messages importants…',
  },
  {
    key: 'habit_watch_hours',
    kind: 'text',
    field: 'habit',
    section: 'habitudes',
    title: 'Sur quels sujets pourrais-tu regarder des vidéos pendant des heures ?',
    placeholder: 'Des tests de matériel, des cuisines de restaurants, des analyses de matchs…',
  },
  {
    key: 'habit_last_purchases',
    kind: 'text',
    field: 'habit',
    section: 'habitudes',
    title: 'Quels sont les trois derniers achats que tu as faits pour toi ?',
    help: 'Ce que tu achètes dit où tu es déjà un client averti.',
    placeholder: 'Des chaussures de trail, un moulin à café, un abonnement à une salle…',
  },
  {
    key: 'habit_free_saturday',
    kind: 'text',
    field: 'habit',
    section: 'habitudes',
    title: 'Un samedi entièrement libre, tu en fais quoi ?',
    placeholder: '',
    optional: true,
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
