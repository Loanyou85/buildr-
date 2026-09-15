import type { NextConfig } from 'next';

/**
 * Origines autorisées pour les Server Actions.
 *
 * Next vérifie que l'origine de la requête correspond à l'hôte. Derrière un
 * domaine personnalisé ou un proxy, les deux diffèrent et l'action est rejetée
 * en silence : le formulaire part, rien ne revient, et l'écran reste figé.
 * C'est la panne la plus fréquente qui n'apparaît qu'en production.
 */
const origines = [
  'nexteo.app',
  'www.nexteo.app',
  'nexto.nexteo.app',
  '*.vercel.app',
  'localhost:3000',
  '127.0.0.1:3100',
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  typedRoutes: false,
  experimental: {
    serverActions: {
      // Les réponses du diagnostic et les validations d'étape passent par là.
      bodySizeLimit: '1mb',
      allowedOrigins: origines,
    },
  },
};

export default nextConfig;
