import { describe, expect, it } from 'vitest';
import { ageGate, canSharePublicly, findForbiddenClaims, stripForbiddenClaims } from '../guardrails';

describe('garde-fou n° 2 — aucune promesse de revenu', () => {
  it('repère les formulations interdites', () => {
    const samples = [
      'Deviens riche en 3 mois',
      'Gagne 10k en 30 jours',
      'Des revenus passifs sans effort',
      'Passe en pilote automatique',
      'Quitte ton job dès le premier client',
      'La liberté financière en un an',
    ];
    for (const sample of samples) {
      expect(findForbiddenClaims(sample).length, sample).toBeGreaterThan(0);
    }
  });

  it('laisse passer le ton attendu : concret, ambitieux, honnête', () => {
    const samples = [
      'Obtenir tes premiers clients',
      'Tu as envoyé 10 messages aujourd’hui.',
      'Cette étape demande environ 58 minutes.',
      'Un premier client est atteignable en environ 30 jours.',
      'Ton offre a besoin d’un ajustement.',
    ];
    for (const sample of samples) {
      expect(findForbiddenClaims(sample), sample).toHaveLength(0);
    }
  });

  it('retire la phrase fautive au lieu de la réécrire en silence', () => {
    const cleaned = stripForbiddenClaims('Contacte 10 marques cette semaine. Tu vas gagner 5k en 30 jours.');
    expect(cleaned).toBe('Contacte 10 marques cette semaine.');
  });
});

describe('garde-fou n° 5 — mineurs', () => {
  it('refuse en dessous de 16 ans', () => {
    expect(ageGate(15)).toBe('refused');
    expect(ageGate(12)).toBe('refused');
  });

  it('restreint le partage public entre 16 et 18 ans', () => {
    expect(ageGate(16)).toBe('restricted');
    expect(ageGate(17)).toBe('restricted');
    expect(canSharePublicly(17)).toBe(false);
  });

  it('autorise à partir de 18 ans', () => {
    expect(ageGate(18)).toBe('allowed');
    expect(canSharePublicly(25)).toBe(true);
  });
});
