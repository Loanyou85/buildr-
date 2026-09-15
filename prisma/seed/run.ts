import { randomUUID } from 'node:crypto';
import type { Prisma, PrismaClient } from '@prisma/client';
import { DOMAINS, INTERESTS, SKILLS } from '../../src/lib/ideas/referentiel';
import { BLUEPRINTS } from '../../src/lib/ideas/catalog';
import { DEFAULT_WEIGHTS } from '../../src/lib/ideas/score';
import { DIMENSION_LABELS, DIMENSIONS } from '../../src/lib/ideas/types';
import { PARCOURS } from './parcours';
import { SEQUENCE } from './prompts/sequence';
import { ERREURS, REPARATION } from './prompts/reparation';
import { FEATURE_FLAGS, MILESTONES } from './referentiel';

/**
 * Seed.
 *
 * Deux contraintes apprises à la dure :
 *   1. Tout tient dans **une** transaction ouverte par un verrou consultatif.
 *      Sans lui, deux exécutions simultanées — un déploiement lent que
 *      l'utilisateur relance — se marchent dessus et violent une contrainte
 *      d'unicité.
 *   2. Les insertions se font par lots, avec des identifiants tirés en avance,
 *      plutôt que ligne par ligne. Le parcours fait plusieurs centaines de
 *      lignes : en unitaire, le seed dépasse le délai d'exécution de la
 *      plateforme.
 */
const VERROU = 8142027n;

export interface SeedOptions {
  /** Réécrit le contenu même s'il est déjà présent. */
  force?: boolean;
  log?: (message: string) => void;
}

export async function runSeed(db: PrismaClient, options: SeedOptions = {}): Promise<void> {
  const log = options.log ?? console.log;

  await db.$transaction(
    async (tx) => {
      await tx.$executeRaw`SELECT pg_advisory_xact_lock(${VERROU})`;

      const dejaSeme = (await tx.journey.count()) > 0;
      if (dejaSeme && !options.force) {
        log('Contenu déjà présent. Relance avec --force pour le réécrire.');
        return;
      }

      await semerPoids(tx, log);
      const referentiels = await semerReferentiels(tx, log);
      await semerArchetypes(tx, referentiels.domains, log);
      await semerParcours(tx, log);
      const gabarits = await semerPrompts(tx, log);
      await semerErreurs(tx, gabarits, log);
      await semerJalonsEtDroits(tx, log);
    },
    { timeout: 180_000, maxWait: 30_000 },
  );
}

type Tx = Prisma.TransactionClient;
type Log = (message: string) => void;

// ---------------------------------------------------------------------------

async function semerPoids(tx: Tx, log: Log): Promise<void> {
  await tx.scoringWeight.deleteMany();
  await tx.scoringWeight.createMany({
    data: DIMENSIONS.map((dimension, index) => ({
      dimension,
      label: DIMENSION_LABELS[dimension],
      weight: DEFAULT_WEIGHTS[dimension],
      order: index,
    })),
  });
  log(`Poids de scoring : ${DIMENSIONS.length} dimensions.`);
}

async function semerReferentiels(tx: Tx, log: Log) {
  await tx.userSkill.deleteMany();
  await tx.userDomain.deleteMany();
  await tx.userInterest.deleteMany();
  await tx.skill.deleteMany();
  await tx.domain.deleteMany();
  await tx.interest.deleteMany();

  const skills = SKILLS.map((s) => ({ id: randomUUID(), ...s }));
  const domains = DOMAINS.map((d) => ({ id: randomUUID(), ...d }));
  const interests = INTERESTS.map((i) => ({ id: randomUUID(), ...i }));

  await tx.skill.createMany({ data: skills });
  await tx.domain.createMany({ data: domains });
  await tx.interest.createMany({ data: interests });

  log(
    `Référentiels : ${skills.length} compétences, ${domains.length} secteurs, ${interests.length} centres d’intérêt.`,
  );
  return {
    skills: new Map(skills.map((s) => [s.slug, s.id])),
    domains: new Map(domains.map((d) => [d.slug, d.id])),
    interests: new Map(interests.map((i) => [i.slug, i.id])),
  };
}

