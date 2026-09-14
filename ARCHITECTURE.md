# Buildr — architecture

**Ton business. Construis-le.** Un SaaS qui emmène une personne de « je veux créer une
entreprise » à « j'ai construit mon entreprise ». Le produit n'est pas l'IA, c'est le chemin.

## Arborescence

```
prisma/           schema.prisma, migrations, seed.ts, seed/ (référentiel + parcours UGC)
src/app/          routes (App Router)
  (marketing)/    landing publique, aventures publiques — territoire sombre
  (auth)/         connexion, vérification, refus mineur
  onboarding/     une question par écran
  recommandation/ résultat du moteur
  app/            produit : aujourd'hui, chemin, étape, jalons, compte
  admin/          éditeur de parcours
  api/            auth handler, assistant (stream), notifications (cron)
src/components/
  ui/             primitives (button, card, badge, progress-bar, empty-state…)
  landing/        hero, scrollytelling, bento, comparatif, compteurs, FAQ, marquee
  app/            step-card, path-view, checkpoint-list, daily-plan, assistant
src/lib/
  matching/       score.ts (fonction pure), dimensions.ts, constraints.ts, explain.ts
  journey/        instantiate.ts, progress.ts, unlock.ts, daily-plan.ts, adaptation.ts
  validation/     schémas Zod partagés client/serveur
  ai/             client Anthropic (serveur uniquement), prompts, signaux d'onboarding
  guardrails.ts   interdits de vocabulaire, declared vs verified, âge
src/server/
  auth.ts         Auth.js v5 (magic link + Google)
  db.ts           singleton Prisma
  actions/        Server Actions (onboarding, journey, assistant, admin, compte)
  features.ts     can(user, 'feature.key')
```

## Routes

| Route | Rôle |
|---|---|
| `/` | Landing publique, animée, sombre |
| `/aventures`, `/aventure/[slug]` | Parcours réels partagés (vide tant que personne n'a partagé) |
| `/connexion`, `/verifier-email`, `/trop-jeune` | Auth et garde-fou mineurs |
| `/onboarding` | Une question par écran, sauvegarde à chaque réponse |
| `/recommandation` | Résultat : business principal + 2 alternatives |
| `/app` | **Aujourd'hui** — l'écran le plus important |
| `/app/chemin` | La montée : étapes franchies, actuelle, verrouillées |
| `/app/etape/[id]` | Sous-étapes, actions, checklist, « J'ai terminé » |
| `/app/jalons` | Jalons franchis, carte partageable |
| `/app/compte` | RGPD : export, suppression, préférences |
| `/admin` | Création et édition des parcours |
| `/api/auth/[...nextauth]`, `/api/assistant`, `/api/notifications/run` | serveur |

## Entités

`User → Profile → (UserSkill, UserInterest, HabitAnswer)` décrit la personne.
`BusinessModel → BusinessTag` décrit l'offre du référentiel, avec `scoringWeights` en JSON.
`Recommendation` garde `score` + `breakdown` par dimension (explication et débogage).
`BusinessModel → Journey → Phase → Step → SubStep → Action`, plus `Checkpoint` et
`Resource` sur l'étape : c'est le contenu, jamais en dur dans le front.
`UserJourney → StepProgress → CheckpointProgress` est l'instance de l'utilisateur ;
`Adjustment` et `DailyPlan` s'y rattachent. `Milestone/UserMilestone/Adventure` portent
les jalons et le partage. `FeatureFlag` + `Subscription` portent le gating.

## Moteur de parcours

1. **Contraintes dures d'abord.** Budget, temps, visage, vente, présence locale : un
   business éliminé n'est jamais scoré.
2. **Score déterministe.** `score.ts` est une fonction pure : `(profil, business, poids) →
   { score, breakdown[] }`. Chaque dimension retourne 0-1 et une raison lisible. Les poids
   viennent de la base. Aucun appel réseau, testable unitairement.
3. **L'IA encadre, ne décide pas.** En amont elle transforme les réponses libres en
   signaux structurés ; en aval elle rédige l'explication à partir du `breakdown`. Le
   classement reste reproductible.
4. **Instanciation.** Accepter une recommandation choisit le `Journey` correspondant au
   budget et au niveau, crée `UserJourney` + un `StepProgress` par étape, déverrouille la
   première.
5. **Déblocage.** `unlockConditions` (étapes requises, checkpoints requis) évalué côté
   serveur ; `progressPercent` est un maximum monotone, il ne recule jamais.
6. **Adaptation.** Trois règles minimum : taux de réponse anormalement bas, étape
   abandonnée depuis plus de 3 jours, checklist partiellement cochée depuis plus d'une
   semaine. Elles créent un `Adjustment` présenté comme une amélioration de l'étape en
   cours, jamais comme un retour en arrière.
7. **Plan du jour.** `DailyPlan` découpe l'étape courante en tâches tenant dans le temps
   quotidien déclaré. C'est ce que l'écran « Aujourd'hui » affiche.

## Règles non négociables dans le code

- L'orange `--signal` n'apparaît qu'une fois par écran d'app : un seul `<Button variant="signal">`.
- `progressPercent` ne décroît jamais (`Math.max` systématique).
- Toute donnée de démonstration porte `isDemo: true` et est affichée comme exemple.
- `verificationStatus` vaut `declared` sauf source de paiement connectée.
- Aucune promesse de revenu : `src/lib/guardrails.ts` liste les formulations interdites,
  un test échoue si elles réapparaissent dans les contenus.
