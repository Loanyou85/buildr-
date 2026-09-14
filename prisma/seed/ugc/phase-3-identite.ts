import type { PhaseSeed } from './types';

/** Phase 3 — Identité : de quoi être pris au sérieux en 10 secondes par une marque. */
export const phase3: PhaseSeed = {
  title: 'Identité',
  goal: 'Construire le minimum crédible : un compte professionnel, une bio qui dit ce que tu fais, un portfolio avec de vraies vidéos.',
  steps: [
    {
      number: 7,
      title: 'Créer ton compte professionnel',
      goal: 'Avoir un compte Instagram professionnel dédié à ton activité UGC, séparé de ton compte personnel.',
      why: 'La marque va regarder ton compte avant de répondre. Si elle tombe sur tes vacances, elle ne comprend pas ce que tu vends. Dix minutes de configuration changent la réponse.',
      estimatedMinutes: 30,
      difficulty: 'easy',
      subSteps: [
        {
          title: 'Créer et configurer le compte',
          body: [
            'On crée un **nouveau compte**, on ne transforme pas le personnel. Tu veux pouvoir montrer ce compte à n’importe quelle marque sans réfléchir.',
          ].join('\n'),
          actions: [
            {
              instruction: 'Ouvre Instagram. Dans ton profil, appuie sur le menu, puis « Ajouter un compte », puis « Créer un compte ».',
              externalUrl: 'https://www.instagram.com/',
            },
            {
              instruction:
                'Choisis un nom d’utilisateur selon cette règle : [prénom] + [mot de la niche] ou [prénom] + « ugc ». Pas de chiffres aléatoires, pas de tirets bas en série.',
              example: 'lea.ugc, marc.fitnessugc, camille.creates',
            },
            {
              instruction:
                'Va dans Paramètres → Type de compte → Passer à un compte professionnel. Choisis la catégorie « Créateur de contenu numérique ».',
            },
            {
              instruction:
                'Ajoute une photo de profil qui respecte ces trois critères : ton visage, cadrage serré sur les épaules, lumière du jour. Pas de logo, pas de photo de groupe, pas de lunettes de soleil.',
            },
            {
              instruction:
                'Renseigne un e-mail professionnel de contact dans les coordonnées du compte. Une adresse dédiée, pas celle que tu partages avec ta famille.',
            },
          ],
        },
        {
          title: 'Écrire la bio',
          body: [
            'Quatre lignes, dans cet ordre exact. La marque doit comprendre en 5 secondes ce que tu fais et pour qui.',
            '',
            '```',
            'Ligne 1 : Créateur UGC · [ta niche]',
            'Ligne 2 : Vidéos publicitaires prêtes à diffuser',
            'Ligne 3 : [Ville] · Livraison en 7 jours',
            'Ligne 4 : Portfolio ↓',
            '```',
          ].join('\n'),
          actions: [
            {
              instruction: 'Recopie la structure de bio ci-dessus en remplaçant les crochets.',
              templateRef: 'ugc.bio.structure',
              example:
                'Créateur UGC · compléments sportifs\nVidéos publicitaires prêtes à diffuser\nLyon · Livraison en 7 jours\nPortfolio ↓',
            },
            {
              instruction:
                'Laisse le lien vide pour l’instant : tu l’ajouteras à l’étape 9, quand ton portfolio existera. Un lien mort coûte plus cher que pas de lien.',
            },
          ],
        },
      ],
      checkpoints: [
        { label: 'Mon compte professionnel est créé, séparé du personnel' },
        { label: 'Le nom d’utilisateur suit la règle prénom + niche' },
        { label: 'Ma photo de profil respecte les trois critères' },
        { label: 'Ma bio suit la structure en quatre lignes' },
      ],
      resources: [
        {
          type: 'template',
          title: 'Structure de bio',
          body: 'Créateur UGC · [niche]\nVidéos publicitaires prêtes à diffuser\n[Ville] · Livraison en 7 jours\nPortfolio ↓',
        },
        {
          type: 'checklist',
          title: 'Critères de la photo de profil',
          body: 'Ton visage · cadrage serré sur les épaules · lumière du jour · pas de logo, pas de groupe, pas de lunettes de soleil',
        },
      ],
    },
    {
      number: 8,
      title: 'Produire tes trois premières vidéos',
      goal: 'Tourner et monter trois vidéos UGC sur des produits que tu possèdes déjà, au niveau de ce que tu factureras.',
      why: 'C’est l’étape qui débloque tout le reste. Sans vidéos à montrer, ta prospection ne convertit pas. Avec trois vidéos correctes, tu peux écrire à n’importe quelle marque.',
      estimatedMinutes: 240,
      difficulty: 'medium',
      subSteps: [
        {
          title: 'Écrire les trois scripts',
          body: [
            'Une vidéo UGC tient en quatre blocs, toujours les mêmes, sur 20 à 30 secondes :',
            '',
            '| Bloc | Durée | Contenu |',
            '|---|---|---|',
            '| Accroche | 0-3 s | le problème, avec les mots du client |',
            '| Contexte | 3-8 s | ta situation, pourquoi tu cherchais une solution |',
            '| Produit | 8-20 s | le produit en main, ce qu’il change concrètement |',
            '| Conclusion | 20-25 s | ce que tu dirais à un ami |',
            '',
            'Les trois vidéos utilisent trois accroches différentes : **le problème**, **le résultat**, **l’erreur courante**.',
          ].join('\n'),
          actions: [
            {
              instruction:
                'Choisis trois produits que tu as chez toi et qui appartiennent à ta niche. Ce sont eux que tu filmes.',
            },
            {
              instruction:
                'Script 1, accroche « problème » : écris une première phrase qui reprend mot pour mot une des phrases de client relevées à l’étape 2.',
              example: '« J’en avais marre d’être vidée à 16 h tous les jours. »',
            },
            {
              instruction:
                'Script 2, accroche « résultat » : commence par le changement, pas par le produit.',
              example: '« Trois semaines que je ne saute plus ma séance du matin. »',
            },
            {
              instruction:
                'Script 3, accroche « erreur » : commence par ce que font les gens et qui ne marche pas.',
              example: '« L’erreur que je faisais : prendre ça juste avant l’entraînement. »',
            },
            {
              instruction:
                'Complète chaque script avec les trois blocs suivants. Écris comme tu parles : lis à voix haute, si tu trébuches, réécris.',
              templateRef: 'ugc.script.structure',
            },
          ],
        },
        {
          title: 'Tourner',
          body: [
            'Tu filmes avec ton téléphone. Le matériel n’est pas le sujet : la lumière et le son le sont.',
            '',
            '- **Lumière** : face à une fenêtre, jamais dos à elle. Entre 10 h et 16 h.',
            '- **Son** : une pièce avec des rideaux ou un canapé. Pas de salle de bain, pas de cuisine vide.',
            '- **Cadre** : vertical, ton visage dans le tiers supérieur, un fond rangé mais réel.',
            '- **Prises** : 3 prises par bloc. La bonne est presque toujours la deuxième ou la troisième.',
          ].join('\n'),
          actions: [
            { instruction: 'Installe ton téléphone à hauteur d’yeux, calé contre des livres ou sur un trépied.' },
            { instruction: 'Place-toi face à une fenêtre et fais un test de 5 secondes. Regarde-le : si ton visage est sombre, rapproche-toi de la fenêtre.' },
            { instruction: 'Filme le bloc accroche, 3 prises. Puis contexte, 3 prises. Puis produit, 3 prises. Puis conclusion, 3 prises.' },
            { instruction: 'Filme 4 plans du produit seul : dans la main, ouvert, en usage, posé. Ce sont eux qui rendent le montage vivant.' },
            { instruction: 'Répète pour les trois vidéos. Compte environ 30 minutes par vidéo une fois installé.' },
          ],
        },
        {
          title: 'Monter et sous-titrer',
          body: [
            'CapCut suffit et est gratuit. L’objectif est un montage propre, pas un montage spectaculaire.',
          ].join('\n'),
          actions: [
            { instruction: 'Installe CapCut et crée un nouveau projet au format 9:16.', externalUrl: 'https://www.capcut.com/' },
            { instruction: 'Assemble les meilleures prises dans l’ordre accroche, contexte, produit, conclusion.' },
            { instruction: 'Coupe tous les silences de plus de 0,4 seconde entre les phrases. C’est ce qui fait la différence entre amateur et pro.' },
            { instruction: 'Ajoute les sous-titres automatiques, puis relis-les et corrige les erreurs. Un sous-titre faux se voit immédiatement.' },
            { instruction: 'Insère les plans du produit sur les moments où tu en parles.' },
            { instruction: 'Exporte en 1080p, 30 fps. Nomme le fichier : niche-accroche-01.mp4.' },
          ],
        },
      ],
      checkpoints: [
        { label: 'Mes trois scripts sont écrits avec les quatre blocs' },
        { label: 'Les trois vidéos sont tournées, lumière de face et son correct' },
        { label: 'Les trois vidéos sont montées, sous-titrées et relues' },
        { label: 'Les fichiers sont exportés en 1080p vertical' },
      ],
      resources: [
        {
          type: 'template',
          title: 'Structure de script UGC',
          body: 'Accroche (0-3 s) : [le problème, avec les mots du client]\nContexte (3-8 s) : [ta situation]\nProduit (8-20 s) : [le produit en main, ce qu’il change]\nConclusion (20-25 s) : [ce que tu dirais à un ami]',
        },
        {
          type: 'checklist',
          title: 'Conditions de tournage',
          body: 'Face à une fenêtre, 10 h-16 h · pièce avec rideaux ou canapé · vertical, visage dans le tiers supérieur · 3 prises par bloc · 4 plans du produit seul',
        },
        { type: 'link', title: 'CapCut (montage gratuit)', url: 'https://www.capcut.com/' },
      ],
    },
    {
      number: 9,
      title: 'Monter ton portfolio',
      goal: 'Avoir une page unique, accessible par un lien, qui montre tes trois vidéos et ton offre.',
      why: 'Le lien de portfolio est ce que tu colles dans chaque message de prospection. C’est la seule chose qui transforme « quelqu’un qui écrit » en « quelqu’un qu’on peut engager ».',
      estimatedMinutes: 60,
      difficulty: 'easy',
      subSteps: [
        {
          title: 'Créer la page',
          body: [
            'Gratuit et suffisant : une page Notion publique. Pas de site à construire, pas de nom de domaine à acheter.',
            '',
            'La page contient, dans cet ordre : ton nom et ta niche, tes trois vidéos, ton offre, ton prix, ton contact.',
          ].join('\n'),
          actions: [
            { instruction: 'Crée un compte Notion gratuit et une nouvelle page nommée « [Ton prénom] — Créateur UGC ».', externalUrl: 'https://www.notion.so/' },
            { instruction: 'En haut, écris ta phrase de niche de l’étape 1, telle quelle.' },
            { instruction: 'Téléverse tes trois vidéos dans la page. Notion les lit directement, inutile de passer par YouTube.' },
            { instruction: 'Sous chaque vidéo, écris une ligne : le type d’accroche utilisé et le produit filmé.', example: 'Accroche « problème » · complément protéiné · 24 s' },
            { instruction: 'Colle ton offre et ton prix (étapes 4 et 5), tels que tu les as écrits.' },
            { instruction: 'Ajoute ton e-mail professionnel en bas.' },
            { instruction: 'Clique sur « Partager », active « Partager sur le Web », copie le lien.' },
          ],
        },
        {
          title: 'Brancher le portfolio partout',
          body: 'Le lien ne sert que s’il est là où la marque regarde.',
          actions: [
            { instruction: 'Colle le lien dans la bio Instagram, à la place laissée vide à l’étape 7.' },
            { instruction: 'Ouvre le lien depuis ton téléphone en navigation privée : c’est ce que voit la marque. Si une vidéo ne se lance pas, corrige maintenant.' },
            { instruction: 'Enregistre le lien dans une note épinglée : tu vas le coller des dizaines de fois.' },
          ],
        },
      ],
      checkpoints: [
        { label: 'Ma page portfolio est en ligne et publique' },
        { label: 'Les trois vidéos se lancent depuis un téléphone en navigation privée' },
        { label: 'L’offre, le prix et le contact sont sur la page' },
        { label: 'Le lien est dans ma bio Instagram' },
      ],
      resources: [
        {
          type: 'template',
          title: 'Plan de la page portfolio',
          body: '1. Nom + phrase de niche\n2. Trois vidéos, une ligne de légende chacune\n3. Offre (le pack)\n4. Prix\n5. E-mail de contact',
        },
        { type: 'link', title: 'Notion', url: 'https://www.notion.so/' },
      ],
    },
    {
      number: 10,
      title: 'Écrire ta première étude de cas',
      goal: 'Transformer une de tes trois vidéos en démonstration de raisonnement, pas seulement de réalisation.',
      why: 'N’importe qui peut montrer une vidéo. Montrer pourquoi tu as choisi cette accroche, pour quel client, contre quelle objection, te place au-dessus des créateurs qui envoient juste un lien.',
      estimatedMinutes: 40,
      difficulty: 'easy',
      subSteps: [
        {
          title: 'Écrire les cinq blocs',
          body: [
            'Une étude de cas UGC tient en cinq blocs courts :',
            '',
            '1. **Le produit** — ce que c’est, pour qui.',
            '2. **Le client visé** — celui de l’étape 2, avec sa phrase.',
            '3. **L’objection** — ce qui l’empêche d’acheter.',
            '4. **L’angle choisi** — l’accroche retenue et pourquoi elle répond à l’objection.',
            '5. **La vidéo** — le résultat.',
            '',
            'Tant que tu n’as pas de client, tu ne parles **jamais** de résultats chiffrés. Tu décris ton raisonnement, pas une performance.',
          ].join('\n'),
          actions: [
            { instruction: 'Ajoute une section « Étude de cas » à ta page portfolio.' },
            { instruction: 'Remplis les cinq blocs pour la vidéo dont tu es le plus satisfait. Deux à trois phrases par bloc, pas plus.', templateRef: 'ugc.casestudy.structure' },
            {
              instruction:
                'Relis : si une phrase promet un résultat que tu n’as pas mesuré, supprime-la. Une étude de cas honnête est plus convaincante qu’un chiffre inventé.',
            },
          ],
        },
      ],
      checkpoints: [
        { label: 'Mon étude de cas suit les cinq blocs' },
        { label: 'Elle est publiée sur ma page portfolio' },
        { label: 'Elle ne contient aucun résultat chiffré que je n’ai pas mesuré' },
      ],
      resources: [
        {
          type: 'template',
          title: 'Étude de cas en cinq blocs',
          body: 'Produit : [ce que c’est, pour qui]\nClient visé : [portrait + sa phrase]\nObjection : [ce qui le fait hésiter]\nAngle choisi : [l’accroche et pourquoi elle répond à l’objection]\nVidéo : [le lien]',
        },
      ],
    },
  ],
};
