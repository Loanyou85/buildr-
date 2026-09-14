import { expect, test, type BrowserContext } from '@playwright/test';
import { cleanupUser, completeProfile, createSignedInUser, db } from './fixtures';

const EMAIL = 'e2e-parcours@nexteo.test';

async function signIn(context: BrowserContext, sessionToken: string) {
  await context.addCookies([
    {
      name: 'authjs.session-token',
      value: sessionToken,
      domain: '127.0.0.1',
      path: '/',
      httpOnly: true,
      sameSite: 'Lax',
    },
  ]);
}

test.describe('Le chemin, de bout en bout', () => {
  test.afterAll(async () => {
    await cleanupUser(EMAIL);
    await db.$disconnect();
  });

  test('landing publique : une seule action principale, aucun faux témoignage', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByRole('heading', { level: 1 })).toContainText('Construis-le');
    await expect(page.getByRole('link', { name: 'Commencer mon aventure' }).first()).toBeVisible();

    // Garde-fou n° 1 : sans aventure publiée, le mur reste vide et le dit.
    await expect(page.getByText('Aucune aventure partagée pour l’instant.')).toBeVisible();

    // Garde-fou n° 2 : aucune promesse de revenu nulle part dans la page.
    const body = (await page.locator('body').innerText()).toLowerCase();
    for (const forbidden of ['deviens riche', 'revenus passifs', 'argent facile', 'liberté financière']) {
      expect(body, `formulation interdite trouvée : ${forbidden}`).not.toContain(forbidden);
    }
  });

  test('du diagnostic au premier « J’ai terminé »', async ({ page, context }) => {
    const { user, sessionToken } = await createSignedInUser({ email: EMAIL, pro: true });
    await completeProfile(user.id);
    await signIn(context, sessionToken);

    // --- Recommandation ---
    await page.goto('/recommandation');
    await expect(page.getByText('Ton business est prêt.')).toBeVisible();
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Agence UGC');
    await expect(page.getByRole('heading', { name: 'Pourquoi cette activité te correspond' })).toBeVisible();

    // Une seule action en orange signal sur l'écran.
    await expect(page.locator('.bg-signal')).toHaveCount(1);

    await page.getByRole('button', { name: 'Commencer' }).click();

    // --- Aujourd'hui ---
    await page.waitForURL('**/app');
    await expect(page.getByText('JOUR 1')).toBeVisible();
    await expect(page.getByText('Ton objectif')).toBeVisible();
    await expect(page.getByText('À faire maintenant')).toBeVisible();
    await expect(page.getByText(/Temps estimé/)).toBeVisible();
    await expect(page.locator('.bg-signal')).toHaveCount(1);

    // --- Étape détaillée ---
    await page.getByRole('button', { name: 'Commencer' }).click();
    await page.waitForURL('**/app/etape/**');
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Choisir ta niche');
    await expect(page.getByText('Pourquoi cette étape')).toBeVisible();

    // Le niveau de détail est une fonctionnalité : les actions sont exécutables.
    await expect(page.getByText('Ouvre une note vide')).toBeVisible();
    await expect(page.getByText(/Exemple :/).first()).toBeVisible();

    // Le bouton de validation est inactif tant que les critères ne sont pas cochés.
    const finish = page.getByRole('button', { name: 'J’ai terminé' });
    await expect(finish).toBeDisabled();

    // --- Validation ---
    const requiredCheckpoints = page.locator('button[aria-pressed]');
    const count = await requiredCheckpoints.count();
    for (let index = 0; index < count; index += 1) {
      await page.locator('button[aria-pressed]').nth(index).click();
      await page.waitForLoadState('networkidle');
    }

    await expect(page.getByRole('button', { name: 'J’ai terminé' })).toBeEnabled();
    await page.getByRole('button', { name: 'J’ai terminé' }).click();

    await page.waitForURL(/franchie=1/);
    await expect(page.getByText('Étape 1 franchie')).toBeVisible();

    // --- La progression a avancé, l'étape suivante est ouverte ---
    await page.goto('/app/chemin');
    await expect(page.getByText('Étape en cours')).toBeVisible();

    const userJourney = await db.userJourney.findFirstOrThrow({ where: { userId: user.id } });
    expect(userJourney.progressPercent).toBeGreaterThan(0);

    const nextStep = await db.stepProgress.findFirstOrThrow({
      where: { userJourneyId: userJourney.id, step: { number: 2 } },
    });
    expect(nextStep.status).toBe('available');
  });

  test('la progression ne recule jamais', async ({ page, context }) => {
    const email = 'e2e-progression@nexteo.test';
    const { user, sessionToken } = await createSignedInUser({ email, pro: true });
    await completeProfile(user.id);
    await signIn(context, sessionToken);

    await page.goto('/recommandation');
    await page.getByRole('button', { name: 'Commencer' }).click();
    await page.waitForURL('**/app');

    const journey = await db.userJourney.findFirstOrThrow({ where: { userId: user.id } });
    await db.userJourney.update({ where: { id: journey.id }, data: { progressPercent: 60 } });

    // On coche puis on décoche : la barre ne redescend pas.
    await page.goto('/app');
    await page.getByRole('button', { name: 'Commencer' }).click();
    await page.waitForURL('**/app/etape/**');

    const checkpoint = page.locator('button[aria-pressed]').first();
    await checkpoint.click();
    await page.waitForLoadState('networkidle');
    await page.locator('button[aria-pressed="true"]').first().click();
    await page.waitForLoadState('networkidle');

    const after = await db.userJourney.findUniqueOrThrow({ where: { id: journey.id } });
    expect(after.progressPercent).toBeGreaterThanOrEqual(60);

    // On quitte la page avant de supprimer l'utilisateur : sinon une
    // revalidation encore en vol interroge des lignes qui viennent de partir.
    await page.goto('about:blank');
    await cleanupUser(email);
  });

  test('un mineur de moins de 16 ans est refusé et son compte supprimé', async ({ page, context }) => {
    const email = 'e2e-mineur@nexteo.test';
    const { user, sessionToken } = await createSignedInUser({ email });
    await signIn(context, sessionToken);

    await page.goto('/onboarding?q=0');
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Quel âge as-tu');

    await page.locator('input[name="value"]').fill('14');
    await page.getByRole('button', { name: 'Continuer' }).click();

    await page.waitForURL('**/trop-jeune');
    await expect(page.getByRole('heading', { level: 1 })).toContainText('16 ans');

    const deleted = await db.user.findUnique({ where: { id: user.id } });
    expect(deleted).toBeNull();
  });

  test('l’onboarding sauvegarde à chaque réponse et reprend où on s’est arrêté', async ({ page, context }) => {
    const email = 'e2e-onboarding@nexteo.test';
    const { user, sessionToken } = await createSignedInUser({ email });
    await signIn(context, sessionToken);

    await page.goto('/onboarding?q=0');
    await page.locator('input[name="value"]').fill('27');
    await page.getByRole('button', { name: 'Continuer' }).click();

    await page.waitForURL('**/onboarding?q=1');
    await page.getByRole('radio').first().click();
    await page.getByRole('button', { name: 'Continuer' }).click();
    await page.waitForURL('**/onboarding?q=2');

    const profile = await db.profile.findUniqueOrThrow({ where: { userId: user.id } });
    expect(profile.age).toBe(27);
    expect(profile.onboardingStep).toBe('status');

    // Reprise : sans paramètre, on repart à la question suivante.
    await page.goto('/onboarding');
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Tu habites où');

    await page.goto('about:blank');
    await cleanupUser(email);
  });
});
