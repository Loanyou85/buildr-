import type {
  BusinessTagInput,
  Dimension,
  ScorableBusiness,
  ScoringProfile,
} from './types';

export interface RawDimensionScore {
  score: number;
  reason: string;
}

export const clamp01 = (n: number): number => Math.max(0, Math.min(1, n));

function tagsOf(business: ScorableBusiness, dimension: string): BusinessTagInput[] {
  return business.tags.filter((t) => t.dimension === dimension);
}

function totalWeight(tags: BusinessTagInput[]): number {
  return tags.reduce((sum, t) => sum + Math.max(0, t.weight), 0);
}

/** Moyenne pondérée d'une liste de (couverture 0-1, poids). */
function weighted(pairs: Array<{ coverage: number; weight: number }>): number {
  const total = pairs.reduce((s, p) => s + p.weight, 0);
  if (total === 0) return 0.5; // aucune exigence déclarée : neutre, jamais éliminatoire
  return clamp01(pairs.reduce((s, p) => s + clamp01(p.coverage) * p.weight, 0) / total);
}

/**
 * Signal libre extrait par l'IA. Absent par défaut : le moteur fonctionne
 * entièrement sans IA, les signaux ne font que nuancer.
 */
function signal(profile: ScoringProfile, key: string): number | undefined {
  const value = profile.derivedSignals?.[key];
  return typeof value === 'number' ? clamp01(value) : undefined;
}

function boost(base: number, signalValue: number | undefined, amplitude = 0.15): number {
  if (signalValue === undefined) return base;
  return clamp01(base + (signalValue - 0.5) * 2 * amplitude);
}

const frenchList = (items: string[]): string =>
  items.length <= 1
    ? (items[0] ?? '')
    : `${items.slice(0, -1).join(', ')} et ${items[items.length - 1]}`;

// --- Compétences -----------------------------------------------------------

export function scoreSkills(profile: ScoringProfile, business: ScorableBusiness): RawDimensionScore {
  const tags = tagsOf(business, 'skills');
  if (tags.length === 0) {
    return { score: 0.5, reason: 'Cette activité ne demande aucune compétence technique particulière.' };
  }

  const covered: string[] = [];
  const missing: string[] = [];
  const pairs = tags.map((tag) => {
    const level = profile.skills[tag.key] ?? 0;
    const coverage = level / 5;
    if (level >= 3) covered.push(tag.key);
    else if (level <= 1) missing.push(tag.key);
    return { coverage, weight: Math.max(0, tag.weight) };
  });

  const score = weighted(pairs);
  const reason =
    covered.length > 0
      ? `Tu maîtrises déjà ${frenchList(covered.slice(0, 3))}, ce qui couvre l’essentiel du travail.`
      : missing.length > 0
        ? `Tu pars de zéro sur ${frenchList(missing.slice(0, 3))} : le parcours les fait apprendre en les pratiquant.`
        : 'Tes compétences actuelles couvrent partiellement le travail demandé.';

  return { score, reason };
}

// --- Intérêts --------------------------------------------------------------

export function scoreInterests(profile: ScoringProfile, business: ScorableBusiness): RawDimensionScore {
  const tags = tagsOf(business, 'interests');
  if (tags.length === 0) {
    return { score: 0.5, reason: 'Cette activité s’adapte à à peu près n’importe quel sujet.' };
  }

  const owned = new Set(profile.interests);
  const matched = tags.filter((t) => owned.has(t.key));
  const matchedWeight = totalWeight(matched);
  const declaredWeight = totalWeight(tags);

  /*
   * Ce qui compte est d'avoir au moins une niche viable, pas d'en couvrir
   * la totalité. Une simple proportion pénaliserait un business qui déclare
   * beaucoup de niches applicables — or la largeur est un avantage pour
   * l'utilisateur, pas un défaut. Un seul intérêt commun suffit donc à
   * atteindre un bon score, les suivants l'affinent.
   */
  const coverage = declaredWeight === 0 ? 0 : matchedWeight / declaredWeight;
  const base =
    matched.length === 0 ? 0.2 : clamp01(0.6 + 0.4 * Math.min(1, coverage * 2));
  const score = boost(base, signal(profile, 'interest_alignment'));

  const reason =
    matched.length > 0
      ? `Les sujets que tu as cochés — ${frenchList(matched.slice(0, 3).map((t) => t.key))} — sont exactement le terrain de cette activité.`
      : 'Aucun de tes sujets de prédilection ne recoupe cette activité, tu travaillerais sur des thèmes qui te sont étrangers.';

  return { score, reason };
}

