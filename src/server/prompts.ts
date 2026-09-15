import 'server-only';
import { z } from 'zod';
import type { Idea, ProjectState } from '@prisma/client';
import { db } from '@/server/db';
import { askJson } from '@/lib/ai/client';
import { BLOCKS } from '@/lib/prompts/blocks';

/**
 * Moteur de prompts (section 11.4).
 *
 * Architecture hybride, et ce point n'est pas négociable : le corps du prompt
 * vient d'un gabarit en base, et seules les **variables** réellement propres à
 * l'idée passent par le modèle — la description de la logique métier, la liste
 * des entités, la liste des écrans. Tout le reste est déterministe.
 *
 * La raison est simple : un prompt cassé casse le projet de l'utilisateur, qui
 * n'a aucun moyen de s'en rendre compte ni de le réparer. On ne laisse pas un
 * modèle réécrire librement un prompt de configuration Stripe.
 */

export const MAX_PROMPT_CHARS = 4000;

const specSchema = z.object({
  coreFeature: z.string().min(10).max(400),
  entities: z
    .array(
      z.object({
        name: z.string().min(1).max(60),
        fields: z.array(z.string().min(1).max(60)).max(15),
      }),
    )
    .min(1)
    .max(10),
  screens: z
    .array(
      z.object({
        route: z.string().min(1).max(60),
        title: z.string().min(1).max(80),
        purpose: z.string().min(1).max(200),
      }),
    )
    .min(1)
    .max(12),
});

export type Specification = z.infer<typeof specSchema>;

/** Repli déterministe : un pack se génère même sans modèle disponible. */
function specificationParDefaut(idea: Idea): Specification {
  return {
    coreFeature: idea.solution.split('.')[0]!.trim(),
    entities: [
      { name: 'Client', fields: ['nom', 'email', 'telephone'] },
      { name: 'Fiche', fields: ['titre', 'statut', 'date', 'notes'] },
    ],
    screens: [
      { route: '/', title: 'Accueil', purpose: 'Présenter le produit et inviter à créer un compte' },
      { route: '/app', title: 'Tableau de bord', purpose: 'La prochaine action, et les dernières fiches' },
      { route: '/app/nouveau', title: 'Créer une fiche', purpose: 'Le formulaire principal du produit' },
      { route: '/app/fiches', title: 'Mes fiches', purpose: 'La liste, avec recherche' },
    ],
  };
}

/**
 * Demande au modèle la partie réellement spécifique à l'idée, et valide sa
 * sortie contre un schéma strict avant de l'écrire.
 */
export async function deduireSpecification(idea: Idea): Promise<Specification> {
  const resultat = await askJson(
    `Tu décris la structure minimale d'un petit SaaS, pour quelqu'un qui ne sait pas coder.

Règles :
- Une seule fonctionnalité centrale. Pas de deuxième.
- Entre deux et six entités, pas plus. Des noms au singulier, en français.
- Entre trois et six écrans. Des routes courtes.
- Rien qui demande du code complexe, un stock physique, ou une équipe.`,
    `Idée : ${idea.title}
En une phrase : ${idea.oneLiner}
Client : ${idea.targetAudience}
Problème : ${idea.problem}
Solution : ${idea.solution}

Format attendu :
{
  "coreFeature": "une phrase décrivant la fonctionnalité centrale",
  "entities": [{ "name": "Client", "fields": ["nom", "email"] }],
  "screens": [{ "route": "/app", "title": "Tableau de bord", "purpose": "à quoi il sert" }]
}`,
    (value) => {
      const parsed = specSchema.safeParse(value);
      return parsed.success ? parsed.data : null;
    },
    2500,
  );

  return resultat ?? specificationParDefaut(idea);
}

// ---------------------------------------------------------------------------
// Remplissage des variables
// ---------------------------------------------------------------------------

export type Variables = Record<string, string>;

export function variablesPour(idea: Idea, etat: ProjectState | null, spec: Specification | null): Variables {
  const entities =
    spec?.entities.map((e) => `${e.name} (${e.fields.join(', ')})`).join(' ; ') ??
    'à déduire de la spécification';
  const screens =
    spec?.screens.map((s) => `${s.route} — ${s.title} : ${s.purpose}`).join('\n') ??
    'à déduire de la spécification';

  return {
    projectName: etat?.projectName?.trim() || idea.title,
    ideaTitle: idea.title,
    ideaOneLiner: idea.oneLiner,
    targetAudience: idea.targetAudience,
    problem: idea.problem,
    solution: idea.solution,
    monthlyPrice: String(idea.monthlyPrice),
    coreFeature: spec?.coreFeature ?? idea.solution,
    entities,
    screens,
    conventions: JSON.stringify(etat?.conventions ?? { langue: 'français', style: 'Tailwind' }),
    stack: JSON.stringify(
      etat?.stack ?? { framework: 'Next.js', base: 'PostgreSQL + Prisma', hebergement: 'Vercel', paiement: 'Stripe' },
    ),
    repoUrl: etat?.repoUrl || 'pas encore créé',
    deployUrl: etat?.deployUrl || 'pas encore en ligne',
    domainName: etat?.domainName || 'pas encore acheté',
  };
}

