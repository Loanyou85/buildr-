import { describe, expect, it } from 'vitest';
import { rankBusinesses, scoreBusiness, topDimensions, weakDimensions } from '../score';
import type { ScorableBusiness, ScoringProfile } from '../types';
import { DIMENSIONS } from '../types';

const baseProfile: ScoringProfile = {
  skills: { video_editing: 4, copywriting: 3 },
  interests: ['fitness', 'video'],
  hoursPerWeek: 15,
  hoursPerDay: 2,
  initialBudget: 200,
  monthlyBudget: 100,
  financialGoal: 2000,
  timeHorizon: 6,
  riskTolerance: 'medium',
  workMode: 'remote',
  showsFace: true,
  createsContent: true,
  prefersSolo: true,
  likesStrangers: true,
  likesSelling: true,
  likesCreating: true,
  likesAnalyzing: false,
  likesRepetition: false,
  prefersFreedom: true,
};

const ugc: ScorableBusiness = {
  id: 'b-ugc',
  slug: 'agence-ugc',
  name: 'Agence UGC',
  difficulty: 'easy',
  minBudget: 0,
  maxBudget: 500,
  hoursPerWeekMin: 8,
  hoursPerWeekMax: 25,
  timeToFirstClientDays: 30,
  requiresFace: true,
  requiresContent: true,
  requiresSelling: false,
  requiresLocalPresence: false,
  weights: { behavior: 1.5, skills: 1.2, monetizationSpeed: 1.3 },
  tags: [
    { dimension: 'skills', key: 'video_editing', weight: 2 },
    { dimension: 'skills', key: 'copywriting', weight: 1 },
    { dimension: 'interests', key: 'fitness', weight: 1 },
    { dimension: 'behavior', key: 'content_production', weight: 2 },
    { dimension: 'behavior', key: 'on_camera', weight: 2 },
    { dimension: 'behavior', key: 'outreach', weight: 1.5 },
    { dimension: 'personality', key: 'solo', weight: 1 },
    { dimension: 'market', key: 'demand', weight: 0.8 },
    { dimension: 'acquisition', key: 'outbound', weight: 2 },
  ],
};

const ecommerce: ScorableBusiness = {
  id: 'b-ecom',
  slug: 'e-commerce',
  name: 'E-commerce',
  difficulty: 'hard',
  minBudget: 1500,
  maxBudget: 8000,
  hoursPerWeekMin: 15,
  hoursPerWeekMax: 40,
  timeToFirstClientDays: 60,
  requiresFace: false,
  requiresContent: false,
  requiresSelling: false,
  requiresLocalPresence: false,
  weights: { budget: 2 },
  tags: [
    { dimension: 'skills', key: 'ads', weight: 2 },
    { dimension: 'acquisition', key: 'paid', weight: 2 },
    { dimension: 'market', key: 'demand', weight: 0.7 },
  ],
};

const localService: ScorableBusiness = {
  id: 'b-local',
  slug: 'service-local',
  name: 'Service local',
  difficulty: 'easy',
  minBudget: 0,
  maxBudget: 400,
  hoursPerWeekMin: 6,
  hoursPerWeekMax: 30,
  timeToFirstClientDays: 14,
  requiresFace: false,
  requiresContent: false,
  requiresSelling: true,
  requiresLocalPresence: true,
  weights: {},
  tags: [
    { dimension: 'acquisition', key: 'local', weight: 2 },
    { dimension: 'market', key: 'demand', weight: 0.9 },
  ],
};

