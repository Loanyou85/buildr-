import { CONTEXTE, type PromptTemplateSeed } from './types';

const c = CONTEXTE;

/** Contexte technique injecté dans chaque prompt de réparation. */
const ETAT = `État de mon projet :
- Dépôt : {{repoUrl}}
- Site en ligne : {{deployUrl}}
- Technologies : {{stack}}
- Écrans existants : {{screens}}
- Données existantes : {{entities}}`;

/**
 * Prompts de réparation (section 11.5). La partie la plus négligée et la plus
 * décisive : un utilisateur sans compétence technique dont le déploiement
 * échoue abandonne en dix minutes s'il n'a pas de réponse.
 */
export const REPARATION: PromptTemplateSeed[] = [
  {
    slug: 'reparation-build-vercel',
    blockKey: 'reparation',
    order: 1,
    title: 'La construction échoue sur Vercel',
    objective: 'Faire passer le déploiement.',
    target: 'claude_code',
    isRepair: true,
    body: `${c}

${ETAT}

Mon déploiement Vercel échoue. Voici le journal d'erreur complet :

"""
{{errorMessage}}
"""

Fais dans cet ordre :
1. Dis-moi en une phrase, sans jargon, ce qui ne va pas.
2. Reproduis l'erreur en lançant la construction en local. Ne devine pas.
3. Corrige la cause, pas le symptôme. Ne désactive pas une vérification pour
   faire passer la construction.
4. Relance la construction en local et montre-moi qu'elle passe.
5. Dis-moi quoi faire ensuite chez Vercel, en étapes cliquables.

Si la cause est une variable d'environnement manquante, donne-moi son nom
exact et où trouver sa valeur. Ne me demande jamais de te coller sa valeur.`,
    expectedOutcome: 'La construction passe en local, puis sur Vercel.',
    verification: 'Relance le déploiement sur Vercel : il doit aller au bout.',
  },
  {
    slug: 'reparation-module-introuvable',
    blockKey: 'reparation',
    order: 2,
    title: 'Un module est introuvable',
    objective: 'Réinstaller ou corriger la dépendance manquante.',
    target: 'claude_code',
    isRepair: true,
    body: `${c}

${ETAT}

J'ai cette erreur :

"""
{{errorMessage}}
"""

1. Dis-moi quel paquet manque, et s'il est censé être là.
2. Vérifie s'il est bien déclaré dans package.json. S'il manque, ajoute-le
   avec une version fixe, pas une plage.
3. Si le paquet est déclaré mais introuvable, supprime node_modules et le
   fichier de verrouillage, puis réinstalle proprement.
4. Vérifie que package.json et le fichier de verrouillage partent bien sur
   GitHub : sans eux, Vercel ne peut pas installer.
5. Relance et montre-moi que ça marche.`,
    expectedOutcome: 'Le module est installé et déclaré, en local comme au déploiement.',
    verification: 'Relance le site : l’erreur ne doit plus apparaître.',
  },
  {
    slug: 'reparation-variable-env',
    blockKey: 'reparation',
    order: 3,
    title: 'Une variable d’environnement manque',
    objective: 'Identifier la variable et la poser au bon endroit.',
    target: 'claude_code',
    isRepair: true,
    body: `${c}

${ETAT}

J'ai cette erreur :

"""
{{errorMessage}}
"""

1. Dis-moi le nom exact de la variable attendue.
2. Dis-moi à quoi elle sert et où aller chercher sa valeur, en étapes
   cliquables sur le site concerné.
3. Explique-moi où la poser : dans le fichier local, et dans les réglages
   Vercel.
4. Vérifie dans le code que le programme tolère une variable définie mais
   vide. Une chaîne vide n'est pas rattrapée par l'opérateur de valeur par
   défaut, et c'est une cause d'échec très fréquente au déploiement.
5. Vérifie qu'aucune variable secrète ne porte le préfixe qui l'exposerait au
   navigateur.

Ne me demande jamais de coller la valeur de la variable dans cette
conversation.`,
    expectedOutcome: 'La variable est identifiée, posée aux deux endroits, et le code tolère une valeur vide.',
    verification: 'Redéploie sur Vercel après avoir ajouté la variable.',
  },
  {
    slug: 'reparation-migration-prisma',
    blockKey: 'reparation',
    order: 4,
    title: 'La migration de base échoue',
    objective: 'Remettre la base et les migrations d’accord.',
    target: 'claude_code',
    isRepair: true,
    body: `${c}

${ETAT}

Ma migration de base de données échoue :

"""
{{errorMessage}}
"""

1. Dis-moi si le problème vient du schéma, des données déjà présentes, ou de
   la connexion.
2. Si la base contient déjà des données incompatibles avec le nouveau schéma,
   écris les instructions de nettoyage à exécuter avant la migration, dans le
   fichier de migration lui-même. Ne me demande pas de le faire à la main.
3. Si l'erreur parle d'une connexion, vérifie que la migration utilise une
   connexion directe et non un pooler : un pooler ne sait pas exécuter des
   instructions de migration.
4. Applique la migration et montre-moi la liste des tables après.

N'efface jamais la base sans me le demander explicitement d'abord.`,
    expectedOutcome: 'La migration s’applique, en local et au déploiement.',
    verification: 'Demande la liste des tables : elle doit correspondre au schéma.',
  },
  {
    slug: 'reparation-webhook-stripe',
    blockKey: 'reparation',
    order: 5,
    title: 'Le webhook Stripe échoue',
    objective: 'Faire aboutir la vérification de signature.',
    target: 'claude_code',
    isRepair: true,
    body: `${c}

${ETAT}

Mon webhook Stripe renvoie une erreur :

"""
{{errorMessage}}
"""

Vérifie ces points, dans cet ordre, et corrige ce qui ne va pas :
1. Le code lit-il le corps **brut** de la requête ? Une lecture en JSON casse
   la signature. C'est la cause dans la grande majorité des cas.
2. Le secret de signature utilisé correspond-il au point de terminaison
   déclaré dans Stripe ? Un secret de test ne valide pas un événement réel.
3. Le point de terminaison est-il déclaré sur la bonne adresse, celle du site
   en ligne et non une adresse locale ?
4. Le code renvoie-t-il bien une erreur 500 quand le traitement échoue, pour
   que Stripe réessaie ?

Montre-moi le fichier corrigé en entier.`,
    expectedOutcome: 'Les tentatives de webhook passent au vert dans Stripe.',
    verification: 'Dans Stripe, « Développeurs » puis « Webhooks » : renvoie un événement et regarde la réponse.',
  },
  {
    slug: 'reparation-typage',
    blockKey: 'reparation',
    order: 6,
    title: 'Une erreur de typage bloque',
    objective: 'Corriger le type, sans le contourner.',
    target: 'claude_code',
    isRepair: true,
    body: `${c}

${ETAT}

J'ai cette erreur de typage :

"""
{{errorMessage}}
"""

1. Explique-moi en une phrase ce que le vérificateur reproche.
2. Corrige la cause réelle. N'utilise ni "any", ni un point d'exclamation, ni
   un commentaire qui désactive la vérification : ces trois solutions
   déplacent le problème vers l'exécution, où il deviendra une page blanche
   chez un client.
3. Si la valeur peut réellement être absente, traite ce cas explicitement.
4. Relance la vérification de types complète et montre-moi qu'elle passe.`,
    expectedOutcome: 'La vérification de types passe, sans contournement.',
    verification: 'Relance la vérification de types : aucune erreur ne doit rester.',
  },
  {
    slug: 'reparation-serveur-client',
    blockKey: 'reparation',
    order: 7,
    title: 'Erreur entre composant serveur et composant client',
    objective: 'Remettre la frontière au bon endroit.',
    target: 'claude_code',
    isRepair: true,
    body: `${c}

${ETAT}

J'ai cette erreur :

"""
{{errorMessage}}
"""

1. Dis-moi quel fichier mélange du code serveur et du code navigateur.
2. Rappelle-moi la règle en une phrase.
3. Corrige en déplaçant l'interactivité dans un petit composant client, et en
   laissant le reste côté serveur. Ne rends pas toute la page cliente : ça
   alourdit le chargement sur téléphone.
4. Vérifie qu'aucune clé secrète ne se retrouve dans un composant client.
5. Relance et montre-moi que ça marche.`,
    expectedOutcome: 'La page fonctionne, avec le minimum de code envoyé au navigateur.',
    verification: 'Recharge la page : l’erreur ne doit plus apparaître, et le site doit rester rapide.',
  },
  {
    slug: 'reparation-hydratation',
    blockKey: 'reparation',
    order: 8,
    title: 'Le contenu affiché ne correspond pas',
    objective: 'Supprimer la divergence entre serveur et navigateur.',
    target: 'claude_code',
    isRepair: true,
    body: `${c}

${ETAT}

J'ai cette erreur :

"""
{{errorMessage}}
"""

1. Trouve ce qui change entre le rendu serveur et le rendu navigateur. Les
   causes habituelles : une date ou une heure calculée au rendu, un nombre
   aléatoire, une lecture du stockage du navigateur, ou une détection de
   taille d'écran.
2. Corrige en calculant la valeur au même endroit dans les deux cas, ou en
   n'affichant la partie variable qu'après le premier rendu.
3. Ne masque pas l'avertissement : il annonce un affichage faux chez un
   client.
4. Relance et montre-moi que l'avertissement a disparu.`,
    expectedOutcome: 'Plus d’avertissement, et un affichage identique des deux côtés.',
    verification: 'Ouvre la console du navigateur et recharge : plus aucun avertissement rouge.',
  },
  {
    slug: 'reparation-base-injoignable',
    blockKey: 'reparation',
    order: 9,
    title: 'La base de données est injoignable',
    objective: 'Rétablir la connexion.',
    target: 'claude_code',
    isRepair: true,
    body: `${c}

${ETAT}

Je n'arrive plus à joindre la base :

"""
{{errorMessage}}
"""

1. Dis-moi si l'erreur vient de l'adresse, du mot de passe, du réseau, ou
   d'une limite de connexions atteinte.
2. Si c'est une limite de connexions : vérifie que le client de base est créé
   une seule fois et réutilisé, pas recréé à chaque requête. C'est la cause la
   plus fréquente en développement.
3. Si c'est l'adresse : vérifie que la connexion applicative passe par le
   pooler et que les migrations utilisent la connexion directe.
4. Si l'hébergeur met la base en veille, dis-le-moi : la première requête
   après une pause peut échouer, et il faut réessayer.
5. Montre-moi une requête de test qui prouve que la connexion est rétablie.`,
    expectedOutcome: 'La connexion à la base fonctionne à nouveau.',
    verification: 'Ouvre un écran qui lit des données : il doit se charger.',
  },
  {
    slug: 'reparation-git',
    blockKey: 'reparation',
    order: 10,
    title: 'L’envoi sur GitHub est refusé',
    objective: 'Remettre le dépôt en état d’être publié.',
    target: 'claude_code',
    isRepair: true,
    body: `${c}

${ETAT}

Je n'arrive pas à envoyer mon code sur GitHub :

"""
{{errorMessage}}
"""

1. Dis-moi si c'est un problème d'autorisation, de dépôt non relié, de
   divergence entre ma version et celle du serveur, ou de fichier trop gros.
2. Donne-moi la marche à suivre dans GitHub Desktop, en étapes cliquables.
   Ne me donne une commande à taper que si c'est vraiment impossible autrement.
3. Si mon travail et celui du serveur ont divergé, explique-moi comment
   récupérer les deux sans rien perdre. Ne me propose jamais d'écraser le
   serveur sans me dire ce que je perds.
4. Si un fichier de secrets est concerné, dis-le tout de suite et explique
   comment le retirer de l'historique, puis comment remplacer les clés
   exposées.`,
    expectedOutcome: 'Le code part sur GitHub, sans secret et sans perte.',
    verification: 'Ouvre ton dépôt sur github.com : le dernier enregistrement doit y être.',
  },
  {
    slug: 'reparation-domaine',
    blockKey: 'reparation',
    order: 11,
    title: 'Le nom de domaine ne répond pas',
    objective: 'Faire pointer le domaine vers le site.',
    target: 'claude_web',
    isRepair: true,
    body: `${c}

${ETAT}

Mon domaine {{domainName}} ne mène pas à mon site. Vercel affiche :

"""
{{errorMessage}}
"""

1. Dis-moi en une phrase ce que ça veut dire.
2. Donne-moi la liste exacte des enregistrements à créer chez mon vendeur de
   domaine, avec leur type, leur nom et leur valeur, présentés en tableau.
3. Dis-moi combien de temps attendre avant de conclure que ça ne marche pas.
   La propagation prend de dix minutes à quarante-huit heures, et il n'y a
   rien à faire pendant ce temps.
4. Donne-moi une façon simple de vérifier si le changement est pris en compte.
5. Liste les trois erreurs les plus fréquentes : un point final oublié, un
   ancien enregistrement laissé en place, ou une redirection posée chez le
   vendeur qui court-circuite tout.`,
    expectedOutcome: 'Les bons enregistrements, et une façon de vérifier la propagation.',
    verification: 'Dans Vercel, onglet « Domains » : la pastille doit passer au vert.',
  },
  {
    slug: 'reparation-stripe-config',
    blockKey: 'reparation',
    order: 12,
    title: 'Stripe refuse la configuration',
    objective: 'Remettre d’accord le mode, les clés et le tarif.',
    target: 'claude_code',
    isRepair: true,
    body: `${c}

${ETAT}

Stripe me renvoie :

"""
{{errorMessage}}
"""

1. Dis-moi si mes clés sont en test ou en production, d'après le préfixe :
   sk_test_ et pk_test_ pour le test, sk_live_ et pk_live_ pour la production.
2. Rappelle-moi que le mode test et le mode réel ne partagent rien : ni
   produits, ni tarifs, ni webhooks. Un identifiant de tarif créé en test
   n'existe pas en production, et inversement.
3. Vérifie que la clé secrète, l'identifiant de tarif et le secret de
   signature sont tous les trois dans le même mode.
4. Dis-moi lequel des trois est dans le mauvais mode, et où le remplacer.
5. Si la clé secrète a pu être exposée, dis-moi de la faire tourner dans
   Stripe avant toute autre chose.`,
    expectedOutcome: 'Les trois valeurs Stripe sont dans le même mode.',
    verification: 'Relance un paiement : en production, la carte de test doit être refusée.',
  },
  {
    slug: 'reparation-quota',
    blockKey: 'reparation',
    order: 13,
    title: 'Une limite d’usage est atteinte',
    objective: 'Comprendre laquelle, et comment continuer.',
    target: 'claude_web',
    isRepair: true,
    body: `${c}

${ETAT}

Je suis bloqué par une limite :

"""
{{errorMessage}}
"""

1. Dis-moi quel service impose cette limite, et laquelle exactement.
2. Dis-moi quand elle se remet à zéro.
3. Donne-moi ce que je peux faire tout de suite, gratuitement, pour avancer
   en attendant.
4. Si la seule solution est de payer, dis-le franchement, avec le montant, et
   dis-moi si c'est vraiment nécessaire maintenant ou si ça peut attendre.
5. Si la limite vient d'un usage anormal de mon code — une boucle qui appelle
   sans arrêt, par exemple — trouve-la et corrige-la.`,
    expectedOutcome: 'La limite est identifiée, avec une façon d’avancer.',
    verification: 'Reprends l’étape où tu étais bloqué.',
  },
  {
    slug: 'reparation-port',
    blockKey: 'reparation',
    order: 14,
    title: 'Le site ne démarre pas en local',
    objective: 'Libérer ce qui bloque et relancer.',
    target: 'claude_code',
    isRepair: true,
    body: `${c}

${ETAT}

Le serveur ne démarre pas :

"""
{{errorMessage}}
"""

1. Dis-moi si c'est un port déjà utilisé, une version de Node incompatible,
   ou autre chose.
2. Si c'est un port occupé : donne-moi la commande exacte, pour mon système,
   qui libère le port, ou lance le site sur un autre port.
3. Si c'est une version de Node : dis-moi quelle version installer et depuis
   où, et vérifie que la même version est utilisée au déploiement.
4. Relance le site et donne-moi l'adresse à ouvrir.`,
    expectedOutcome: 'Le site démarre et s’ouvre dans le navigateur.',
    verification: 'Ouvre l’adresse donnée : la page doit s’afficher.',
  },
  {
    slug: 'reparation-diagnostic',
    blockKey: 'reparation',
    order: 99,
    title: 'Diagnostic général',
    objective: 'Quand rien ne correspond : faire lire l’erreur à Claude.',
    target: 'claude_code',
    isRepair: true,
    body: `${c}

${ETAT}

Quelque chose ne marche pas et je ne sais pas quoi. Voici ce que je vois :

"""
{{errorMessage}}
"""

Ce que je faisais au moment où c'est arrivé : {{contexteUtilisateur}}

Procède comme ceci :
1. Dis-moi en une phrase, sans jargon, ce qui se passe.
2. Ne devine pas : reproduis le problème. Lance ce qu'il faut pour le voir
   toi-même.
3. Quand tu l'as reproduit, dis-moi la cause exacte.
4. Corrige la cause, pas le symptôme.
5. Prouve-moi que c'est réglé : montre-moi la même opération qui passe.
6. Dis-moi en une ligne ce qu'il faut éviter pour que ça ne revienne pas.

Je ne sais pas coder : ne me demande pas de modifier un fichier moi-même.`,
    expectedOutcome: 'Une cause identifiée, une correction, et une preuve que ça passe.',
    verification: 'Refais l’opération qui échouait.',
  },
];

