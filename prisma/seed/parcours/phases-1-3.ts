import type { PhaseSeed } from './types';

export const PHASES_1_3: PhaseSeed[] = [
  {
    key: 'cadrer',
    title: 'Cadrer l’idée',
    goal: 'Réduire ton idée à une phrase, un client, une seule fonctionnalité.',
    outcome: 'Une phrase, un client, une seule fonctionnalité.',
    steps: [
      {
        title: 'Écris ta phrase',
        goal: 'Une phrase que tu peux dire à quelqu’un dans un couloir.',
        why: 'Tant que tu ne sais pas dire ce que tu construis en une phrase, tu ne sais pas encore ce que tu construis. Et tu ne pourras pas le vendre.',
        estimatedMinutes: 20,
        subSteps: [
          {
            title: 'Remplis le modèle',
            body:
              'On ne cherche pas une belle phrase. On cherche une phrase **vraie et précise**. Le modèle est volontairement rigide : il t’oblige à nommer un client et un résultat.\n\n> J’aide **[qui]** à **[obtenir quoi]** sans **[la corvée d’aujourd’hui]**.',
            actions: [
              { instruction: 'Recopie le modèle ci-dessus dans le champ en bas de l’étape.' },
              { instruction: 'Remplace [qui] par le métier exact, au singulier. Pas « les professionnels », mais « un kiné libéral ».' },
              { instruction: 'Remplace [obtenir quoi] par un résultat visible, pas une fonctionnalité. « Savoir si son patient a fait ses exercices », pas « une application de suivi ».' },
              { instruction: 'Remplace [la corvée d’aujourd’hui] par ce que la personne fait à la main en ce moment.' },
              { instruction: 'Relis à voix haute. Si tu butes, c’est que ce n’est pas encore clair.' },
            ],
          },
          {
            title: 'Élimine la fonctionnalité de trop',
            body:
              'Ton idée contient probablement trois produits. On en garde **un**. Celui sans lequel les autres ne servent à rien.',
            actions: [
              { instruction: 'Écris la liste de tout ce que tu imagines dans ton produit. Sans filtre, dix lignes s’il le faut.' },
              { instruction: 'Pour chaque ligne, demande-toi : si je retire ça, est-ce que le client obtient quand même le résultat de ma phrase ?' },
              { instruction: 'Barre tout ce qui répond oui.' },
              { instruction: 'Il doit rester une seule ligne. S’il en reste deux, garde celle que le client ferait à la main aujourd’hui.' },
            ],
          },
        ],
        checkpoints: [
          { label: 'Ma phrase est écrite et tient en une ligne', proofKind: 'text' },
          { label: 'J’ai nommé un métier précis, au singulier' },
          { label: 'Il reste une seule fonctionnalité' },
        ],
      },
      {
        title: 'Donne un nom à ton projet',
        goal: 'Un nom court, prononçable, disponible.',
        why: 'Le nom sert partout à partir de maintenant : le dépôt de code, l’adresse du site, les prompts. Le choisir une fois, tôt, évite de tout renommer dans trois semaines.',
        estimatedMinutes: 25,
        subSteps: [
          {
            title: 'Trouve cinq candidats',
            body:
              'Un bon nom ici n’est pas un nom de marque génial. C’est un nom que tu peux taper sans faute et dire au téléphone.',
            actions: [
              { instruction: 'Écris cinq noms de deux syllabes maximum, sans tiret ni chiffre.' },
              { instruction: 'Élimine ceux qui s’écrivent de deux façons différentes quand on les entend.' },
              { instruction: 'Pour les trois qui restent, vérifie que le `.fr` ou le `.com` est libre.', externalUrl: 'https://www.namecheap.com/domains/domain-name-search/' },
              { instruction: 'Cherche le nom sur un moteur de recherche. S’il existe déjà une entreprise du même secteur avec ce nom, écarte-le.' },
              { instruction: 'Garde-en un. Note-le en bas de l’étape : il sera repris automatiquement dans tous tes prompts.' },
            ],
          },
        ],
        checkpoints: [
          { label: 'J’ai choisi un nom', proofKind: 'text', proofField: 'projectName' },
          { label: 'Le nom de domaine correspondant est libre' },
        ],
      },
    ],
  },
  {
    key: 'valider',
    title: 'Valider avant de construire',
    goal: 'Parler à dix personnes concernées avant d’écrire une ligne.',
    outcome: 'Dix conversations avec de vrais concernés.',
    steps: [
      {
        title: 'Fais ta liste de dix personnes',
        goal: 'Dix noms de personnes réelles que tu peux joindre cette semaine.',
        why: 'Le moteur t’a proposé cette idée parce que tu connais ce milieu. C’est ton seul avantage sur quelqu’un de mieux financé que toi. Si tu sautes cette étape, tu le perds.',
        estimatedMinutes: 30,
        subSteps: [
          {
            title: 'Écris les noms',
            body:
              'Des noms, pas des catégories. « Trois kinés » ne compte pas. « Camille, le cabinet de la rue Pasteur » compte.',
            actions: [
              { instruction: 'Ouvre tes contacts téléphone et fais défiler en entier. Note toute personne du métier visé.' },
              { instruction: 'Fais la même chose avec tes conversations des six derniers mois.' },
              { instruction: 'Ajoute les personnes que tu peux atteindre par quelqu’un d’autre : note « Camille — par Julien ».' },
              { instruction: 'Complète avec cinq établissements du métier visé à moins de trente minutes de chez toi.' },
              { instruction: 'Tu dois arriver à dix lignes. Si tu n’y arrives pas, c’est un signal : reviens choisir une autre idée, tu n’as pas l’accès au marché.' },
            ],
          },
        ],
        checkpoints: [
          { label: 'Ma liste contient dix noms de personnes réelles' },
          { label: 'Au moins cinq sont joignables directement, sans intermédiaire' },
        ],
      },
      {
        title: 'Mène les dix conversations',
        goal: 'Écouter, ne rien vendre, noter ce qui revient.',
        why: 'Tu ne cherches pas à savoir si ton idée plaît — on te dira toujours oui par politesse. Tu cherches à savoir ce que la personne fait aujourd’hui, combien de temps ça lui prend, et ce qu’elle a déjà essayé.',
        estimatedMinutes: 180,
        difficulty: 'medium',
        subSteps: [
          {
            title: 'Envoie le message d’approche',
            body:
              'Le message ne parle pas de ton produit. Il demande quinze minutes sur leur métier. Les gens acceptent beaucoup plus facilement de parler d’eux que d’écouter quelqu’un.',
            actions: [
              { instruction: 'Copie ce message : « Bonjour [prénom], je travaille sur un outil pour [métier] et j’essaie surtout de comprendre comment ça se passe vraiment. Est-ce que tu aurais quinze minutes cette semaine ? Je ne te vends rien, j’ai juste besoin de comprendre. »' },
              { instruction: 'Envoie-le aux dix personnes de ta liste, une par une. Jamais en message groupé.' },
              { instruction: 'Relance une seule fois, quatre jours après, en une ligne.' },
            ],
          },
          {
            title: 'Pose les cinq questions',
            body:
              'Toujours les mêmes cinq questions, dans le même ordre. C’est ce qui te permet de comparer dix réponses entre elles.',
            actions: [
              { instruction: 'Demande : « Raconte-moi comment tu fais ça aujourd’hui, concrètement, depuis le début. »' },
              { instruction: 'Demande : « Combien de temps ça te prend par semaine ? »' },
              { instruction: 'Demande : « Qu’est-ce que tu as déjà essayé pour améliorer ça ? »' },
              { instruction: 'Demande : « Pourquoi ça n’a pas marché ? »' },
              { instruction: 'Demande : « Si quelqu’un réglait ça, qu’est-ce que ça changerait pour toi ? » Puis tais-toi et laisse le silence.' },
              { instruction: 'Note les réponses mot pour mot, pas ton interprétation. Tu réutiliseras ces phrases dans ta page de vente.' },
            ],
          },
          {
            title: 'Compte ce qui revient',
            body:
              'Trois personnes sur dix qui décrivent la même corvée, c’est un produit. Une seule, c’est un service sur mesure.',
            actions: [
              { instruction: 'Relis tes dix comptes rendus d’affilée.' },
              { instruction: 'Note les formulations qui reviennent au moins trois fois.' },
              { instruction: 'Si personne ne décrit spontanément le problème que tu voulais résoudre, change de problème avant de construire. C’est le moment le moins cher pour le faire.' },
            ],
          },
        ],
        checkpoints: [
          { label: 'J’ai eu au moins six conversations réelles' },
          { label: 'J’ai noté les réponses mot pour mot' },
          { label: 'Au moins trois personnes décrivent le même problème' },
          { label: 'Je sais combien de temps ce problème leur coûte par semaine' },
        ],
      },
    ],
  },
  {
    key: 'comptes',
    title: 'Préparer les comptes',
    goal: 'Créer les quatre comptes dont tu auras besoin, une bonne fois.',
    outcome: 'GitHub, Vercel, Claude, Stripe.',
    steps: [
      {
        title: 'Crée ton compte GitHub',
        goal: 'Un compte GitHub, qui gardera ton code en sécurité.',
        why: 'GitHub est l’endroit où vit ton code. C’est aussi ce qui te permet de revenir en arrière quand quelque chose casse. Sans lui, une erreur peut effacer une semaine de travail.',
        estimatedMinutes: 10,
        subSteps: [
          {
            title: 'Inscription',
            body: 'C’est gratuit et ça prend cinq minutes. Utilise une adresse e-mail que tu consultes vraiment.',
            actions: [
              { instruction: 'Va sur github.com.', externalUrl: 'https://github.com/signup' },
              { instruction: 'Clique sur « Sign up » en haut à droite.' },
              { instruction: 'Entre ton adresse e-mail, puis clique sur « Continue ».' },
              { instruction: 'Choisis un mot de passe. Note-le dans ton gestionnaire de mots de passe, tu en auras besoin.' },
              { instruction: 'Choisis un nom d’utilisateur. Il apparaîtra dans l’adresse de ton code : prends quelque chose de sobre.' },
              { instruction: 'Valide le code reçu par e-mail.' },
              { instruction: 'Quand on te propose un plan, choisis « Free ». Tu n’as besoin de rien d’autre.' },
            ],
          },
          {
            title: 'Active la double authentification',
            body:
              'GitHub l’exige pour tout le monde, et c’est une bonne chose : ton code y vit. Fais-le maintenant plutôt que d’être bloqué dans deux semaines.',
            actions: [
              { instruction: 'Clique sur ta photo en haut à droite, puis « Settings ».' },
              { instruction: 'Dans le menu de gauche, clique sur « Password and authentication ».' },
              { instruction: 'Clique sur « Enable two-factor authentication ».' },
              { instruction: 'Choisis « Set up using an app » et scanne le code avec une application d’authentification sur ton téléphone.' },
              { instruction: 'Enregistre les codes de secours qu’on te propose. Mets-les ailleurs que sur ton téléphone.' },
            ],
          },
        ],
        checkpoints: [
          { label: 'Je peux me connecter à github.com' },
          { label: 'La double authentification est active' },
        ],
      },
      {
        title: 'Crée ton compte Vercel',
        goal: 'Le compte qui mettra ton site en ligne.',
        why: 'Vercel prend ton code sur GitHub et le transforme en site accessible à tout le monde. Gratuitement, tant que tu débutes.',
        estimatedMinutes: 8,
        subSteps: [
          {
            title: 'Inscription par GitHub',
            body:
              'Inscris-toi **avec GitHub**, pas avec une adresse e-mail. Ça évite une manipulation de liaison plus tard.',
            actions: [
              { instruction: 'Va sur vercel.com.', externalUrl: 'https://vercel.com/signup' },
              { instruction: 'Clique sur « Sign Up » en haut à droite.' },
              { instruction: 'Choisis « Hobby » — c’est l’offre gratuite, elle suffit largement.' },
              { instruction: 'Entre ton prénom quand on te le demande, puis clique sur « Continue ».' },
              { instruction: 'Clique sur « Continue with GitHub ».' },
              { instruction: 'Une fenêtre GitHub s’ouvre et demande l’autorisation. Clique sur « Authorize Vercel ».' },
              { instruction: 'Tu arrives sur un tableau de bord vide. C’est normal, il n’y a encore rien.' },
            ],
          },
        ],
        checkpoints: [
          { label: 'Je vois le tableau de bord Vercel' },
          { label: 'Mon compte Vercel est relié à mon compte GitHub' },
        ],
      },
      {
        title: 'Crée ton compte Claude',
        goal: 'L’outil qui écrira le code à ta place.',
        why: 'C’est lui qui construit. Toi, tu lui dis quoi construire — et Nexteo te donne exactement quoi lui dire.',
        estimatedMinutes: 8,
        subSteps: [
          {
            title: 'Inscription',
            body:
              'L’offre gratuite permet de commencer. Tu verras vite si tu as besoin de plus : le signal, c’est de te faire interrompre en plein milieu d’une étape.',
            actions: [
              { instruction: 'Va sur claude.ai.', externalUrl: 'https://claude.ai' },
              { instruction: 'Clique sur « Sign up ».' },
              { instruction: 'Utilise la même adresse e-mail que pour GitHub, ce sera plus simple à retrouver.' },
              { instruction: 'Valide le code reçu par e-mail.' },
              { instruction: 'Ouvre une nouvelle conversation et écris « bonjour » pour vérifier que tout répond.' },
            ],
          },
        ],
        checkpoints: [{ label: 'J’ai eu une réponse de Claude dans une conversation' }],
      },
      {
        title: 'Crée ton compte Stripe',
        goal: 'Le compte qui encaissera les paiements.',
        why: 'On le crée maintenant parce que la vérification d’identité prend parfois deux jours. Le jour où tu voudras encaisser, tu ne veux pas attendre.',
        estimatedMinutes: 20,
        difficulty: 'medium',
        subSteps: [
          {
            title: 'Inscription',
            body:
              'Tu peux tout tester sans avoir terminé la vérification. Mais commence-la aujourd’hui, elle tourne en arrière-plan.',
            actions: [
              { instruction: 'Va sur stripe.com.', externalUrl: 'https://dashboard.stripe.com/register' },
              { instruction: 'Clique sur « Commencer maintenant ».' },
              { instruction: 'Entre ton adresse e-mail, ton nom et un mot de passe.' },
              { instruction: 'Choisis « France » comme pays.' },
              { instruction: 'Valide ton adresse e-mail.' },
              { instruction: 'Sur le tableau de bord, repère l’interrupteur « Mode test » en haut à droite. Laisse-le **activé** : tout ce que tu feras jusqu’à la phase 9 doit rester en test.' },
            ],
          },
          {
            title: 'Lance la vérification d’identité',
            body:
              'Stripe a besoin de savoir qui encaisse. Si tu as moins de dix-huit ans, tu ne peux pas ouvrir de compte à ton nom : passe cette étape et reviens-y plus tard, le reste du parcours fonctionne sans.',
            actions: [
              { instruction: 'Clique sur « Activer le compte » dans le bandeau en haut.' },
              { instruction: 'Renseigne ton statut. Si tu n’as pas encore d’entreprise, choisis « Particulier / Auto-entrepreneur ».' },
              { instruction: 'Ajoute ton IBAN : c’est le compte sur lequel l’argent arrivera.' },
              { instruction: 'Téléverse une pièce d’identité quand c’est demandé.' },
              { instruction: 'Ferme la fenêtre. La vérification continue sans toi, tu recevras un e-mail.' },
            ],
          },
        ],
        checkpoints: [
          { label: 'Je vois le tableau de bord Stripe' },
          { label: 'Le mode test est activé' },
          { label: 'J’ai lancé la vérification d’identité', isRequired: false },
        ],
      },
    ],
  },
];
