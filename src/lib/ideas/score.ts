import {
  DIMENSIONS,
  DIMENSION_LABELS,
  type BlueprintInput,
  type Dimension,
  type DimensionScore,
  type DomainSource,
  type Evidence,
  type ProfileInput,
  type ScoredIdea,
  type Weights,
} from './types';

/**
 * Moteur d'idées — fonction pure (section 8.2).
 *
 * Le classement est déterministe : l'IA ne note jamais. Elle intervient en
 * amont pour transformer les réponses libres en `frictionSignals`, et en aval
 * pour rédiger l'explication à partir du `breakdown` produit ici.
 *
 * Aucun accès à la base, aucune date, aucun aléa : deux appels avec les mêmes
 * entrées rendent exactement le même résultat.
 */

const clamp01 = (v: number): number => (v < 0 ? 0 : v > 1 ? 1 : v);
const round2 = (v: number): number => Math.round(v * 100) / 100;

/** Poids par défaut, utilisés uniquement si la base est vide. */
export const DEFAULT_WEIGHTS: Weights = {
  // La dimension la plus lourde, volontairement : c'est ce que personne
  // n'exploite et ce qui sépare une idée à lui d'une idée générique.
  problemAccess: 0.24,
  customerAccess: 0.18,
  // Volontairement basse : le parcours existe précisément pour absorber la
  // complexité de construction. Un écran de plus ne doit pas disqualifier une
  // idée que l'utilisateur est le seul à pouvoir vendre.
  noCodeFeasibility: 0.12,
  timeToRevenue: 0.1,
  willingnessToPay: 0.12,
  timeFit: 0.08,
  budgetFit: 0.06,
  personalFit: 0.1,
};

/**
 * Crédit accordé selon la façon dont il connaît le secteur. Avoir travaillé
 * dedans n'est pas la même chose que s'y intéresser : c'est précisément cette
 * différence qui produit une information que le marché n'a pas (section 8.1).
 */
const SOURCE_CREDIT: Record<DomainSource, number> = {
  metier: 1,
  etudes: 0.85,
  entourage: 0.7,
  passion: 0.5,
};

const SOURCE_LABEL: Record<DomainSource, string> = {
  metier: 'tu y as travaillé',
  etudes: 'tu l’as étudié',
  entourage: 'ton entourage y est',
  passion: 'tu t’y intéresses',
};

const PAYER_BASE = { business: 1, professional: 0.85, consumer: 0.4 } as const;

const PAYER_LABEL = {
  business: 'une entreprise',
  professional: 'un professionnel',
  consumer: 'un particulier',
} as const;

// ---------------------------------------------------------------------------
// Contraintes dures (section 8.2) — évaluées avant tout scoring.
// ---------------------------------------------------------------------------

export const MAX_MONTHLY_FIXED_COST = 500;

export function hardConstraintFailures(blueprint: BlueprintInput): string[] {
  const reasons: string[] = [];
  if (blueprint.requiresComplexCode) reasons.push('Demande du code complexe, hors du parcours.');
  if (blueprint.requiresRegulatedLicense) reasons.push('Demande une licence réglementée.');
  if (blueprint.requiresPhysicalStock) reasons.push('Demande un stock physique.');
  if (blueprint.requiresTeam) reasons.push('Ne se construit pas seul.');
  if (blueprint.monthlyFixedCost > MAX_MONTHLY_FIXED_COST) {
    reasons.push(`Coûts fixes au-dessus de ${MAX_MONTHLY_FIXED_COST} € par mois.`);
  }
  return reasons;
}

// ---------------------------------------------------------------------------
// Dimensions
// ---------------------------------------------------------------------------

interface DomainMatch {
  slug: string;
  credit: number;
  source: DomainSource;
  years: number;
}

function bestDomainMatch(profile: ProfileInput, blueprint: BlueprintInput): DomainMatch | null {
  let best: DomainMatch | null = null;
  for (const owned of profile.domains) {
    if (!blueprint.domains.includes(owned.slug)) continue;
    // L'ancienneté compte, mais avec un rendement décroissant : trois ans dans
    // un secteur suffisent à en connaître les irritants.
    const credit = SOURCE_CREDIT[owned.source] * (0.75 + 0.25 * Math.min(1, owned.yearsExposure / 3));
    if (!best || credit > best.credit) {
      best = { slug: owned.slug, credit, source: owned.source, years: owned.yearsExposure };
    }
  }
  return best;
}

function tagScore(profile: ProfileInput, blueprint: BlueprintInput, dimension: string): number {
  const tags = blueprint.tags.filter((t) => t.dimension === dimension);
  if (tags.length === 0) return 0;

  const owned = new Map<string, number>();
  if (dimension === 'skill') {
    for (const s of profile.skills) owned.set(s.slug, clamp01(s.level / 5));
  } else if (dimension === 'interest') {
    for (const key of profile.interests) owned.set(key, 1);
  } else if (dimension === 'friction') {
    for (const key of profile.frictionSignals) owned.set(key, 1);
  }

  let got = 0;
  let total = 0;
  for (const tag of tags) {
    total += tag.weight;
    const level = owned.get(tag.key);
    if (level != null) got += tag.weight * level;
  }
  return total === 0 ? 0 : clamp01(got / total);
}