async function semerArchetypes(tx: Tx, domains: Map<string, string>, log: Log): Promise<void> {
  await tx.ideaBlueprintTag.deleteMany();
  await tx.ideaBlueprint.deleteMany();

  const lignes = BLUEPRINTS.map((b) => ({ id: randomUUID(), blueprint: b }));

  await tx.ideaBlueprint.createMany({
    data: lignes.map(({ id, blueprint: b }) => ({
      id,
      slug: b.slug,
      title: b.title,
      oneLiner: b.oneLiner,
      targetAudience: b.targetAudience,
      problem: b.problem,
      solution: b.solution,
      pricingModel: b.pricingModel,
      monthlyPrice: b.monthlyPrice,
      buildComplexity: b.buildComplexity,
      weeksToFirstEuro: b.weeksToFirstEuro,
      payerType: b.payerType,
      hoursPerWeekMin: b.hoursPerWeekMin,
      monthlyFixedCost: b.monthlyFixedCost,
      requiresComplexCode: b.requiresComplexCode,
      requiresRegulatedLicense: b.requiresRegulatedLicense,
      requiresPhysicalStock: b.requiresPhysicalStock,
      requiresTeam: b.requiresTeam,
      requiresFace: b.requiresFace,
      requiresOutbound: b.requiresOutbound,
    })),
  });

  await tx.ideaBlueprintTag.createMany({
    data: lignes.flatMap(({ id, blueprint: b }) =>
      b.tags.map((t) => ({
        id: randomUUID(),
        blueprintId: id,
        dimension: t.dimension,
        key: t.key,
        weight: t.weight,
      })),
    ),
  });

  // La relation implicite plusieurs-à-plusieurs ne se remplit pas par lot :
  // une mise à jour par archétype, c'est trente requêtes, pas trois cents.
  for (const { id, blueprint } of lignes) {
    const ids = blueprint.domains.map((slug) => domains.get(slug)).filter((v): v is string => Boolean(v));
    if (ids.length !== blueprint.domains.length) {
      throw new Error(`Archétype ${blueprint.slug} : secteur inconnu dans ${blueprint.domains.join(', ')}`);
    }
    await tx.ideaBlueprint.update({
      where: { id },
      data: { domains: { connect: ids.map((domainId) => ({ id: domainId })) } },
    });
  }

  log(`Archétypes d’idées : ${lignes.length}.`);
}

async function semerParcours(tx: Tx, log: Log): Promise<void> {
  await tx.journey.deleteMany();

  const journeyId = randomUUID();
  await tx.journey.create({
    data: { id: journeyId, slug: 'creer-son-saas', name: 'Crée ton SaaS de A à Z', version: 1 },
  });

  const phases: Prisma.PhaseCreateManyInput[] = [];
  const steps: Prisma.StepCreateManyInput[] = [];
  const subSteps: Prisma.SubStepCreateManyInput[] = [];
  const actions: Prisma.ActionCreateManyInput[] = [];
  const checkpoints: Prisma.CheckpointCreateManyInput[] = [];

  let numero = 0;
  PARCOURS.forEach((phase, phaseIndex) => {
    const phaseId = randomUUID();
    phases.push({
      id: phaseId,
      journeyId,
      order: phaseIndex + 1,
      key: phase.key,
      title: phase.title,
      goal: phase.goal,
      outcome: phase.outcome,
    });

    phase.steps.forEach((step, stepIndex) => {
      const stepId = randomUUID();
      numero += 1;
      steps.push({
        id: stepId,
        phaseId,
        order: stepIndex + 1,
        number: numero,
        title: step.title,
        goal: step.goal,
        why: step.why,
        estimatedMinutes: step.estimatedMinutes,
        difficulty: step.difficulty ?? 'easy',
        techPath: step.techPath ?? null,
      });

      step.subSteps.forEach((sub, subIndex) => {
        const subId = randomUUID();
        subSteps.push({ id: subId, stepId, order: subIndex + 1, title: sub.title, body: sub.body });
        sub.actions.forEach((action, actionIndex) => {
          actions.push({
            id: randomUUID(),
            subStepId: subId,
            order: actionIndex + 1,
            instruction: action.instruction,
            externalUrl: action.externalUrl ?? null,
            promptTemplateSlug: action.promptTemplateSlug ?? null,
            screenshot: action.screenshot ?? null,
          });
        });
      });

      step.checkpoints.forEach((cp, cpIndex) => {
        checkpoints.push({
          id: randomUUID(),
          stepId,
          order: cpIndex + 1,
          label: cp.label,
          isRequired: cp.isRequired ?? true,
          proofKind: cp.proofKind ?? 'none',
          proofField: cp.proofField ?? null,
        });
      });
    });
  });

  await tx.phase.createMany({ data: phases });
  await tx.step.createMany({ data: steps });
  await tx.subStep.createMany({ data: subSteps });
  await tx.action.createMany({ data: actions });
  await tx.checkpoint.createMany({ data: checkpoints });

  log(
    `Parcours : ${phases.length} phases, ${steps.length} étapes, ${subSteps.length} sous-étapes, ${actions.length} actions, ${checkpoints.length} critères.`,
  );
}

