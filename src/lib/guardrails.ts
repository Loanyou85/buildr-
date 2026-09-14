/**
 * Garde-fous de la section 11. Ces règles ne sont pas des recommandations :
 * le code doit les rendre structurellement impossibles à violer.
 */

/** Garde-fou n° 2 — aucune promesse de revenu, nulle part. */
const FORBIDDEN_PATTERNS: RegExp[] = [
  /\bdeviens? riche\b/i,
  /\bdevenir riche\b/i,
  /\brevenus? (?:passifs?|garantis?)\b/i,
  /\bgarantis? de gagner\b/i,
  /\btu (?:vas|verras) gagner\b/i,
  /\b\d+\s?k\s?(?:€|euros?)?\s+en\s+\d+\s+(?:jours?|semaines?|mois)\b/i,
  /\bargent facile\b/i,
  /\bsans effort\b/i,
  /\bpilote automatique\b/i,
  /\bliberté financière\b/i,
  /\bquitte ton (?:job|travail|cdi)\b/i,
];

export type GuardrailViolation = { pattern: string; excerpt: string };

/** Retourne les formulations interdites trouvées dans un texte destiné à l'utilisateur. */
export function findForbiddenClaims(text: string): GuardrailViolation[] {
  const violations: GuardrailViolation[] = [];
  for (const pattern of FORBIDDEN_PATTERNS) {
    const match = pattern.exec(text);
    if (match) violations.push({ pattern: pattern.source, excerpt: match[0] });
  }
  return violations;
}

export function assertNoForbiddenClaims(text: string, source: string): void {
  const violations = findForbiddenClaims(text);
  if (violations.length > 0) {
    throw new Error(
      `Garde-fou n° 2 (promesse de revenu) violé dans ${source} : ${violations
        .map((v) => `« ${v.excerpt} »`)
        .join(', ')}`,
    );
  }
}

/**
 * Nettoie un texte produit par l'IA avant affichage. On ne corrige pas en
 * silence une promesse de revenu : on retire la phrase fautive.
 */
export function stripForbiddenClaims(text: string): string {
  return text
    .split(/(?<=[.!?])\s+/)
    .filter((sentence) => findForbiddenClaims(sentence).length === 0)
    .join(' ')
    .trim();
}

/** Garde-fou n° 5 — mineurs. */
export const MIN_AGE = 16;
export const PUBLIC_SHARING_AGE = 18;

export type AgeGate = 'refused' | 'restricted' | 'allowed';

export function ageGate(age: number | null | undefined): AgeGate {
  if (age == null) return 'allowed';
  if (age < MIN_AGE) return 'refused';
  if (age < PUBLIC_SHARING_AGE) return 'restricted';
  return 'allowed';
}

export function canSharePublicly(age: number | null | undefined): boolean {
  return ageGate(age) === 'allowed';
}

/** Garde-fou n° 3 — un résultat partagé est déclaré, jamais vérifié par défaut. */
export const DECLARED_LABEL = 'Déclaré par l’utilisateur';