describe('scoreBusiness — contraintes dures', () => {
  it('élimine un business dont le budget minimum dépasse le budget initial', () => {
    const result = scoreBusiness({ ...baseProfile, initialBudget: 200 }, ecommerce);
    expect(result.eliminated).toBe(true);
    if (result.eliminated) {
      expect(result.reasons.map((r) => r.constraint)).toContain('budget');
    }
  });

  it('élimine un business demandant plus de temps que disponible', () => {
    const result = scoreBusiness({ ...baseProfile, hoursPerWeek: 4 }, ugc);
    expect(result.eliminated).toBe(true);
    if (result.eliminated) expect(result.reasons.map((r) => r.constraint)).toContain('time');
  });

  it('élimine un business exigeant le visage quand l’utilisateur refuse', () => {
    const result = scoreBusiness({ ...baseProfile, showsFace: false }, ugc);
    expect(result.eliminated).toBe(true);
    if (result.eliminated) expect(result.reasons.map((r) => r.constraint)).toContain('face');
  });

  it('élimine un business local quand l’utilisateur veut travailler à distance', () => {
    const result = scoreBusiness(baseProfile, localService);
    expect(result.eliminated).toBe(true);
    if (result.eliminated) expect(result.reasons.map((r) => r.constraint)).toContain('local');
  });

  it('n’élimine pas quand toutes les contraintes sont satisfaites', () => {
    expect(scoreBusiness(baseProfile, ugc).eliminated).toBe(false);
  });
});

describe('scoreBusiness — score', () => {
  it('retourne un score borné entre 0 et 100', () => {
    const result = scoreBusiness(baseProfile, ugc);
    if (result.eliminated) throw new Error('inattendu');
    expect(result.score).toBeGreaterThan(0);
    expect(result.score).toBeLessThanOrEqual(100);
  });

  it('couvre les onze dimensions, chacune avec une raison lisible', () => {
    const result = scoreBusiness(baseProfile, ugc);
    if (result.eliminated) throw new Error('inattendu');
    expect(result.breakdown).toHaveLength(DIMENSIONS.length);
    for (const dimension of result.breakdown) {
      expect(dimension.score).toBeGreaterThanOrEqual(0);
      expect(dimension.score).toBeLessThanOrEqual(1);
      expect(dimension.reason.length).toBeGreaterThan(10);
    }
  });

  it('normalise les poids : leur somme vaut 1', () => {
    const result = scoreBusiness(baseProfile, ugc);
    if (result.eliminated) throw new Error('inattendu');
    const total = result.breakdown.reduce((sum, d) => sum + d.weight, 0);
    expect(total).toBeCloseTo(1, 2);
  });

  it('est déterministe : deux appels identiques donnent le même score', () => {
    const a = scoreBusiness(baseProfile, ugc);
    const b = scoreBusiness(baseProfile, ugc);
    expect(a).toEqual(b);
  });

  it('est une fonction pure : elle ne modifie pas ses entrées', () => {
    const profileCopy = structuredClone(baseProfile);
    const businessCopy = structuredClone(ugc);
    scoreBusiness(profileCopy, businessCopy);
    expect(profileCopy).toEqual(baseProfile);
    expect(businessCopy).toEqual(ugc);
  });

  it('monte quand les compétences demandées sont mieux maîtrisées', () => {
    const weak = scoreBusiness({ ...baseProfile, skills: { video_editing: 0, copywriting: 0 } }, ugc);
    const strong = scoreBusiness({ ...baseProfile, skills: { video_editing: 5, copywriting: 5 } }, ugc);
    if (weak.eliminated || strong.eliminated) throw new Error('inattendu');
    expect(strong.score).toBeGreaterThan(weak.score);
  });

  it('pénalise un horizon plus court que le délai jusqu’au premier client', () => {
    const patient = scoreBusiness({ ...baseProfile, timeHorizon: 12 }, ugc);
    const pressé = scoreBusiness({ ...baseProfile, timeHorizon: 1 }, ugc);
    if (patient.eliminated || pressé.eliminated) throw new Error('inattendu');
    const speedOf = (r: typeof patient) =>
      r.breakdown.find((d) => d.dimension === 'monetizationSpeed')?.score ?? 0;
    expect(speedOf(patient)).toBeGreaterThan(speedOf(pressé));
  });

  it('respecte les poids déclarés en base plutôt que les poids par défaut', () => {
    const behaviorHeavy = scoreBusiness(baseProfile, { ...ugc, weights: { behavior: 100 } });
    if (behaviorHeavy.eliminated) throw new Error('inattendu');
    const behavior = behaviorHeavy.breakdown.find((d) => d.dimension === 'behavior');
    expect(behavior?.weight).toBeGreaterThan(0.8);
  });

  it('reste calculable pour un business sans aucun tag', () => {
    const bare: ScorableBusiness = { ...ugc, tags: [], weights: {} };
    const result = scoreBusiness(baseProfile, bare);
    expect(result.eliminated).toBe(false);
  });
});

