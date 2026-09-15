# Nexteo — architecture

**Crée ton SaaS de A à Z, étape par étape.**
L'utilisateur arrive sans idée et sans compétence technique. Il repart avec un
produit en ligne et un plan de contenu.

## Arborescence

```
src/
  app/
    page.tsx                  landing publique (§6)
    diagnostic/               le diagnostic public, une question par écran (§8.1)
      analyse/                écran de transition, lance le classement
    mes-idees/                restitution des trois idées (§8.4)
    inscription/ connexion/   prénom + e-mail + mot de passe
    offres/ garantie/         paywall, juste après la restitution (§13)
    app/                      l'espace connecté
      page.tsx                « Aujourd'hui » : une phrase, un bouton
      chemin/                 les 13 phases et leurs étapes
      etape/[id]/             étape détaillée, prompts, checklist, réparation
      prompts/                le pack séquencé, filtrable
      ajouter/                le générateur à la demande (§11.6)
      videos/                 les 30 scripts, vue calendrier (§10.4)
      compte/                 offre, jalons, export, suppression
    legal/                    mentions, CGV, confidentialité
    trop-jeune/               garde-fou mineurs (§12.6)
    api/stripe/webhook/       la seule source de l'accès payant
  components/  ui, brand, shell, landing, diagnostic, ideas, app, auth
  lib/         ideas (moteur), diagnostic, prompts, videos, guardrails, offers
  server/      db, auth, diagnostic, ideas, journey, prompts, videos, features
prisma/
  schema.prisma
  seed/        referentiel, parcours (13 phases), prompts (pack + réparation)
```

## Entités

Compte et profil : `User`, `Profile` (rattachable à un `anonId` tant que le
diagnostic est anonyme), `Skill`/`UserSkill`, `Domain`/`UserDomain`,
`Interest`/`UserInterest`, `FrictionAnswer`.

Moteur d'idées : `ScoringWeight`, `IdeaBlueprint` + `IdeaBlueprintTag`, `Idea`,
`IdeaSource`.

Parcours : `Journey` → `Phase` → `Step` → `SubStep` → `Action`, `Checkpoint`.
Progression : `UserJourney`, `StepProgress`, `CheckpointProgress`,
`ProjectState`.

Prompts : `PromptTemplate`, `PromptPack`, `GeneratedPrompt`, `ErrorPattern`,
`CustomPromptRequest`.

Vidéos : `VideoScript`. Monétisation : `Subscription`, `FeatureFlag`.
Jalons : `Milestone`, `UserMilestone`, `Adventure`.

Aucun contenu de parcours n'est codé en dur dans le front-end : tout vient de
la base.

## Moteur d'idées

`src/lib/ideas/score.ts` — fonction pure, sans base, sans date, sans aléa.

1. **Contraintes dures**, éliminatoires avant tout scoring : code complexe,
   licence réglementée, stock physique, équipe, coûts fixes au-dessus de 500 €.
2. **Huit dimensions**, chacune ramenée entre 0 et 1 : accès au problème, accès
   aux premiers clients, faisabilité sans coder, temps jusqu'au premier euro,
   disposition à payer, compatibilité temps, budget, compatibilité personnelle.
3. **Somme pondérée**, les poids venant de la table `ScoringWeight`.

L'IA intervient à deux endroits, et jamais pour noter : en amont pour traduire
les réponses libres vers un vocabulaire fermé de vingt irritants, en aval pour
rédiger l'explication à partir du `breakdown`. Chaque idée porte des
`IdeaSource` qui citent les réponses l'ayant produite, et l'interface les
affiche.

## Moteur de prompts

Architecture hybride. Le corps de chaque prompt vient d'un `PromptTemplate` en
base, avec des variables `{{ }}`. Seule la partie réellement propre à l'idée —
fonctionnalité centrale, entités, écrans — passe par le modèle, et sa sortie est
validée par Zod avant d'être écrite dans `ProjectState`. Le reste est
déterministe : on ne laisse pas un modèle réécrire librement un prompt de
configuration Stripe.

Deux mécanismes distincts : un **pack séquencé** de quarante prompts dans
l'ordre du parcours, et un **générateur à la demande** illimité qui s'appuie sur
`ProjectState` pour rester cohérent avec ce qui est déjà construit.

La **bibliothèque d'erreurs** (vingt-sept motifs) reconnaît le message collé par
correspondance d'expressions régulières et rend le prompt de réparation
correspondant, contextualisé. Sans correspondance, un prompt de diagnostic
générique injecte l'état du projet.

## Générateur de scripts

Le calendrier des angles est déterministe (`src/lib/videos/angles.ts`) :
répartition 6/6/6/5/4/3, jamais deux fois le même angle d'affilée, et les six
premiers tournables avant d'avoir le moindre utilisateur. Le modèle n'écrit que
le contenu, par lots de six, et chaque script traverse le filtre des
formulations interdites avant d'être enregistré. Si le profil dit non au visage,
aucun script ne demande de se filmer.

## Ce qui tient le produit

- Le gating vit dans `FeatureFlag`, et `can()` est vérifié dans l'action, pas
  seulement dans la vue.
- Le webhook Stripe est le seul endroit qui ouvre un accès payant.
- Aucune clé d'API côté client. Tous les appels IA passent par des Server
  Actions.
- La progression ne recule jamais.
