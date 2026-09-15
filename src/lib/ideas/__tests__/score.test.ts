import { describe, expect, it } from 'vitest';
import { BLUEPRINTS } from '../catalog';
import {
  DEFAULT_WEIGHTS,
  MAX_MONTHLY_FIXED_COST,
  hardConstraintFailures,
  hasDemonstrableLink,
  rankIdeas,
  scoreIdea,
} from '../score';
import { DIMENSIONS, type BlueprintInput, type ProfileInput } from '../types';
import { PROFIL_KINE, PROFIL_LOGISTIQUE, PROFIL_SERVEUR } from './profils-demo';

const blueprintBySlug = (slug: string): BlueprintInput => {
  const found = BLUEPRINTS.find((b) => b.slug === slug);
  if (!found) throw new Error(`Archétype inconnu : ${slug}`);
  return found;
};

describe('contraintes dures', () => {
  it('élimine ce que le parcours ne sait pas construire', () => {
    const impossible: BlueprintInput = {
      ...blueprintBySlug('planning-restaurant'),
      slug: 'impossible',
      requiresComplexCode: true,
      requiresTeam: true,
    };
    const reasons = hardConstraintFailures(impossible);
    expect(reasons).toHaveLength(2);
    expect(scoreIdea(PROFIL_SERVEUR, impossible).eliminated).toBe(true);
  });

  it('élimine au-delà du plafond de coûts fixes', () => {
    const cher: BlueprintInput = {
      ...blueprintBySlug('planning-restaurant'),
      slug: 'cher',
      monthlyFixedCost: MAX_MONTHLY_FIXED_COST + 1,
    };
    expect(hardConstraintFailures(cher)).toHaveLength(1);
  });

  it('ne renvoie jamais une idée éliminée dans le classement', () => {
    const avecImpossible: BlueprintInput[] = [
      ...BLUEPRINTS,
      { ...blueprintBySlug('planning-restaurant'), slug: 'zzz-impossible', requiresPhysicalStock: true },
    ];
    const top = rankIdeas(PROFIL_SERVEUR, avecImpossible, DEFAULT_WEIGHTS, 50);
    expect(top.map((r) => r.slug)).not.toContain('zzz-impossible');
  });

  it('le catalogue livré ne contient aucun archétype éliminé d’office', () => {
    for (const b of BLUEPRINTS) {
      expect(hardConstraintFailures(b), `${b.slug} viole une contrainte dure`).toHaveLength(0);
    }
  });
});

describe('déterminisme', () => {
  it('rend exactement le même résultat pour les mêmes entrées', () => {
    const a = rankIdeas(PROFIL_KINE, BLUEPRINTS);
    const b = rankIdeas(PROFIL_KINE, BLUEPRINTS);
    expect(a).toEqual(b);
  });

  it('ne dépend pas de l’ordre des archétypes en entrée', () => {
    const inverse = [...BLUEPRINTS].reverse();
    expect(rankIdeas(PROFIL_SERVEUR, inverse).map((r) => r.slug)).toEqual(
      rankIdeas(PROFIL_SERVEUR, BLUEPRINTS).map((r) => r.slug),
    );
  });

  it('produit un score entre 0 et 100 et un détail complet', () => {
    for (const result of rankIdeas(PROFIL_LOGISTIQUE, BLUEPRINTS, DEFAULT_WEIGHTS, 50)) {
      expect(result.score).toBeGreaterThanOrEqual(0);
      expect(result.score).toBeLessThanOrEqual(100);
      expect(result.breakdown.map((d) => d.dimension)).toEqual([...DIMENSIONS]);
      for (const d of result.breakdown) {
        expect(d.value).toBeGreaterThanOrEqual(0);
        expect(d.value).toBeLessThanOrEqual(1);
        expect(d.explanation.length).toBeGreaterThan(0);
      }
    }
  });
});

describe('section 8.3 — lien démontrable avec le profil', () => {
  it('chaque idée retenue cite au moins un élément du profil', () => {
    for (const profil of [PROFIL_KINE, PROFIL_SERVEUR, PROFIL_LOGISTIQUE]) {
      for (const result of rankIdeas(profil, BLUEPRINTS)) {
        expect(hasDemonstrableLink(result), `${result.slug} ne cite rien du profil`).toBe(true);
      }
    }
  });

  it('un profil vide ne produit aucun lien démontrable', () => {
    const vide: ProfileInput = {
      domains: [],
      skills: [],
      interests: [],
      frictionSignals: [],
      hoursPerWeek: 5,
      budget: 0,
      technicalLevel: 0,
      goalRevenue: 0,
      timeHorizon: 6,
      riskTolerance: 'low',
      showsFace: false,
      prefersSolo: false,
      reachableCount: 0,
    };
    const resultat = scoreIdea(vide, blueprintBySlug('planning-restaurant'));
    expect(hasDemonstrableLink(resultat)).toBe(false);
  });
});