function matchedTagKeys(profile: ProfileInput, blueprint: BlueprintInput, dimension: string): string[] {
  const ownedKeys = new Set<string>(
    dimension === 'skill'
      ? profile.skills.filter((s) => s.level > 0).map((s) => s.slug)
      : dimension === 'interest'
        ? profile.interests
        : profile.frictionSignals,
  );
  return blueprint.tags
    .filter((t) => t.dimension === dimension && ownedKeys.has(t.key))
    .map((t) => t.key);
}

// ---------------------------------------------------------------------------

export function scoreIdea(
  profile: ProfileInput,
  blueprint: BlueprintInput,
  weights: Weights = DEFAULT_WEIGHTS,
): ScoredIdea {
  const eliminationReasons = hardConstraintFailures(blueprint);
  const domain = bestDomainMatch(profile, blueprint);
  const frictionFit = tagScore(profile, blueprint, 'friction');
  const skillFit = tagScore(profile, blueprint, 'skill');
  const interestFit = tagScore(profile, blueprint, 'interest');

  const evidences: Evidence[] = [];
  const values: Record<Dimension, number> = {} as Record<Dimension, number>;
  const explanations: Record<Dimension, string> = {} as Record<Dimension, string>;

  // 1. Accès au problème — la dimension la plus discriminante.
  {
    // Deux sources, à parts presque égales : connaître le secteur de
    // l'intérieur, et avoir nommé soi-même l'irritant que l'idée fait
    // disparaître. Sans secteur, le plafond reste bas — proposer une idée dans
    // un milieu qu'il n'a jamais vu, c'est proposer une idée générique.
    const value = domain
      ? clamp01(0.55 * domain.credit + 0.45 * frictionFit)
      : clamp01(0.1 + 0.25 * frictionFit);
    values.problemAccess = value;
    explanations.problemAccess = domain
      ? `Tu connais ce secteur de l’intérieur — ${SOURCE_LABEL[domain.source]}.`
      : 'Tu ne connais pas ce secteur de l’intérieur.';
    if (domain) {
      evidences.push({
        dimension: 'problemAccess',
        evidence: `Secteur « ${domain.slug} » : ${SOURCE_LABEL[domain.source]}${
          domain.years > 0 ? `, ${domain.years} an${domain.years > 1 ? 's' : ''}` : ''
        }.`,
      });
    }
    for (const key of matchedTagKeys(profile, blueprint, 'friction')) {
      evidences.push({
        dimension: 'problemAccess',
        evidence: `Tu as toi-même cité cet irritant : « ${key} ».`,
      });
    }
  }

  // 2. Accès aux premiers clients.
  {
    const reach = clamp01(profile.reachableCount / 10);
    const insider = domain ? (domain.source === 'metier' || domain.source === 'entourage' ? 0.3 : 0.15) : 0;
    const value = clamp01(0.7 * reach + insider);
    values.customerAccess = value;
    explanations.customerAccess =
      profile.reachableCount >= 10
        ? 'Tu peux appeler dix personnes concernées dès demain.'
        : profile.reachableCount > 0
          ? `Tu connais ${profile.reachableCount} personne${profile.reachableCount > 1 ? 's' : ''} à appeler demain.`
          : 'Tu pars sans contact dans ce milieu.';
    if (profile.reachableCount > 0 && domain) {
      evidences.push({
        dimension: 'customerAccess',
        evidence: `${profile.reachableCount} personne${profile.reachableCount > 1 ? 's' : ''} joignable${
          profile.reachableCount > 1 ? 's' : ''
        } dans ce milieu.`,
      });
    }
  }

  // 3. Faisabilité sans coder.
  {
    const effective = blueprint.buildComplexity - profile.technicalLevel * 0.4;
    const value = clamp01(1 - (effective - 1) / 4);
    values.noCodeFeasibility = value;
    explanations.noCodeFeasibility =
      blueprint.buildComplexity <= 2
        ? 'Se construit avec les prompts du parcours, sans rien de plus.'
        : blueprint.buildComplexity === 3
          ? 'Demande quelques écrans de plus que la moyenne.'
          : 'C’est la limite haute de ce que le parcours couvre.';
  }

  // 4. Temps jusqu'au premier euro.
  {
    const speed = clamp01(1 - (blueprint.weeksToFirstEuro - 2) / 16);
    const horizonWeeks = Math.max(1, profile.timeHorizon) * 4.33;
    const fit = blueprint.weeksToFirstEuro <= horizonWeeks ? 1 : 0.2;
    const value = clamp01(0.7 * speed + 0.3 * fit);
    values.timeToRevenue = value;
    explanations.timeToRevenue = `Premier euro envisageable vers la semaine ${blueprint.weeksToFirstEuro}.`;
  }

  // 5. Disposition à payer — et réalisme de l'objectif déclaré.
  {
    const payer = PAYER_BASE[blueprint.payerType];
    const price = clamp01(blueprint.monthlyPrice / 60);
    const clientsNeeded = blueprint.monthlyPrice > 0 ? profile.goalRevenue / blueprint.monthlyPrice : 999;
    const realism = clamp01(1 - (clientsNeeded - 5) / 95);
    const value = clamp01(0.45 * payer + 0.2 * price + 0.35 * realism);
    values.willingnessToPay = value;
    explanations.willingnessToPay = `Le client est ${PAYER_LABEL[blueprint.payerType]} : il paie un outil qui lui fait gagner du temps.`;
    if (profile.goalRevenue > 0 && blueprint.monthlyPrice > 0) {
      evidences.push({
        dimension: 'willingnessToPay',
        evidence: `${Math.ceil(clientsNeeded)} client${Math.ceil(clientsNeeded) > 1 ? 's' : ''} à ${
          blueprint.monthlyPrice
        } € pour atteindre les ${profile.goalRevenue} € par mois que tu vises.`,
      });
    }
  }

  // 6. Compatibilité temps.
  {
    const ratio = blueprint.hoursPerWeekMin === 0 ? 1 : profile.hoursPerWeek / blueprint.hoursPerWeekMin;
    const value = clamp01(ratio < 1 ? ratio * 0.9 : 1);
    values.timeFit = value;
    explanations.timeFit = `Compte environ ${blueprint.hoursPerWeekMin} h par semaine ; tu en as ${profile.hoursPerWeek}.`;
  }

  // 7. Compatibilité budget.
  {
    const cost = blueprint.monthlyFixedCost;
    const value = cost === 0 ? 1 : clamp01(profile.budget / (cost * 3));
    values.budgetFit = value;
    explanations.budgetFit =
      cost === 0
        ? 'Aucun coût fixe : tout tient dans les offres gratuites des outils.'
        : `Environ ${cost} € par mois de coûts fixes.`;
  }

  // 8. Compatibilité personnelle.
  {
    let base = 1;
    const frictionsPerso: string[] = [];
    if (blueprint.requiresFace && !profile.showsFace) {
      base = 0.15;
      frictionsPerso.push('il faudrait te filmer, et tu as dit non');
    }
    if (blueprint.requiresOutbound && profile.prefersSolo) {
      base *= 0.6;
      frictionsPerso.push('il faut aller chercher les premiers clients un par un');
    }
    const affinity = Math.max(skillFit, interestFit);
    const value = clamp01(base * (0.75 + 0.25 * affinity));
    values.personalFit = value;
    explanations.personalFit =
      frictionsPerso.length > 0
        ? `À savoir : ${frictionsPerso.join(', et ')}.`
        : 'Rien ici ne te demande de sortir de ce que tu as dit accepter.';
    for (const key of matchedTagKeys(profile, blueprint, 'skill')) {
      evidences.push({ dimension: 'personalFit', evidence: `Tu sais déjà faire : ${key}.` });
    }
    for (const key of matchedTagKeys(profile, blueprint, 'interest')) {
      evidences.push({ dimension: 'personalFit', evidence: `Ça touche à ce qui t’intéresse : ${key}.` });
    }
  }

  const totalWeight = DIMENSIONS.reduce((sum, d) => sum + (weights[d] ?? 0), 0);
  const breakdown: DimensionScore[] = DIMENSIONS.map((dimension) => {
    const weight = weights[dimension] ?? 0;
    const value = round2(values[dimension]);
    return {
      dimension,
      value,
      weight,
      contribution: round2(value * weight),
      explanation: explanations[dimension] ?? DIMENSION_LABELS[dimension],
    };
  });

  const weighted = DIMENSIONS.reduce((sum, d) => sum + values[d] * (weights[d] ?? 0), 0);
  const score = totalWeight === 0 ? 0 : round2((weighted / totalWeight) * 100);

  return {
    slug: blueprint.slug,
    score,
    breakdown,
    evidences,
    eliminated: eliminationReasons.length > 0,
    eliminationReasons,
  };
}

/**
 * Classe les archétypes pour un profil. Les idées éliminées par une contrainte
 * dure ne sont jamais renvoyées : elles ne peuvent pas être construites avec
 * le parcours, les proposer serait un mensonge (section 8.3).
 */
export function rankIdeas(
  profile: ProfileInput,
  blueprints: BlueprintInput[],
  weights: Weights = DEFAULT_WEIGHTS,
  limit = 3,
): ScoredIdea[] {
  return blueprints
    .map((b) => scoreIdea(profile, b, weights))
    .filter((r) => !r.eliminated)
    // À score égal, l'ordre alphabétique du slug tranche : le classement ne
    // doit pas dépendre de l'ordre d'arrivée des lignes en base.
    .sort((a, b) => b.score - a.score || a.slug.localeCompare(b.slug))
    .slice(0, limit);
}

/**
 * Section 8.3 : aucune idée sans lien démontrable avec le profil. Une idée qui
 * ne cite aucun élément du profil n'est pas affichable.
 */
export function hasDemonstrableLink(result: ScoredIdea): boolean {
  return result.evidences.length > 0;
}