describe('rankBusinesses', () => {
  it('retourne au plus trois résultats, un principal et des alternatives', () => {
    const result = rankBusinesses(baseProfile, [ugc, ecommerce, localService]);
    expect(result.ranked.length).toBeLessThanOrEqual(3);
    expect(result.primary?.businessId).toBe('b-ugc');
    expect(result.alternatives.every((a) => a.businessId !== result.primary?.businessId)).toBe(true);
  });

  it('classe par score décroissant', () => {
    const permissive: ScoringProfile = { ...baseProfile, initialBudget: 5000, monthlyBudget: 600, hoursPerWeek: 30, workMode: 'hybrid' };
    const result = rankBusinesses(permissive, [ugc, ecommerce, localService]);
    const scores = result.ranked.map((r) => r.score);
    expect([...scores].sort((a, b) => b - a)).toEqual(scores);
  });

  it('remonte les éliminés séparément, avec leur raison', () => {
    const result = rankBusinesses(baseProfile, [ugc, ecommerce, localService]);
    expect(result.eliminated.map((e) => e.slug).sort()).toEqual(['e-commerce', 'service-local']);
    expect(result.eliminated[0]?.reasons.length).toBeGreaterThan(0);
  });

  it('exclut les business déjà refusés', () => {
    const result = rankBusinesses(baseProfile, [ugc, ecommerce, localService], { exclude: ['b-ugc'] });
    expect(result.ranked.some((r) => r.businessId === 'b-ugc')).toBe(false);
  });

  it('ne renvoie aucune recommandation quand tout est éliminé', () => {
    const impossible: ScoringProfile = { ...baseProfile, hoursPerWeek: 1, initialBudget: 0 };
    const result = rankBusinesses(impossible, [ugc, ecommerce, localService]);
    expect(result.primary).toBeNull();
    expect(result.ranked).toHaveLength(0);
  });

  it('départage deux scores identiques de façon stable', () => {
    const twin: ScorableBusiness = { ...ugc, id: 'b-ugc-2', slug: 'agence-ugc-bis', name: 'Agence UGC bis' };
    const first = rankBusinesses(baseProfile, [ugc, twin]);
    const second = rankBusinesses(baseProfile, [twin, ugc]);
    expect(first.ranked.map((r) => r.slug)).toEqual(second.ranked.map((r) => r.slug));
  });
});

describe('lecture du breakdown', () => {
  it('topDimensions remonte les contributions les plus fortes', () => {
    const result = scoreBusiness(baseProfile, ugc);
    if (result.eliminated) throw new Error('inattendu');
    const top = topDimensions(result.breakdown, 3);
    expect(top).toHaveLength(3);
    expect(top[0]!.contribution).toBeGreaterThanOrEqual(top[2]!.contribution);
  });

  it('weakDimensions remonte les scores les plus bas', () => {
    const result = scoreBusiness({ ...baseProfile, interests: [] }, ugc);
    if (result.eliminated) throw new Error('inattendu');
    const weak = weakDimensions(result.breakdown, 2);
    expect(weak[0]!.score).toBeLessThanOrEqual(weak[1]!.score);
  });
});
