/**
 * URL publique du site. Résolue ici, une seule fois, parce que les variables
 * d'environnement des plateformes de déploiement sont souvent **définies mais
 * vides** — et `??` ne rattrape que `undefined` et `null`, pas la chaîne vide.
 * Un `new URL('')` cassait alors le build au moment de collecter les métadonnées.
 */
const FALLBACK_URL = 'http://localhost:3000';

function normalize(value: string | undefined): string | null {
  const trimmed = value?.trim();
  if (!trimmed) return null;

  // Les plateformes exposent souvent l'hôte seul, sans protocole.
  const withProtocol = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;

  try {
    return new URL(withProtocol).origin;
  } catch {
    return null;
  }
}

export function siteUrl(): string {
  const candidates = [
    process.env.AUTH_URL,
    process.env.NEXT_PUBLIC_APP_URL,
    process.env.VERCEL_PROJECT_PRODUCTION_URL,
    process.env.VERCEL_URL,
  ];

  for (const candidate of candidates) {
    const normalized = normalize(candidate);
    if (normalized) return normalized;
  }

  return FALLBACK_URL;
}

/** URL absolue vers un chemin interne, pour les e-mails et les métadonnées. */
export function absoluteUrl(path: string): string {
  return `${siteUrl()}${path.startsWith('/') ? path : `/${path}`}`;
}
