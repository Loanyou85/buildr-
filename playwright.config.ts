import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  timeout: 90_000,
  expect: { timeout: 15_000 },
  fullyParallel: false,
  workers: 1,
  reporter: [['list']],
  use: {
    baseURL: process.env.E2E_BASE_URL ?? 'http://127.0.0.1:3100',
    trace: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        // Chromium est pré-installé dans l'environnement : on l'utilise plutôt
        // que de retélécharger une build liée à la version du paquet.
        launchOptions: process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {},
      },
    },
  ],
  webServer: {
    command: 'npx next start -p 3100 -H 127.0.0.1',
    // Sans clé, les explications et les scripts basculent sur leur version
    // déterministe : les tests ne dépendent pas d'un appel réseau.
    env: { ANTHROPIC_API_KEY: '', STRIPE_SECRET_KEY: '' },
    url: 'http://127.0.0.1:3100',
    reuseExistingServer: true,
    timeout: 120_000,
  },
});
