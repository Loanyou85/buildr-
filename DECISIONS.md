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
