# Nexteo

**Crée ton SaaS de A à Z, étape par étape.**

Trouve ton idée, mets ton site en ligne, encaisse tes premiers paiements.

## Lancer en local

```bash
npm install
cp .env.example .env        # puis renseigne DATABASE_URL et AUTH_SECRET
npm run db:deploy           # crée les tables
npm run db:seed             # référentiels, archétypes, parcours, prompts
npm run dev
```

## Variables d'environnement

| Variable | Obligatoire | À quoi ça sert |
|---|---|---|
| `DATABASE_URL` | oui | Connexion applicative (pooler en production) |
| `DIRECT_URL` | oui | Connexion directe, pour les migrations |
| `AUTH_SECRET` | oui | Signature des sessions (`npx auth secret`) |
| `AUTH_URL` | en production | URL publique du site |
| `ANTHROPIC_API_KEY` | non | Sans elle, les explications et les scripts basculent sur leur version déterministe |
| `STRIPE_SECRET_KEY` | non | Sans elle, l'écran des offres enregistre l'intention et le dit |
| `STRIPE_WEBHOOK_SECRET` | avec Stripe | Vérification de signature du webhook |
| `STRIPE_PRICE_DEPART` | avec Stripe | Identifiant de tarif de l'offre Départ |
| `STRIPE_PRICE_CONSTRUCTION` | avec Stripe | Identifiant de tarif de l'offre Construction |
| `STRIPE_PRICE_LANCEMENT` | avec Stripe | Identifiant de tarif de l'offre Lancement |
| `AUTH_RESEND_KEY`, `EMAIL_FROM` | non | Envoi des e-mails |
| `ADMIN_EMAILS` | non | Adresses promues administrateur à l'inscription |

## Déploiement

`npm run build` applique les migrations **et** sème le contenu avant de
construire le site. Le seed est idempotent : s'il y a déjà un parcours en base,
il ne fait rien et le dit. Un déploiement ne demande donc aucune manipulation
manuelle, et un premier déploiement sur une base vide part avec tout son
contenu.

Pour réécrire le contenu après avoir modifié le parcours ou les gabarits de
prompts : `npm run db:seed -- --force`.

La bascule depuis l'ancien produit supprime toutes les tables sauf le journal
de migrations, puis recrée le schéma. C'est délibéré : l'ancien contenu n'a pas
d'équivalent, et c'est la seule forme qui aboutisse aussi bien sur une base
neuve que sur une base restée en échec. Les comptes existants sont donc à
recréer.

## Commandes

```bash
npm run dev        npm run build       npm run start
npm run typecheck  npm run lint
npm test           npm run test:e2e
npm run db:seed -- --force   # réécrit le contenu
```

## La capture Stripe de la page d'accueil

Dépose la capture réelle du tableau de bord dans
`public/proof/stripe-revenue.png`. Le composant la détecte au rendu. Tant
qu'elle n'y est pas, la page affiche un visuel qui dit qu'il en est un.
Ne le remplace jamais par une fausse capture : voir `public/proof/README.md`.

## Documentation

- `ARCHITECTURE.md` — arborescence, entités, moteurs.
- `DECISIONS.md` — les choix tranchés, et pourquoi.
