import type { PhaseSeed } from './types';

/** Phase 5 — Conversion : de la réponse intéressée à la signature. */
export const phase5: PhaseSeed = {
  title: 'Conversion',
  goal: 'Transformer une réponse intéressée en contrat signé, sans brader et sans laisser la conversation s’éteindre.',
  steps: [
    {
      number: 15,
      title: 'Mener ton premier rendez-vous',
      goal: 'Conduire un appel de 20 minutes qui se termine par un accord de principe et une date.',
      why: 'Un premier appel se perd de deux façons : parler de soi pendant quinze minutes, ou terminer sans étape suivante. La structure ci-dessous évite les deux.',
      estimatedMinutes: 45,
      difficulty: 'medium',
      subSteps: [
        {
          title: 'Préparer l’appel',
          body: [
            'Quinze minutes de préparation, jamais zéro. Tu arrives avec des faits sur leur marque.',
          ].join('\n'),
          actions: [
            { instruction: 'Ouvre leur compte Instagram et note leurs trois dernières publications.' },
            { instruction: 'Ouvre la bibliothèque publicitaire et note les publicités qu’ils diffusent en ce moment : format, angle, ce qui manque.', externalUrl: 'https://www.facebook.com/ads/library/' },
            { instruction: 'Écris deux idées d’accroche précises pour leur produit phare. Ce sont tes cartes à jouer pendant l’appel.' },
            { instruction: 'Ouvre ta note « réponses objections » de l’étape 5 dans un autre onglet.' },
          ],
        },
        {
          title: 'La structure des 20 minutes',
          body: [
            '| Temps | Ce que tu fais |',
            '|---|---|',
            '| 0-2 min | Tu remercies, tu annonces le plan : « 20 minutes, je vous pose quelques questions puis je vous montre ce que je proposerais » |',
            '| 2-10 min | **Tu écoutes.** Tu poses les questions ci-dessous et tu notes leurs mots exacts |',
            '| 10-15 min | Tu proposes, en reprenant leurs mots |',
            '| 15-18 min | Prix, annoncé sans hésiter |',
            '| 18-20 min | Étape suivante, avec une date |',
            '',
            'Les quatre questions à poser, dans l’ordre :',
            '',
            '1. Qu’est-ce que vous diffusez en publicité en ce moment ?',
            '2. Qu’est-ce qui marche le mieux chez vous aujourd’hui ?',
            '3. Qui produit vos vidéos actuellement ?',
            '4. Qu’est-ce qui vous manque : du volume, des angles, de la régularité ?',
          ].join('\n'),
          actions: [
            { instruction: 'Recopie les quatre questions sur une feuille, devant toi pendant l’appel.', templateRef: 'ugc.rdv.questions' },
            { instruction: 'Pendant qu’ils répondent, note leurs mots exacts. Tu les réutiliseras dans ta proposition, bloc 1.' },
            { instruction: 'Quand tu proposes, commence par « d’après ce que vous me dites » et reprends leur formulation. C’est ce qui fait dire oui.' },
            { instruction: 'Annonce ton prix en une phrase, puis tais-toi. Laisser le silence est la partie difficile et la plus efficace.' },
            { instruction: 'Termine toujours par une date : « je vous envoie la proposition ce soir, vous me dites d’ici vendredi ? »' },
          ],
        },
      ],
      checkpoints: [
        { label: 'J’ai préparé l’appel avec leurs publicités et deux idées d’accroche' },
        { label: 'J’ai posé les quatre questions et noté leurs mots exacts' },
        { label: 'J’ai annoncé mon prix sans hésiter' },
        { label: 'L’appel s’est terminé sur une étape suivante datée' },
      ],
      resources: [
        {
          type: 'script',
          title: 'Les quatre questions du premier appel',
          body: '1. Qu’est-ce que vous diffusez en publicité en ce moment ?\n2. Qu’est-ce qui marche le mieux chez vous aujourd’hui ?\n3. Qui produit vos vidéos actuellement ?\n4. Qu’est-ce qui vous manque : du volume, des angles, de la régularité ?',
        },
        {
          type: 'checklist',
          title: 'Structure des 20 minutes',
          body: '0-2 annonce du plan · 2-10 écoute · 10-15 proposition avec leurs mots · 15-18 prix · 18-20 étape suivante datée',
        },
      ],
    },
    {
      number: 16,
      title: 'Envoyer ton devis',
      goal: 'Envoyer dans les 24 heures un devis conforme, clair, que la marque peut accepter par écrit.',
      why: 'Le délai entre l’appel et le devis est le moment où les affaires meurent. Vingt-quatre heures est la limite au-delà de laquelle l’enthousiasme retombe.',
      estimatedMinutes: 50,
      difficulty: 'medium',
      subSteps: [
        {
          title: 'Créer le devis',
          body: [
            'Un devis français comporte des mentions obligatoires. Elles ne sont pas décoratives : sans elles, ton document n’a pas de valeur.',
            '',
            '- tes nom, adresse, e-mail et numéro SIRET ;',
            '- le nom et l’adresse du client ;',
            '- la date d’émission et la durée de validité (30 jours) ;',
            '- le détail des prestations, quantité et prix unitaire ;',
            '- le montant total hors taxes et, si tu es en franchise de TVA, la mention « TVA non applicable, article 293 B du CGI » ;',
            '- les conditions et délais de paiement ;',
            '- la mention « Bon pour accord », la date et la signature.',
          ].join('\n'),
          actions: [
            { instruction: 'Si tu n’as pas encore de SIRET, crée ton auto-entreprise : la démarche est en ligne, gratuite, et prend environ 20 minutes.', externalUrl: 'https://formalites.entreprises.gouv.fr/' },
            { instruction: 'Ouvre un outil de devis gratuit ou un modèle de document, et reporte toutes les mentions de la liste ci-dessus.', templateRef: 'ugc.devis.mentions' },
            { instruction: 'Détaille la prestation ligne par ligne plutôt qu’en un bloc : « 3 vidéos UGC verticales », « 2 variantes d’accroche par vidéo », « cession de droits publicitaires 6 mois ».' },
            { instruction: 'Ajoute la ligne de paiement : acompte de 50 % à la commande, solde à la livraison. L’acompte n’est pas négociable, il filtre les clients sérieux.' },
            { instruction: 'Exporte en PDF, nomme « Devis - [Marque] - [date].pdf ».' },
          ],
        },
        {
          title: 'Envoyer et cadrer la suite',
          body: 'Le devis part avec un message court qui rappelle l’essentiel et propose une date de décision.',
          actions: [
            {
              instruction: 'Écris le message d’envoi en trois lignes.',
              example:
                'Bonjour [prénom], comme convenu le devis est en pièce jointe : 3 vidéos, livrées 7 jours après réception du produit, 270 €. Si c’est bon pour vous, un « bon pour accord » par retour d’e-mail suffit. Vous pensez pouvoir me dire d’ici vendredi ?',
              templateRef: 'ugc.devis.message',
            },
            { instruction: 'Envoie dans les 24 heures qui suivent l’appel, sans exception.' },
            { instruction: 'Note dans ton tableau : statut « devis envoyé » et la date de décision annoncée.' },
          ],
        },
      ],
      checkpoints: [
        { label: 'Mon devis contient toutes les mentions obligatoires' },
        { label: 'La prestation est détaillée ligne par ligne' },
        { label: 'L’acompte de 50 % est indiqué' },
        { label: 'Le devis est parti dans les 24 heures après l’appel' },
      ],
      resources: [
        {
          type: 'checklist',
          title: 'Mentions obligatoires d’un devis',
          body: 'Tes coordonnées + SIRET · coordonnées du client · date et validité 30 jours · détail des prestations · total HT · « TVA non applicable, article 293 B du CGI » si franchise · conditions de paiement · « Bon pour accord », date, signature',
        },
        { type: 'link', title: 'Créer son auto-entreprise', url: 'https://formalites.entreprises.gouv.fr/' },
      ],
    },
    {
      number: 17,
      title: 'Négocier sans brader',
      goal: 'Répondre aux demandes de remise en gardant ton prix, ou en échangeant une baisse contre une contrepartie.',
      why: 'Le prix que tu acceptes sur le premier contrat devient ton prix de référence chez ce client. Une remise consentie sans contrepartie se paie sur tous les contrats suivants.',
      estimatedMinutes: 30,
      difficulty: 'medium',
      subSteps: [
        {
          title: 'La règle unique',
          body: [
            '**Tu ne baisses jamais un prix sans retirer quelque chose.**',
            '',
            'Trois échanges possibles, dans l’ordre de préférence :',
            '',
            '| Ils demandent | Tu proposes |',
            '|---|---|',
            '| −20 % sur le pack | 2 vidéos au lieu de 3, prix unitaire inchangé |',
            '| un prix plus bas | le même prix contre un engagement sur deux mois |',
            '| un test gratuit | une vidéo test payée au tarif unitaire |',
            '',
            'Ce que tu peux offrir sans perdre d’argent : un délai plus confortable, une variante d’accroche supplémentaire, le droit d’usage organique en plus du publicitaire.',
          ].join('\n'),
          actions: [
            { instruction: 'Recopie le tableau d’échanges dans ta note « réponses objections ».', templateRef: 'ugc.negociation.echanges' },
            { instruction: 'Écris ton prix plancher : le chiffre en dessous duquel tu dis non. Décide-le à froid, maintenant, pas pendant l’appel.' },
            { instruction: 'Prépare ta phrase de refus, calme et sans justification longue.', example: 'À ce tarif je ne peux pas maintenir la qualité que vous avez vue. Je peux en revanche faire 2 vidéos au lieu de 3 pour rester dans votre budget.' },
          ],
        },
      ],
      checkpoints: [
        { label: 'Mon prix plancher est écrit' },
        { label: 'J’ai mes trois échanges prêts' },
        { label: 'Ma phrase de refus est écrite' },
      ],
      resources: [
        {
          type: 'script',
          title: 'Échanges de négociation',
          body: '−20 % → 2 vidéos au lieu de 3\nPrix plus bas → même prix, engagement 2 mois\nTest gratuit → vidéo test au tarif unitaire\nGratuit sans perte : délai plus long, variante d’accroche en plus, usage organique inclus',
        },
      ],
    },
    {
      number: 18,
      title: 'Faire signer',
      goal: 'Obtenir un accord écrit et l’acompte, puis lancer la production.',
      why: 'Un accord oral ne protège personne. L’écrit et l’acompte transforment une intention en client, et c’est le moment exact où tu franchis le jalon « premier client ».',
      estimatedMinutes: 30,
      difficulty: 'easy',
      subSteps: [
        {
          title: 'Obtenir l’accord écrit',
          body: [
            'Un e-mail avec « bon pour accord », la date et le nom de la personne suffit juridiquement pour un devis. Une signature électronique est plus confortable mais pas obligatoire.',
          ].join('\n'),
          actions: [
            { instruction: 'Si la réponse est positive mais orale, réponds par écrit en récapitulant : prestation, prix, délai, et demande le « bon pour accord » par retour.' },
            { instruction: 'Émets la facture d’acompte de 50 % dès l’accord reçu, avec la même numérotation que tes futures factures.' },
            { instruction: 'Vérifie la réception du paiement avant de commencer à produire. C’est la règle, y compris pour un premier client.' },
            { instruction: 'Passe la ligne au statut « signé » dans ton tableau.' },
          ],
        },
        {
          title: 'Marquer le jalon',
          body: [
            'Tu viens de signer ton premier client. Dans Buildr, ce moment est un jalon : tu peux l’enregistrer, avec ou sans montant.',
            '',
            'Ce que tu déclares est affiché comme **déclaré par toi**, jamais comme vérifié. Tu choisis librement ce que tu partages, et tu peux ne rien partager du tout.',
          ].join('\n'),
          actions: [
            { instruction: 'Enregistre le jalon « premier client » dans Buildr.' },
            { instruction: 'Ajoute le montant si tu le souhaites. Ce champ est facultatif et reste privé tant que tu ne publies pas ton aventure.' },
          ],
        },
      ],
      checkpoints: [
        { label: 'J’ai un accord écrit' },
        { label: 'La facture d’acompte est émise' },
        { label: 'L’acompte est encaissé' },
        { label: 'J’ai enregistré le jalon premier client', isRequired: false },
      ],
      resources: [
        {
          type: 'template',
          title: 'E-mail de récapitulatif avant accord',
          body: 'Bonjour [prénom], je récapitule ce qu’on s’est dit : 3 vidéos UGC verticales, 2 accroches par vidéo, livrées 7 jours après réception du produit, 270 € avec acompte de 50 % à la commande. Si c’est bon pour vous, répondez simplement « bon pour accord » avec la date.',
        },
      ],
    },
  ],
};
