import type { PhaseSeed } from './types';

export const PHASES_10_13: PhaseSeed[] = [
  {
    key: 'page-de-vente',
    title: 'Page de vente',
    goal: 'Une page qui explique ce que tu vends, à qui, et pourquoi c’est pour eux.',
    outcome: 'Une landing qui convertit.',
    steps: [
      {
        title: 'Écris les textes avant de construire',
        goal: 'Les mots d’abord, le design ensuite.',
        why: 'Une belle page qui ne dit rien ne vend rien. Tu as dix conversations notées mot pour mot à la phase 2 : c’est ton matériau, et il est meilleur que tout ce que tu pourrais inventer.',
        estimatedMinutes: 60,
        difficulty: 'medium',
        subSteps: [
          {
            title: 'Ressors tes dix conversations',
            body:
              'Tu ne vas pas écrire ta page. Tu vas la recopier depuis ce que tes futurs clients t’ont dit.',
            actions: [
              { instruction: 'Relis tes dix comptes rendus de la phase 2.' },
              { instruction: 'Surligne chaque phrase où quelqu’un décrit sa corvée avec ses propres mots.' },
              { instruction: 'Choisis la formulation qui revient le plus souvent : c’est ton titre.' },
              { instruction: 'Choisis les trois conséquences les plus citées : c’est ta section « le problème ».' },
              { instruction: 'Choisis l’objection qui est revenue le plus : elle ira dans ta FAQ.' },
            ],
          },
          {
            title: 'Fais rédiger la page',
            body:
              'Le prompt de textes reprend ta phrase, ton client et les formulations que tu viens de choisir.',
            actions: [
              { instruction: 'Colle le prompt de structure de page.', promptTemplateSlug: 'vente-structure' },
              { instruction: 'Colle le prompt de textes.', promptTemplateSlug: 'vente-textes' },
              { instruction: 'Relis chaque phrase. Supprime tout ce que tu ne pourrais pas dire en face à quelqu’un.' },
              { instruction: 'Vérifie qu’aucune phrase ne promet un revenu, ni à toi ni à ton client. C’est interdit par la loi française sur les pratiques commerciales trompeuses, et ça détruit la confiance.' },
            ],
          },
        ],
        checkpoints: [
          { label: 'Mon titre vient d’une phrase dite par une vraie personne' },
          { label: 'Ma page nomme un métier précis' },
          { label: 'Aucune phrase ne promet un revenu ni un résultat garanti' },
        ],
      },
      {
        title: 'Construis la page',
        goal: 'La page en ligne, lisible sur un téléphone.',
        why: 'La moitié de tes visiteurs arriveront d’un lien envoyé par message, sur un téléphone, debout. Si ça ne se lit pas là, ça ne se lit pas.',
        estimatedMinutes: 45,
        subSteps: [
          {
            title: 'Le prompt d’animations, en dernier',
            body:
              'Structure, textes, puis animations. Dans l’autre ordre, tu passes une heure à animer des blocs que tu vas supprimer.',
            actions: [
              { instruction: 'Colle le prompt d’animations.', promptTemplateSlug: 'vente-animations' },
              { instruction: 'Ouvre la page sur ton téléphone.' },
              { instruction: 'Fais défiler du haut en bas. Rien ne doit dépasser sur les côtés.' },
              { instruction: 'Vérifie que le bouton principal est atteignable avec le pouce, sans zoomer.' },
              { instruction: 'Montre la page à quelqu’un qui ne connaît pas ton projet. Demande-lui : « à qui ça s’adresse ? » S’il hésite, ton titre n’est pas assez précis.' },
            ],
          },
        ],
        checkpoints: [
          { label: 'La page est en ligne' },
          { label: 'Elle se lit sur un téléphone sans zoomer' },
          { label: 'Une personne extérieure a compris à qui ça s’adresse' },
        ],
      },
    ],
  },
  {
    key: 'trente-videos',
    title: 'Les trente vidéos',
    goal: 'Un mois de contenu prêt à tourner.',
    outcome: 'Le plan de contenu généré.',
    steps: [
      {
        title: 'Génère tes trente scripts',
        goal: 'Trente scripts, un par jour, écrits pour ton produit.',
        why: 'Le plus dur dans la publication quotidienne n’est pas de filmer, c’est de décider quoi dire. Si c’est déjà écrit, il ne reste qu’à appuyer sur enregistrer.',
        estimatedMinutes: 30,
        subSteps: [
          {
            title: 'Lance la génération',
            body:
              'Les scripts s’appuient sur ton idée, ton secteur et ce que tu as accepté de faire — si tu as dit que tu ne voulais pas te filmer, aucun script ne te le demandera.',
            actions: [
              { instruction: 'Ouvre l’écran « Mes vidéos » depuis le menu.' },
              { instruction: 'Clique sur « Générer mes trente scripts ».' },
              { instruction: 'Attends. La génération prend une à deux minutes.' },
              { instruction: 'Lis les six premiers : ce sont ceux que tu peux tourner dès aujourd’hui, avant d’avoir le moindre utilisateur.' },
              { instruction: 'Régénère individuellement ceux qui ne te ressemblent pas. Ne régénère pas tout : tu perdrais ceux qui sont bons.' },
            ],
          },
        ],
        checkpoints: [
          { label: 'Mes trente scripts sont générés' },
          { label: 'J’ai lu les six premiers' },
        ],
      },
      {
        title: 'Tourne les six premières',
        goal: 'Six vidéos enregistrées, avant de publier quoi que ce soit.',
        why: 'Tourner six vidéos d’un coup prend deux heures. En tourner une par jour prend six jours et s’arrête au troisième. Prends l’avance maintenant.',
        estimatedMinutes: 150,
        difficulty: 'medium',
        subSteps: [
          {
            title: 'Prépare',
            body: 'Rien de compliqué : un téléphone, une fenêtre, et le silence.',
            actions: [
              { instruction: 'Installe-toi face à une fenêtre, la lumière sur toi, pas derrière toi.' },
              { instruction: 'Pose ton téléphone sur quelque chose de stable, à hauteur des yeux.' },
              { instruction: 'Ouvre le script 1 sur un autre écran, ou apprends juste l’accroche par cœur.' },
            ],
          },
          {
            title: 'Enregistre',
            body:
              'La première phrase décide de tout. Les quinze premiers mots doivent tenir dans une seconde et demie.',
            actions: [
              { instruction: 'Enregistre le script 1. Si tu bafouilles, recommence la phrase, pas la vidéo.' },
              { instruction: 'Enchaîne les six sans regarder les résultats entre deux.' },
              { instruction: 'Marque chaque script comme « tourné » dans le calendrier.' },
              { instruction: 'Si tu as choisi de ne pas apparaître, filme ton écran pendant que tu utilises ton produit, et enregistre ta voix par-dessus.' },
            ],
          },
        ],
        checkpoints: [
          { label: 'Six vidéos sont enregistrées' },
          { label: 'Elles sont marquées « tourné » dans le calendrier' },
        ],
      },
    ],
  },
  {
    key: 'publier-vendre',
    title: 'Publier et vendre',
    goal: 'Tes premiers utilisateurs, et tes premières vraies objections.',
    outcome: 'Premiers utilisateurs.',
    steps: [
      {
        title: 'Publie sept jours de suite',
        goal: 'Une vidéo par jour, sans exception, pendant une semaine.',
        why: 'Les plateformes ne montrent rien à un compte irrégulier. Sept jours ne te rendront pas célèbre, mais ils te diront lequel de tes angles intéresse quelqu’un.',
        estimatedMinutes: 90,
        subSteps: [
          {
            title: 'Publie',
            body:
              'Même heure chaque jour. La légende et le commentaire épinglé sont déjà écrits dans chaque script.',
            actions: [
              { instruction: 'Choisis une heure et tiens-la. Le matin avant le travail marche très bien.' },
              { instruction: 'Publie la vidéo du jour, colle la légende du script.' },
              { instruction: 'Épingle le commentaire prévu dans le script : c’est lui qui déclenche les réponses.' },
              { instruction: 'Réponds à chaque commentaire le jour même, en une phrase.' },
              { instruction: 'Marque le script comme « publié ».' },
              { instruction: 'Au bout de sept jours, regarde lequel des angles a le plus retenu l’attention. Fais-en trois de plus la semaine suivante.' },
            ],
          },
        ],
        checkpoints: [
          { label: 'J’ai publié sept jours de suite' },
          { label: 'J’ai répondu à tous les commentaires' },
          { label: 'Je sais quel angle a le mieux marché' },
        ],
      },
      {
        title: 'Reviens vers tes dix personnes',
        goal: 'Leur montrer ce que tu as construit à partir de ce qu’elles t’ont dit.',
        why: 'Ce sont tes clients les plus probables, et tu leur dois un retour. Elles t’ont donné quinze minutes : elles veulent savoir ce que ça a donné.',
        estimatedMinutes: 60,
        subSteps: [
          {
            title: 'Le message de retour',
            body:
              'Tu ne vends pas. Tu montres. La vente vient d’elle-même quand la personne se reconnaît dans ce que tu as construit.',
            actions: [
              { instruction: 'Reprends ta liste de la phase 2.' },
              { instruction: 'Écris à chacune, une par une : « Tu m’avais dit que [sa phrase exacte]. J’ai construit ça. Est-ce que tu veux l’essayer ? »' },
              { instruction: 'Cite sa phrase à elle, pas une phrase générique. C’est toute la différence.' },
              { instruction: 'Propose de le mettre en place avec elle, en direct, pendant vingt minutes.' },
              { instruction: 'Note ce qui bloque quand quelqu’un refuse. C’est ce qui manque à ton produit ou à ta page.' },
            ],
          },
        ],
        checkpoints: [
          { label: 'J’ai recontacté les dix personnes' },
          { label: 'Au moins une a essayé le produit' },
          { label: 'J’ai noté les raisons des refus' },
        ],
      },
    ],
  },
  {
    key: 'premier-euro',
    title: 'Premier euro',
    goal: 'Un paiement réel, par quelqu’un qui n’est pas toi.',
    outcome: 'Jalon final du MVP.',
    steps: [
      {
        title: 'Passe en production',
        goal: 'Quitter le mode test de Stripe.',
        why: 'Tant que tu es en mode test, aucune vraie carte ne fonctionne. C’est l’erreur la plus fréquente : un client veut payer, la carte est refusée, il ne revient pas.',
        estimatedMinutes: 30,
        difficulty: 'medium',
        subSteps: [
          {
            title: 'Bascule les clés',
            body:
              'Tes clés de test commencent par sk_test_ et pk_test_. Tes clés réelles commencent par sk_live_ et pk_live_. Il faut aussi refaire le produit, le prix et le webhook : le mode test et le mode réel ne partagent rien.',
            actions: [
              { instruction: 'Dans Stripe, vérifie que ta vérification d’identité est terminée. Sans elle, le mode réel reste fermé.' },
              { instruction: 'Bascule l’interrupteur « Mode test » sur désactivé.' },
              { instruction: 'Recrée ton produit et ton prix, exactement comme en test. Copie le nouvel identifiant price_.' },
              { instruction: 'Dans « Développeurs », « Clés API », copie la clé publiable pk_live_ et révèle la clé secrète sk_live_.' },
              { instruction: 'Recrée le webhook vers la même adresse /api/stripe/webhook, avec les mêmes événements. Copie le nouveau secret whsec_.' },
              { instruction: 'Sur Vercel, remplace les cinq valeurs dans « Environment Variables ».' },
              { instruction: 'Redéploie depuis Vercel : onglet « Deployments », les trois points sur le dernier, puis « Redeploy ».' },
            ],
          },
          {
            title: 'Vérifie que tu es bien en production',
            body:
              'Le tableau de bord Stripe se souvient du dernier interrupteur que tu as utilisé, pas de ce qui tourne sur ton site. La seule preuve fiable est le préfixe de la clé qui tourne réellement.',
            actions: [
              { instruction: 'Sur Vercel, ouvre « Environment Variables » et vérifie que ta clé secrète commence bien par sk_live_.' },
              { instruction: 'Vérifie qu’aucune variable ne contient encore une valeur en _test_.' },
              { instruction: 'Ouvre ton site et lance un paiement. La carte de test 4242 doit maintenant être refusée : c’est la preuve que tu es en production.' },
              { instruction: 'Annule ce paiement avant de le valider avec ta vraie carte.' },
            ],
          },
        ],
        checkpoints: [
          { label: 'Ma vérification d’identité Stripe est terminée' },
          { label: 'Mes clés en ligne commencent par sk_live_ et pk_live_' },
          { label: 'Le webhook de production est déclaré et reçoit des événements' },
          { label: 'La carte de test n’est plus acceptée' },
        ],
      },
      {
        title: 'Encaisse ton premier paiement',
        goal: 'Quelqu’un d’autre que toi a payé.',
        why: 'C’est la seule mesure qui compte, et c’est le jalon final du parcours. Tout ce que tu as construit existait déjà avant. Ce qui change aujourd’hui, c’est que quelqu’un a estimé que ça valait de l’argent.',
        estimatedMinutes: 45,
        subSteps: [
          {
            title: 'Accompagne la première vente',
            body:
              'Le premier client ne s’abonne presque jamais tout seul. Tu le fais avec lui, en direct, et tu regardes où ça coince.',
            actions: [
              { instruction: 'Reprends la personne la plus intéressée de la phase 12.' },
              { instruction: 'Propose vingt minutes en direct pour mettre en place son compte.' },
              { instruction: 'Fais-lui créer son compte pendant que tu regardes. Ne touche pas à sa souris : tu apprends plus en la regardant se tromper.' },
              { instruction: 'Note chaque hésitation. Chacune est un correctif à faire.' },
              { instruction: 'Quand elle est prête, laisse-la payer elle-même.' },
              { instruction: 'Vérifie dans Stripe que le paiement est arrivé, et que son accès est ouvert.' },
            ],
          },
          {
            title: 'Marque le jalon',
            body:
              'Tu peux enregistrer ce jalon dans Nexteo. Le montant reste déclaré tant qu’il n’est pas vérifié — et il n’est vérifié que si tu connectes Stripe en lecture.',
            actions: [
              { instruction: 'Ouvre l’écran « Mes jalons ».' },
              { instruction: 'Marque « Premier euro » et note le montant réel.' },
              { instruction: 'Si tu veux partager, la carte se compose toute seule. Rien n’est public sans ton accord.' },
            ],
          },
        ],
        checkpoints: [
          { label: 'Une personne qui n’est pas moi a payé', proofKind: 'text' },
          { label: 'Le paiement apparaît dans mon tableau de bord Stripe' },
          { label: 'Son accès est ouvert' },
        ],
      },
    ],
  },
];
