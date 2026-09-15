import { CONTEXTE, type PromptTemplateSeed } from './types';

const c = CONTEXTE;

/**
 * Le pack séquencé — une quarantaine de prompts dans l'ordre exact du
 * parcours (section 11.3). Court volontairement : un utilisateur sans
 * compétence technique n'a pas à choisir dans une liste, il exécute une suite.
 */
export const SEQUENCE: PromptTemplateSeed[] = [
  // --- Fondations (4) ---------------------------------------------------
  {
    slug: 'fondation-specification',
    blockKey: 'fondations',
    order: 1,
    title: 'La spécification complète',
    objective: 'Faire écrire à Claude, noir sur blanc, ce qu’il va construire.',
    target: 'claude_code',
    body: `${c}

Avant d'écrire la moindre ligne de code, rédige la spécification de ce produit.

Contraintes techniques imposées, ne les discute pas :
- Next.js avec l'App Router, TypeScript, Tailwind CSS
- Base de données PostgreSQL avec Prisma
- Hébergement Vercel, code sur GitHub
- Paiement par Stripe Checkout

Contraintes de périmètre :
- Une seule fonctionnalité centrale : {{coreFeature}}
- Tout le reste attend. Si tu vois une deuxième fonctionnalité utile,
  note-la dans une section « plus tard » et ne la construis pas.
- Le produit doit être utilisable sur un téléphone en priorité.

Rends-moi :
1. Le nom des écrans, avec en une phrase ce qu'on y fait.
2. La liste des données à stocker, avec leurs champs.
3. Le parcours d'un client, de son inscription au moment où il obtient le
   résultat, étape par étape.
4. Ce qui est explicitement hors périmètre.

Ne génère pas encore de code. Attends ma validation.`,
    expectedOutcome:
      'Une description en quatre parties : les écrans, les données, le parcours client, et ce qui est hors périmètre.',
    verification:
      'Relis la liste des écrans. Si tu ne reconnais pas ton produit, réponds « Corrige ce point : … » plutôt que de recommencer.',
  },
  {
    slug: 'fondation-arborescence',
    blockKey: 'fondations',
    order: 2,
    title: 'Le squelette du projet',
    objective: 'Créer les dossiers, les fichiers et les pages vides.',
    target: 'claude_code',
    body: `${c}

Tu m'as rendu la spécification. Crée maintenant le squelette du projet.

- Initialise le projet Next.js avec l'App Router et TypeScript s'il n'existe pas.
- Crée un fichier par écran de la spécification, avec un titre et rien d'autre.
- Crée les dossiers pour les composants, les fonctions serveur et les utilitaires.
- Ajoute un fichier .gitignore qui exclut node_modules, .next et .env.
- N'écris aucune logique métier pour l'instant.

Quand c'est fait, donne-moi la commande exacte pour lancer le site, et rien d'autre.`,
    expectedOutcome: 'Un projet qui démarre et affiche des pages vides mais réelles.',
    verification: 'Lance le site et clique sur chaque lien. Aucun ne doit afficher de message rouge.',
  },
  {
    slug: 'fondation-tokens',
    blockKey: 'fondations',
    order: 3,
    title: 'Les couleurs et les polices',
    objective: 'Poser une identité visuelle cohérente, une fois pour toutes.',
    target: 'claude_code',
    body: `${c}

Pose l'identité visuelle du projet, en variables CSS, dans un seul fichier.

- Une couleur de marque, une couleur de fond, deux niveaux de texte, une
  couleur de bordure. Pas plus.
- Une seule police pour les titres, une seule pour le texte.
- Une échelle de tailles de texte, du plus petit au plus grand, et rien en
  dehors de cette échelle ensuite.
- Des rayons d'arrondi définis une fois.

Règles :
- Aucune couleur écrite en dur ailleurs que dans ce fichier.
- Tout doit rester lisible sur un téléphone en plein soleil : contraste fort.
- Pas d'ombre portée.

Montre-moi le fichier, puis applique-le à la page d'accueil pour que je voie
le résultat.`,
    expectedOutcome: 'Un fichier de variables CSS, appliqué à la page d’accueil.',
    verification: 'Ouvre la page d’accueil : les couleurs et la police doivent avoir changé.',
  },
  {
    slug: 'fondation-layout',
    blockKey: 'fondations',
    order: 4,
    title: 'La mise en page commune',
    objective: 'L’en-tête, le pied de page et la navigation, partagés par tous les écrans.',
    target: 'claude_code',
    body: `${c}

Construis la mise en page commune à tous les écrans.

- Un en-tête avec le nom du produit à gauche et un seul bouton à droite.
- Sur mobile : aucun menu déroulant. Le nom, le bouton, c'est tout.
- Sur mobile : une barre d'action collée en bas de l'écran, toujours visible,
  qui porte l'action principale de l'écran en cours.
- Un pied de page avec les mentions légales, la politique de confidentialité
  et un lien de contact.
- Toutes les zones cliquables font au moins 48 pixels de haut.

Applique cette mise en page à tous les écrans existants.`,
    expectedOutcome: 'Un en-tête et un pied de page identiques sur tous les écrans.',
    verification: 'Ouvre le site sur un téléphone : la barre du bas doit rester visible en défilant.',
  },

  // --- Données (3) ------------------------------------------------------
  {
    slug: 'donnees-schema',
    blockKey: 'donnees',
    order: 1,
    title: 'Le schéma de données',
    objective: 'Décrire les tables qui stockeront ce que tes clients saisissent.',
    target: 'claude_code',
    body: `${c}

Écris le schéma Prisma complet de ce produit.

Données à couvrir, d'après la spécification : {{entities}}

Règles :
- Chaque table a un identifiant, une date de création et une date de mise à jour.
- Chaque donnée appartenant à un client porte son identifiant d'utilisateur,
  avec suppression en cascade : effacer un compte doit effacer ses données.
- Utilise des énumérations plutôt que des chaînes libres pour les statuts.
- Ajoute un index sur tout champ servant à filtrer une liste.
- Pas de champ que la spécification ne demande pas.

Montre-moi le fichier schema.prisma en entier, et explique en une ligne par
table à quoi elle sert.`,
    expectedOutcome: 'Un fichier schema.prisma complet, commenté table par table.',
    verification: 'Vérifie que chaque table de la spécification est présente, et qu’il n’y en a pas d’autres.',
  },
  {
    slug: 'donnees-migration',
    blockKey: 'donnees',
    order: 2,
    title: 'Créer les tables dans la base',
    objective: 'Transformer le schéma en tables réelles.',
    target: 'claude_code',
    body: `${c}

Crée les tables dans la base à partir du schéma Prisma.

- Vérifie d'abord que les variables d'environnement de connexion existent.
  Si elles manquent, dis-moi lesquelles et où les trouver : je les ajouterai
  moi-même. Ne me demande jamais de te les coller ici.
- Génère la migration, applique-la, et régénère le client Prisma.
- Configure la commande de build pour que la migration s'applique
  automatiquement à chaque déploiement.

Si la migration échoue, donne-moi le message d'erreur exact et la cause
probable en une phrase.`,
    expectedOutcome: 'Les tables existent dans la base, et la migration rejouera au déploiement.',
    verification: 'Demande « liste les tables de la base » : tu dois voir celles du schéma.',
  },
  {
    slug: 'donnees-seed',
    blockKey: 'donnees',
    order: 3,
    title: 'Les données de départ',
    objective: 'Remplir la base de quoi voir des écrans qui ne sont pas vides.',
    target: 'claude_code',
    body: `${c}

Écris un script de données de départ.

- Insère de quoi voir chaque écran rempli : une dizaine de lignes par table
  principale, cohérentes entre elles.
- Marque chaque ligne de démonstration d'un champ isDemo à vrai, pour qu'on
  puisse les distinguer et les effacer.
- Le script doit pouvoir tourner deux fois de suite sans créer de doublon.
- Rends-le lançable par une seule commande, et dis-moi laquelle.`,
    expectedOutcome: 'Un script relançable, et des écrans qui affichent quelque chose.',
    verification: 'Lance-le deux fois. La deuxième fois ne doit produire ni erreur ni doublon.',
  },

  // --- Comptes (3) ------------------------------------------------------
  {
    slug: 'comptes-inscription',
    blockKey: 'comptes',
    order: 1,
    title: 'L’inscription',
    objective: 'Permettre à un visiteur de créer un compte.',
    target: 'claude_code',
    body: `${c}

Ajoute l'inscription par e-mail et mot de passe.

- Un seul écran : prénom, e-mail, mot de passe.
- Le mot de passe est stocké haché, jamais en clair. Utilise une fonction de
  hachage lente et une empreinte différente par compte.
- Un mot de passe de moins de huit caractères est refusé, avec un message qui
  dit précisément ce qui manque.
- Une adresse déjà inscrite affiche « un compte existe déjà avec cette
  adresse », avec un lien vers la connexion.
- Une case à cocher obligatoire pour accepter les conditions, avec la date
  d'acceptation enregistrée.
- Le formulaire doit fonctionner même si le JavaScript ne s'est pas encore
  chargé.

Liste-moi les variables d'environnement que tu attends. Ne me demande jamais
de coller une clé secrète dans cette conversation.`,
    expectedOutcome: 'Un écran d’inscription qui crée un compte réel en base.',
    verification: 'Inscris-toi en fenêtre privée, puis vérifie que la ligne existe en base.',
  },
  {
    slug: 'comptes-connexion',
    blockKey: 'comptes',
    order: 2,
    title: 'La connexion',
    objective: 'Permettre à un client de revenir.',
    target: 'claude_code',
    body: `${c}

Ajoute la connexion et la déconnexion.

- Un écran avec e-mail et mot de passe.
- Un mauvais mot de passe et une adresse inconnue donnent exactement le même
  message : « identifiants incorrects ». Ne révèle jamais laquelle des deux
  informations est fausse.
- La session dure trente jours.
- Protège toutes les pages privées : un visiteur non connecté est renvoyé vers
  la connexion, puis ramené où il allait une fois connecté.
- Ajoute un bouton de déconnexion dans l'en-tête.`,
    expectedOutcome: 'Connexion, déconnexion et pages privées protégées.',
    verification: 'Essaie d’ouvrir une page privée en fenêtre privée : tu dois être renvoyé vers la connexion.',
  },
  {
    slug: 'comptes-profil',
    blockKey: 'comptes',
    order: 3,
    title: 'Le compte et ses données',
    objective: 'Un écran de compte, avec export et suppression.',
    target: 'claude_code',
    body: `${c}

Ajoute un écran « Mon compte ».

- Modifier son prénom et son mot de passe.
- Un bouton « Exporter mes données » qui télécharge un fichier JSON contenant
  tout ce que le produit sait de la personne.
- Un bouton « Supprimer mon compte » avec une confirmation qui demande de
  taper le mot SUPPRIMER. La suppression efface réellement les données, elle
  ne les masque pas.
- Affiche la durée de conservation des données et un lien vers la politique
  de confidentialité.

Ces deux fonctions ne sont pas optionnelles : le règlement européen sur les
données personnelles les impose.`,
    expectedOutcome: 'Un écran de compte avec export et suppression qui fonctionnent réellement.',
    verification: 'Exporte tes données et ouvre le fichier. Puis supprime un compte de test et vérifie en base.',
  },

  // --- Cœur du produit (8) ---------------------------------------------
  {
    slug: 'coeur-modele',
    blockKey: 'coeur',
    order: 1,
    title: 'Le modèle central',
    objective: 'La table principale de ton produit et ses règles.',
    target: 'claude_code',
    body: `${c}

La fonctionnalité centrale est : {{coreFeature}}

Construis d'abord sa donnée centrale.
- Crée ou complète la table qui la porte, avec tous ses champs.
- Écris les fonctions serveur pour créer, lire, modifier et supprimer.
- Chaque fonction vérifie que la donnée appartient bien à l'utilisateur
  connecté, avant toute chose.
- Valide toutes les entrées avec un schéma strict. Une entrée invalide renvoie
  un message compréhensible, jamais une erreur technique.

Pas encore d'écran. Juste les données et les fonctions.`,
    expectedOutcome: 'Les fonctions serveur du cœur du produit, sécurisées et validées.',
    verification: 'Demande à Claude d’écrire un test qui vérifie qu’un utilisateur ne peut pas lire la donnée d’un autre.',
  },
  {
    slug: 'coeur-creation',
    blockKey: 'coeur',
    order: 2,
    title: 'Créer une donnée',
    objective: 'L’écran qui permet à ton client de créer sa première donnée.',
    target: 'claude_code',
    body: `${c}

Construis l'écran de création pour : {{coreFeature}}

- Un formulaire, une seule colonne, pensé pour un téléphone.
- Les champs obligatoires d'abord, les champs facultatifs repliés sous un
  bouton « plus d'options ».
- Un seul bouton principal, en bas, collé à l'écran sur mobile.
- Pendant l'envoi, le bouton se désactive et dit ce qui se passe.
- En cas d'erreur, le message s'affiche au-dessus du champ concerné, pas en
  haut de page.
- Après création, on arrive directement sur la donnée créée.`,
    expectedOutcome: 'Un écran de création utilisable d’une seule main sur un téléphone.',
    verification: 'Crée une donnée depuis ton téléphone, sans zoomer.',
  },
  {
    slug: 'coeur-liste',
    blockKey: 'coeur',
    order: 3,
    title: 'La liste',
    objective: 'Voir toutes ses données, et retrouver la bonne.',
    target: 'claude_code',
    body: `${c}

Construis la liste de {{coreFeature}}.

- Une carte par ligne sur mobile, un tableau à partir de la taille tablette.
- Les plus récentes en haut.
- Un champ de recherche qui filtre pendant la frappe.
- Si la liste est vide, affiche un état vide qui explique quoi faire et porte
  le bouton de création. Jamais un écran blanc.
- Charge par pages de vingt, avec un bouton « en voir plus ».`,
    expectedOutcome: 'Une liste lisible sur téléphone, avec recherche et état vide.',
    verification: 'Vide la table et vérifie que l’état vide s’affiche, avec son bouton.',
  },
  {
    slug: 'coeur-detail',
    blockKey: 'coeur',
    order: 4,
    title: 'Le détail',
    objective: 'L’écran où ton client obtient le résultat qu’il vient chercher.',
    target: 'claude_code',
    body: `${c}

Construis l'écran de détail d'une donnée de {{coreFeature}}.

- En haut, l'information que le client vient chercher, en gros. Pas un titre
  décoratif : le résultat.
- En dessous, le reste, par ordre d'importance décroissante.
- Les actions possibles en bas, l'action principale isolée des autres.
- La suppression demande une confirmation.
- Si la donnée n'existe pas ou n'appartient pas à l'utilisateur, renvoie une
  page « introuvable », jamais une erreur technique.`,
    expectedOutcome: 'Un écran de détail où le résultat saute aux yeux.',
    verification: 'Ouvre l’écran et compte trois secondes : tu dois avoir vu l’information principale.',
  },
  {
    slug: 'coeur-modification',
    blockKey: 'coeur',
    order: 5,
    title: 'La modification',
    objective: 'Corriger sans repartir de zéro.',
    target: 'claude_code',
    body: `${c}

Ajoute la modification d'une donnée de {{coreFeature}}.

- Réutilise le formulaire de création, pré-rempli. N'écris pas un second
  formulaire : il dériverait du premier.
- Un bouton « annuler » qui ramène au détail sans rien changer.
- Si l'utilisateur quitte avec des changements non enregistrés, préviens-le.
- Enregistre la date de dernière modification et affiche-la.`,
    expectedOutcome: 'Un écran de modification qui partage le code du formulaire de création.',
    verification: 'Modifie un champ, recharge : la valeur doit avoir changé.',
  },
  {
    slug: 'coeur-partage',
    blockKey: 'coeur',
    order: 6,
    title: 'Le lien à partager',
    objective: 'Ce que ton client montre à son propre client.',
    target: 'claude_code',
    body: `${c}

Ajoute un lien public partageable pour une donnée de {{coreFeature}}.

- Un identifiant long et imprévisible dans l'adresse, jamais un numéro qui se
  devine en ajoutant un.
- Le partage est désactivé par défaut. Un bouton l'active, un autre le coupe.
- La page publique n'affiche que ce qui doit être vu, jamais les données du
  compte.
- Elle se lit sans être connecté et sans rien installer.
- Un bouton « copier le lien » qui confirme la copie.`,
    expectedOutcome: 'Un lien public qui ne fuit rien du compte.',
    verification: 'Ouvre le lien en fenêtre privée : tu dois voir la donnée sans rien d’autre.',
  },
  {
    slug: 'coeur-notifications',
    blockKey: 'coeur',
    order: 7,
    title: 'Les rappels',
    objective: 'Ramener le client au bon moment.',
    target: 'claude_code',
    body: `${c}

Ajoute les rappels par e-mail.

- Une table de notifications avec le destinataire, le type, la date prévue et
  la date d'envoi.
- Une fonction qui envoie ce qui est dû, appelée par une tâche planifiée.
- Un e-mail n'est jamais envoyé deux fois : la date d'envoi le garantit.
- Un lien de désinscription dans chaque e-mail, qui fonctionne sans connexion.
- Un écran de préférences dans « Mon compte ».

N'envoie aucun e-mail promotionnel sans accord explicite.`,
    expectedOutcome: 'Des rappels qui partent une seule fois, avec désinscription.',
    verification: 'Déclenche l’envoi deux fois de suite : le second ne doit rien envoyer.',
  },
  {
    slug: 'coeur-export',
    blockKey: 'coeur',
    order: 8,
    title: 'L’export',
    objective: 'Sortir ses données du produit.',
    target: 'claude_code',
    body: `${c}

Ajoute l'export des données de {{coreFeature}}.

- Un bouton qui télécharge un fichier CSV, ouvrable dans un tableur.
- Encodage compatible avec Excel en français, séparateur point-virgule.
- Une ligne d'en-tête avec des noms de colonnes lisibles, en français.
- Les dates au format jour/mois/année.
- L'export ne contient que les données de l'utilisateur connecté.`,
    expectedOutcome: 'Un fichier CSV qui s’ouvre proprement dans un tableur français.',
    verification: 'Télécharge et ouvre le fichier : les accents et les colonnes doivent être corrects.',
  },

  // --- Écrans (6) -------------------------------------------------------
  {
    slug: 'ecran-accueil',
    blockKey: 'ecrans',
    order: 1,
    title: 'L’écran d’accueil connecté',
    objective: 'Ce que le client voit en arrivant : quoi faire maintenant.',
    target: 'claude_code',
    body: `${c}

Construis l'écran d'accueil d'un client connecté.

- En haut, une seule phrase : ce qu'il doit faire maintenant.
- Un seul bouton principal. Tout le reste est secondaire.
- En dessous, les trois dernières choses qu'il a faites.
- Si le compte est neuf, affiche un guide de démarrage en trois étapes, avec
  la première déjà cochée puisqu'il vient de s'inscrire.
- Aucun graphique, aucun chiffre décoratif.`,
    expectedOutcome: 'Un écran où l’action suivante est évidente en trois secondes.',
    verification: 'Montre l’écran à quelqu’un et demande « qu’est-ce que tu dois faire ? ». Il doit répondre sans hésiter.',
  },
  {
    slug: 'ecran-onboarding',
    blockKey: 'ecrans',
    order: 2,
    title: 'La première utilisation',
    objective: 'Amener le client à son premier résultat, tout de suite.',
    target: 'claude_code',
    body: `${c}

Construis le parcours de première utilisation.

- Une question par écran, jamais un formulaire long.
- Chaque réponse est enregistrée immédiatement : on peut fermer et revenir.
- Une barre de progression qui ne recule jamais.
- Trois questions maximum avant que le client voie un premier résultat utile.
- À la fin, il arrive directement sur ce résultat, pas sur un écran de
  félicitations.`,
    expectedOutcome: 'Un parcours d’accueil de trois questions, repris là où il s’est arrêté.',
    verification: 'Ferme l’onglet en plein milieu et rouvre : tu dois reprendre à la même question.',
  },
  {
    slug: 'ecran-recherche',
    blockKey: 'ecrans',
    order: 3,
    title: 'La recherche',
    objective: 'Retrouver une donnée dans une longue liste.',
    target: 'claude_code',
    body: `${c}

Ajoute une recherche à l'échelle du produit.

- Un champ unique, accessible depuis l'en-tête.
- La recherche se déclenche après trois cents millisecondes sans frappe, pas
  à chaque lettre.
- Elle ignore les accents et la casse.
- Les résultats sont groupés par type de donnée.
- Aucun résultat affiche une phrase utile et propose de créer la donnée.`,
    expectedOutcome: 'Une recherche tolérante aux accents, avec un état « aucun résultat » utile.',
    verification: 'Cherche un mot avec et sans accent : les deux doivent donner le même résultat.',
  },
  {
    slug: 'ecran-parametres',
    blockKey: 'ecrans',
    order: 4,
    title: 'Les réglages',
    objective: 'Un seul endroit pour tout ce qui se règle.',
    target: 'claude_code',
    body: `${c}

Construis l'écran de réglages.

- Regroupe par thème : le compte, les notifications, l'abonnement, les données.
- Chaque réglage s'enregistre tout seul au changement, sans bouton
  « enregistrer », et affiche une confirmation discrète.
- Les actions dangereuses sont en bas, séparées, et demandent confirmation.
- Pas de réglage qui ne serve à rien : si personne ne va le changer, retire-le.`,
    expectedOutcome: 'Un écran de réglages qui s’enregistre tout seul.',
    verification: 'Change un réglage, recharge la page : il doit avoir tenu.',
  },
  {
    slug: 'ecran-erreurs',
    blockKey: 'ecrans',
    order: 5,
    title: 'Les écrans d’erreur',
    objective: 'Ne jamais laisser quelqu’un devant un message technique.',
    target: 'claude_code',
    body: `${c}

Construis les écrans d'erreur.

- Page introuvable : dis-le simplement, propose un lien vers l'accueil.
- Erreur serveur : dis que le problème vient de nous, propose de réessayer.
- Aucun message technique visible : pas de trace d'appels, pas de nom de
  fichier, pas de nom de table.
- Enregistre l'erreur côté serveur pour pouvoir la lire, mais ne la montre pas.
- Ajoute un état de chargement sur chaque écran qui attend des données.`,
    expectedOutcome: 'Des erreurs compréhensibles par quelqu’un qui n’est pas développeur.',
    verification: 'Ouvre une adresse qui n’existe pas : tu dois voir une page soignée, pas un message brut.',
  },
  {
    slug: 'ecran-mobile',
    blockKey: 'ecrans',
    order: 6,
    title: 'Le passage mobile',
    objective: 'Tout doit marcher à trois cent quatre-vingt-dix pixels de large.',
    target: 'claude_code',
    body: `${c}

Reprends tous les écrans pour un téléphone de 390 pixels de large.

- Rien ne dépasse horizontalement, sur aucun écran.
- Tout ce qui se clique fait au moins 48 pixels de haut.
- Les tableaux deviennent des cartes empilées, ou défilent horizontalement
  dans leur propre cadre.
- L'action principale de chaque écran est atteignable au pouce, en bas.
- Les formulaires ne demandent jamais de zoomer : taille de texte 16 pixels
  minimum sur les champs.

Liste-moi les écrans que tu as modifiés et ce que tu as changé sur chacun.`,
    expectedOutcome: 'Aucun débordement horizontal, aucune cible tactile trop petite.',
    verification: 'Ouvre chaque écran sur ton téléphone et fais défiler latéralement : rien ne doit bouger.',
  },

  // --- Paiement (4) -----------------------------------------------------
  {
    slug: 'paiement-checkout',
    blockKey: 'paiement',
    order: 1,
    title: 'La page de paiement',
    objective: 'Un bouton qui emmène vers une vraie page de paiement Stripe.',
    target: 'claude_code',
    body: `${c}

Branche Stripe Checkout pour un abonnement mensuel à {{monthlyPrice}} €.

- Une fonction serveur crée la session de paiement et renvoie son adresse.
- Le prix n'est jamais écrit dans le code : il vient d'une variable
  d'environnement contenant un identifiant de tarif Stripe.
- Le client Stripe est créé au premier paiement et réutilisé ensuite, pour que
  la facturation reste d'un seul tenant.
- Prévois une page de retour en cas de succès et une en cas d'abandon.
- Si la clé Stripe est absente, le produit doit continuer de fonctionner et
  l'écran doit dire franchement que le paiement n'est pas encore branché.

Dis-moi les variables d'environnement à créer. Ne me demande pas de te coller
une clé.`,
    expectedOutcome: 'Un bouton qui ouvre la page de paiement Stripe.',
    verification: 'Clique sur le bouton : tu dois arriver sur une page stripe.com avec le bon montant.',
  },
  {
    slug: 'paiement-webhook',
    blockKey: 'paiement',
    order: 2,
    title: 'Le webhook',
    objective: 'Ouvrir l’accès uniquement quand Stripe confirme le paiement.',
    target: 'claude_code',
    body: `${c}

Écris le webhook Stripe. C'est le seul endroit du produit qui a le droit
d'ouvrir un accès payant.

- Vérifie la signature de chaque requête avec le secret de signature. Une
  requête non signée est rejetée, sans exception.
- Lis le corps brut de la requête : une lecture en JSON casse la vérification
  de signature.
- Traite : paiement abouti, abonnement modifié, abonnement annulé.
- Enregistre le plan, le statut et la date de fin de période.
- Si le traitement échoue, renvoie une erreur 500 pour que Stripe réessaie.
  Ne renvoie jamais un succès sur un échec.
- Le retour du client sur la page de succès n'ouvre aucun accès : seul le
  webhook le fait. Sinon, il suffit de fabriquer une adresse pour ne pas payer.`,
    expectedOutcome: 'Un webhook signé qui est la seule source de l’accès payant.',
    verification: 'Dans Stripe, ouvre ton webhook : les tentatives doivent être en vert.',
  },
  {
    slug: 'paiement-portail',
    blockKey: 'paiement',
    order: 3,
    title: 'Le portail client',
    objective: 'Laisser le client gérer son abonnement tout seul.',
    target: 'claude_code',
    body: `${c}

Ajoute le portail de facturation Stripe.

- Un bouton « Gérer mon abonnement » dans les réglages, visible seulement si
  la personne a un abonnement.
- Il ouvre le portail Stripe, où elle peut changer de carte, télécharger ses
  factures et résilier.
- Une résiliation garde l'accès jusqu'à la fin de la période payée. Ne coupe
  jamais immédiatement quelque chose qui est payé.
- Affiche la date de fin de période dans les réglages.`,
    expectedOutcome: 'Un bouton qui ouvre le portail Stripe avec les factures.',
    verification: 'Ouvre le portail depuis un compte payant : tu dois voir la facture du paiement test.',
  },
  {
    slug: 'paiement-restriction',
    blockKey: 'paiement',
    order: 4,
    title: 'Ce qui est réservé aux abonnés',
    objective: 'Fermer les fonctions payantes, côté serveur.',
    target: 'claude_code',
    body: `${c}

Restreins les fonctions payantes.

- Crée une table qui associe une clé de fonctionnalité aux offres qui y ont
  droit. Aucun droit écrit en dur dans le code.
- Écris une fonction can(utilisateur, clé) qui ne s'exécute que côté serveur.
- Une clé inconnue est fermée par défaut. On n'ouvre jamais par omission.
- Vérifie le droit dans la fonction serveur, pas seulement en masquant le
  bouton : masquer un bouton n'est pas une sécurité.
- Quand l'accès est fermé, affiche ce que la fonction ferait et un lien vers
  l'offre. Ne cache pas l'existence de la fonction.`,
    expectedOutcome: 'Un contrôle d’accès en base, vérifié côté serveur.',
    verification: 'Appelle la fonction serveur depuis un compte gratuit : elle doit refuser, même si le bouton est masqué.',
  },

  // --- Mise en ligne (3) -----------------------------------------------
  {
    slug: 'ligne-github',
    blockKey: 'mise-en-ligne',
    order: 1,
    title: 'Envoyer le code sur GitHub',
    objective: 'Sauvegarder le code hors de ton ordinateur.',
    target: 'claude_code',
    body: `${c}

Prépare le projet pour GitHub.

- Vérifie que le fichier .gitignore exclut node_modules, .next, .env et tout
  fichier contenant des clés.
- Si un fichier contenant des secrets a déjà été envoyé, dis-le-moi
  franchement et explique-moi comment le retirer de l'historique.
- Écris un README avec : ce que fait le produit, comment le lancer, et la
  liste des variables d'environnement attendues — avec leurs noms seulement,
  jamais leurs valeurs.
- Fais le premier enregistrement avec un message clair.

Donne-moi ensuite les étapes, cliquables, pour publier depuis GitHub Desktop.`,
    expectedOutcome: 'Un dépôt propre, sans secret, avec un README utilisable.',
    verification: 'Ouvre ton dépôt sur github.com et cherche « .env ». Il ne doit pas y être.',
  },
  {
    slug: 'ligne-vercel',
    blockKey: 'mise-en-ligne',
    order: 2,
    title: 'Déployer sur Vercel',
    objective: 'Une adresse publique qui fonctionne.',
    target: 'claude_code',
    body: `${c}

Prépare le déploiement sur Vercel.

- Vérifie que la commande de build applique les migrations de base avant de
  construire le site.
- Vérifie que le projet construit sans erreur en local avant de déployer.
- Liste toutes les variables d'environnement à créer sur Vercel, avec pour
  chacune où trouver sa valeur.
- Vérifie qu'aucune variable secrète n'est exposée au navigateur : seules
  celles préfixées NEXT_PUBLIC_ le sont, et aucune clé secrète ne doit porter
  ce préfixe.

Donne-moi la liste des variables sous forme de tableau.`,
    expectedOutcome: 'Un projet qui construit sans erreur, et la liste exacte des variables.',
    verification: 'Lance la construction en local : elle doit aller au bout sans message rouge.',
  },
  {
    slug: 'ligne-domaine',
    blockKey: 'mise-en-ligne',
    order: 3,
    title: 'Brancher le nom de domaine',
    objective: 'Ton site répond à ton adresse.',
    target: 'claude_code',
    body: `${c}

Mon nom de domaine est {{domainName}}.

- Configure le projet pour que toutes les adresses absolues utilisent ce
  domaine plutôt qu'une adresse Vercel.
- Résous l'adresse du site à partir des variables d'environnement, en
  tolérant qu'une variable soit définie mais vide : c'est fréquent sur les
  plateformes de déploiement et ça casse la construction.
- Prévois une solution de repli si aucune variable n'est renseignée.
- Vérifie que la redirection du www vers le domaine principal est en place.`,
    expectedOutcome: 'Les liens et les e-mails pointent vers ton domaine.',
    verification: 'Vide une variable d’adresse et relance la construction : elle doit passer quand même.',
  },

  // --- Page de vente (3) -----------------------------------------------
  {
    slug: 'vente-structure',
    blockKey: 'vente',
    order: 1,
    title: 'La structure de la page de vente',
    objective: 'Les blocs, dans le bon ordre.',
    target: 'claude_code',
    body: `${c}

Construis la structure de la page de vente publique, sans les textes définitifs.

Dans cet ordre :
1. Un titre, un sous-titre, un seul bouton.
2. Le problème, en trois points.
3. Ce que fait le produit, en trois points.
4. Comment ça marche, en trois étapes.
5. Le prix, une seule offre à {{monthlyPrice}} € par mois.
6. Les questions fréquentes.
7. Un dernier bouton.

- Conçue pour 390 pixels de large d'abord.
- Une barre d'action collée en bas sur mobile, avec le même bouton.
- Aucun champ de formulaire sur cette page.`,
    expectedOutcome: 'Une page de vente structurée, prête à recevoir les textes.',
    verification: 'Ouvre la page sur ton téléphone et compte les boutons principaux : il ne doit y en avoir qu’un par écran.',
  },
  {
    slug: 'vente-textes',
    blockKey: 'vente',
    order: 2,
    title: 'Les textes de la page de vente',
    objective: 'Écrire avec les mots des clients, pas les tiens.',
    target: 'claude_web',
    body: `${c}

Écris les textes de ma page de vente.

Voici ce que de vraies personnes du métier m'ont dit, mot pour mot :
{{conversations}}

Règles absolues :
- Reprends leurs formulations. N'invente pas de vocabulaire marketing.
- Aucune promesse de revenu, ni chiffrée, ni implicite. Les mots « gagne »,
  « revenus passifs », « automatique », « garanti » sont interdits, ainsi que
  tout montant associé à un délai.
- Aucun faux témoignage, aucun chiffre inventé. Si je n'ai pas de client, la
  page ne fait semblant de rien.
- Phrases courtes. Un collégien doit comprendre.
- Le titre nomme le métier visé.

Rends-moi les textes bloc par bloc, prêts à coller.`,
    expectedOutcome: 'Des textes qui reprennent les mots de tes dix conversations.',
    verification: 'Cherche les mots interdits dans la page. Aucun ne doit apparaître.',
  },
  {
    slug: 'vente-animations',
    blockKey: 'vente',
    order: 3,
    title: 'Les animations de la page de vente',
    objective: 'Du mouvement sobre, qui ne ralentit pas la page.',
    target: 'claude_code',
    body: `${c}

Ajoute les animations de la page de vente.

- Une seule séquence d'entrée en haut de page, décalée de soixante
  millisecondes entre les éléments. Elle ne se rejoue jamais.
- Les blocs apparaissent quand ils entrent dans l'écran, une seule fois.
- Rien ne dépasse six cents millisecondes.
- Uniquement des déplacements et des variations d'opacité. Rien qui fasse
  recalculer la mise en page.
- Respecte le réglage système « réduire les animations » : dans ce cas, tout
  s'affiche immédiatement.
- Aucune animation ne doit retarder l'affichage du texte.`,
    expectedOutcome: 'Des animations sobres, désactivées si le système le demande.',
    verification: 'Active « réduire les animations » dans ton système : la page doit s’afficher d’un coup.',
  },

  // --- E-mails (2) ------------------------------------------------------
  {
    slug: 'email-transactionnels',
    blockKey: 'emails',
    order: 1,
    title: 'Les e-mails du produit',
    objective: 'Bienvenue, réinitialisation, confirmation de paiement.',
    target: 'claude_code',
    body: `${c}

Ajoute les e-mails transactionnels.

- Bienvenue à l'inscription : ce que la personne peut faire maintenant, en
  trois lignes et un bouton.
- Réinitialisation de mot de passe : un lien valable une heure, à usage unique.
- Confirmation d'abonnement : le montant, la date du prochain prélèvement, et
  un lien vers le portail.
- Une seule mise en page partagée, sobre, lisible sans images.
- L'expéditeur est une adresse de ton domaine, pas une adresse générique.
- Chaque e-mail fonctionne en texte brut, pour les clients qui bloquent le HTML.

Dis-moi quelles variables d'environnement il faut pour l'envoi.`,
    expectedOutcome: 'Trois e-mails soignés, lisibles sans images.',
    verification: 'Envoie-toi chacun des trois et ouvre-les sur ton téléphone.',
  },
  {
    slug: 'email-relance',
    blockKey: 'emails',
    order: 2,
    title: 'La relance des comptes inactifs',
    objective: 'Ramener quelqu’un qui s’est arrêté en route.',
    target: 'claude_code',
    body: `${c}

Ajoute une relance des comptes inactifs.

- Envoyée si la personne ne s'est pas connectée depuis sept jours et n'a pas
  terminé sa première utilisation.
- Une seule fois. Jamais deux relances pour le même motif.
- Le message rappelle où elle s'est arrêtée et propose de reprendre là.
- Aucune formule de culpabilisation, aucune fausse urgence, aucun compte à
  rebours inventé.
- Lien de désinscription qui fonctionne sans connexion.
- Respecte le réglage de notifications du compte : si la personne les a
  coupées, on n'envoie rien.`,
    expectedOutcome: 'Une relance unique, honnête, désinscriptible.',
    verification: 'Déclenche la relance deux fois : la seconde ne doit rien envoyer.',
  },

  // --- Finitions (4) ----------------------------------------------------
  {
    slug: 'finition-performance',
    blockKey: 'finitions',
    order: 1,
    title: 'La vitesse sur téléphone',
    objective: 'Moins de deux secondes en 4G.',
    target: 'claude_code',
    body: `${c}

Optimise la vitesse de chargement, en visant un téléphone d'entrée de gamme
en 4G.

- Mesure d'abord le poids du JavaScript envoyé sur la page d'accueil et
  dis-le-moi. Vise moins de deux cents kilooctets.
- Rends serveur tout composant qui n'a pas besoin d'interactivité.
- Charge à la demande ce qui n'est pas visible au premier écran.
- Images en AVIF ou WebP, avec largeur et hauteur déclarées pour que la page
  ne saute pas.
- Polices en display swap, avec préchargement de celle du titre.
- Liste-moi ce que tu as changé, avec le gain mesuré pour chaque changement.`,
    expectedOutcome: 'Un budget JavaScript mesuré et tenu sur la page d’accueil.',
    verification: 'Relance la mesure après changement : le poids doit avoir baissé, pas seulement « être optimisé ».',
  },
  {
    slug: 'finition-accessibilite',
    blockKey: 'finitions',
    order: 2,
    title: 'L’accessibilité',
    objective: 'Utilisable au clavier et au lecteur d’écran.',
    target: 'claude_code',
    body: `${c}

Reprends le produit pour l'accessibilité.

- Chaque champ a une étiquette réellement liée, pas seulement un texte gris
  à l'intérieur.
- Tout est atteignable au clavier, dans un ordre logique, avec un contour de
  focus visible.
- Contraste d'au moins 4,5 contre 1 pour le texte.
- Chaque image porte une description, ou est marquée décorative.
- Les messages d'erreur sont annoncés aux lecteurs d'écran.
- La page a un seul titre de niveau un, et les niveaux ne sautent pas.

Liste les problèmes trouvés et corrigés, écran par écran.`,
    expectedOutcome: 'Un produit utilisable sans souris.',
    verification: 'Traverse un écran entier à la touche de tabulation : tu dois toujours voir où tu es.',
  },
  {
    slug: 'finition-etats-vides',
    blockKey: 'finitions',
    order: 3,
    title: 'Les états vides et les chargements',
    objective: 'Ne jamais montrer un écran blanc.',
    target: 'claude_code',
    body: `${c}

Reprends tous les états vides et de chargement.

- Chaque liste vide explique ce qu'on y mettra et porte le bouton pour le
  faire. Jamais « aucune donnée ».
- Chaque écran qui attend affiche une silhouette du contenu à venir, pas un
  cercle qui tourne.
- Chaque action qui dure affiche ce qui se passe, en toutes lettres.
- Chaque erreur propose une action : réessayer, revenir, contacter.

Fais la liste des écrans concernés et montre-moi ce que tu as mis sur chacun.`,
    expectedOutcome: 'Aucun écran blanc, aucun « aucune donnée » sec.',
    verification: 'Vide la base et parcours tout le produit : chaque écran doit rester utile.',
  },
  {
    slug: 'finition-legal',
    blockKey: 'finitions',
    order: 4,
    title: 'Les mentions obligatoires',
    objective: 'Être en règle avant d’encaisser.',
    target: 'claude_code',
    body: `${c}

Ajoute les pages légales obligatoires pour un site français qui encaisse.

- Mentions légales : identité de l'éditeur, hébergeur, contact.
- Conditions générales de vente : ce qui est vendu, le prix, la durée, la
  résiliation, le droit de rétractation.
- Politique de confidentialité : données collectées, finalité, durée de
  conservation, lieu d'hébergement, droits d'accès, de rectification, de
  suppression et de portabilité, et comment les exercer.
- Une bannière de consentement uniquement si tu poses des traceurs non
  essentiels. Si tu n'en poses pas, ne mets pas de bannière.
- Un lien vers ces pages dans le pied de page de tous les écrans.

Laisse en évidence les champs que je dois remplir moi-même, encadrés par des
crochets. N'invente aucune information sur mon entreprise.`,
    expectedOutcome: 'Trois pages légales, avec les champs à remplir clairement marqués.',
    verification: 'Relis les trois pages et cherche les crochets : remplace-les tous avant d’encaisser.',
  },
];
