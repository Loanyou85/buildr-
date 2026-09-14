import type { PhaseSeed } from './types';

/** Phase 4 — Prospection : le volume, fait proprement. C'est ici que le premier client apparaît. */
export const phase4: PhaseSeed = {
  title: 'Prospection',
  goal: 'Constituer une liste de 50 marques qualifiées, écrire un message qui obtient des réponses, envoyer, relancer.',
  steps: [
    {
      number: 11,
      title: 'Constituer ta liste de 50 marques',
      goal: 'Un tableau de 50 marques qualifiées, avec le contact, le canal et la raison de les contacter.',
      why: 'Le taux de réponse en prospection à froid tourne autour de 10 à 20 % quand le message est bon. Cinquante marques, c’est cinq à dix conversations, et une à trois signatures. Moins de cinquante, et les statistiques ne jouent pas pour toi.',
      estimatedMinutes: 120,
      difficulty: 'medium',
      subSteps: [
        {
          title: 'Créer le tableau',
          body: [
            'Une feuille de calcul, huit colonnes, dans cet ordre :',
            '',
            '`Marque | Instagram | Site | E-mail | Abonnés | Diffuse de la pub | Angle personnalisé | Statut`',
            '',
            'La colonne **Angle personnalisé** est celle qui fait la différence : une phrase précise sur cette marque-là, que tu colleras dans le message.',
          ].join('\n'),
          actions: [
            { instruction: 'Ouvre une feuille de calcul vide (Google Sheets convient).', externalUrl: 'https://sheets.google.com/' },
            { instruction: 'Crée les huit colonnes exactement dans l’ordre ci-dessus.', templateRef: 'ugc.prospection.tableau' },
            { instruction: 'Dans la colonne Statut, prépare les valeurs que tu utiliseras : à contacter, contacté, relancé, répondu, rendez-vous, signé, refusé.' },
          ],
        },
        {
          title: 'Trouver les 50 marques',
          body: [
            'Quatre sources, environ 12 à 15 marques chacune. Ne t’épuise pas sur une seule.',
          ].join('\n'),
          actions: [
            {
              instruction:
                'Source 1 — Instagram : cherche 3 hashtags de ta niche. Pour chaque hashtag, ouvre les 10 premiers comptes de marque. Retiens ceux qui ont entre 5 000 et 200 000 abonnés.',
              example: '#complementsportfr, #nutritionsportive, #prewokoutfr',
            },
            {
              instruction:
                'Source 2 — Bibliothèque publicitaire Meta : cherche un mot-clé de ta niche, filtre sur la France. Toutes les marques qui apparaissent dépensent en publicité aujourd’hui : ce sont tes meilleures cibles.',
              externalUrl: 'https://www.facebook.com/ads/library/',
            },
            {
              instruction:
                'Source 3 — TikTok : cherche ta niche, ouvre les vidéos de marques, note les comptes qui publient déjà du contenu type UGC.',
            },
            {
              instruction:
                'Source 4 — Concurrents de tes marques : ouvre 3 marques déjà listées et regarde les comptes suggérés par Instagram. C’est la source la plus rapide pour remplir les dernières lignes.',
            },
            {
              instruction:
                'Pour chaque marque, trouve l’e-mail : regarde le bouton « E-mail » du profil professionnel, sinon la page « Contact » du site, sinon les mentions légales.',
            },
            {
              instruction:
                'Remplis l’angle personnalisé : une phrase sur ce que fait cette marque précisément, pas une généralité.',
              example:
                'Leur pub actuelle montre uniquement le produit sur fond blanc, aucune vidéo avec une personne.',
            },
            {
              instruction:
                'Arrête-toi quand tu as 50 lignes remplies. Compte environ deux heures : c’est la séance la plus longue du parcours, et celle qui produit le premier client.',
            },
          ],
        },
      ],
      checkpoints: [
        { label: 'Mon tableau a les huit colonnes' },
        { label: 'J’ai 50 marques listées' },
        { label: 'Chaque ligne a un e-mail ou un compte Instagram joignable' },
        { label: 'Chaque ligne a un angle personnalisé écrit' },
      ],
      resources: [
        {
          type: 'template',
          title: 'Colonnes du tableau de prospection',
          body: 'Marque | Instagram | Site | E-mail | Abonnés | Diffuse de la pub | Angle personnalisé | Statut',
        },
        {
          type: 'checklist',
          title: 'Quatre sources pour 50 marques',
          body: 'Hashtags Instagram (15) · Bibliothèque publicitaire Meta (15) · TikTok (10) · comptes suggérés (10)',
        },
      ],
    },
    {
      number: 12,
      title: 'Écrire ton script de contact',
      goal: 'Un message court, personnalisé en une phrase, avec une seule demande claire.',
      why: 'Les messages ignorés ont tous le même défaut : ils parlent du créateur. Les messages qui obtiennent une réponse parlent de ce que la marque diffuse en ce moment.',
      estimatedMinutes: 45,
      difficulty: 'medium',
      subSteps: [
        {
          title: 'Le message de base',
          body: [
            'Quatre lignes, cinquante mots maximum. Structure :',
            '',
            '```',
            'Bonjour [prénom si tu le trouves, sinon le nom de la marque],',
            '',
            '[Angle personnalisé : une phrase précise sur ce qu’ils diffusent en ce moment.]',
            '',
            'Je produis des vidéos UGC pour les marques de [niche] : des vidéos verticales prêtes à diffuser en publicité.',
            '',
            '[Trois exemples ici : lien portfolio]',
            '',
            'Est-ce que ça vous intéresse d’en tester une ?',
            '```',
            '',
            'Règles non négociables :',
            '',
            '- **une seule question** à la fin, et elle appelle un oui ou un non ;',
            '- **aucun prix** dans le premier message ;',
            '- **aucune pièce jointe** : un lien, pas un fichier ;',
            '- **pas de « n’hésitez pas »**, pas de « je me permets de ».',
          ].join('\n'),
          actions: [
            { instruction: 'Recopie la structure et remplis les parties fixes : ta niche, ton lien de portfolio.', templateRef: 'ugc.prospection.message' },
            { instruction: 'Écris deux variantes de la dernière question et garde celle qui te semble la plus simple à répondre.', example: '« Est-ce que ça vous intéresse d’en tester une ? » ou « Vous voulez que je vous en envoie une sur un de vos produits ? »' },
            { instruction: 'Fais lire le message à une personne qui ne connaît rien à l’UGC. Si elle ne comprend pas ce que tu proposes en 10 secondes, raccourcis.' },
          ],
        },
        {
          title: 'Adapter au canal',
          body: [
            'Le message change légèrement selon l’endroit où tu l’envoies.',
            '',
            '- **Instagram (DM)** : pas d’objet, et la première phrase doit tenir dans l’aperçu de notification. Commence directement par l’angle personnalisé.',
            '- **E-mail** : objet court et concret. « Vidéos UGC pour [Marque] » fonctionne mieux que n’importe quelle formule créative.',
          ].join('\n'),
          actions: [
            { instruction: 'Écris ta version Instagram : coupe la formule d’appel, commence par l’angle.' },
            { instruction: 'Écris ta version e-mail avec l’objet « Vidéos UGC pour [Marque] ».' },
            { instruction: 'Enregistre les deux versions dans une note nommée « scripts prospection ». Tu ne les réécriras plus, tu ne feras que remplir les crochets.' },
          ],
        },
      ],
      checkpoints: [
        { label: 'Mon message tient en 50 mots et pose une seule question' },
        { label: 'Il ne contient aucun prix ni pièce jointe' },
        { label: 'J’ai une version Instagram et une version e-mail' },
      ],
      resources: [
        {
          type: 'script',
          title: 'Message de premier contact',
          body: [
            'Bonjour [prénom ou marque],',
            '',
            '[Angle personnalisé : une phrase précise sur ce qu’ils diffusent.]',
            '',
            'Je produis des vidéos UGC pour les marques de [niche] : des vidéos verticales prêtes à diffuser en publicité.',
            '',
            'Trois exemples ici : [lien portfolio]',
            '',
            'Est-ce que ça vous intéresse d’en tester une ?',
          ].join('\n'),
        },
        {
          type: 'checklist',
          title: 'Ce qui tue un message de prospection',
          body: 'Parler de soi en premier · plusieurs questions · le prix trop tôt · une pièce jointe · « n’hésitez pas » · un lien qui ne s’ouvre pas sur mobile',
        },
      ],
    },
    {
      number: 13,
      title: 'Envoyer tes 50 messages',
      goal: 'Contacter les 50 marques de ta liste, par séries de 10, en tenant le tableau à jour.',
      why: 'C’est l’étape où la plupart des gens s’arrêtent après huit messages sans réponse. Les réponses arrivent statistiquement, pas immédiatement : il faut le volume avant de juger.',
      estimatedMinutes: 150,
      difficulty: 'medium',
      subSteps: [
        {
          title: 'Envoyer par séries de 10',
          body: [
            'Dix messages par séance, jamais cinquante d’un coup. Deux raisons : la qualité de personnalisation chute après dix, et Instagram limite les messages des comptes récents.',
            '',
            'Compte environ 30 minutes pour dix messages une fois le script prêt.',
          ].join('\n'),
          actions: [
            { instruction: 'Ouvre ton tableau et ton script côte à côte.' },
            { instruction: 'Pour chaque marque : copie le script, remplace le nom et colle l’angle personnalisé de la ligne. Relis une fois. Envoie.' },
            { instruction: 'Passe le statut à « contacté » et note la date dans la ligne. Sans date, tu ne sauras pas quand relancer.' },
            { instruction: 'Après dix envois, arrête-toi. Reprends demain ou plus tard dans la journée.' },
            { instruction: 'Répète jusqu’à ce que les 50 lignes soient au statut « contacté ».' },
          ],
        },
        {
          title: 'Mesurer, ne pas interpréter',
          body: [
            'Tu ne juges rien avant 30 messages envoyés. À 30, tu calcules :',
            '',
            '**taux de réponse = réponses ÷ messages envoyés × 100**',
            '',
            '- **10 % ou plus** → ton message fonctionne, continue jusqu’à 50.',
            '- **moins de 5 %** → ce n’est pas le volume le problème, c’est l’offre ou l’angle. Buildr te le signalera et te proposera d’ajuster l’étape 4 avant de continuer.',
          ].join('\n'),
          actions: [
            { instruction: 'Après 30 envois, compte les réponses obtenues, y compris les refus : un refus est une réponse.' },
            { instruction: 'Note le chiffre dans Buildr quand on te le demande : c’est ce qui déclenche la détection d’un problème d’offre.' },
            { instruction: 'Si ton taux est sous 5 %, ne force pas les 20 messages restants : l’ajustement proposé te fera gagner du temps.' },
          ],
        },
      ],
      checkpoints: [
        { label: 'J’ai envoyé au moins 30 messages' },
        { label: 'Mon tableau est à jour, avec la date de chaque envoi' },
        { label: 'J’ai calculé mon taux de réponse' },
        { label: 'J’ai envoyé les 50 messages', isRequired: false },
      ],
      resources: [
        {
          type: 'checklist',
          title: 'Rythme d’envoi',
          body: '10 messages par séance · statut et date mis à jour à chaque envoi · aucun jugement avant 30 envois',
        },
      ],
    },
    {
      number: 14,
      title: 'Relancer',
      goal: 'Relancer une fois chaque marque sans réponse, cinq jours après le premier message.',
      why: 'Une part importante des réponses arrive après la relance, simplement parce que le premier message est passé au mauvais moment. Une relance, pas deux : au-delà, tu perds la marque pour de bon.',
      estimatedMinutes: 60,
      difficulty: 'easy',
      subSteps: [
        {
          title: 'Écrire la relance',
          body: [
            'Trois lignes. Elle apporte quelque chose de nouveau, elle ne répète pas.',
            '',
            '```',
            'Bonjour [prénom], je reviens vers vous rapidement.',
            '',
            'J’ai regardé [élément précis : leur dernière publication, leur nouvelle publicité] et j’ai noté une idée d’accroche qui pourrait fonctionner : [idée en une phrase].',
            '',
            'Si le sujet n’est pas d’actualité, dites-le moi, je n’insisterai pas.',
            '```',
            '',
            'La dernière phrase est importante : elle rend le non facile, et c’est justement ce qui fait répondre.',
          ].join('\n'),
          actions: [
            { instruction: 'Recopie la structure de relance dans ta note de scripts.', templateRef: 'ugc.prospection.relance' },
            { instruction: 'Prépare une idée d’accroche par marque à relancer. C’est ce qui distingue une relance utile d’un « je me permets de revenir vers vous ».' },
          ],
        },
        {
          title: 'Relancer par série',
          body: 'Même rythme que l’envoi : dix relances par séance, tableau tenu à jour.',
          actions: [
            { instruction: 'Filtre ton tableau sur les lignes contactées il y a 5 jours ou plus, statut « contacté ».' },
            { instruction: 'Envoie dix relances, en changeant l’idée d’accroche à chaque fois.' },
            { instruction: 'Passe le statut à « relancé » et note la date.' },
            { instruction: 'Une marque qui ne répond pas après une relance passe au statut « refusé ». Tu ne la recontactes pas avant trois mois.' },
          ],
        },
      ],
      checkpoints: [
        { label: 'Ma relance apporte une idée nouvelle, elle ne répète pas le premier message' },
        { label: 'J’ai relancé toutes les marques sans réponse après 5 jours' },
        { label: 'Mon tableau distingue contacté, relancé et refusé' },
      ],
      resources: [
        {
          type: 'script',
          title: 'Message de relance',
          body: [
            'Bonjour [prénom], je reviens vers vous rapidement.',
            '',
            'J’ai regardé [élément précis] et j’ai noté une idée d’accroche qui pourrait fonctionner : [idée en une phrase].',
            '',
            'Si le sujet n’est pas d’actualité, dites-le moi, je n’insisterai pas.',
          ].join('\n'),
        },
      ],
    },
  ],
};
