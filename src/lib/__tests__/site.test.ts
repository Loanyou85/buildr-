import { afterEach, describe, expect, it } from 'vitest';
import { absoluteUrl, siteUrl } from '../site';

const KEYS = ['AUTH_URL', 'NEXT_PUBLIC_APP_URL', 'VERCEL_PROJECT_PRODUCTION_URL', 'VERCEL_URL'] as const;

function setEnv(values: Partial<Record<(typeof KEYS)[number], string>>) {
  for (const key of KEYS) delete process.env[key];
  for (const [key, value] of Object.entries(values)) process.env[key] = value;
}

afterEach(() => {
  for (const key of KEYS) delete process.env[key];
});

describe('résolution de l’URL du site', () => {
  it('ignore une variable définie mais vide — c’est ce qui cassait le build', () => {
    setEnv({ AUTH_URL: '' });
    expect(() => new URL(siteUrl())).not.toThrow();
    expect(siteUrl()).toBe('http://localhost:3000');
  });

  it('ignore une variable qui ne contient que des espaces', () => {
    setEnv({ AUTH_URL: '   ' });
    expect(siteUrl()).toBe('http://localhost:3000');
  });

  it('ignore une valeur qui n’est pas une URL analysable', () => {
    setEnv({ AUTH_URL: 'ht!tp://pas une url' });
    expect(() => new URL(siteUrl())).not.toThrow();
  });

  it('utilise AUTH_URL quand elle est renseignée', () => {
    setEnv({ AUTH_URL: 'https://buildr.app' });
    expect(siteUrl()).toBe('https://buildr.app');
  });

  it('ajoute le protocole quand la plateforme ne donne que l’hôte', () => {
    setEnv({ VERCEL_URL: 'buildr-abc123.vercel.app' });
    expect(siteUrl()).toBe('https://buildr-abc123.vercel.app');
  });

  it('retombe sur la variable suivante quand la première est vide', () => {
    setEnv({ AUTH_URL: '', VERCEL_URL: 'buildr-abc123.vercel.app' });
    expect(siteUrl()).toBe('https://buildr-abc123.vercel.app');
  });

  it('ne conserve que l’origine, sans chemin résiduel', () => {
    setEnv({ AUTH_URL: 'https://buildr.app/app/' });
    expect(siteUrl()).toBe('https://buildr.app');
  });

  it('compose une URL absolue utilisable dans un e-mail', () => {
    setEnv({ AUTH_URL: 'https://buildr.app' });
    expect(absoluteUrl('/app')).toBe('https://buildr.app/app');
    expect(absoluteUrl('app')).toBe('https://buildr.app/app');
  });
});
