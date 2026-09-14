import type { PhaseSeed } from './types';

/** Phase 2 — Offre : ce que tu vends exactement, à quel prix, écrit noir sur blanc. */
export const phase2: PhaseSeed = {
  title: 'Offre',
  goal: 'Transformer « je fais des vidéos » en une offre précise, chiffrée, que la marque peut accepter en une réponse.',
  steps: [
    {
      number: 4,
      title: 'Construire ton offre',
      goal: 'Définir un livrable précis : combien de vidéos, quel format, quels droits, en combien de jours.',
      why: 'Une marque ne peut pas dire oui à quelque chose de flou. Tant que ton offre n’est pas chiffrée, chaque conversation repart de zéro et tu passes ton temps à négocier au lieu de produire.',
      estimatedMinutes: 50,
      difficulty: 'medium',
      subSteps: [
        {
          title: 'Choisir ton livrable de base',
          body: [
            'L’offre UGC standard, celle que les marques reconnaissent immédiatement, est un **pack de 3 vidéos**. C’est ce que tu vas vendre.',
            '',
            'Un pack se décrit toujours par ces six éléments :',
            '',
            '| Élément | Ta valeur de départ |',
            '|---|---|',
            '| Nombre de vidéos | 3 |',
            '| Durée | 15 à 30 secondes chacune |',
            '| Format | vertical 9:16, sous-titré |',
            '| Variantes | 2 accroches différentes par vidéo |',
            '| Délai | 7 jours après réception du produit |',
            '| Droits | usage publicitaire 6 mois, réseaux de la marque |',
            '',
            'Ne réinvente rien pour l’instant. Ces valeurs sont celles du marché : elles rendent ton offre lisible.',
          ].join('\n'),
          actions: [
            {
              instruction:
                'Recopie le tableau ci-dessus dans ta note, en remplaçant les valeurs seulement si tu as une raison précise de le faire.',
              templateRef: 'ugc.offre.pack',
            },
            {
              instruction:
                'Ajoute une ligne « ce qui n’est pas inclus » : déplacement, achat du produit, acteurs supplémentaires, montage long format. C’est ce qui t’évitera les demandes gratuites en cours de mission.',
            },
            {
              instruction:
                'Écris ta phrase d’offre en une ligne, prête à être copiée dans un message.',
              example:
                'Pack de 3 vidéos UGC verticales, 2 accroches par vidéo, livrées en 7 jours, droits publicitaires 6 mois.',
            },
          ],
        },
        {
          title: 'Écrire le bénéfice, pas la prestation',
          body: [
            'La marque n’achète pas « 3 vidéos ». Elle achète **du contenu publicitaire qu’elle peut diffuser sans repartir de zéro**.',
            '',
            'Formule à utiliser : *« [ce que tu livres] pour que [la marque] puisse [ce qu’elle en fait] sans [ce que ça lui coûte habituellement] »*.',
          ].join('\n'),
          actions: [
            {
              instruction: 'Écris ta phrase de bénéfice avec la formule ci-dessus.',
              templateRef: 'ugc.offre.benefice',
              example:
                '3 vidéos prêtes à diffuser pour que vous puissiez tester de nouvelles accroches publicitaires sans mobiliser votre équipe ni organiser un tournage.',
            },
            {
              instruction:
                'Relis ta phrase à voix haute. Si elle contient « je suis passionné », « je propose mes services » ou « n’hésitez pas », réécris-la : ces formules parlent de toi, pas du problème de la marque.',
            },
          ],
        },
      ],
      checkpoints: [
        { label: 'Mon pack est défini : nombre, durée, format, variantes, délai, droits' },
        { label: 'J’ai écrit ce qui n’est pas inclus' },
        { label: 'J’ai une phrase de bénéfice qui parle de la marque, pas de moi' },
      ],
      resources: [
        {
          type: 'template',
          title: 'Fiche offre',
          body: 'Pack : 3 vidéos UGC\nDurée : 15-30 s\nFormat : vertical 9:16, sous-titré\nVariantes : 2 accroches par vidéo\nDélai : 7 jours après réception du produit\nDroits : usage publicitaire 6 mois, réseaux de la marque\nNon inclus : déplacement, achat du produit, acteurs supplémentaires, montage long format',
        },
      ],
    },
    {
      number: 5,
      title: 'Fixer ton prix',
      goal: 'Sortir avec trois prix écrits : pack découverte, pack standard, pack mensuel. Et ne plus jamais hésiter quand on te pose la question.',
      why: 'Le moment où une marque demande « c’est combien ? » arrive toujours plus vite que prévu. Hésiter coûte la crédibilité que tes vidéos t’ont donnée.',
      estimatedMinutes: 40,
      difficulty: 'medium',
      subSteps: [
        {
          title: 'Poser tes trois niveaux de prix',
          body: [
            'Les fourchettes pratiquées en France pour un créateur UGC débutant, sans audience :',
            '',
            '| Offre | Fourchette | Quand la proposer |',
            '|---|---|---|',
            '| 1 vidéo test | 80 à 120 € | à une marque qui hésite, une seule fois |',
            '| Pack de 3 vidéos | 250 à 400 € | c’est ton offre par défaut |',
            '| Pack mensuel, 6 vidéos | 500 à 800 € | à partir du deuxième mois avec un client |',
            '',
            'Au démarrage, positionne-toi **au bas de chaque fourchette**, jamais en dessous. En dessous, tu attires les marques qui négocient tout et qui partent au premier désaccord.',
          ].join('\n'),
          actions: [
            {
              instruction:
                'Écris tes trois prix dans ta note, en chiffres exacts. Pas de fourchette : un prix.',
              example: 'Vidéo test : 90 €. Pack de 3 : 270 €. Pack mensuel de 6 : 520 €.',
              templateRef: 'ugc.prix.grille',
            },
            {
              instruction:
                'Calcule ton taux horaire réel : prix du pack divisé par le temps estimé. Compte 2 h par vidéo la première fois (script, tournage, montage). Si tu tombes sous 15 €/h, remonte le prix plutôt que d’accélérer.',
            },
            {
              instruction:
                'Écris la phrase que tu diras quand on te demandera le prix, et apprends-la : elle doit sortir sans hésitation.',
              example:
                'Le pack de 3 vidéos est à 270 €, livré sous 7 jours, droits publicitaires inclus pour 6 mois.',
            },
          ],
        },
        {
          title: 'Préparer tes réponses aux trois objections de prix',
          body: [
            'Il y en a trois, toujours les mêmes. Prépare-les maintenant, à froid, plutôt que d’improviser en rendez-vous.',
          ].join('\n'),
          actions: [
            {
              instruction:
                '« C’est trop cher. » → Réponse : ne baisse pas le prix, baisse le volume. Écris ta version.',
              example:
                'Je comprends. On peut démarrer sur une vidéo test à 90 € : vous voyez le rendu et on décide ensuite pour un pack complet.',
            },
            {
              instruction:
                '« On envoie juste le produit, pas de budget. » → Réponse : tu acceptes seulement si c’est ta toute première étude de cas, et tu le dis comme un choix.',
              example:
                'Je travaille en rémunération, pas en produit seul. Pour un premier essai, je peux faire une vidéo test à 90 € produit inclus.',
            },
            {
              instruction:
                '« On a déjà des créateurs. » → Réponse : tu proposes la comparaison, pas le remplacement.',
              example:
                'Parfait, ça veut dire que le format fonctionne chez vous. Je peux produire 2 accroches différentes des vôtres pour vous donner de quoi tester en publicité.',
            },
            {
              instruction:
                'Copie tes trois réponses dans une note séparée nommée « réponses objections ». Tu l’ouvriras avant chaque rendez-vous.',
            },
          ],
        },
      ],
      checkpoints: [
        { label: 'Mes trois prix sont écrits en chiffres exacts' },
        { label: 'J’ai calculé mon taux horaire réel' },
        { label: 'Mes trois réponses aux objections de prix sont écrites' },
      ],
      resources: [
        {
          type: 'template',
          title: 'Grille tarifaire de départ',
          body: '1 vidéo test : 80-120 €\nPack de 3 vidéos : 250-400 €\nPack mensuel 6 vidéos : 500-800 €\nRègle : au démarrage, bas de fourchette, jamais en dessous.',
        },
        {
          type: 'script',
          title: 'Réponses aux objections de prix',
          body: 'Trop cher → baisser le volume, pas le prix : « on démarre sur une vidéo test à 90 € ».\nProduit seul → « je travaille en rémunération ; pour un premier essai, vidéo test à 90 € produit inclus ».\nDéjà des créateurs → « je produis 2 accroches différentes des vôtres pour vous donner de quoi tester ».',
        },
      ],
    },
    {
      number: 6,
      title: 'Rédiger ta proposition',
      goal: 'Avoir un document d’une page, réutilisable, que tu envoies après chaque échange intéressé.',
      why: 'Après un bon échange, la marque a besoin de quelque chose à faire circuler en interne. Sans document, ta proposition meurt dans une boîte de réception.',
      estimatedMinutes: 45,
      difficulty: 'easy',
      subSteps: [
        {
          title: 'Écrire la page de proposition',
          body: [
            'Une page, six blocs, dans cet ordre. Ni plus long, ni plus décoré.',
            '',
            '1. **Ce que j’ai compris de votre besoin** — deux lignes, avec les mots de la marque.',
            '2. **Ce que je propose** — ton pack, chiffré.',
            '3. **Ce que vous recevez** — la liste exacte des fichiers.',
            '4. **Délai** — la date de livraison, pas « rapidement ».',
            '5. **Prix** — un chiffre, en gras.',
            '6. **Comment on démarre** — la première action concrète, côté marque.',
          ].join('\n'),
          actions: [
            {
              instruction:
                'Ouvre un document vide (Google Docs, Notion ou Word) et recopie les six titres ci-dessus.',
              externalUrl: 'https://docs.google.com/',
            },
            {
              instruction: 'Remplis les blocs 2 à 5 avec ton offre et tes prix : ils ne changeront plus d’un envoi à l’autre.',
            },
            {
              instruction:
                'Laisse le bloc 1 vide : tu le remplis à chaque envoi avec les mots exacts de la marque. C’est le seul bloc personnalisé, et c’est celui qui fait la différence.',
            },
            {
              instruction:
                'Écris le bloc 6 avec une action simple et datée pour la marque.',
              example:
                'Vous m’envoyez le produit cette semaine, je vous livre les 3 vidéos 7 jours après réception.',
            },
            {
              instruction:
                'Exporte le document en PDF et nomme-le : « Proposition - [Ton prénom] - UGC.pdf ». C’est ce fichier que tu enverras.',
            },
          ],
        },
      ],
      checkpoints: [
        { label: 'Ma proposition tient sur une page' },
        { label: 'Les six blocs sont présents et remplis, sauf le bloc 1 laissé personnalisable' },
        { label: 'Le PDF est exporté et nommé correctement' },
      ],
      resources: [
        {
          type: 'template',
          title: 'Proposition en une page',
          body: [
            '**Ce que j’ai compris de votre besoin**',
            '[deux lignes, avec les mots de la marque]',
            '',
            '**Ce que je propose**',
            'Pack de 3 vidéos UGC verticales, 2 accroches par vidéo.',
            '',
            '**Ce que vous recevez**',
            '3 vidéos montées 9:16 sous-titrées, 6 accroches, les rushes bruts.',
            '',
            '**Délai**',
            '7 jours après réception du produit.',
            '',
            '**Prix**',
            '**270 €**, droits publicitaires 6 mois inclus.',
            '',
            '**Comment on démarre**',
            'Vous m’envoyez le produit, je vous livre 7 jours après réception.',
          ].join('\n'),
        },
      ],
    },
  ],
};