/** Bibliothèque d'erreurs connues (section 11.5) : au moins vingt motifs. */
export interface ErrorPatternSeed {
  signature: string;
  /** Expression régulière testée sur le message collé, insensible à la casse. */
  matcher: string;
  label: string;
  category: string;
  explanation: string;
  repairSlug: string;
}

export const ERREURS: ErrorPatternSeed[] = [
  {
    signature: 'vercel-build-failed',
    matcher: 'build failed|command .npm run build. exited with|error occurred prerendering',
    label: 'La construction a échoué sur Vercel',
    category: 'Déploiement',
    explanation:
      'Le site n’a pas pu être fabriqué. La vraie erreur est plus haut dans le journal : celle-ci n’est que la conclusion.',
    repairSlug: 'reparation-build-vercel',
  },
  {
    signature: 'module-not-found',
    matcher: "module not found|cannot find module|can't resolve '",
    label: 'Un fichier ou un paquet est introuvable',
    category: 'Dépendances',
    explanation:
      'Le code demande quelque chose qui n’est pas installé, ou dont le chemin est faux.',
    repairSlug: 'reparation-module-introuvable',
  },
  {
    signature: 'eresolve',
    matcher: 'eresolve|could not resolve dependency|peer dep',
    label: 'Deux paquets demandent des versions incompatibles',
    category: 'Dépendances',
    explanation:
      'Deux bibliothèques ne s’entendent pas sur la version d’une troisième. Ça se règle en fixant les versions.',
    repairSlug: 'reparation-module-introuvable',
  },
  {
    signature: 'env-missing',
    matcher: 'environment variable|env var|is not defined.*process\\.env|missing.*_url|missing.*_key',
    label: 'Une variable d’environnement manque',
    category: 'Configuration',
    explanation:
      'Le programme attend une valeur qu’on ne lui a pas donnée — souvent une adresse de base ou une clé.',
    repairSlug: 'reparation-variable-env',
  },
  {
    signature: 'invalid-url',
    matcher: 'invalid url|failed to construct .url.|typeerror: invalid url',
    label: 'Une adresse est vide ou mal formée',
    category: 'Configuration',
    explanation:
      'Une variable d’adresse est définie mais vide. C’est un piège classique : une chaîne vide n’est pas rattrapée par une valeur par défaut.',
    repairSlug: 'reparation-variable-env',
  },
  {
    signature: 'prisma-migrate-failed',
    matcher: 'migration.*failed|p3006|p3009|migrate deploy|drift detected',
    label: 'La migration de base a échoué',
    category: 'Base de données',
    explanation:
      'Le schéma et la base ne sont plus d’accord, ou des données existantes empêchent le changement.',
    repairSlug: 'reparation-migration-prisma',
  },
  {
    signature: 'prisma-client-not-generated',
    matcher: '@prisma/client did not initialize|prisma generate',
    label: 'Le client de base n’a pas été généré',
    category: 'Base de données',
    explanation:
      'Une étape de génération manque avant la construction. Elle doit faire partie de la commande de build.',
    repairSlug: 'reparation-build-vercel',
  },
  {
    signature: 'unique-constraint',
    matcher: 'unique constraint failed|p2002|duplicate key value',
    label: 'Cette donnée existe déjà',
    category: 'Base de données',
    explanation:
      'On essaie d’insérer une ligne qui existe déjà. Souvent parce qu’un script a tourné deux fois en même temps.',
    repairSlug: 'reparation-migration-prisma',
  },
  {
    signature: 'db-connection-refused',
    matcher: 'econnrefused|connection refused|can.t reach database server|p1001',
    label: 'La base de données ne répond pas',
    category: 'Base de données',
    explanation: 'L’adresse est fausse, la base est en veille, ou le réseau bloque.',
    repairSlug: 'reparation-base-injoignable',
  },
  {
    signature: 'db-too-many-connections',
    matcher: 'too many connections|max client connections|p2037',
    label: 'Trop de connexions à la base',
    category: 'Base de données',
    explanation:
      'Le client de base est recréé à chaque requête au lieu d’être réutilisé, et les connexions s’accumulent.',
    repairSlug: 'reparation-base-injoignable',
  },
  {
    signature: 'stripe-signature',
    matcher: 'no signatures found matching|webhook signature verification failed|stripe-signature',
    label: 'La signature du webhook Stripe est refusée',
    category: 'Paiement',
    explanation:
      'Presque toujours : le corps de la requête a été lu en JSON au lieu d’être lu brut. Ou le secret ne correspond pas.',
    repairSlug: 'reparation-webhook-stripe',
  },
  {
    signature: 'stripe-no-such-price',
    matcher: 'no such price|no such product|resource_missing',
    label: 'Ce tarif Stripe n’existe pas',
    category: 'Paiement',
    explanation:
      'Un tarif créé en mode test n’existe pas en mode réel, et inversement. Les deux mondes ne partagent rien.',
    repairSlug: 'reparation-stripe-config',
  },
  {
    signature: 'stripe-invalid-api-key',
    matcher: 'invalid api key|expired api key|authentication.*stripe',
    label: 'La clé Stripe est refusée',
    category: 'Paiement',
    explanation: 'La clé est fausse, a été remplacée, ou n’est pas dans le bon mode.',
    repairSlug: 'reparation-stripe-config',
  },
  {
    signature: 'stripe-testmode-mismatch',
    matcher: 'test mode key|live mode key|testmode',
    label: 'Mélange entre mode test et mode réel',
    category: 'Paiement',
    explanation: 'Une clé de test et une donnée de production se croisent, ou l’inverse.',
    repairSlug: 'reparation-stripe-config',
  },
  {
    signature: 'type-error',
    matcher: 'type error|ts\\(\\d+\\)|is not assignable to type|property .* does not exist on type',
    label: 'Une erreur de typage bloque la construction',
    category: 'Code',
    explanation:
      'Le vérificateur a repéré une incohérence. La contourner la déplace vers l’exécution, chez un client.',
    repairSlug: 'reparation-typage',
  },
  {
    signature: 'syntax-error',
    matcher: 'syntax error|unexpected token|parsing error',
    label: 'Le code contient une faute de frappe',
    category: 'Code',
    explanation: 'Une parenthèse, une virgule ou une accolade manque quelque part.',
    repairSlug: 'reparation-diagnostic',
  },
  {
    signature: 'use-client-server',
    matcher: 'use client|use server|server components?|only works in a client component',
    label: 'Mélange entre code serveur et code navigateur',
    category: 'Code',
    explanation:
      'Un fichier essaie de faire les deux. Il faut isoler la partie interactive dans un petit composant à part.',
    repairSlug: 'reparation-serveur-client',
  },
  {
    signature: 'hydration-mismatch',
    matcher: 'hydration|did not match|text content does not match',
    label: 'L’affichage diffère entre le serveur et le navigateur',
    category: 'Code',
    explanation:
      'Quelque chose change entre les deux rendus : une date, un aléa, une lecture du navigateur. Ça annonce un affichage faux.',
    repairSlug: 'reparation-hydratation',
  },
  {
    signature: 'undefined-property',
    matcher: "cannot read propert(y|ies) of (undefined|null)|is not a function",
    label: 'Le code lit une valeur qui n’existe pas',
    category: 'Code',
    explanation: 'Une donnée attendue est absente, et le cas n’est pas traité.',
    repairSlug: 'reparation-diagnostic',
  },
  {
    signature: 'git-rejected',
    matcher: 'updates were rejected|non-fast-forward|failed to push|permission denied.*git',
    label: 'GitHub refuse l’envoi',
    category: 'Dépôt',
    explanation:
      'Ta version et celle du serveur ont divergé, ou l’autorisation manque. Rien n’est perdu.',
    repairSlug: 'reparation-git',
  },
  {
    signature: 'git-secret-detected',
    matcher: 'push protection|secret scanning|detected secret|remote rejected.*secret',
    label: 'Un secret a été détecté dans le code',
    category: 'Dépôt',
    explanation:
      'GitHub a bloqué l’envoi parce qu’une clé est écrite dans un fichier. Il faut la retirer et la remplacer chez le fournisseur.',
    repairSlug: 'reparation-git',
  },
  {
    signature: 'repo-not-linked',
    matcher: 'no remote|repository not found|not a git repository',
    label: 'Le projet n’est relié à aucun dépôt',
    category: 'Dépôt',
    explanation: 'Le dossier n’est pas encore rattaché à GitHub.',
    repairSlug: 'reparation-git',
  },
  {
    signature: 'domain-not-propagated',
    matcher: 'invalid configuration|dns_probe|nxdomain|domain is not configured|certificate',
    label: 'Le domaine ne pointe pas encore vers le site',
    category: 'Domaine',
    explanation:
      'Les enregistrements ne sont pas posés, ou la propagation n’est pas terminée. Ça peut prendre jusqu’à deux jours.',
    repairSlug: 'reparation-domaine',
  },
  {
    signature: 'port-in-use',
    matcher: 'eaddrinuse|port \\d+ is already in use|address already in use',
    label: 'Le port est déjà occupé',
    category: 'Local',
    explanation: 'Un site tourne déjà sur ce port, souvent dans une fenêtre oubliée.',
    repairSlug: 'reparation-port',
  },
  {
    signature: 'node-version',
    matcher: 'engine .node.|unsupported engine|requires node',
    label: 'La version de Node ne convient pas',
    category: 'Local',
    explanation: 'Le projet demande une version différente de celle installée.',
    repairSlug: 'reparation-port',
  },
  {
    signature: 'rate-limit',
    matcher: 'rate limit|quota exceeded|429|too many requests|usage limit',
    label: 'Une limite d’usage est atteinte',
    category: 'Limites',
    explanation: 'Un service refuse de répondre pour l’instant. Il faut attendre, ou payer.',
    repairSlug: 'reparation-quota',
  },
  {
    signature: 'out-of-memory',
    matcher: 'javascript heap out of memory|killed.*out of memory|exit code 137',
    label: 'La construction a manqué de mémoire',
    category: 'Déploiement',
    explanation: 'Le projet demande plus de mémoire que la machine n’en a pendant la construction.',
    repairSlug: 'reparation-build-vercel',
  },
];