// --- Comportement ----------------------------------------------------------

export function scoreBehavior(profile: ScoringProfile, business: ScorableBusiness): RawDimensionScore {
  const tags = tagsOf(business, 'behavior');
  const traits: Record<string, boolean> = {
    outreach: profile.likesStrangers,
    selling: profile.likesSelling,
    content_production: profile.createsContent,
    on_camera: profile.showsFace,
    repetition: profile.likesRepetition,
    analysis: profile.likesAnalyzing,
    creation: profile.likesCreating,
  };

  if (tags.length === 0) {
    return { score: 0.5, reason: 'Cette activité n’impose pas de rythme de travail particulier.' };
  }

  const aligned: string[] = [];
  const friction: string[] = [];
  const pairs = tags.map((tag) => {
    const ok = traits[tag.key];
    if (ok === true) aligned.push(tag.key);
    if (ok === false) friction.push(tag.key);
    return { coverage: ok === undefined ? 0.5 : ok ? 1 : 0, weight: Math.max(0, tag.weight) };
  });

  const behaviourLabels: Record<string, string> = {
    outreach: 'contacter des inconnus',
    selling: 'vendre',
    content_production: 'produire du contenu',
    on_camera: 'apparaître à l’image',
    repetition: 'répéter la même tâche',
    analysis: 'analyser des données',
    creation: 'créer',
  };

  const score = boost(weighted(pairs), signal(profile, 'execution_appetite'), 0.1);
  const reason =
    friction.length > 0
      ? `Le quotidien demande de ${frenchList(friction.slice(0, 2).map((k) => behaviourLabels[k] ?? k))}, ce que tu as dit ne pas aimer.`
      : aligned.length > 0
        ? `Le quotidien consiste à ${frenchList(aligned.slice(0, 3).map((k) => behaviourLabels[k] ?? k))}, ce qui te va.`
        : 'Le quotidien de cette activité est neutre par rapport à ce que tu as déclaré.';

  return { score, reason };
}

// --- Personnalité ----------------------------------------------------------

export function scorePersonality(profile: ScoringProfile, business: ScorableBusiness): RawDimensionScore {
  const tags = tagsOf(business, 'personality');
  const traits: Record<string, boolean> = {
    solo: profile.prefersSolo,
    team: !profile.prefersSolo,
    freedom: profile.prefersFreedom,
    structure: !profile.prefersFreedom,
    analytical: profile.likesAnalyzing,
    creative: profile.likesCreating,
  };

  if (tags.length === 0) {
    return { score: 0.5, reason: 'Cette activité convient à des profils très différents.' };
  }

  const pairs = tags.map((tag) => ({
    coverage: traits[tag.key] === undefined ? 0.5 : traits[tag.key] ? 1 : 0,
    weight: Math.max(0, tag.weight),
  }));

  const score = weighted(pairs);
  const reason =
    score >= 0.66
      ? 'Le mode de travail correspond à la façon dont tu dis fonctionner.'
      : score >= 0.34
        ? 'Le mode de travail te conviendra en partie, avec quelques compromis.'
        : 'Le mode de travail va à l’encontre de la façon dont tu dis fonctionner.';

  return { score, reason };
}

// --- Budget ----------------------------------------------------------------

