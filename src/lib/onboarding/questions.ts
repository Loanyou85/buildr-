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

const OUI_NON: QuestionOption[] = [
  { value: 'true', label: 'Oui, ça me va' },
  { value: 'false', label: 'Non, pas pour moi' },
];

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
    kind: 'choice',
    field: 'city',
    section: 'toi',
    title: 'Tu vis plutôt où ?',
    help: 'Certaines activités se construisent sur le terrain, près de chez toi.',
    options: [
      { value: 'Grande ville', label: 'Dans une grande ville', hint: 'Beaucoup de commerces et d’entreprises autour' },
      { value: 'Ville moyenne', label: 'Dans une ville moyenne' },
      { value: 'Petite ville ou campagne', label: 'Dans une petite ville ou à la campagne' },
    ],
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
    help: 'Choisis tout ce que tu sais faire, même moyennement. Plusieurs réponses possibles.',
  },
  {
    key: 'skillLevel',
    kind: 'choice',
    field: 'skillLevel',
    numeric: true,
    section: 'toi',
    title: 'Où en es-tu sur ces compétences ?',
    options: [
      { value: '1', label: 'J’ai juste bricolé', hint: 'Quelques essais, rien de sérieux' },
      { value: '3', label: 'Je me débrouille bien', hint: 'Je sais faire quand il faut' },
      { value: '4', label: 'C’est mon métier ou tout comme', hint: 'J’en ai fait beaucoup' },
    ],
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
    key: 'hoursPerDay',
    kind: 'choice',
    field: 'hoursPerDay',
    numeric: true,
    section: 'temps',
    title: 'Et par jour, en moyenne ?',
    help: 'C’est ce chiffre qui détermine la taille de ton plan quotidien.',
    options: [
      { value: '1', label: 'Environ 1 heure' },
      { value: '2', label: '2 heures' },
      { value: '4', label: '3 à 4 heures' },
      { value: '7', label: 'Plus de 4 heures' },
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
    key: 'monthlyBudget',
    kind: 'choice',
    field: 'monthlyBudget',
    numeric: true,
    section: 'moyens',
    title: 'Combien peux-tu y remettre chaque mois ?',
    options: [
      { value: '0', label: 'Rien' },
      { value: '50', label: 'Jusqu’à 100 €' },
      { value: '200', label: '100 à 300 €' },
      { value: '500', label: '300 à 1 000 €' },
      { value: '1500', label: 'Plus de 1 000 €' },
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
    options: [
      { value: '3', label: 'Dans 3 mois' },
      { value: '6', label: 'Dans 6 mois' },
      { value: '12', label: 'Dans un an' },
      { value: '24', label: 'Je ne suis pas pressé' },
    ],
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
    kind: 'choice',
    field: 'showsFace',
    section: 'façon',
    title: 'Es-tu prêt à apparaître à l’image ?',
    help: 'Certaines activités l’exigent. Si tu réponds non, elles sont écartées, pas déguisées.',
    options: OUI_NON,
  },
  {
    key: 'createsContent',
    kind: 'choice',
    field: 'createsContent',
    section: 'façon',
    title: 'Es-tu prêt à produire du contenu régulièrement ?',
    options: OUI_NON,
  },
  {
    key: 'likesStrangers',
    kind: 'choice',
    field: 'likesStrangers',
    section: 'façon',
    title: 'Contacter des inconnus, ça te va ?',
    options: OUI_NON,
  },
  {
    key: 'likesSelling',
    kind: 'choice',
    field: 'likesSelling',
    section: 'façon',
    title: 'Et vendre, parler prix, négocier ?',
    options: OUI_NON,
  },
  {
    key: 'likesCreating',
    kind: 'choice',
    field: 'likesCreating',
    section: 'façon',
    title: 'Tu aimes créer, fabriquer quelque chose ?',
    options: OUI_NON,
  },
  {
    key: 'likesAnalyzing',
    kind: 'choice',
    field: 'likesAnalyzing',
    section: 'façon',
    title: 'Tu aimes analyser des chiffres et comprendre ce qui marche ?',
    options: OUI_NON,
  },
  {
    key: 'likesRepetition',
    kind: 'choice',
    field: 'likesRepetition',
    section: 'façon',
    title: 'Répéter la même tâche chaque jour, ça te dérange ?',
    options: [
      { value: 'true', label: 'Non, ça ne me dérange pas' },
      { value: 'false', label: 'Oui, j’ai besoin de variété' },
    ],
  },
  {
    key: 'prefersSolo',
    kind: 'choice',
    field: 'prefersSolo',
    section: 'façon',
    title: 'Tu préfères travailler seul ?',
    options: [
      { value: 'true', label: 'Seul, à mon rythme' },
      { value: 'false', label: 'À plusieurs' },
    ],
  },
  {
    key: 'prefersFreedom',
    kind: 'choice',
    field: 'prefersFreedom',
    section: 'façon',
    title: 'Tu préfères organiser ton temps librement ?',
    options: [
      { value: 'true', label: 'Librement' },
      { value: 'false', label: 'Avec un cadre et des horaires' },
    ],
  },
  // Les questions d'habitudes arrivent en fin de parcours, quand l'utilisateur
  // est déjà engagé. Elles restent le meilleur révélateur de compétences
  // invisibles — elles se cochent désormais au lieu de s'écrire.
  {
    key: 'habit_friends_ask',
    kind: 'multi',
    field: 'habit',
    section: 'habitudes',
    title: 'Qu’est-ce que tes amis te demandent souvent de faire pour eux ?',
    help: 'C’est souvent là que se cache une compétence que tu ne vois plus. Plusieurs réponses possibles.',
    options: [
      { value: 'Retoucher leurs photos ou monter une vidéo', label: 'Retoucher leurs photos, monter une vidéo' },
      { value: 'Donner un avis avant un achat', label: 'Les conseiller avant un achat' },
      { value: 'Organiser quelque chose pour le groupe', label: 'Organiser quelque chose pour le groupe' },
      { value: 'Réparer ou configurer un appareil, un ordinateur', label: 'Réparer ou configurer un appareil' },
      { value: 'Relire et écrire un message important', label: 'Relire ou écrire un message important' },
      { value: 'Expliquer un sujet compliqué', label: 'Leur expliquer un truc compliqué' },
      { value: 'Les aider à vendre quelque chose', label: 'Les aider à vendre quelque chose' },
      { value: 'Bricoler, monter des meubles, dépanner', label: 'Bricoler, monter, dépanner' },
    ],
  },
  {
    key: 'habit_watch_hours',
    kind: 'multi',
    field: 'habit',
    section: 'habitudes',
    title: 'Sur quels sujets pourrais-tu regarder des vidéos pendant des heures ?',
    options: [
      { value: 'Des tests de matériel et de technologie', label: 'Des tests de matériel, de technologie' },
      { value: 'Du sport et de l’entraînement', label: 'Du sport, de l’entraînement' },
      { value: 'De la cuisine et de la restauration', label: 'De la cuisine, des restaurants' },
      { value: 'De la vidéo, du montage, de la création de contenu', label: 'De la vidéo, du montage' },
      { value: 'De la finance et de l’investissement', label: 'De la finance, de l’investissement' },
      { value: 'De la décoration et de la maison', label: 'De la déco, de la maison' },
      { value: 'De la mode et de la beauté', label: 'De la mode, de la beauté' },
      { value: 'Des reportages sur des entreprises', label: 'Des coulisses d’entreprises' },
    ],
  },
  {
    key: 'habit_energy',
    kind: 'multi',
    field: 'habit',
    section: 'habitudes',
    title: 'Qu’est-ce qui te donne de l’énergie dans une journée de travail ?',
    help: 'Deux ou trois réponses suffisent.',
    options: [
      { value: 'Créer quelque chose de mes mains', label: 'Créer quelque chose' },
      { value: 'Convaincre et vendre', label: 'Convaincre quelqu’un' },
      { value: 'Analyser des chiffres et trouver ce qui marche', label: 'Comprendre pourquoi ça marche' },
      { value: 'Aider une personne à avancer', label: 'Aider quelqu’un à avancer' },
      { value: 'Cocher des tâches, avancer régulièrement', label: 'Avancer, cocher, terminer' },
      { value: 'Apprendre quelque chose de nouveau', label: 'Apprendre du neuf' },
    ],
  },
  {
    key: 'habit_blocker',
    kind: 'multi',
    field: 'habit',
    section: 'habitudes',
    title: 'Qu’est-ce qui t’a arrêté jusqu’ici ?',
    help: 'Dernière question. Ta réponse sert à choisir le niveau de détail du parcours.',
    optional: true,
    options: [
      { value: 'Je ne savais pas par où commencer', label: 'Je ne savais pas par où commencer' },
      { value: 'Je manquais de temps', label: 'Le manque de temps' },
      { value: 'Je manquais d’argent', label: 'Le manque d’argent' },
      { value: 'J’avais peur de me lancer', label: 'La peur de me lancer' },
      { value: 'J’ai commencé puis abandonné', label: 'J’ai commencé puis abandonné' },
      { value: 'Rien, je démarre maintenant', label: 'Rien, je démarre maintenant' },
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