/**
 * Remplace les variables `{{ }}`. Une variable inconnue devient une mention
 * lisible plutôt qu'un `{{trou}}` : un prompt collé avec une accolade
 * orpheline fait dérailler la réponse du modèle.
 */
export function remplir(gabarit: string, variables: Variables): string {
  return gabarit.replace(/\{\{\s*([\w.]+)\s*\}\}/g, (_, nom: string) => {
    const valeur = variables[nom];
    return valeur && valeur.length > 0 ? valeur : '[à compléter]';
  });
}

// ---------------------------------------------------------------------------
// Pack séquencé
// ---------------------------------------------------------------------------

const PHASE_PAR_BLOC = new Map(BLOCKS.map((b) => [b.key, b.phaseKey]));

/** Génère, ou régénère, le pack séquencé d'une idée. */
export async function genererPack(userId: string, ideaId: string): Promise<string> {
  const idea = await db.idea.findFirstOrThrow({ where: { id: ideaId, userId } });

  const existant = await db.promptPack.findFirst({
    where: { userId, ideaId },
    orderBy: { version: 'desc' },
  });
  if (existant) return existant.id;

  const parcours = await db.userJourney.findFirst({
    where: { userId, ideaId },
    include: { projectState: true },
  });

  const spec = await deduireSpecification(idea);
  if (parcours) {
    await db.projectState.upsert({
      where: { userJourneyId: parcours.id },
      create: {
        userJourneyId: parcours.id,
        projectName: idea.title,
        entities: spec.entities,
        screens: spec.screens,
      },
      update: { entities: spec.entities, screens: spec.screens },
    });
  }

  const variables = variablesPour(idea, parcours?.projectState ?? null, spec);
  const gabarits = await db.promptTemplate.findMany({
    where: { isActive: true, isRepair: false },
    orderBy: [{ blockKey: 'asc' }, { order: 'asc' }],
  });

  // L'ordre du pack est celui du parcours, pas l'ordre alphabétique des blocs.
  const rangBloc = new Map(BLOCKS.map((b, index) => [b.key, index]));
  const ordonnes = [...gabarits].sort(
    (a, b) => (rangBloc.get(a.blockKey) ?? 99) - (rangBloc.get(b.blockKey) ?? 99) || a.order - b.order,
  );

  const pack = await db.promptPack.create({
    data: {
      userId,
      ideaId,
      prompts: {
        create: ordonnes.map((gabarit, index) => ({
          templateId: gabarit.id,
          order: index + 1,
          phaseKey: PHASE_PAR_BLOC.get(gabarit.blockKey) ?? 'generer',
          title: gabarit.title,
          objective: gabarit.objective,
          body: remplir(gabarit.body, variables).slice(0, MAX_PROMPT_CHARS),
          target: gabarit.target,
          expectedOutcome: gabarit.expectedOutcome,
          verification: gabarit.verification,
        })),
      },
    },
  });

  return pack.id;
}

export async function packDe(userId: string, ideaId: string) {
  return db.promptPack.findFirst({
    where: { userId, ideaId },
    orderBy: { version: 'desc' },
    include: { prompts: { orderBy: { order: 'asc' } } },
  });
}

// ---------------------------------------------------------------------------
// Générateur à la demande (section 11.6)
// ---------------------------------------------------------------------------

const surMesureSchema = z.object({
  title: z.string().min(3).max(90),
  objective: z.string().min(10).max(300),
  body: z.string().min(50).max(MAX_PROMPT_CHARS),
  expectedOutcome: z.string().min(10).max(400),
  verification: z.string().min(10).max(400),
});

/**
 * Produit un prompt sur mesure, cohérent avec ce qui est déjà construit.
 * C'est `ProjectState` qui rend cette cohérence possible : sans lui, chaque
 * nouveau prompt repart de zéro et le projet devient incohérent.
 */
