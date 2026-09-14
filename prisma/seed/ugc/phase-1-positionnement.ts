import type { PhaseSeed } from './types';

/**
 * Phase 1 — Positionnement.
 * Niveau de détail : chaque action doit être exécutable par quelqu'un qui n'a
 * jamais rien vendu. « Choisis une niche » est interdit ; on donne la règle,
 * le critère et l'exemple (section 9).
 */
export const phase1: PhaseSeed = {
  title: 'Positionnement',
  goal: 'Choisir un terrain précis où tes vidéos valent quelque chose, et vérifier que des marques y dépensent déjà de l’argent.',
  steps: [
    {
      number: 1,
      title: 'Choisir ta niche',
      goal: 'Sortir de cette étape avec une niche écrite en une phrase, choisie sur des critères et non au feeling.',
      why: 'Une marque ne paie pas « quelqu’un qui fait des vidéos ». Elle paie quelqu’un qui comprend ses clients. Une niche précise divise par trois le temps qu’il te faudra pour signer le premier contrat, parce que ton message devient évident pour la personne qui le lit.',
      estimatedMinutes: 45,
      difficulty: 'easy',
      subSteps: [
        {
          title: 'Lister tes terrains possibles',
          body: [
            'On ne cherche pas encore la bonne niche. On cherche la liste des candidates.',
            '',
            'Une niche UGC tient en trois éléments : **un type de produit**, **un type de client final**, **un problème que le produit résout**. Exemple : compléments alimentaires (produit) pour femmes qui reprennent le sport après 35 ans (client) qui manquent d’énergie en fin de journée (problème).',
          ].join('\n'),
          actions: [
            {
              instruction:
                'Ouvre une note vide sur ton téléphone ou ton ordinateur. Titre : « Niches candidates ».',
            },
            {
              instruction:
                'Écris les 5 sujets sur lesquels tu pourrais parler 10 minutes sans préparation. Pas les sujets qui font sérieux : ceux sur lesquels tu as réellement des choses à dire.',
              example:
                'Musculation en salle, cuisine rapide le soir, matériel de randonnée, soin des cheveux bouclés, café de spécialité.',
            },
            {
              instruction:
                'Pour chacun, écris à côté les 3 derniers produits que tu as achetés dans ce domaine. Si tu n’arrives pas à en citer 3, barre la ligne : tu n’es pas assez dans ce marché pour parler comme un client.',
            },
            {
              instruction:
                'Garde les 3 lignes qui restent. Ce sont tes candidates.',
            },
          ],
        },
        {
          title: 'Filtrer avec les quatre critères',
          body: [
            'Une niche UGC viable coche quatre cases. Applique-les dans l’ordre, et note un point par case pour chacune de tes 3 candidates.',
            '',
            '1. **De l’argent publicitaire circule.** Des marques du secteur paient déjà de la publicité.',
            '2. **Le produit se filme.** Il tient dans la main, se porte, se mange, s’utilise devant une caméra. Un service B2B abstrait est beaucoup plus difficile.',
            '3. **Les marques sont nombreuses.** Au moins 50 marques identifiables, sinon ta liste de prospection s’épuise en trois semaines.',
            '4. **Tu es crédible à l’image.** Tu ressembles au client final, ou tu peux l’être.',
          ].join('\n'),
          actions: [
            {
              instruction:
                'Ouvre la bibliothèque publicitaire de Meta. Dans le champ de recherche, choisis « Toutes les publicités », pays France, puis tape le nom d’une marque de ta première niche.',
              externalUrl: 'https://www.facebook.com/ads/library/',
            },
            {
              instruction:
                'Compte les publicités actives. Si la marque en diffuse au moins 3 et qu’au moins une est une vidéo filmée par une personne au téléphone (pas un spot studio), la case 1 est cochée pour cette niche.',
            },
            {
              instruction:
                'Répète pour 3 marques par niche candidate. Note le résultat dans ta note : « niche — 2 marques sur 3 diffusent de la vidéo UGC ».',
            },
            {
              instruction:
                'Attribue les points des cases 2, 3 et 4 de tête, honnêtement. Une case incertaine vaut 0, pas 1.',
            },
            {
              instruction:
                'Compare les totaux. La niche gagnante est celle qui a le plus de points. En cas d’égalité, garde celle où tu es le plus crédible à l’image : c’est ce qui se voit dans la vidéo.',
            },
          ],
        },
        {
          title: 'Écrire ta niche en une phrase',
          body: [
            'Ta niche doit tenir dans cette structure exacte, que tu réutiliseras dans ta bio, tes messages de prospection et ta proposition :',
            '',
            '> Je produis des vidéos UGC pour les marques de **[type de produit]** qui s’adressent à **[client final]**.',
            '',
            'Si la phrase pourrait décrire 500 créateurs, elle est trop large. Ajoute une précision jusqu’à ce qu’elle décrive une poignée de personnes.',
          ].join('\n'),
          actions: [
            {
              instruction: 'Écris ta phrase en remplissant la structure ci-dessus.',
              templateRef: 'ugc.niche.phrase',
              example:
                'Je produis des vidéos UGC pour les marques de compléments alimentaires sportifs qui s’adressent aux femmes de 25 à 40 ans qui s’entraînent en salle.',
            },
            {
              instruction:
                'Test de largeur : relis ta phrase et demande-toi « est-ce que ça pourrait décrire 500 personnes ? ». Si oui, ajoute une précision d’âge, de canal ou d’usage.',
            },
            {
              instruction:
                'Copie la phrase finale en haut de ta note. Tu vas la réutiliser dans presque toutes les étapes suivantes.',
            },
          ],
        },
      ],
      checkpoints: [
        { label: 'J’ai listé au moins 3 niches candidates' },
        { label: 'J’ai vérifié dans la bibliothèque publicitaire que des marques diffusent de la vidéo' },
        { label: 'Ma niche tient en une phrase, écrite et enregistrée' },
        { label: 'J’ai testé la largeur de la phrase', isRequired: false },
      ],
      resources: [
        {
          type: 'template',
          title: 'Phrase de niche à remplir',
          body: 'Je produis des vidéos UGC pour les marques de [type de produit] qui s’adressent à [client final, avec âge ou situation].',
        },
        {
          type: 'link',
          title: 'Bibliothèque publicitaire Meta',
          url: 'https://www.facebook.com/ads/library/',
        },
        {
          type: 'checklist',
          title: 'Les quatre critères d’une niche viable',
          body: '1. De l’argent publicitaire circule\n2. Le produit se filme\n3. Au moins 50 marques identifiables\n4. Tu es crédible à l’image',
        },
      ],
    },
    {
      number: 2,
      title: 'Définir la marque type que tu vises',
      goal: 'Décrire précisément le genre de marque à qui tu vas écrire, pour ne pas perdre trois semaines à contacter des entreprises qui ne peuvent pas te payer.',
      why: 'Les deux erreurs classiques : viser trop gros (une marque nationale a déjà une agence et ne lit pas tes messages) ou trop petit (une marque sans budget publicitaire ne sait pas quoi faire de ta vidéo). Le bon profil est au milieu, et il se reconnaît à des signes précis.',
      estimatedMinutes: 35,
      difficulty: 'easy',
      subSteps: [
        {
          title: 'Reconnaître une marque qui peut te payer',
          body: [
            'Une marque devient un bon prospect UGC quand elle réunit ces signes :',
            '',
            '- entre **5 000 et 200 000 abonnés** sur Instagram ou TikTok ;',
            '- elle **diffuse de la publicité** en ce moment (visible dans la bibliothèque publicitaire) ;',
            '- son site vend en direct, avec un panier et un prix affiché ;',
            '- ses publications récentes datent de moins de 15 jours ;',
            '- elle republie déjà du contenu de clients, ou ses publicités montrent des personnes réelles.',
            '',
            'Une marque qui coche 4 signes sur 5 vaut un message. Une marque qui en coche 2 te fera perdre du temps.',
          ].join('\n'),
          actions: [
            {
              instruction:
                'Ouvre Instagram et cherche un hashtag de ta niche, par exemple #complementsportfr.',
            },
            {
              instruction:
                'Ouvre les 5 premiers comptes de marque qui apparaissent. Pour chacun, note le nombre d’abonnés et la date de la dernière publication.',
            },
            {
              instruction:
                'Vérifie dans la bibliothèque publicitaire Meta si la marque diffuse actuellement. Note oui ou non.',
              externalUrl: 'https://www.facebook.com/ads/library/',
            },
            {
              instruction:
                'Écris dans ta note le portrait qui ressort : fourchette d’abonnés, type de produit, prix moyen du produit, plateforme principale.',
              example:
                'Marques de compléments, 8 000 à 60 000 abonnés, produits à 25-45 €, actives sur Instagram et TikTok, diffusent de la publicité Meta en continu.',
            },
          ],
        },
        {
          title: 'Décrire le client final de la marque',
          body: [
            'Tu ne filmes pas pour la marque, tu filmes pour **le client de la marque**. C’est lui que ta vidéo doit convaincre, et c’est de lui que tu dois parler dans ta prospection.',
            '',
            'Trois éléments suffisent : qui il est, ce qu’il essaie de résoudre, ce qui l’empêche d’acheter.',
          ].join('\n'),
          actions: [
            {
              instruction:
                'Ouvre la fiche produit la plus vendue d’une marque de ta liste et lis les 10 derniers avis clients.',
            },
            {
              instruction:
                'Relève trois phrases où un client explique son problème, avec ses mots. Copie-les telles quelles, sans les reformuler.',
              example:
                '« J’en avais marre de craquer sur du sucré à 16 h », « je m’entraîne le matin et j’étais vidée à midi ».',
            },
            {
              instruction:
                'Relève deux objections visibles dans les avis négatifs ou les questions : le prix, le goût, le doute sur l’efficacité.',
            },
            {
              instruction:
                'Écris trois lignes dans ta note : « client final », « problème », « objection principale ». Ces phrases serviront de base à tes scripts vidéo.',
              templateRef: 'ugc.client.portrait',
            },
          ],
        },
      ],
      checkpoints: [
        { label: 'J’ai écrit le portrait de la marque type (abonnés, produit, prix, plateforme)' },
        { label: 'J’ai relevé 3 phrases de clients réels dans les avis' },
        { label: 'J’ai identifié l’objection principale du client final' },
      ],
      resources: [
        {
          type: 'checklist',
          title: 'Les 5 signes d’une marque qui peut te payer',
          body: '1. 5 000 à 200 000 abonnés\n2. Diffuse de la publicité en ce moment\n3. Vend en direct sur son site\n4. Publie depuis moins de 15 jours\n5. Republie du contenu de clients',
        },
        {
          type: 'template',
          title: 'Portrait du client final',
          body: 'Client final : [qui, âge, situation]\nProblème : [sa phrase exacte, relevée dans un avis]\nObjection principale : [ce qui le fait hésiter avant d’acheter]',
        },
      ],
    },
    {
      number: 3,
      title: 'Valider que la demande existe',
      goal: 'Prouver avec des faits, pas avec une intuition, que des marques de ta niche paient pour de la vidéo UGC en ce moment.',
      why: 'C’est l’étape que tout le monde saute, et c’est celle qui fait perdre deux mois. Vingt minutes de vérification t’évitent de construire une offre pour un marché qui n’achète pas.',
      estimatedMinutes: 40,
      difficulty: 'medium',
      subSteps: [
        {
          title: 'Chercher les preuves de dépense',
          body: [
            'Trois preuves suffisent, et elles sont toutes publiques. Tu cherches des traces de marques qui **paient déjà** pour ce que tu vends.',
          ].join('\n'),
          actions: [
            {
              instruction:
                'Dans la bibliothèque publicitaire Meta, filtre sur la France et cherche 10 marques de ta niche. Note combien diffusent au moins une publicité au format vidéo verticale filmée au téléphone.',
              externalUrl: 'https://www.facebook.com/ads/library/',
            },
            {
              instruction:
                'Sur LinkedIn ou Indeed, cherche « UGC creator » et « créateur UGC ». Note le nombre d’annonces publiées dans les 30 derniers jours.',
              externalUrl: 'https://fr.indeed.com/',
            },
            {
              instruction:
                'Sur TikTok, cherche le nom de 3 marques de ta niche et regarde si des vidéos de clients apparaissent sur leur compte officiel, republiées.',
            },
            {
              instruction:
                'Écris le verdict en une ligne : « X marques sur 10 diffusent de la vidéo UGC », plus le nombre d’annonces trouvées.',
            },
          ],
        },
        {
          title: 'Décider : continuer ou changer de niche',
          body: [
            'La règle est simple et tu l’appliques sans discuter :',
            '',
            '- **6 marques sur 10 ou plus** diffusent de la vidéo UGC → tu continues avec cette niche.',
            '- **3 à 5 sur 10** → la niche fonctionne mais il faudra plus de volume de prospection. Continue, en notant que ta liste devra compter 70 marques plutôt que 50.',
            '- **moins de 3 sur 10** → reviens à l’étape 1 et prends ta deuxième niche. Ce n’est pas un échec : c’est vingt minutes qui t’ont évité deux mois.',
          ].join('\n'),
          actions: [
            {
              instruction: 'Compare ton chiffre à la règle ci-dessus et écris ta décision dans ta note.',
            },
            {
              instruction:
                'Si tu changes de niche, reprends l’étape 1 avec ta deuxième candidate : tu as déjà la méthode, ça te prendra 15 minutes.',
            },
            {
              instruction:
                'Si tu continues, écris la phrase finale de ta niche en haut de ta note, avec la date du jour.',
            },
          ],
        },
      ],
      checkpoints: [
        { label: 'J’ai vérifié 10 marques dans la bibliothèque publicitaire' },
        { label: 'J’ai cherché les annonces « créateur UGC » des 30 derniers jours' },
        { label: 'J’ai écrit ma décision : je continue avec cette niche' },
      ],
      resources: [
        {
          type: 'checklist',
          title: 'Règle de décision',
          body: '6+/10 → continue\n3 à 5/10 → continue avec une liste de 70 marques\n<3/10 → change de niche maintenant',
        },
      ],
    },
  ],
};
