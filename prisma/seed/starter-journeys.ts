import type { JourneySeed } from './ugc/types';

/**
 * Parcours d'amorçage des autres business models. Ils suivent la même
 * structure que le parcours UGC : les écrans ne font aucune différence entre un
 * parcours de 22 étapes et un parcours de 5. La profondeur se démontre sur un
 * cas (section 14), l'extensibilité sur le reste du référentiel.
 */
function starter(name: string, opening: { niche: string; offer: string; proof: string; outreach: string; delivery: string }): JourneySeed {
  return {
    name,
    budgetTier: 'zero',
    experienceTier: 'beginner',
    phases: [
      {
        title: 'Positionnement',
        goal: 'Choisir un terrain précis et vérifier que des clients y dépensent déjà.',
        steps: [
          {
            number: 1,
            title: 'Choisir ton terrain',
            goal: 'Sortir avec une phrase qui décrit qui tu sers et sur quel problème.',
            why: 'Une offre générale n’intéresse personne en particulier. Le premier client vient presque toujours d’un positionnement étroit.',
            estimatedMinutes: 45,
            subSteps: [
              {
                title: 'Lister puis trancher',
                body: opening.niche,
                actions: [
                  { instruction: 'Écris 5 terrains possibles, en te limitant à ceux où tu as déjà été client ou utilisateur.' },
                  { instruction: 'Pour chacun, vérifie en ligne que des concurrents facturent ce service : un concurrent visible est une preuve de marché.' },
                  { instruction: 'Écris ta phrase : « J’aide [qui] à [résultat] grâce à [ce que tu fais] ».' },
                ],
              },
            ],
            checkpoints: [
              { label: 'J’ai listé 5 terrains possibles' },
              { label: 'J’ai vérifié qu’au moins 3 concurrents facturent ce service' },
              { label: 'Ma phrase de positionnement est écrite' },
            ],
          },
        ],
      },
      {
        title: 'Offre',
        goal: 'Chiffrer ce que tu vends, pour qu’un client puisse dire oui en une réponse.',
        steps: [
          {
            number: 2,
            title: 'Construire et chiffrer ton offre',
            goal: 'Un livrable précis, un délai, un prix.',
            why: 'Tant que l’offre est floue, chaque conversation repart de zéro.',
            estimatedMinutes: 50,
            subSteps: [
              {
                title: 'Écrire l’offre',
                body: opening.offer,
                actions: [
                  { instruction: 'Décris ton livrable en une ligne : quoi, combien, en combien de jours.' },
                  { instruction: 'Écris ce qui n’est pas inclus. C’est ce qui t’évitera le travail gratuit.' },
                  { instruction: 'Fixe un prix en chiffre exact, pas une fourchette, et calcule ton taux horaire réel.' },
                ],
              },
            ],
            checkpoints: [
              { label: 'Mon livrable est décrit en une ligne' },
              { label: 'Ce qui n’est pas inclus est écrit' },
              { label: 'Mon prix est fixé en chiffre exact' },
            ],
          },
        ],
      },
      {
        title: 'Preuve',
        goal: 'Avoir quelque chose de concret à montrer avant de démarcher.',
        steps: [
          {
            number: 3,
            title: 'Produire ta première preuve',
            goal: 'Un exemple visible du travail que tu vends.',
            why: 'Un prospect ne juge pas des promesses, il juge un exemple. Sans preuve, la prospection ne convertit pas.',
            estimatedMinutes: 180,
            subSteps: [
              {
                title: 'Créer et publier',
                body: opening.proof,
                actions: [
                  { instruction: 'Réalise un exemple complet de ta prestation, sur ton propre projet ou pour un proche.' },
                  { instruction: 'Publie-le sur une page accessible par un lien (Notion suffit).', externalUrl: 'https://www.notion.so/' },
                  { instruction: 'Ajoute ton offre, ton prix et ton contact sur la même page.' },
                ],
              },
            ],
            checkpoints: [
              { label: 'Mon exemple est réalisé' },
              { label: 'Ma page est en ligne et le lien fonctionne' },
            ],
          },
        ],
      },
      {
        title: 'Prospection',
        goal: 'Aller chercher les premiers prospects, avec méthode et volume.',
        steps: [
          {
            number: 4,
            title: 'Contacter tes 50 premiers prospects',
            goal: 'Une liste de 50 prospects qualifiés, contactés et suivis.',
            why: 'Le taux de réponse à froid tourne autour de 10 %. Cinquante contacts, c’est cinq conversations, et une à trois signatures.',
            estimatedMinutes: 240,
            subSteps: [
              {
                title: 'Lister, écrire, envoyer',
                body: opening.outreach,
                actions: [
                  { instruction: 'Crée un tableau : nom, contact, canal, angle personnalisé, statut, date.' },
                  { instruction: 'Trouve 50 prospects correspondant à ton positionnement.' },
                  { instruction: 'Écris un message de 50 mots maximum, avec une seule question à la fin et aucun prix.' },
                  { instruction: 'Envoie par séries de 10 et tiens ton tableau à jour après chaque envoi.' },
                  { instruction: 'Relance une fois, 5 jours après, en apportant une idée nouvelle.' },
                ],
              },
            ],
            checkpoints: [
              { label: 'Mon tableau contient 50 prospects' },
              { label: 'J’ai envoyé au moins 30 messages' },
              { label: 'J’ai relancé les prospects sans réponse' },
            ],
          },
        ],
      },
      {
        title: 'Conversion et livraison',
        goal: 'Signer, livrer, encaisser, et ouvrir le contrat suivant.',
        steps: [
          {
            number: 5,
            title: 'Signer et livrer ton premier client',
            goal: 'Un accord écrit, un acompte encaissé, une livraison propre.',
            why: 'Un accord oral ne protège personne. L’écrit et l’acompte transforment une intention en client.',
            estimatedMinutes: 120,
            subSteps: [
              {
                title: 'De l’accord au paiement',
                body: opening.delivery,
                actions: [
                  { instruction: 'Envoie un devis avec les mentions obligatoires dans les 24 h suivant l’échange.', externalUrl: 'https://formalites.entreprises.gouv.fr/' },
                  { instruction: 'Demande un acompte de 50 % à la commande et attends l’encaissement avant de commencer.' },
                  { instruction: 'Livre dans un dossier organisé, avec un message qui cadre les retouches : une série, 7 jours.' },
                  { instruction: 'Émets la facture de solde le jour de la livraison et relance à J+7 après échéance.' },
                  { instruction: 'Trois à sept jours après la livraison, propose la suite et demande une recommandation écrite.' },
                ],
              },
            ],
            checkpoints: [
              { label: 'Mon devis est envoyé avec les mentions obligatoires' },
              { label: 'L’acompte est encaissé' },
              { label: 'La livraison est faite et la facture de solde émise' },
            ],
          },
        ],
      },
    ],
  };
}

