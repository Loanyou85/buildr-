import 'server-only';
import type { Profile } from '@prisma/client';
import { db } from '@/server/db';
import { DEFAULT_WEIGHTS, rankIdeas } from '@/lib/ideas/score';
import type { BlueprintInput, ProfileInput, Weights } from '@/lib/ideas/types';
import { DIMENSIONS } from '@/lib/ideas/types';
import { askText } from '@/lib/ai/client';
import { frictionsParMotsCles } from '@/lib/ai/signals';
import { stripForbiddenClaims } from '@/lib/guardrails';

/**
 * Génération des idées (sections 8.2 et 8.4).
 *
 * Le classement est fait par la fonction pure `rankIdeas`. Le modèle
 * n'intervient qu'après, pour rédiger l'explication à partir du `breakdown`.
 * Si le modèle est indisponible, on affiche l'explication déterministe : une
 * idée sans justification n'est jamais affichée.
 */

/** Les poids viennent de la base, avec repli sur les valeurs par défaut. */
export async function poids(): Promise<Weights> {
  const lignes = await db.scoringWeight.findMany();
  if (lignes.length === 0) return DEFAULT_WEIGHTS;
  const out = { ...DEFAULT_WEIGHTS };
  for (const ligne of lignes) {
    if ((DIMENSIONS as readonly string[]).includes(ligne.dimension)) {
      out[ligne.dimension as keyof Weights] = ligne.weight;
    }
  }
  return out;
}

export async function profilPourMoteur(profile: Profile): Promise<ProfileInput> {
  const [domains, skills, interests, frictions] = await Promise.all([
    db.userDomain.findMany({ where: { profileId: profile.id }, include: { domain: true } }),
    db.userSkill.findMany({ where: { profileId: profile.id }, include: { skill: true } }),
    db.userInterest.findMany({ where: { profileId: profile.id }, include: { interest: true } }),
    db.frictionAnswer.findMany({ where: { profileId: profile.id } }),
  ]);

  const signaux = Array.isArray((profile.derivedSignals as { frictions?: unknown })?.frictions)
    ? ((profile.derivedSignals as { frictions: string[] }).frictions ?? [])
    : [];

  return {
    domains: domains.map((d) => ({
      slug: d.domain.slug,
      yearsExposure: d.yearsExposure,
      source: d.source,
    })),
    skills: skills.map((s) => ({ slug: s.skill.slug, level: s.level })),
    interests: interests.map((i) => i.interest.slug),
    // Repli déterministe : si le modèle n'a pas tourné, on extrait les
    // irritants par mots-clés plutôt que de partir sans aucun signal.
    frictionSignals: signaux.length > 0 ? signaux : frictionsParMotsCles(frictions),
    hoursPerWeek: profile.hoursPerWeek ?? 5,
    budget: profile.budget ?? 0,
    technicalLevel: profile.technicalLevel ?? 0,
    goalRevenue: profile.goalRevenue ?? 1000,
    timeHorizon: profile.timeHorizon ?? 6,
    riskTolerance: profile.riskTolerance ?? 'medium',
    showsFace: profile.showsFace ?? false,
    prefersSolo: profile.prefersSolo ?? false,
    reachableCount: profile.reachableCount ?? 0,
  };
}

async function archetypes(): Promise<{ input: BlueprintInput; id: string; row: Record<string, unknown> }[]> {
  const rows = await db.ideaBlueprint.findMany({
    where: { isActive: true },
    include: { tags: true, domains: { select: { slug: true } } },
  });
  return rows.map((row) => ({
    id: row.id,
    row: row as unknown as Record<string, unknown>,
    input: {
      slug: row.slug,
      title: row.title,
      domains: row.domains.map((d) => d.slug),
      tags: row.tags.map((t) => ({ dimension: t.dimension, key: t.key, weight: t.weight })),
      monthlyPrice: row.monthlyPrice,
      buildComplexity: row.buildComplexity,
      weeksToFirstEuro: row.weeksToFirstEuro,
      payerType: row.payerType,
      hoursPerWeekMin: row.hoursPerWeekMin,
      monthlyFixedCost: row.monthlyFixedCost,
      requiresComplexCode: row.requiresComplexCode,
      requiresRegulatedLicense: row.requiresRegulatedLicense,
      requiresPhysicalStock: row.requiresPhysicalStock,
      requiresTeam: row.requiresTeam,
      requiresFace: row.requiresFace,
      requiresOutbound: row.requiresOutbound,
    },
  }));
}

