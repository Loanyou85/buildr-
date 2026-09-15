# Décisions

Journal des arbitrages pris pendant la construction. Une ligne par décision, la raison
compte plus que la décision.

## Socle

- **Next.js 15.5 / React 19 / TypeScript strict.** Stack imposée. `noUncheckedIndexedAccess`
  activé en plus du strict : le moteur de scoring manipule des tableaux indexés, autant que
  le compilateur le vérifie.
- **Tailwind v4 avec `@theme`.** Les tokens de la section 4 sont des variables CSS, donc
  réutilisables hors Tailwind (canvas de la carte de jalon, e-mails).
- **Postgres local pour le développement.** Migrations et seed réellement appliquées, pas
  seulement écrites.
- **Prisma 6.** Prisma 7/8 changent la génération du client ; inutile de payer cette
  migration maintenant.

## Produit

- **Le variant `signal` du bouton est unique par écran.** Matérialisé par un seul composant
  et vérifié par un test Playwright qui compte les occurrences sur les écrans d'app.
- **`progressPercent` monotone.** Écrit via `Math.max(actuel, calculé)` dans une seule
  fonction (`src/lib/journey/progress.ts`) — impossible de faire reculer la barre ailleurs.
- **Le refus d'une recommandation demande une raison.** Après deux refus, on ne propose pas
  une troisième alternative : on propose de reprendre les questions d'onboarding qui pèsent
  le plus dans le score. Le système encourage l'exécution.
- **L'IA ne score pas.** Elle normalise les réponses libres en signaux et rédige
  l'explication. Sans clé API, le produit fonctionne : les signaux tombent en heuristique
  locale et l'explication est générée depuis le `breakdown`. Le chemin ne dépend jamais d'un
  appel réseau.
- **Assistant contextuel sans clé API.** Il répond avec le contenu réel de l'étape
  (sous-étapes, actions, templates) plutôt que rien. C'est cohérent avec le produit : tout
  ce qu'il faut savoir est déjà dans le chemin.
- **Jalons déclaratifs.** `declared` par défaut, `verified` impossible tant qu'aucune source
  de paiement n'existe. Le type Prisma n'a que deux valeurs, donc rien d'autre ne peut être
  écrit.
- **Mineurs.** L'âge est demandé au premier écran d'onboarding. Sous 16 ans, aucune donnée
  de profil n'est écrite et le compte est supprimé : le blocage est en base, pas en CSS.
  De 16 à 18 ans, `Adventure.isPublic` est forcé à `false` côté serveur.
- **Témoignages de la landing vides.** Le mur lit les aventures publiques réelles ; tant
  qu'il n'y en a pas, il affiche un état vide qui invite à être le premier. Aucun faux avis.

## Contenu

- **Un parcours entièrement détaillé pour l'agence UGC** (budget 0 €, niveau débutant), six
  phases, du jour 1 au premier client, avec scripts, templates et critères de validation
  réels. Les autres business models ont un parcours d'amorçage ; la profondeur se démontre
  sur un cas, pas sur quinze esquisses.
- **Les variantes budget/niveau sont des lignes `Journey`,** pas des `if` dans le code.

## Déploiement

- **L'URL du site est résolue par `src/lib/site.ts`, jamais lue directement.** Les plateformes
  de déploiement exposent souvent une variable *définie mais vide* ; `??` ne rattrape que
  `undefined`, donc `new URL(process.env.AUTH_URL ?? '…')` cassait le build au moment de
  collecter les métadonnées. Le résolveur ignore les valeurs vides ou inanalysables, ajoute le
  protocole quand la plateforme ne donne que l'hôte, et retombe sur `localhost`. Huit tests
  couvrent ces cas, dont celui qui a réellement cassé.
- **Les migrations tournent au déploiement**, dans le script `build`. Une base en retard sur le
  code produit des pannes à l'exécution, difficiles à diagnostiquer ; un build qui échoue est
  immédiat et lisible. `build:sans-migration` reste disponible pour les cas où la base n'est pas
  joignable depuis l'environnement de build.
- **`directUrl` dans le schéma Prisma.** En production, l'application passe par un pooler de
  connexions — indispensable en serverless — mais un pooler ne sait pas exécuter des
  migrations. Prisma a besoin des deux URL. Conséquence assumée : `DIRECT_URL` devient
  obligatoire pour migrer, y compris en local, où elle vaut simplement `DATABASE_URL`.
- **Une route d'initialisation protégée** (`POST /api/admin/initialiser`) rejoue le seed sans
  terminal, parce qu'une base de production vide rend le produit inutilisable (aucun business
  model à recommander) et que tout le monde n'a pas Node installé. Fermée par défaut : sans
  `SEED_SECRET`, elle répond 503.