export const STARTER_JOURNEYS: Record<string, JourneySeed> = {
  'freelance-video': starter('Freelance vidéo — du premier montage au premier client', {
    niche: 'Un monteur « généraliste » est invisible. Un monteur « vidéos de podcast pour coachs » est trouvable.',
    offer: 'Le format qui se vend le mieux au démarrage : un abonnement de montage mensuel, 8 vidéos courtes par mois.',
    proof: 'Remonte gratuitement un extrait d’une vidéo existante d’une marque que tu vises, et montre l’avant/après.',
    outreach: 'Les créateurs et podcasteurs sont joignables en message direct, et ils répondent eux-mêmes.',
    delivery: 'Le montage se livre par lien, avec une série de retouches incluse et un délai annoncé.',
  }),
  'gestion-reseaux-sociaux': starter('Gestion de réseaux sociaux — premiers comptes clients', {
    niche: 'Les commerces locaux ont un compte inactif et savent que c’est un problème. C’est le terrain le plus accessible.',
    offer: 'Un forfait mensuel : 12 publications, réponses aux messages, un point mensuel.',
    proof: 'Refais gratuitement un mois de calendrier éditorial pour un commerce, en maquette.',
    outreach: 'Le terrain fonctionne mieux que l’e-mail pour les commerces : passe en boutique, demande le gérant.',
    delivery: 'Le livrable mensuel est un calendrier validé à l’avance, pas des publications improvisées.',
  }),
  'service-local': starter('Service local — des premiers clients près de chez toi', {
    niche: 'Un service précis dans un rayon de 15 km bat un service large sur toute une région.',
    offer: 'Une prestation type, un prix affiché, un créneau de disponibilité clair.',
    proof: 'Fais une première prestation pour un voisin et prends des photos avant/après.',
    outreach: 'Groupes Facebook de quartier, panneaux de commerçants, bouche-à-oreille : le local se prospecte à pied.',
    delivery: 'Sur le terrain, la ponctualité et le devis écrit font toute la différence face à la concurrence.',
  }),
  consulting: starter('Consulting — de l’expertise au premier mandat', {
    niche: 'Tu ne vends pas « du conseil », tu vends la résolution d’un problème que tu as déjà résolu.',
    offer: 'Un audit à prix fixe, livré en une semaine, qui débouche naturellement sur un accompagnement.',
    proof: 'Écris une analyse publique d’un cas réel de ton secteur, avec tes recommandations.',
    outreach: 'LinkedIn fonctionne : commente sérieusement pendant deux semaines avant d’écrire en direct.',
    delivery: 'Un mandat se livre par un document écrit et une restitution orale, jamais l’un sans l’autre.',
  }),
  'agence-contenu': starter('Agence de contenu — premier client en abonnement', {
    niche: 'Une agence de contenu qui parle à tout le monde n’a aucun argument. Choisis un secteur.',
    offer: 'Un abonnement mensuel avec un volume de livrables défini et un jour de livraison fixe.',
    proof: 'Produis un mois de contenu pour une entreprise fictive de ton secteur et publie-le comme démonstration.',
    outreach: 'Les responsables marketing répondent à l’e-mail si l’objet nomme leur entreprise.',
    delivery: 'La régularité vaut plus que la perfection : livre le même jour chaque semaine.',
  }),
  'produit-numerique': starter('Produit numérique — de l’idée à la première vente', {
    niche: 'Un produit numérique se vend à une audience précise sur un problème précis, pas à « tout le monde ».',
    offer: 'Un modèle, un outil ou un pack, à moins de 50 € pour la première version.',
    proof: 'Publie gratuitement une version réduite de ton produit et compte les téléchargements.',
    outreach: 'Les communautés où se trouvent tes acheteurs valent mieux que la publicité au démarrage.',
    delivery: 'La vente est automatique, le service après-vente ne l’est pas : réponds vite aux premiers acheteurs.',
  }),
};
