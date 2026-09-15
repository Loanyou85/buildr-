import { describe, expect, it } from 'vitest';
import {
  ANGLES_SANS_UTILISATEURS,
  REPARTITION,
  TOTAL_SCRIPTS,
  calendrierDesAngles,
} from '../angles';

describe('calendrier des trente vidéos', () => {
  const suite = calendrierDesAngles();

  it('produit exactement trente scripts', () => {
    expect(TOTAL_SCRIPTS).toBe(30);
    expect(suite).toHaveLength(30);
  });

  it('respecte la répartition imposée par la section 10.2', () => {
    const compte = suite.reduce<Record<string, number>>((acc, angle) => {
      acc[angle] = (acc[angle] ?? 0) + 1;
      return acc;
    }, {});
    expect(compte).toEqual(REPARTITION);
  });

  it('les six premiers se tournent sans le moindre utilisateur', () => {
    for (const angle of suite.slice(0, 6)) {
      expect(ANGLES_SANS_UTILISATEURS).toContain(angle);
    }
  });

  it('ne répète jamais le même angle deux jours de suite', () => {
    for (let i = 1; i < suite.length; i += 1) {
      expect(suite[i], `jour ${i + 1}`).not.toBe(suite[i - 1]);
    }
  });

  it('est déterministe', () => {
    expect(calendrierDesAngles()).toEqual(suite);
  });
});
