import { describe, expect, it } from 'vitest';
import { findForbiddenClaims } from '../guardrails';
import {
  GUARANTEE_CONDITIONS,
  GUARANTEE_DAYS,
  GUARANTEE_HEADLINE,
  GUARANTEE_LEGAL_NOTE,
  GUARANTEE_PROMISE,
} from '../guarantee';

const ALL_TEXT = [
  GUARANTEE_HEADLINE,
  GUARANTEE_PROMISE,
  GUARANTEE_LEGAL_NOTE,
  ...GUARANTEE_CONDITIONS.flatMap((c) => [c.title, c.detail]),
];

describe('garantie de remboursement', () => {
  it('ne promet aucun revenu, malgré le sujet', () => {
    // La garantie parle de ce qui se passe s'il n'y a pas de revenu. Elle ne
    // doit jamais laisser entendre qu'il y en aura un.
    for (const text of ALL_TEXT) {
      expect(findForbiddenClaims(text), text).toHaveLength(0);
    }
  });

  it('n’emploie aucune formule qui suggère un gain attendu', () => {
    const joined = ALL_TEXT.join(' ').toLowerCase();
    for (const forbidden of [
      'tu vas gagner',
      'tes premiers revenus sont',
      'résultats garantis',
      'succès garanti',
      'tu réussiras',
    ]) {
      expect(joined, forbidden).not.toContain(forbidden);
    }
  });

  it('énonce toutes les conditions qui engagent, aucune n’est laissée de côté', () => {
    const titles = GUARANTEE_CONDITIONS.map((c) => c.title.toLowerCase()).join(' | ');
    // Qui, quand, quoi, comment, sous quel délai : une garantie à laquelle il
    // manque une de ces réponses se retourne contre celui qui l'annonce.
    expect(titles).toContain('pour qui');
    expect(titles).toContain('à partir de quand');
    expect(titles).toContain('ce qu’on te demande');
    expect(titles).toContain('comment demander');
    expect(titles).toContain('sous quel délai');
  });

  it('rappelle que la garantie s’ajoute aux droits légaux', () => {
    expect(GUARANTEE_LEGAL_NOTE).toContain('droits légaux');
    expect(GUARANTEE_LEGAL_NOTE).toContain('ne s’y substitue pas');
  });

  it('annonce un remboursement intégral, sans condition cachée sur le montant', () => {
    const joined = ALL_TEXT.join(' ');
    expect(joined).toMatch(/intégral/);
    expect(joined).not.toMatch(/partiel|au prorata|hors frais/i);
  });

  it('dit combien de jours, et le même nombre partout', () => {
    expect(GUARANTEE_PROMISE).toContain(String(GUARANTEE_DAYS));
    const quand = GUARANTEE_CONDITIONS.find((c) => c.title.includes('quand'));
    expect(quand?.detail).toContain(String(GUARANTEE_DAYS));
  });
});