/**
 * Produit les trois idées d'un profil et les enregistre, avec leurs sources.
 * Les idées déjà rejetées ne reviennent pas.
 */
export async function genererIdees(profile: Profile): Promise<void> {
  const [entree, w, catalogue] = await Promise.all([profilPourMoteur(profile), poids(), archetypes()]);

  const cle = profile.userId ? { userId: profile.userId } : { anonId: profile.anonId! };
  const rejetees = await db.idea.findMany({
    where: { ...cle, status: 'rejected' },
    select: { blueprintId: true },
  });
  const exclus = new Set(rejetees.map((r) => r.blueprintId));
  const disponibles = catalogue.filter((c) => !exclus.has(c.id));

  const classement = rankIdeas(
    entree,
    disponibles.map((c) => c.input),
    w,
    3,
  );

  // On remplace les propositions en cours, jamais les idées choisies ou
  // rejetées : elles portent une décision de l'utilisateur.
  await db.idea.deleteMany({ where: { ...cle, status: 'proposed' } });

  for (const [rang, resultat] of classement.entries()) {
    const source = disponibles.find((c) => c.input.slug === resultat.slug);
    if (!source) continue;
    const b = source.row as {
      title: string;
      oneLiner: string;
      targetAudience: string;
      problem: string;
      solution: string;
      pricingModel: string;
      monthlyPrice: number;
      buildComplexity: number;
      weeksToFirstEuro: number;
    };

    await db.idea.create({
      data: {
        ...cle,
        blueprintId: source.id,
        title: b.title,
        oneLiner: b.oneLiner,
        targetAudience: b.targetAudience,
        problem: b.problem,
        solution: b.solution,
        pricingModel: b.pricingModel,
        monthlyPrice: b.monthlyPrice,
        buildComplexity: b.buildComplexity,
        timeToFirstEuro: b.weeksToFirstEuro,
        score: resultat.score,
        rank: rang + 1,
        breakdown: resultat.breakdown as unknown as object,
        sources: {
          create: resultat.evidences.map((e) => ({ dimension: e.dimension, evidence: e.evidence })),
        },
      },
    });
  }
}

/**
 * Rédige l'explication d'une idée à partir de son détail. Le modèle ne note
 * rien : il reformule un classement déjà fait, et sa sortie passe par le
 * filtre des formulations interdites (garde-fou n° 1).
 */
export async function redigerJustification(ideaId: string): Promise<string | null> {
  const idea = await db.idea.findUnique({ where: { id: ideaId }, include: { sources: true } });
  if (!idea) return null;
  if (idea.rationale) return idea.rationale;

  const detail = (idea.breakdown as { dimension: string; value: number; explanation: string }[]) ?? [];
  const texte = await askText(
    `Tu expliques à quelqu'un pourquoi une idée de SaaS lui a été proposée.

Règles absolues :
- Tu t'appuies uniquement sur les éléments fournis. Tu n'inventes rien.
- Tu tutoies. Trois phrases au maximum.
- Aucune promesse de revenu, aucun chiffre associé à un délai, aucun
  superlatif. Les mots « gagne », « revenus passifs », « automatique »,
  « garanti » sont interdits.
- Tu cites explicitement ce que la personne a répondu.`,
    `Idée : ${idea.title}
Pour qui : ${idea.targetAudience}

Ce que la personne a répondu :
${idea.sources.map((s) => `- ${s.evidence}`).join('\n')}

Ce qui ressort de l'analyse :
${detail
  .filter((d) => d.value >= 0.6)
  .map((d) => `- ${d.explanation}`)
  .join('\n')}`,
    400,
  );

  if (!texte) return null;
  const propre = stripForbiddenClaims(texte);
  if (propre.length < 20) return null;

  await db.idea.update({ where: { id: ideaId }, data: { rationale: propre } });
  return propre;
}
