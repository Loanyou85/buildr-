# Buildr

**Ton business. Construis-le.**

Un SaaS qui accompagne une personne de « je veux créer une entreprise » à « j'ai construit
mon entreprise ». Le produit n'est pas l'IA : c'est le chemin.

- `ARCHITECTURE.md` — arborescence, routes, entités, moteur de parcours
- `DECISIONS.md` — journal des arbitrages

## Démarrer

```bash
npm install
cp .env.example .env          # renseigne au minimum DATABASE_URL et AUTH_SECRET
npx prisma migrate deploy     # ou `npm run db:migrate` en développement
npm run db:seed               # référentiel + parcours UGC entièrement détaillé
npm run dev
```

Le produit fonctionne **sans clé d'API IA** : les signaux d'onboarding retombent sur une
heuristique locale, l'explication de la recommandation est générée depuis le `breakdown`, et
l'assistance répond avec le contenu réel de l'étape. Sans clé Resend, les liens de connexion
et les notifications sont écrits dans la console.

| Variable | Rôle |
|---|---|
| `DATABASE_URL` | PostgreSQL (hébergement UE) |
| `AUTH_SECRET`, `AUTH_URL` | Auth.js v5 ; `AUTH_URL` sert aussi d'URL publique |
| `NEXT_PUBLIC_APP_URL`, `VERCEL_URL` | replis pour l'URL publique (métadonnées, e-mails) |
| `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET` | connexion Google, optionnelle |
| `AUTH_RESEND_KEY`, `EMAIL_FROM` | magic link et notifications par e-mail |
| `ANTHROPIC_API_KEY`, `ANTHROPIC_MODEL` | IA, **appels serveur uniquement** |
| `ADMIN_EMAILS` | e-mails promus `role=admin` à la création du compte |
| `CRON_SECRET` | protège `POST /api/notifications/run` |

## Tests

```bash
npm run typecheck     # TypeScript strict
npm run lint
npm test              # Vitest : moteur de scoring, progression, adaptation, garde-fous
npm run build
npm run test:e2e      # Playwright : le parcours de bout en bout
```

Les tests de bout en bout démarrent `next start` sur le port 3100 et utilisent la base
pointée par `DATABASE_URL`. Si Chromium est déjà installé sur la machine, pointe
`CHROMIUM_PATH` dessus pour éviter un téléchargement.

## Ce que le code rend structurellement impossible

Les garde-fous de la section 11 du cahier des charges ne sont pas des intentions :

- `src/lib/guardrails.ts` refuse toute promesse de revenu — y compris dans les textes produits
  par l'IA et dans les contenus saisis en admin ;
- `computeProgressPercent` est le seul écrivain de `progressPercent`, et il est monotone ;
- `VerificationStatus` n'a que deux valeurs, `verified` étant inatteignable sans source de
  paiement connectée ;
- en dessous de 16 ans, le compte est supprimé côté serveur ; entre 16 et 18 ans, la
  publication publique est refusée côté serveur ;
- la landing n'affiche que des aventures réelles : sans aucune, elle affiche un état vide.