export function scoreBudget(profile: ScoringProfile, business: ScorableBusiness): RawDimensionScore {
  // La contrainte dure a déjà écarté les budgets insuffisants : ici on mesure
  // le confort, pas la faisabilité.
  const span = Math.max(1, business.maxBudget - business.minBudget);
  const comfort = clamp01((profile.initialBudget - business.minBudget) / span);
  const monthlyComfort = business.minBudget === 0 ? 1 : clamp01(profile.monthlyBudget / Math.max(1, business.minBudget / 2));
  const score = clamp01(comfort * 0.65 + monthlyComfort * 0.35);

  const reason =
    business.minBudget === 0
      ? 'Tu peux démarrer sans dépenser un euro, avec les outils gratuits du parcours.'
      : comfort >= 0.6
        ? `Ton budget de démarrage couvre confortablement les ${business.minBudget} € nécessaires.`
        : `Ton budget couvre le minimum de ${business.minBudget} € mais laisse peu de marge, le parcours privilégiera le gratuit.`;

  return { score, reason };
}

// --- Temps -----------------------------------------------------------------

export function scoreTime(profile: ScoringProfile, business: ScorableBusiness): RawDimensionScore {
  const ideal = (business.hoursPerWeekMin + business.hoursPerWeekMax) / 2;
  const score =
    profile.hoursPerWeek >= business.hoursPerWeekMax
      ? 1
      : clamp01(
          (profile.hoursPerWeek - business.hoursPerWeekMin) /
            Math.max(1, business.hoursPerWeekMax - business.hoursPerWeekMin),
        ) *
            0.7 +
          0.3;

  const reason =
    profile.hoursPerWeek >= ideal
      ? `Tes ${profile.hoursPerWeek} h par semaine permettent d’avancer à un rythme confortable.`
      : `Avec ${profile.hoursPerWeek} h par semaine tu avanceras, mais plus lentement que la moyenne (${Math.round(ideal)} h conseillées).`;

  return { score, reason };
}

// --- Risque ----------------------------------------------------------------

const DIFFICULTY_RISK: Record<string, number> = { easy: 0.2, medium: 0.5, hard: 0.85 };
const TOLERANCE_LEVEL: Record<string, number> = { low: 0.25, medium: 0.55, high: 0.9 };

export function scoreRisk(profile: ScoringProfile, business: ScorableBusiness): RawDimensionScore {
  const required = DIFFICULTY_RISK[business.difficulty] ?? 0.5;
  const tolerated = TOLERANCE_LEVEL[profile.riskTolerance] ?? 0.5;
  // Prendre moins de risque que ce qu'on tolère n'est pas pénalisant.
  const gap = Math.max(0, required - tolerated);
  const score = clamp01(1 - gap * 1.6);

  const reason =
    gap === 0
      ? 'Le niveau d’incertitude reste dans ce que tu acceptes.'
      : `Cette activité est plus incertaine que ce que tu as dit accepter : le parcours compense par des étapes plus courtes.`;

  return { score, reason };
}

// --- Demande du marché -----------------------------------------------------

export function scoreMarketDemand(profile: ScoringProfile, business: ScorableBusiness): RawDimensionScore {
  const demandTag = tagsOf(business, 'market').find((t) => t.key === 'demand');
  const base = demandTag ? clamp01(demandTag.weight) : 0.5;
  // Un intérêt commun avec la demande renforce la capacité à trouver une niche.
  const nicheTags = tagsOf(business, 'niche');
  const owned = new Set(profile.interests);
  const nicheFit = nicheTags.length === 0 ? 0.5 : clamp01(nicheTags.filter((t) => owned.has(t.key)).length / nicheTags.length);
  const score = clamp01(base * 0.75 + nicheFit * 0.25);

  const reason =
    base >= 0.7
      ? 'La demande est installée : des clients cherchent activement ce service.'
      : base >= 0.4
        ? 'La demande existe mais se travaille : il faut aller la chercher client par client.'
        : 'La demande est diffuse, il faudra beaucoup de volume avant les premiers résultats.';

  return { score, reason };
}

// --- Vitesse de monétisation ----------------------------------------------

