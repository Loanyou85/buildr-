import type { PhaseSeed } from './types';

export const PHASES_4_6: PhaseSeed[] = [
  {
    key: 'generer',
    title: 'Générer le produit',
    goal: 'Faire exister ton produit et le voir tourner sous tes yeux.',
    outcome: 'Le projet existe et tourne, en local ou dans le navigateur.',
    steps: [
      {
        title: 'Choisis ton chemin',
        goal: 'Décider où tu vas construire : dans un onglet, ou sur ton ordinateur.',
        why: 'Les deux mènent au même endroit. Le chemin navigateur ne demande aucune installation. Le chemin ordinateur est plus rapide une fois en place, mais demande d’ouvrir un terminal une fois.',
        estimatedMinutes: 10,
        subSteps: [
          {
            title: 'Comprendre la différence',
            body:
              '**Chemin navigateur (Replit)** — tout se passe dans un onglet. Rien à installer. Tu peux travailler depuis n’importe quel ordinateur, et même depuis un téléphone pour relire.\n\n**Chemin ordinateur (Claude Code)** — plus rapide, plus puissant, mais il faut installer deux logiciels et taper quelques commandes.\n\nSi tu hésites, prends le navigateur. Tu pourras basculer plus tard sans rien perdre : ton code est sur GitHub dans les deux cas.',
            actions: [
              { instruction: 'Choisis ton chemin en bas de l’étape. Les étapes suivantes s’adapteront.' },
            ],
          },
        ],
        checkpoints: [{ label: 'J’ai choisi mon chemin' }],
      },
      {
        title: 'Ouvre ton espace de travail dans le navigateur',
        goal: 'Un projet Replit prêt, relié à ton compte GitHub.',
        why: 'Replit te donne un ordinateur dans un onglet. Tout ce que Claude écrira y tournera immédiatement, sans rien installer chez toi.',
        estimatedMinutes: 20,
        techPath: 'navigateur',
        subSteps: [
          {
            title: 'Crée le compte et le projet',
            body: 'Inscris-toi avec GitHub : ton code partira ensuite tout seul au bon endroit.',
            actions: [
              { instruction: 'Va sur replit.com.', externalUrl: 'https://replit.com/signup' },
              { instruction: 'Clique sur « Sign up », puis sur « Continue with GitHub ».' },
              { instruction: 'Autorise l’accès dans la fenêtre GitHub qui s’ouvre.' },
              { instruction: 'Sur la page d’accueil, clique sur « Create Repl » (ou le bouton « + » en haut).' },
              { instruction: 'Dans la recherche de modèle, tape « Next.js » et choisis le modèle Next.js.' },
              { instruction: 'Dans « Title », mets le nom de ton projet, celui que tu as choisi à l’étape 2.' },
              { instruction: 'Clique sur « Create Repl ». Attends que l’écran se charge, environ une minute.' },
              { instruction: 'Clique sur « Run » en haut. Un aperçu du site apparaît à droite. Si tu vois une page, tout va bien.' },
            ],
          },
        ],
        checkpoints: [
          { label: 'Mon projet Replit s’ouvre' },
          { label: 'Le bouton Run affiche un aperçu du site' },
        ],
      },
      {
        title: 'Installe ton espace de travail sur ton ordinateur',
        goal: 'Claude Code et GitHub Desktop installés et connectés.',
        why: 'Une fois en place, tu décris ce que tu veux et le code s’écrit directement dans ton dossier. C’est la façon la plus rapide de construire.',
        estimatedMinutes: 35,
        difficulty: 'medium',
        techPath: 'ordinateur',
        subSteps: [
          {
            title: 'Installe GitHub Desktop',
            body: 'C’est la version avec des boutons de GitHub. Elle t’évite d’avoir à retenir des commandes.',
            actions: [
              { instruction: 'Va sur desktop.github.com.', externalUrl: 'https://desktop.github.com/' },
              { instruction: 'Clique sur « Download » et choisis ton système (Windows ou macOS).' },
              { instruction: 'Ouvre le fichier téléchargé et laisse l’installation aller au bout.' },
              { instruction: 'Au premier lancement, clique sur « Sign in to GitHub.com » et connecte-toi.' },
              { instruction: 'Quand on te demande ton nom et ton e-mail, laisse ce qui est proposé et continue.' },
            ],
          },
          {
            title: 'Installe Claude Code',
            body:
              'Là, il faut ouvrir un terminal. C’est la seule fois du parcours. Le terminal est juste une fenêtre où l’on tape au lieu de cliquer.',
            actions: [
              { instruction: 'Sur Windows : appuie sur la touche Windows, tape « PowerShell », ouvre-le. Sur Mac : appuie sur Cmd + Espace, tape « Terminal », ouvre-le.' },
              { instruction: 'Copie exactement cette ligne et colle-la dans la fenêtre : npm install -g @anthropic-ai/claude-code' },
              { instruction: 'Appuie sur Entrée. Attends. Des lignes défilent, c’est normal.' },
              { instruction: 'Si tu vois une erreur qui parle de « npm » introuvable, installe d’abord Node.js depuis nodejs.org, choisis la version « LTS », puis recommence.', externalUrl: 'https://nodejs.org/' },
              { instruction: 'Quand la fenêtre te rend la main, tape : claude' },
              { instruction: 'Appuie sur Entrée. Suis la connexion à ton compte Claude qui s’affiche.' },
              { instruction: 'Si quelque chose bloque, utilise le bouton « Ça ne marche pas » en bas de cette étape.' },
            ],
          },
        ],
        checkpoints: [
          { label: 'GitHub Desktop est installé et connecté' },
          { label: 'La commande claude démarre et me demande mon compte' },
        ],
      },
      {
        title: 'Donne la spécification à Claude',
        goal: 'Claude sait exactement quoi construire.',
        why: 'C’est le prompt le plus important du parcours. Tout ce qui suit s’appuie dessus. Il est déjà rempli avec ton idée, ton client et ta fonctionnalité unique.',
        estimatedMinutes: 25,
        subSteps: [
          {
            title: 'Copie et colle le prompt maître',
            body:
              'Ne le réécris pas, ne le raccourcis pas. Il contient des contraintes qui évitent trois erreurs classiques dans les étapes suivantes.',
            actions: [
              { instruction: 'Clique sur le bouton de copie du prompt ci-dessous.', promptTemplateSlug: 'fondation-specification' },
              { instruction: 'Colle-le à l’endroit indiqué sous le prompt, et envoie.' },
              { instruction: 'Lis la réponse en entier. Elle décrit ce qui va être construit.' },
              { instruction: 'Si une phrase ne correspond pas à ton idée, réponds en une ligne : « Corrige ce point : [ce qui ne va pas]. » Ne recommence pas de zéro.' },
              { instruction: 'Quand la description te convient, marque ce prompt comme validé.' },
            ],
          },
        ],
        checkpoints: [
          { label: 'J’ai collé le prompt de spécification' },
          { label: 'La description renvoyée correspond à mon idée' },
        ],
      },
      {
        title: 'Fais construire le squelette',
        goal: 'Un site qui s’ouvre, avec ses pages vides mais réelles.',
        why: 'On construit d’abord la coquille, ensuite ce qu’il y a dedans. C’est ce qui permet de voir quelque chose dès aujourd’hui plutôt que dans dix jours.',
        estimatedMinutes: 45,
        difficulty: 'medium',
        subSteps: [
          {
            title: 'Les quatre prompts de fondation',
            body:
              'Ils s’enchaînent dans l’ordre. Ne saute pas, ne mélange pas : chacun s’appuie sur le résultat du précédent.',
            actions: [
              { instruction: 'Colle le prompt d’arborescence et attends la fin.', promptTemplateSlug: 'fondation-arborescence' },
              { instruction: 'Colle le prompt de tokens de design.', promptTemplateSlug: 'fondation-tokens' },
              { instruction: 'Colle le prompt de mise en page.', promptTemplateSlug: 'fondation-layout' },
              { instruction: 'Relance l’aperçu et regarde le site. Il est vide, mais il doit s’ouvrir sans message rouge.' },
            ],
          },
          {
            title: 'Vérifie que ça tourne',
            body: 'Une page blanche n’est pas un échec. Un message d’erreur rouge, si.',
            actions: [
              { instruction: 'Chemin navigateur : clique sur « Run », puis ouvre l’aperçu.' },
              { instruction: 'Chemin ordinateur : demande à Claude « lance le serveur de développement », puis ouvre l’adresse qu’il te donne.' },
              { instruction: 'Clique sur chaque lien de ton site. Aucun ne doit afficher d’erreur.' },
              { instruction: 'Si une erreur apparaît, copie son texte et utilise le bouton « Ça ne marche pas ».' },
            ],
          },
        ],
        checkpoints: [
          { label: 'Le site s’ouvre sans message d’erreur' },
          { label: 'Les pages principales existent, même vides' },
          { label: 'Les quatre prompts de fondation sont marqués exécutés' },
        ],
      },
    ],
  },
  {
    key: 'en-ligne',
    title: 'Mettre en ligne',
    goal: 'Une adresse publique que tu peux envoyer à quelqu’un.',
    outcome: 'Une URL publique sur Vercel.',
    steps: [
      {
        title: 'Envoie ton code sur GitHub',
        goal: 'Ton code sauvegardé, hors de ton ordinateur.',
        why: 'Tant que ton code n’est qu’à un seul endroit, une fausse manipulation peut tout effacer. Et Vercel ne sait déployer que ce qui est sur GitHub.',
        estimatedMinutes: 20,
        subSteps: [
          {
            title: 'Depuis Replit',
            body: 'Replit sait publier sur GitHub tout seul, en trois clics.',
            actions: [
              { instruction: 'Dans la barre latérale gauche, clique sur l’icône en forme de branche (« Git »).' },
              { instruction: 'Clique sur « Connect to GitHub ».' },
              { instruction: 'Choisis « Create a new repository », laisse le nom proposé.' },
              { instruction: 'Choisis « Private » si tu ne veux pas que ton code soit visible. Les deux marchent.' },
              { instruction: 'Clique sur « Create ». Attends la fin.' },
              { instruction: 'Dans la même barre, écris « premier envoi » dans le champ de message, puis clique sur « Commit & Push ».' },
            ],
          },
          {
            title: 'Depuis ton ordinateur',
            body: 'GitHub Desktop fait la même chose avec des boutons.',
            actions: [
              { instruction: 'Ouvre GitHub Desktop.' },
              { instruction: 'Menu « File », puis « Add Local Repository », et choisis le dossier de ton projet.' },
              { instruction: 'S’il te dit que ce n’est pas un dépôt, clique sur « create a repository » dans le message, puis sur « Create Repository ».' },
              { instruction: 'En bas à gauche, écris « premier envoi » dans le champ « Summary », puis clique sur « Commit to main ».' },
              { instruction: 'Clique sur « Publish repository » en haut.' },
              { instruction: 'Décoche « Keep this code private » si tu veux un dépôt public. Puis « Publish Repository ».' },
            ],
          },
          {
            title: 'Vérifie',
            body: 'Le code doit être visible depuis un autre appareil que le tien.',
            actions: [
              { instruction: 'Va sur github.com et ouvre ton profil.' },
              { instruction: 'Clique sur l’onglet « Repositories ». Ton projet doit apparaître.' },
              { instruction: 'Ouvre-le et vérifie que tu vois des fichiers.' },
              { instruction: 'Copie l’adresse de la page et colle-la en bas de l’étape.' },
            ],
          },
        ],
        checkpoints: [
          { label: 'Mon code est visible sur github.com', proofKind: 'url', proofField: 'repoUrl' },
          { label: 'Le dépôt contient bien mes fichiers' },
        ],
      },
      {
        title: 'Mets ton site en ligne',
        goal: 'Une adresse publique qui fonctionne.',
        why: 'C’est le moment où ton projet cesse d’être un dossier et devient un site. Tu peux l’envoyer à quelqu’un.',
        estimatedMinutes: 20,
        subSteps: [
          {
            title: 'Importe le projet dans Vercel',
            body: 'Ne touche à aucun réglage. Les valeurs par défaut sont les bonnes.',
            actions: [
              { instruction: 'Va sur vercel.com et connecte-toi.', externalUrl: 'https://vercel.com/new' },
              { instruction: 'Clique sur « Add New » en haut à droite, puis « Project ».' },
              { instruction: 'Dans la liste, trouve le dépôt qui porte le nom de ton projet.' },
              { instruction: 'S’il n’apparaît pas, clique sur « Adjust GitHub App Permissions » et autorise Vercel à voir ce dépôt.' },
              { instruction: 'Clique sur « Import ».' },
              { instruction: 'Ne touche à aucun réglage. Clique sur « Deploy ».' },
              { instruction: 'Attends. Deux minutes, c’est normal.' },
              { instruction: 'Quand tu vois les confettis, clique sur l’aperçu. Ton site est en ligne.' },
              { instruction: 'Copie l’adresse en .vercel.app et colle-la en bas de l’étape.' },
            ],
          },
          {
            title: 'Ouvre-le sur ton téléphone',
            body:
              'La plupart de tes visiteurs viendront d’un téléphone. Autant le voir tout de suite.',
            actions: [
              { instruction: 'Envoie-toi l’adresse par message.' },
              { instruction: 'Ouvre-la sur ton téléphone.' },
              { instruction: 'Fais défiler la page entière. Rien ne doit dépasser sur les côtés.' },
              { instruction: 'Si quelque chose dépasse, note-le : on le corrigera à la phase 13, pas maintenant.' },
            ],
          },
        ],
        checkpoints: [
          { label: 'Mon site est en ligne à une adresse publique', proofKind: 'url', proofField: 'deployUrl' },
          { label: 'Je l’ai ouvert sur mon téléphone' },
        ],
      },
    ],
  },
  {
    key: 'domaine',
    title: 'Nom de domaine',
    goal: 'Ton adresse à toi, pas celle de Vercel.',
    outcome: 'Son adresse à lui.',
    steps: [
      {
        title: 'Achète ton nom de domaine',
        goal: 'Une adresse que tu peux dire au téléphone.',
        why: 'Une adresse en .vercel.app dit « projet d’essai ». Un nom à toi dit « entreprise ». Pour douze euros par an, c’est la meilleure dépense du parcours.',
        estimatedMinutes: 20,
        subSteps: [
          {
            title: 'Achat',
            body:
              'Prends le nom que tu as choisi à l’étape 2. Si le .com est pris, le .fr fait très bien l’affaire pour une clientèle française.',
            actions: [
              { instruction: 'Va sur un vendeur de noms de domaine, par exemple OVH ou Namecheap.', externalUrl: 'https://www.ovhcloud.com/fr/domains/' },
              { instruction: 'Tape le nom de ton projet dans la recherche.' },
              { instruction: 'Choisis l’extension disponible la plus courte : .com, sinon .fr.' },
              { instruction: 'Refuse toutes les options proposées en plus : hébergement, e-mail, certificats. Tu n’en as besoin d’aucune.' },
              { instruction: 'Accepte en revanche la protection des données personnelles si elle est gratuite.' },
              { instruction: 'Paie. Note l’adresse exacte en bas de l’étape.' },
            ],
          },
        ],
        checkpoints: [
          { label: 'J’ai acheté mon nom de domaine', proofKind: 'text', proofField: 'domainName' },
        ],
      },
      {
        title: 'Branche ton domaine sur ton site',
        goal: 'Ton site répond à ton adresse.',
        why: 'C’est une manipulation de dix minutes qui fait peur et qui n’est pas difficile. Vercel te dit exactement quoi copier.',
        estimatedMinutes: 25,
        difficulty: 'medium',
        subSteps: [
          {
            title: 'Déclare le domaine dans Vercel',
            body: 'Vercel va te donner deux lignes à recopier chez ton vendeur de domaine.',
            actions: [
              { instruction: 'Ouvre ton projet sur vercel.com.' },
              { instruction: 'Clique sur l’onglet « Settings », puis « Domains » dans le menu de gauche.' },
              { instruction: 'Tape ton nom de domaine dans le champ, puis clique sur « Add ».' },
              { instruction: 'Choisis l’option recommandée quand on te propose d’ajouter aussi le « www ».' },
              { instruction: 'Vercel affiche un tableau avec « Type », « Name » et « Value ». Garde cette page ouverte.' },
            ],
          },
          {
            title: 'Recopie chez ton vendeur',
            body:
              'Tu vas recopier exactement ce que Vercel affiche. À la lettre, sans rien ajouter.',
            actions: [
              { instruction: 'Ouvre un second onglet sur le site où tu as acheté le domaine, et connecte-toi.' },
              { instruction: 'Cherche une section appelée « Zone DNS », « DNS » ou « Gestion des enregistrements ».' },
              { instruction: 'Ajoute un enregistrement avec exactement les valeurs que Vercel affiche pour le type « A ».' },
              { instruction: 'Ajoute le second enregistrement, de type « CNAME », de la même façon.' },
              { instruction: 'Enregistre.' },
              { instruction: 'Reviens sur Vercel. La pastille passera au vert. Ça peut prendre dix minutes comme deux heures : c’est normal et tu n’y peux rien.' },
              { instruction: 'Quand c’est vert, ouvre ton domaine dans un nouvel onglet. Ton site doit s’afficher.' },
            ],
          },
        ],
        checkpoints: [
          { label: 'Mon site s’affiche à mon nom de domaine', proofKind: 'url' },
          { label: 'Le cadenas de sécurité apparaît dans la barre d’adresse' },
        ],
      },
    ],
  },
];