async function semerPrompts(tx: Tx, log: Log): Promise<Map<string, string>> {
  await tx.promptTemplate.deleteMany();

  const tous = [...SEQUENCE, ...REPARATION];
  const lignes = tous.map((t) => ({ id: randomUUID(), gabarit: t }));

  // Règle 11.8, vérifiée à l'insertion plutôt qu'à la lecture : un gabarit
  // trop long ne doit jamais arriver en base.
  for (const { gabarit } of lignes) {
    if (gabarit.body.length > 4000) {
      throw new Error(`Gabarit ${gabarit.slug} : ${gabarit.body.length} caractères, au-dessus de 4 000.`);
    }
  }

  await tx.promptTemplate.createMany({
    data: lignes.map(({ id, gabarit }) => ({
      id,
      slug: gabarit.slug,
      blockKey: gabarit.blockKey,
      order: gabarit.order,
      title: gabarit.title,
      objective: gabarit.objective,
      target: gabarit.target,
      body: gabarit.body,
      expectedOutcome: gabarit.expectedOutcome,
      verification: gabarit.verification,
      isRepair: gabarit.isRepair ?? false,
    })),
  });

  log(`Gabarits de prompts : ${SEQUENCE.length} dans le pack, ${REPARATION.length} de réparation.`);
  return new Map(lignes.map(({ id, gabarit }) => [gabarit.slug, id]));
}

async function semerErreurs(tx: Tx, gabarits: Map<string, string>, log: Log): Promise<void> {
  await tx.errorPattern.deleteMany();
  await tx.errorPattern.createMany({
    data: ERREURS.map((e) => {
      const repairTemplateId = gabarits.get(e.repairSlug);
      if (!repairTemplateId) throw new Error(`Motif ${e.signature} : gabarit ${e.repairSlug} introuvable.`);
      return {
        id: randomUUID(),
        signature: e.signature,
        matcher: e.matcher,
        label: e.label,
        category: e.category,
        explanation: e.explanation,
        repairTemplateId,
      };
    }),
  });
  log(`Bibliothèque d’erreurs : ${ERREURS.length} motifs.`);
}

async function semerJalonsEtDroits(tx: Tx, log: Log): Promise<void> {
  for (const milestone of MILESTONES) {
    await tx.milestone.upsert({
      where: { key: milestone.key },
      create: { ...milestone },
      update: { label: milestone.label, order: milestone.order },
    });
  }

  for (const flag of FEATURE_FLAGS) {
    await tx.featureFlag.upsert({
      where: { key: flag.key },
      create: flag,
      update: { label: flag.label, plans: flag.plans },
    });
  }

  log(`Jalons : ${MILESTONES.length}. Droits : ${FEATURE_FLAGS.length} clés.`);
}