export async function genererPromptSurMesure(
  userId: string,
  packId: string,
  demande: string,
): Promise<string | null> {
  const pack = await db.promptPack.findFirstOrThrow({
    where: { id: packId, userId },
    include: { idea: true, prompts: { orderBy: { order: 'asc' } } },
  });
  const parcours = await db.userJourney.findFirst({
    where: { userId, ideaId: pack.ideaId },
    include: { projectState: true },
  });

  const variables = variablesPour(pack.idea, parcours?.projectState ?? null, null);
  const dejaFaits = pack.prompts
    .filter((p) => p.status === 'executed' || p.status === 'validated')
    .map((p) => p.title);

  const genere = await askJson(
    `Tu écris un prompt à coller dans Claude, pour quelqu'un qui ne sait pas coder et qui construit un petit SaaS.

Règles absolues :
- Le prompt doit être autonome : il rappelle le contexte nécessaire, parce que
  la personne peut avoir fermé sa session.
- Il ne demande jamais d'écrire du code à la main.
- Il ne contient aucune clé d'API. Les secrets passent par une étape dédiée
  aux variables d'environnement.
- Il reste cohérent avec la stack et les entités déjà en place.
- Moins de ${MAX_PROMPT_CHARS} caractères.`,
    `Le projet : ${variables.projectName}
En une phrase : ${variables.ideaOneLiner}
Stack : ${variables.stack}
Entités existantes : ${variables.entities}
Écrans existants :
${variables.screens}
Prompts déjà exécutés : ${dejaFaits.join(', ') || 'aucun'}

Ce que la personne veut ajouter, dans ses mots :
"""
${demande.slice(0, 800)}
"""

Format attendu :
{
  "title": "titre court",
  "objective": "l'objectif en une phrase",
  "body": "le prompt complet, prêt à coller",
  "expectedOutcome": "ce qu'elle doit obtenir en retour",
  "verification": "comment vérifier que ça a fonctionné"
}`,
    (value) => {
      const parsed = surMesureSchema.safeParse(value);
      return parsed.success ? parsed.data : null;
    },
    3000,
  );

  if (!genere) return null;

  const dernier = pack.prompts.at(-1);
  const prompt = await db.generatedPrompt.create({
    data: {
      packId: pack.id,
      order: (dernier?.order ?? 0) + 1,
      phaseKey: 'sur-mesure',
      title: genere.title,
      objective: genere.objective,
      body: genere.body.slice(0, MAX_PROMPT_CHARS),
      target: 'claude_code',
      expectedOutcome: genere.expectedOutcome,
      verification: genere.verification,
      isCustom: true,
    },
  });

  await db.customPromptRequest.create({
    data: { userId, packId: pack.id, request: demande.slice(0, 2000), generatedPromptId: prompt.id },
  });

  return prompt.id;
}

// ---------------------------------------------------------------------------
// Réparation (section 11.5)
// ---------------------------------------------------------------------------

export interface Reparation {
  motif: { label: string; category: string; explanation: string } | null;
  title: string;
  body: string;
  expectedOutcome: string;
  verification: string;
}

/**
 * Identifie l'erreur par correspondance de motifs, puis rend un prompt de
 * réparation contextualisé. Si aucun motif ne correspond, on rend le prompt
 * de diagnostic générique plutôt que rien.
 */
export async function reparer(
  userId: string,
  ideaId: string,
  message: string,
  contexte: string,
): Promise<Reparation | null> {
  const idea = await db.idea.findFirst({ where: { id: ideaId, userId } });
  if (!idea) return null;

  const parcours = await db.userJourney.findFirst({
    where: { userId, ideaId },
    include: { projectState: true },
  });

  const motifs = await db.errorPattern.findMany({ include: { repairTemplate: true } });
  const trouve = motifs.find((motif) => {
    try {
      return new RegExp(motif.matcher, 'i').test(message);
    } catch {
      return false;
    }
  });

  const gabarit =
    trouve?.repairTemplate ??
    (await db.promptTemplate.findUnique({ where: { slug: 'reparation-diagnostic' } }));
  if (!gabarit) return null;

  const variables = {
    ...variablesPour(idea, parcours?.projectState ?? null, null),
    errorMessage: message.slice(0, 1500),
    contexteUtilisateur: contexte.slice(0, 300) || 'je suivais l’étape en cours',
  };

  return {
    motif: trouve
      ? { label: trouve.label, category: trouve.category, explanation: trouve.explanation }
      : null,
    title: gabarit.title,
    body: remplir(gabarit.body, variables).slice(0, MAX_PROMPT_CHARS),
    expectedOutcome: gabarit.expectedOutcome,
    verification: gabarit.verification,
  };
}
