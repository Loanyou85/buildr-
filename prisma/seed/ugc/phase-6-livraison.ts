import type { PhaseSeed } from './types';

/** Phase 6 — Livraison : livrer proprement, se faire payer, préparer le contrat suivant. */
export const phase6: PhaseSeed = {
  title: 'Livraison',
  goal: 'Produire, livrer et encaisser sans accroc, et transformer ce premier client en client récurrent.',
  steps: [
    {
      number: 19,
      title: 'Cadrer le brief',
      goal: 'Obtenir de la marque toutes les informations nécessaires avant de filmer, en un seul échange.',
      why: 'Un brief incomplet se paie en retournages. Les retournages ne sont pas facturés, et c’est ce qui fait qu’un contrat rentable devient un contrat à perte.',
      estimatedMinutes: 40,
      difficulty: 'easy',
      subSteps: [
        {
          title: 'Envoyer le questionnaire de brief',
          body: [
            'Sept questions, envoyées en une fois, dès l’acompte reçu.',
            '',
            '1. Quel produit exactement, quelle référence ?',
            '2. À qui s’adresse-t-il en priorité ?',
            '3. Quel bénéfice doit ressortir dans la vidéo ?',
            '4. Y a-t-il des mentions obligatoires ou interdites ? (allégations santé, promotions, prix)',
            '5. Où la vidéo sera-t-elle diffusée : publicité Meta, TikTok, page produit ?',
            '6. Avez-vous des exemples de vidéos que vous aimez ?',
            '7. Quand recevrai-je le produit ?',
          ].join('\n'),
          actions: [
            { instruction: 'Copie les sept questions dans un e-mail et envoie-les dès l’acompte reçu.', templateRef: 'ugc.brief.questions' },
            { instruction: 'Fais préciser la question 4 : c’est celle qui provoque le plus de refus à la livraison, surtout sur les compléments et les cosmétiques.' },
            { instruction: 'Note la date de réception du produit dans ton tableau : c’est elle qui démarre le délai de 7 jours, pas la date de signature.' },
          ],
        },
        {
          title: 'Valider les angles avant de filmer',
          body: [
            'Tu envoies tes trois accroches **avant** de tourner, en demandant une validation. Cinq minutes de lecture pour la marque, plusieurs heures de tournage économisées pour toi.',
          ].join('\n'),
          actions: [
            { instruction: 'Écris tes trois accroches en une phrase chacune, sur la base des réponses du brief.' },
            { instruction: 'Envoie-les avec une question fermée.', example: 'Voici les trois angles que je propose. Vous validez, ou vous voulez en changer un ?' },
            { instruction: 'Attends la validation avant de tourner. Si la marque ne répond pas sous 48 h, relance une fois puis pars sur tes angles en le disant par écrit.' },
          ],
        },
      ],
      checkpoints: [
        { label: 'Les sept questions de brief sont envoyées' },
        { label: 'Les mentions obligatoires et interdites sont écrites noir sur blanc' },
        { label: 'Mes trois angles sont validés par la marque' },
        { label: 'La date de réception du produit est notée' },
      ],
      resources: [
        {
          type: 'template',
          title: 'Questionnaire de brief',
          body: '1. Quel produit exactement, quelle référence ?\n2. À qui s’adresse-t-il en priorité ?\n3. Quel bénéfice doit ressortir ?\n4. Mentions obligatoires ou interdites ?\n5. Où la vidéo sera-t-elle diffusée ?\n6. Exemples de vidéos que vous aimez ?\n7. Quand recevrai-je le produit ?',
        },
      ],
    },
    {
      number: 20,
      title: 'Produire les vidéos',
      goal: 'Tourner et monter les trois vidéos commandées, au niveau de tes exemples de portfolio.',
      why: 'La première livraison décide si ce client revient. Le travail est le même qu’à l’étape 8 : la différence est qu’il est payé, et qu’il doit respecter le brief à la lettre.',
      estimatedMinutes: 300,
      difficulty: 'medium',
      subSteps: [
        {
          title: 'Tourner dans les conditions du brief',
          body: [
            'Tu reprends exactement la méthode de l’étape 8, avec trois ajouts :',
            '',
            '- tu respectes les mentions obligatoires et tu évites les mentions interdites, mot pour mot ;',
            '- tu filmes **2 accroches différentes par vidéo** : c’est ce que tu as vendu ;',
            '- tu filmes plus de plans de produit que nécessaire : ce sont eux qui sauvent un montage.',
          ].join('\n'),
          actions: [
            { instruction: 'Relis le brief avant de commencer à filmer, en particulier la question 4.' },
            { instruction: 'Filme les 3 vidéos, chacune avec ses 2 variantes d’accroche : 6 accroches au total.' },
            { instruction: 'Filme au moins 6 plans du produit seul : dans la main, ouvert, en usage, posé, macro, en contexte.' },
            { instruction: 'Vérifie chaque prise avant de ranger le matériel : son, lumière, netteté. Une prise ratée découverte au montage, c’est une demi-journée perdue.' },
          ],
        },
        {
          title: 'Monter et contrôler',
          body: [
            'Avant de livrer, tu passes ce contrôle en six points. Aucun n’est facultatif.',
          ].join('\n'),
          actions: [
            { instruction: 'Format vertical 9:16, 1080p minimum, 30 fps.' },
            { instruction: 'Sous-titres présents et relus, sans faute.' },
            { instruction: 'Aucun silence de plus de 0,4 seconde.' },
            { instruction: 'Le produit est visible et lisible dans les 8 premières secondes.' },
            { instruction: 'Les mentions obligatoires apparaissent, les mentions interdites sont absentes.' },
            { instruction: 'Nommage des fichiers cohérent : marque-produit-accroche-01.mp4.' },
          ],
        },
      ],
      checkpoints: [
        { label: 'Les 3 vidéos sont tournées avec 2 accroches chacune' },
        { label: 'Le contrôle en six points est passé sur chaque fichier' },
        { label: 'Les mentions obligatoires du brief sont respectées' },
      ],
      resources: [
        {
          type: 'checklist',
          title: 'Contrôle avant livraison',
          body: '1. Vertical 9:16, 1080p, 30 fps\n2. Sous-titres relus\n3. Aucun silence > 0,4 s\n4. Produit lisible dans les 8 premières secondes\n5. Mentions obligatoires présentes, interdites absentes\n6. Fichiers nommés marque-produit-accroche-01.mp4',
        },
      ],
    },
    {
      number: 21,
      title: 'Livrer',
      goal: 'Remettre les fichiers dans un dossier propre, avec un message qui cadre les retouches.',
      why: 'Une livraison sans cadre ouvre la porte aux retouches infinies. Deux phrases suffisent à fixer la limite, et elles doivent être écrites au moment de la livraison, pas après la première demande.',
      estimatedMinutes: 40,
      difficulty: 'easy',
      subSteps: [
        {
          title: 'Préparer le dossier',
          body: [
            'Un seul lien, une arborescence claire :',
            '',
            '```',
            '[Marque] - Livraison UGC/',
            '  01-videos-montees/',
            '  02-accroches-variantes/',
            '  03-rushes/',
            '  lisez-moi.txt',
            '```',
          ].join('\n'),
          actions: [
            { instruction: 'Crée l’arborescence ci-dessus dans Google Drive ou WeTransfer et téléverse les fichiers.', externalUrl: 'https://drive.google.com/' },
            { instruction: 'Écris le fichier lisez-moi.txt : liste des fichiers, format, durée, angle de chaque vidéo, et la durée des droits cédés.' },
            { instruction: 'Règle le partage du lien sur « toute personne disposant du lien » et teste-le en navigation privée.' },
          ],
        },
        {
          title: 'Le message de livraison',
          body: [
            'Il fait trois choses : il livre, il cadre les retouches, il ouvre la suite.',
          ].join('\n'),
          actions: [
            {
              instruction: 'Envoie ce message avec le lien.',
              templateRef: 'ugc.livraison.message',
              example:
                'Bonjour [prénom], voici la livraison : 3 vidéos montées, 6 accroches et les rushes. Une série de retouches est incluse, dites-moi d’ici 7 jours si vous voulez ajuster quelque chose. Si vous testez les accroches en publicité, je veux bien savoir laquelle sort en tête : ça m’aide à viser juste pour la prochaine série.',
            },
            { instruction: 'Émets la facture de solde le jour de la livraison, pas une semaine après.' },
            { instruction: 'Note la date de livraison et la date limite de retouches dans ton tableau.' },
          ],
        },
      ],
      checkpoints: [
        { label: 'Le dossier est organisé et le lien fonctionne en navigation privée' },
        { label: 'Le message de livraison cadre les retouches (une série, 7 jours)' },
        { label: 'La facture de solde est émise' },
      ],
      resources: [
        {
          type: 'template',
          title: 'Message de livraison',
          body: 'Bonjour [prénom], voici la livraison : 3 vidéos montées, 6 accroches et les rushes. Une série de retouches est incluse, dites-moi d’ici 7 jours si vous voulez ajuster quelque chose. Si vous testez les accroches en publicité, je veux bien savoir laquelle sort en tête.',
        },
      ],
    },
    {
      number: 22,
      title: 'Obtenir le paiement et la suite',
      goal: 'Encaisser le solde et poser la question qui ouvre le deuxième contrat.',
      why: 'Le deuxième contrat avec un client existant demande dix fois moins d’effort que le premier avec un inconnu. La question se pose au bon moment : juste après une livraison réussie.',
      estimatedMinutes: 35,
      difficulty: 'easy',
      subSteps: [
        {
          title: 'Encaisser',
          body: [
            'Le délai de paiement légal entre professionnels est de 30 jours à défaut d’accord contraire. Tu relances, et tu le fais sans gêne : ce n’est pas une faveur, c’est une facture.',
          ].join('\n'),
          actions: [
            { instruction: 'Note la date d’échéance de ta facture dans ton tableau.' },
            { instruction: 'À J+7 après l’échéance, relance par e-mail, simplement.', example: 'Bonjour [prénom], petit rappel pour la facture [numéro] échue le [date]. Pouvez-vous me confirmer la date de règlement ?' },
            { instruction: 'À J+15, relance par téléphone. Un appel règle en deux minutes ce que trois e-mails ne règlent pas.' },
            { instruction: 'Quand le paiement arrive, enregistre le jalon « premier revenu » dans Nexteo. Le montant reste déclaratif et privé tant que tu ne publies rien.' },
          ],
        },
        {
          title: 'Ouvrir le contrat suivant',
          body: [
            'Tu poses la question **entre 3 et 7 jours après la livraison**, quand la marque a eu le temps de diffuser mais pas celui d’oublier.',
          ].join('\n'),
          actions: [
            {
              instruction: 'Envoie ce message.',
              example:
                'Bonjour [prénom], est-ce que les vidéos ont tourné ? Si une accroche sort du lot, je peux en produire 3 variantes sur le même angle pour la prochaine série.',
            },
            { instruction: 'S’ils sont satisfaits, propose le pack mensuel de l’étape 5 : c’est le moment où il se vend le mieux.' },
            { instruction: 'Demande une phrase de recommandation écrite. Deux lignes suffisent, et elles serviront dans ta prospection : une recommandation réelle vaut dix arguments.' },
            { instruction: 'Reprends ta prospection là où tu l’avais laissée : ton tableau contient encore des marques au statut « à contacter ».' },
          ],
        },
      ],
      checkpoints: [
        { label: 'Le solde est encaissé' },
        { label: 'J’ai posé la question du contrat suivant' },
        { label: 'J’ai demandé une recommandation écrite', isRequired: false },
        { label: 'J’ai enregistré le jalon premier revenu', isRequired: false },
      ],
      resources: [
        {
          type: 'script',
          title: 'Relance de paiement',
          body: 'J+7 après échéance, par e-mail : « Bonjour [prénom], petit rappel pour la facture [numéro] échue le [date]. Pouvez-vous me confirmer la date de règlement ? »\nJ+15 : appel téléphonique.',
        },
        {
          type: 'script',
          title: 'Question du contrat suivant',
          body: 'Bonjour [prénom], est-ce que les vidéos ont tourné ? Si une accroche sort du lot, je peux en produire 3 variantes sur le même angle pour la prochaine série.',
        },
      ],
    },
  ],
};