## Marque

- **Le logo est « les marches ».** Trois blocs qui montent en diagonale, de taille croissante,
  le dernier en orange signal. Aucun ne partage de ligne de base : c'est ce qui le distingue
  d'un graphique en barres, piste écartée pour cette raison. Une piste « escalier tracé » avait
  plus de caractère à grande taille mais se désagrégeait à 16 px — le favicon a tranché.
- **Deux variantes, pour une raison de fond.** Dans l'application, la marque est monochrome :
  l'orange y signifie une seule chose, la prochaine action, et ne doit apparaître qu'une fois
  par écran. Partout ailleurs — landing, connexion, favicon, carte de partage — la variante
  colorée s'applique. Vérifié à l'écran : l'écran « Aujourd'hui » ne contient qu'un seul
  élément orange, le bouton d'action.

## Authentification

- **E-mail et mot de passe, sans confirmation par e-mail.** Le lien magique ajoutait un
  aller-retour dans la boîte de réception avant même d'avoir vu le produit, et rendait la
  connexion dépendante de la délivrabilité d'un e-mail. L'inscription demande trois champs —
  prénom, e-mail, mot de passe — et ouvre directement le diagnostic.
- **Conséquence technique assumée : sessions signées (JWT) au lieu de sessions en base.** Un
  fournisseur à identifiants ne peut pas s'appuyer sur l'adaptateur de base. L'adaptateur
  Prisma reste en place pour Google. Les tests de bout en bout passent désormais par le vrai
  formulaire de connexion, ce qui est une amélioration : plus de raccourci par cookie fabriqué.
- **scrypt plutôt qu'une dépendance native.** Coûteux en mémoire, donc résistant aux attaques
  parallélisées sur carte graphique, présent dans Node, et sans compilation à prévoir sur une
  plateforme serverless. Les paramètres sont stockés dans l'empreinte pour pouvoir être durcis
  sans invalider les comptes existants.
- **Un seul message d'erreur pour la connexion.** « Adresse e-mail ou mot de passe incorrect » :
  distinguer les deux cas revient à confirmer qu'une adresse existe.
- **Le logo est « le cap »** : un escalier tracé d'un seul trait avec un carré posé au sommet,
  la marche qui n'est pas encore franchie, seule à porter l'orange.

## Offres

- **Trois niveaux plutôt que deux.** Découverte (gratuit), Parcours (29 €/mois), Illimité
  (59 €/mois). Le niveau supérieur repose sur des droits que le produit sait réellement
  appliquer — plusieurs activités en parallèle, toutes les variantes de parcours, assistance
  sans quota — et non sur des promesses invérifiables.
- **Le paywall arrive après la recommandation**, pas avant. Placé plus tôt il convertirait
  davantage, mais la landing promet un diagnostic gratuit et l'utilisateur paierait sans
  savoir ce qu'il achète. Le parcours est instancié avant l'écran des offres : les trois
  premières étapes restent accessibles quoi qu'il arrive.
- **Aucun paiement n'est simulé.** Sans prestataire configuré, choisir une offre payante
  enregistre l'intention (`Subscription.intendedPlan`) et le dit franchement : « aucun montant
  ne t'a été débité ». Le point de branchement est isolé dans une seule fonction. Un test
  vérifie que l'accès n'est pas accordé.

## Écran d'analyse et paiement

- **L'écran qui précède les offres affiche des chiffres, tous lus en base au rendu.** La
  demande initiale était d'annoncer « 1 200 business créés » : c'est faux — aucun utilisateur
  n'a encore créé d'activité —, c'est contraire au garde-fou n° 1, et placé juste avant un
  paiement cela constitue une pratique commerciale trompeuse (art. L121-2 du code de la
  consommation). L'effet recherché est obtenu avec des chiffres vrais : réponses analysées,
  activités comparées, dimensions pesées, volume réel du parcours.
- **Le compteur d'usage réel n'apparaît qu'au-delà de 50 parcours démarrés.** En dessous, il
  ne dit rien d'utile, et l'arrondir à la hausse serait précisément ce qu'on refuse.
- **Stripe : seul le webhook accorde un accès.** Une redirection de retour se falsifie, une
  signature Stripe non. Un abonnement résilié ou impayé ramène au plan gratuit — l'accès suit
  l'état réel du paiement, jamais l'intention. Le webhook renvoie 500 en cas d'erreur pour que
  Stripe réessaie : mieux vaut une nouvelle tentative qu'un abonnement payé sans accès.
- **Aucune interface de facturation réécrite.** Moyens de paiement, factures et résiliation
  passent par le portail Stripe.
