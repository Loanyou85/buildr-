import type { PhaseSeed } from './types';

export const PHASES_7_9: PhaseSeed[] = [
  {
    key: 'comptes-utilisateurs',
    title: 'Comptes utilisateurs',
    goal: 'Tes clients peuvent créer un compte et se reconnecter.',
    outcome: 'Inscription et connexion qui marchent.',
    steps: [
      {
        title: 'Ajoute l’inscription et la connexion',
        goal: 'Un visiteur peut créer un compte et revenir.',
        why: 'Sans compte, tu ne peux ni garder les données d’un client, ni lui faire payer un abonnement. C’est la fondation de tout ce qui suit.',
        estimatedMinutes: 50,
        difficulty: 'medium',
        subSteps: [
          {
            title: 'Les trois prompts de comptes',
            body:
              'Dans cet ordre. Le troisième dépend du deuxième, qui dépend du premier.',
            actions: [
              { instruction: 'Colle le prompt d’inscription.', promptTemplateSlug: 'comptes-inscription' },
              { instruction: 'Attends la fin, puis colle le prompt de connexion.', promptTemplateSlug: 'comptes-connexion' },
              { instruction: 'Attends la fin, puis colle le prompt de profil.', promptTemplateSlug: 'comptes-profil' },
              { instruction: 'Demande à Claude de relancer le site, et ouvre l’aperçu.' },
            ],
          },
          {
            title: 'Mets les secrets au bon endroit',
            body:
              'Une clé secrète ne se colle jamais dans un prompt et ne part jamais sur GitHub. Elle vit dans un fichier à part, et sur Vercel.',
            actions: [
              { instruction: 'Demande à Claude : « quelles variables d’environnement ce projet attend-il ? »' },
              { instruction: 'Pour chacune, demande-lui où la trouver. Ne les invente pas.' },
              { instruction: 'Sur Vercel, ouvre ton projet, « Settings », puis « Environment Variables ».' },
              { instruction: 'Ajoute chaque variable, une par une, avec sa valeur. Coche les trois environnements proposés.' },
              { instruction: 'Vérifie que le fichier .env n’apparaît pas sur GitHub. S’il y est, dis-le à Claude : « le fichier .env est dans le dépôt, retire-le et ajoute-le au .gitignore ».' },
            ],
          },
        ],
        checkpoints: [
          { label: 'Je peux créer un compte sur mon site' },
          { label: 'Je peux me déconnecter et me reconnecter' },
          { label: 'Aucune clé secrète n’est visible sur GitHub' },
        ],
      },
      {
        title: 'Teste comme un vrai utilisateur',
        goal: 'Vérifier que ça marche vraiment, pas seulement pour toi.',
        why: 'Ça marche presque toujours dans ton navigateur, où tu es déjà connecté. C’est dans une fenêtre privée que les vrais problèmes apparaissent.',
        estimatedMinutes: 20,
        subSteps: [
          {
            title: 'La fenêtre privée',
            body: 'Une fenêtre privée ne connaît rien de toi. C’est exactement ce que voit ton premier client.',
            actions: [
              { instruction: 'Ouvre une fenêtre de navigation privée : Ctrl + Maj + N (Windows) ou Cmd + Maj + N (Mac).' },
              { instruction: 'Va sur ton site en ligne, pas sur l’aperçu local.' },
              { instruction: 'Crée un compte avec une adresse e-mail différente de la tienne.' },
              { instruction: 'Déconnecte-toi, puis reconnecte-toi avec ce compte.' },
              { instruction: 'Essaie un mot de passe faux. Un message clair doit s’afficher, pas une page d’erreur.' },
              { instruction: 'Fais le même test depuis ton téléphone.' },
            ],
          },
        ],
        checkpoints: [
          { label: 'L’inscription marche depuis une fenêtre privée' },
          { label: 'Un mauvais mot de passe affiche un message clair' },
          { label: 'Ça marche aussi depuis mon téléphone' },
        ],
      },
    ],
  },
  {
    key: 'base-de-donnees',
    title: 'Base de données',
    goal: 'Ce que tes clients saisissent ne disparaît plus.',
    outcome: 'Les données persistent.',
    steps: [
      {
        title: 'Crée ta base de données',
        goal: 'Une base hébergée, reliée à ton site.',
        why: 'Jusqu’ici, tout disparaît au rechargement. Une base, c’est ce qui fait la différence entre une maquette et un produit.',
        estimatedMinutes: 30,
        difficulty: 'medium',
        subSteps: [
          {
            title: 'Crée la base depuis Vercel',
            body:
              'Vercel propose des bases en deux clics, hébergées en Europe. Choisis bien la région : les données de tes clients doivent rester dans l’Union européenne.',
            actions: [
              { instruction: 'Ouvre ton projet sur vercel.com, puis l’onglet « Storage ».' },
              { instruction: 'Clique sur « Create Database », puis choisis une base Postgres.' },
              { instruction: 'Dans « Region », choisis une région européenne — Frankfurt ou Paris.' },
              { instruction: 'Clique sur « Create », puis sur « Connect » pour la relier à ton projet.' },
              { instruction: 'Vercel ajoute tout seul les variables d’environnement. Tu n’as rien à copier.' },
            ],
          },
          {
            title: 'Fais créer les tables',
            body: 'Les tables sont décrites par Claude à partir de ta spécification, puis créées d’un coup.',
            actions: [
              { instruction: 'Colle le prompt de schéma de données.', promptTemplateSlug: 'donnees-schema' },
              { instruction: 'Relis la liste des tables proposées. Elle doit correspondre à ce que ton produit manipule.' },
              { instruction: 'Colle le prompt de migration.', promptTemplateSlug: 'donnees-migration' },
              { instruction: 'Colle le prompt de données de départ.', promptTemplateSlug: 'donnees-seed' },
              { instruction: 'Si une erreur parle de « migration », copie-la et utilise « Ça ne marche pas ».' },
            ],
          },
        ],
        checkpoints: [
          { label: 'Ma base est créée et hébergée dans l’Union européenne' },
          { label: 'Les tables existent' },
        ],
      },
      {
        title: 'Vérifie que les données restent',
        goal: 'Ce qui est saisi survit à un rechargement et à un déploiement.',
        why: 'C’est le test qui sépare une démonstration d’un produit. Fais-le maintenant, pas devant un client.',
        estimatedMinutes: 20,
        subSteps: [
          {
            title: 'Le test du rechargement',
            body: 'Trois vérifications, dans cet ordre. Si l’une échoue, ne passe pas à la suite.',
            actions: [
              { instruction: 'Sur ton site en ligne, crée une donnée : un client, une fiche, ce que ton produit manipule.' },
              { instruction: 'Recharge la page. La donnée doit être encore là.' },
              { instruction: 'Ferme complètement le navigateur, rouvre, reconnecte-toi. Elle doit être encore là.' },
              { instruction: 'Demande à Claude de faire un petit changement visuel et de redéployer. Après le déploiement, la donnée doit être encore là.' },
            ],
          },
        ],
        checkpoints: [
          { label: 'Une donnée créée survit au rechargement' },
          { label: 'Elle survit à une reconnexion' },
          { label: 'Elle survit à un nouveau déploiement' },
        ],
      },
    ],
  },
  {
    key: 'encaisser',
    title: 'Encaisser',
    goal: 'Ton site sait prendre un paiement.',
    outcome: 'Stripe branché, un vrai paiement test passé.',
    steps: [
      {
        title: 'Crée ton offre dans Stripe',
        goal: 'Un produit et un prix, en mode test.',
        why: 'Le prix ne vit pas dans ton code. Il vit chez Stripe. C’est ce qui te permettra de le changer sans redéployer.',
        estimatedMinutes: 20,
        subSteps: [
          {
            title: 'Le produit et le prix',
            body:
              'Reste en mode test. L’interrupteur est en haut à droite du tableau de bord Stripe.',
            actions: [
              { instruction: 'Va sur dashboard.stripe.com et vérifie que « Mode test » est activé.', externalUrl: 'https://dashboard.stripe.com/test/products' },
              { instruction: 'Dans le menu de gauche, clique sur « Catalogue de produits », puis « Ajouter un produit ».' },
              { instruction: 'Mets le nom de ton offre et une description d’une ligne.' },
              { instruction: 'Dans « Modèle de tarification », choisis « Forfaitaire ».' },
              { instruction: 'Entre ton prix mensuel et choisis « Récurrent », puis « Mensuel ».' },
              { instruction: 'Clique sur « Enregistrer le produit ».' },
              { instruction: 'Sur la fiche du produit, repère l’identifiant du prix : il commence par price_. Copie-le.' },
            ],
          },
          {
            title: 'Récupère tes clés',
            body:
              'Deux clés, deux usages. La clé publique peut être vue par tout le monde. La clé secrète, jamais — ni dans un prompt, ni sur GitHub, ni dans une capture d’écran.',
            actions: [
              { instruction: 'Dans Stripe, clique sur « Développeurs », puis « Clés API ».' },
              { instruction: 'Copie la clé publiable, celle qui commence par pk_test_.' },
              { instruction: 'Clique sur « Révéler » pour la clé secrète, celle qui commence par sk_test_, et copie-la.' },
              { instruction: 'Sur Vercel : « Settings », « Environment Variables ». Ajoute les deux clés et l’identifiant de prix.' },
              { instruction: 'Ne colle jamais la clé secrète dans une conversation avec Claude. Si tu l’as fait, retourne dans Stripe et clique sur « Faire tourner » pour la remplacer.' },
            ],
          },
        ],
        checkpoints: [
          { label: 'Mon produit et mon prix existent dans Stripe, en mode test' },
          { label: 'Mes clés sont dans les variables d’environnement de Vercel' },
          { label: 'Aucune clé secrète ne figure dans une conversation ou sur GitHub' },
        ],
      },
      {
        title: 'Branche le paiement',
        goal: 'Un bouton qui emmène vers une vraie page de paiement.',
        why: 'Quatre prompts, dans l’ordre. Le webhook est le seul qui donne l’accès : c’est lui qui empêche quelqu’un de s’offrir ton produit en fabriquant une adresse.',
        estimatedMinutes: 60,
        difficulty: 'hard',
        subSteps: [
          {
            title: 'Les quatre prompts de paiement',
            body:
              'Ne saute pas le webhook. Sans lui, ton produit donne l’accès à quelqu’un qui n’a pas payé.',
            actions: [
              { instruction: 'Colle le prompt de page de paiement.', promptTemplateSlug: 'paiement-checkout' },
              { instruction: 'Colle le prompt de webhook.', promptTemplateSlug: 'paiement-webhook' },
              { instruction: 'Colle le prompt de portail client.', promptTemplateSlug: 'paiement-portail' },
              { instruction: 'Colle le prompt de restriction par offre.', promptTemplateSlug: 'paiement-restriction' },
            ],
          },
          {
            title: 'Déclare le webhook dans Stripe',
            body:
              'Stripe doit savoir où prévenir ton site quand un paiement aboutit. Sans cette déclaration, le paiement passe mais l’accès ne s’ouvre pas.',
            actions: [
              { instruction: 'Dans Stripe, va dans « Développeurs », puis « Webhooks ».', externalUrl: 'https://dashboard.stripe.com/test/webhooks' },
              { instruction: 'Clique sur « Ajouter un point de terminaison ».' },
              { instruction: 'Dans l’URL, mets l’adresse de ton site suivie de /api/stripe/webhook' },
              { instruction: 'Dans les événements à écouter, coche checkout.session.completed, customer.subscription.updated et customer.subscription.deleted.' },
              { instruction: 'Clique sur « Ajouter un point de terminaison ».' },
              { instruction: 'Copie le « Secret de signature », il commence par whsec_.' },
              { instruction: 'Ajoute-le dans les variables d’environnement de Vercel, puis redéploie.' },
            ],
          },
        ],
        checkpoints: [
          { label: 'Le bouton ouvre une page de paiement Stripe' },
          { label: 'Le webhook est déclaré dans Stripe' },
          { label: 'Le secret de signature est dans les variables d’environnement' },
        ],
      },
      {
        title: 'Passe un vrai paiement test',
        goal: 'De bout en bout : payer, et voir l’accès s’ouvrir.',
        why: 'C’est le seul test qui compte. Tant que tu ne l’as pas fait toi-même, tu ne sais pas si ça marche.',
        estimatedMinutes: 25,
        subSteps: [
          {
            title: 'Le parcours complet',
            body:
              'Utilise une carte de test Stripe. Elle ne débite rien et se comporte comme une vraie.',
            actions: [
              { instruction: 'Ouvre une fenêtre privée et crée un compte neuf sur ton site.' },
              { instruction: 'Clique sur ton bouton d’abonnement.' },
              { instruction: 'Sur la page Stripe, entre le numéro de carte de test : 4242 4242 4242 4242' },
              { instruction: 'Mets n’importe quelle date future et n’importe quel code à trois chiffres.' },
              { instruction: 'Valide le paiement.' },
              { instruction: 'Tu dois revenir sur ton site, et l’accès payant doit être ouvert. Si le paiement passe mais que l’accès reste fermé, c’est le webhook : va voir ses tentatives dans Stripe, elles t’indiquent l’erreur.' },
              { instruction: 'Teste aussi un refus : recommence avec la carte 4000 0000 0000 0002. Un message clair doit s’afficher, et l’accès doit rester fermé.' },
            ],
          },
          {
            title: 'Vérifie côté Stripe',
            body: 'Ce que tu vois sur ton site doit correspondre à ce que Stripe a enregistré.',
            actions: [
              { instruction: 'Dans Stripe, ouvre « Paiements ». Ton paiement test doit y figurer.' },
              { instruction: 'Ouvre « Abonnements ». L’abonnement doit être actif.' },
              { instruction: 'Dans « Webhooks », ouvre ton point de terminaison. Les tentatives doivent être en vert.' },
            ],
          },
        ],
        checkpoints: [
          { label: 'Un paiement test passe de bout en bout' },
          { label: 'L’accès payant s’ouvre après le paiement' },
          { label: 'Une carte refusée n’ouvre pas l’accès' },
          { label: 'Les tentatives de webhook sont en vert dans Stripe' },
        ],
      },
    ],
  },
];