describe('section 15 — les trois profils ne produisent pas des idées interchangeables', () => {
  const kine = rankIdeas(PROFIL_KINE, BLUEPRINTS);
  const serveur = rankIdeas(PROFIL_SERVEUR, BLUEPRINTS);
  const logistique = rankIdeas(PROFIL_LOGISTIQUE, BLUEPRINTS);

  it('sort l’idée attendue en tête pour chacun', () => {
    expect(kine[0]!.slug).toBe('suivi-seances-kine');
    expect(serveur[0]!.slug).toBe('planning-restaurant');
    expect(logistique[0]!.slug).toBe('suivi-livraisons-transporteur');
  });

  it('les trois listes de trois idées sont disjointes', () => {
    const k = new Set(kine.map((r) => r.slug));
    const s = new Set(serveur.map((r) => r.slug));
    const l = new Set(logistique.map((r) => r.slug));
    expect([...k].filter((x) => s.has(x))).toHaveLength(0);
    expect([...k].filter((x) => l.has(x))).toHaveLength(0);
    expect([...s].filter((x) => l.has(x))).toHaveLength(0);
  });

  it('l’idée de tête se détache nettement de la suivante', () => {
    for (const liste of [kine, serveur, logistique]) {
      expect(liste[0]!.score - liste[1]!.score).toBeGreaterThan(2);
    }
  });
});

describe('dimensions', () => {
  it('connaître le secteur par le métier pèse plus que par intérêt', () => {
    const blueprint = blueprintBySlug('planning-restaurant');
    const parMetier = scoreIdea(
      { ...PROFIL_SERVEUR, domains: [{ slug: 'restauration', yearsExposure: 4, source: 'metier' }] },
      blueprint,
    );
    const parPassion = scoreIdea(
      { ...PROFIL_SERVEUR, domains: [{ slug: 'restauration', yearsExposure: 4, source: 'passion' }] },
      blueprint,
    );
    const acces = (r: typeof parMetier) =>
      r.breakdown.find((d) => d.dimension === 'problemAccess')!.value;
    expect(acces(parMetier)).toBeGreaterThan(acces(parPassion));
  });

  it('refuser de se filmer effondre la compatibilité personnelle d’une idée qui l’exige', () => {
    const blueprint: BlueprintInput = { ...blueprintBySlug('programmes-coach-sportif'), requiresFace: true };
    const avec = scoreIdea({ ...PROFIL_SERVEUR, showsFace: true }, blueprint);
    const sans = scoreIdea({ ...PROFIL_SERVEUR, showsFace: false }, blueprint);
    const fit = (r: typeof avec) => r.breakdown.find((d) => d.dimension === 'personalFit')!.value;
    expect(fit(sans)).toBeLessThan(fit(avec) / 2);
  });

  it('un objectif de revenu élevé favorise les idées à prix plus élevé', () => {
    const cher = blueprintBySlug('suivi-candidats-interim'); // 45 €
    const bonMarche = blueprintBySlug('notes-frais-tpe'); // 7 €
    const ambitieux: ProfileInput = { ...PROFIL_SERVEUR, goalRevenue: 3000 };
    const payer = (b: BlueprintInput) =>
      scoreIdea(ambitieux, b).breakdown.find((d) => d.dimension === 'willingnessToPay')!.value;
    expect(payer(cher)).toBeGreaterThan(payer(bonMarche));
  });

  it('moins d’heures disponibles que l’idée n’en demande fait baisser la compatibilité temps', () => {
    const blueprint = blueprintBySlug('preparation-commandes-entrepot'); // 10 h minimum
    const fit = (hoursPerWeek: number) =>
      scoreIdea({ ...PROFIL_LOGISTIQUE, hoursPerWeek }, blueprint).breakdown.find(
        (d) => d.dimension === 'timeFit',
      )!.value;
    expect(fit(3)).toBeLessThan(fit(10));
    expect(fit(10)).toBe(1);
  });

  it('un budget nul pénalise une idée à coûts fixes, jamais une idée gratuite', () => {
    const sansFrais = blueprintBySlug('planning-restaurant'); // 0 €/mois
    const avecFrais = blueprintBySlug('notes-frais-tpe'); // 30 €/mois
    const fauche: ProfileInput = { ...PROFIL_SERVEUR, budget: 0 };
    const budget = (b: BlueprintInput) =>
      scoreIdea(fauche, b).breakdown.find((d) => d.dimension === 'budgetFit')!.value;
    expect(budget(sansFrais)).toBe(1);
    expect(budget(avecFrais)).toBe(0);
  });

  it('les poids viennent de l’extérieur : les changer change le classement', () => {
    const surAccesClients = { ...DEFAULT_WEIGHTS, customerAccess: 5 };
    const normal = rankIdeas(PROFIL_KINE, BLUEPRINTS, DEFAULT_WEIGHTS, 24);
    const biaise = rankIdeas(PROFIL_KINE, BLUEPRINTS, surAccesClients, 24);
    expect(biaise.map((r) => r.score)).not.toEqual(normal.map((r) => r.score));
  });
});