export function scoreMonetizationSpeed(profile: ScoringProfile, business: ScorableBusiness): RawDimensionScore {
  const horizonDays = Math.max(30, profile.timeHorizon * 30);
  const ratio = business.timeToFirstClientDays / horizonDays;
  const score = clamp01(1 - ratio);

  const reason =
    business.timeToFirstClientDays <= horizonDays / 3
      ? `Un premier client est atteignable en environ ${business.timeToFirstClientDays} jours, bien avant ton horizon.`
      : ratio <= 1
        ? `Un premier client demande environ ${business.timeToFirstClientDays} jours, ce qui tient dans ton horizon de ${profile.timeHorizon} mois.`
        : `Un premier client demande environ ${business.timeToFirstClientDays} jours, au-delà de ton horizon de ${profile.timeHorizon} mois.`;

  return { score, reason };
}

// --- Capacité d'acquisition ------------------------------------------------

export function scoreAcquisition(profile: ScoringProfile, business: ScorableBusiness): RawDimensionScore {
  const tags = tagsOf(business, 'acquisition');
  if (tags.length === 0) {
    return { score: 0.5, reason: 'Les canaux d’acquisition restent à choisir.' };
  }

  const capacity: Record<string, number> = {
    outbound: profile.likesStrangers ? 1 : 0.2,
    content: profile.createsContent ? 1 : 0.2,
    paid: clamp01(profile.monthlyBudget / 300),
    local: profile.workMode === 'remote' ? 0.2 : 1,
    referral: profile.likesStrangers ? 0.8 : 0.4,
  };

  const channelLabels: Record<string, string> = {
    outbound: 'la prospection directe',
    content: 'le contenu',
    paid: 'la publicité payante',
    local: 'le terrain',
    referral: 'le bouche-à-oreille',
  };

  const pairs = tags.map((tag) => ({ coverage: capacity[tag.key] ?? 0.5, weight: Math.max(0, tag.weight) }));
  const score = weighted(pairs);

  const best = [...tags].sort((a, b) => (capacity[b.key] ?? 0) - (capacity[a.key] ?? 0))[0];
  const reason = best
    ? `Ton canal le plus naturel ici est ${channelLabels[best.key] ?? best.key}.`
    : 'Les canaux d’acquisition restent à choisir.';

  return { score, reason };
}

// --- Contraintes personnelles ---------------------------------------------

export function scoreConstraints(profile: ScoringProfile, business: ScorableBusiness): RawDimensionScore {
  const checks: Array<{ ok: boolean; issue: string }> = [
    {
      ok: !business.requiresLocalPresence || profile.workMode !== 'remote',
      issue: 'la présence sur le terrain',
    },
    {
      ok: !business.requiresFace || profile.showsFace,
      issue: 'la présence à l’image',
    },
    {
      ok: profile.hoursPerDay >= 1,
      issue: 'le temps quotidien disponible',
    },
    {
      ok: business.timeToFirstClientDays <= profile.timeHorizon * 30 * 1.5,
      issue: 'le délai avant les premiers revenus',
    },
  ];

  const failed = checks.filter((c) => !c.ok);
  const score = clamp01(1 - failed.length / checks.length);
  const reason =
    failed.length === 0
      ? 'Rien dans ta situation actuelle ne bloque cette activité.'
      : `Point de friction : ${frenchList(failed.map((f) => f.issue))}.`;

  return { score, reason };
}

export const DIMENSION_SCORERS: Record<
  Dimension,
  (profile: ScoringProfile, business: ScorableBusiness) => RawDimensionScore
> = {
  skills: scoreSkills,
  interests: scoreInterests,
  behavior: scoreBehavior,
  personality: scorePersonality,
  budget: scoreBudget,
  time: scoreTime,
  risk: scoreRisk,
  marketDemand: scoreMarketDemand,
  monetizationSpeed: scoreMonetizationSpeed,
  acquisition: scoreAcquisition,
  constraints: scoreConstraints,
};
