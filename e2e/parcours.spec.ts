import { expect, test } from '@playwright/test';
import { cleanupUser, completeProfile, createAccount, db, signIn, TEST_PASSWORD } from './fixtures';

const EMAIL = 'e2e-parcours@nexteo.test';

test.describe('Le chemin, de bout en bout', () => {
  test.afterAll(async () => {
    await cleanupUser(EMAIL);
    await db.$disconnect();
  });

  test('inscription en trois champs, puis reconnexion', async ({ page }) => {
    const email = 'e2e-inscription@nexteo.test';
    await cleanupUser(email);

    await page.goto('/inscription');
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Commencer ton aventure');

    // Le prénom est demandé au-dessus de l'adresse et du mot de passe.
    const labels = await page.locator('form label span').first().innerText();
    expect(labels).toContain('prénom');

    await page.getByLabel('Ton prénom').fill('Camille');
    await page.getByLabel('Ton adresse e-mail').fill(email);
    await page.getByLabel('Ton mot de passe').fill(TEST_PASSWORD);
    await page.getByRole('button', { name: 'Créer mon compte' }).click();

    // Aucun écran d'attente d'e-mail : on entre directement dans le diagnostic.
    await page.waitForURL('**/onboarding**');
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Quel âge as-tu');

    const created = await db.user.findUniqueOrThrow({ where: { email } });
    expect(created.name).toBe('Camille');
    expect(created.passwordHash).toBeTruthy();
    // Le mot de passe n'est jamais stocké en clair.
    expect(created.passwordHash).not.toContain(TEST_PASSWORD);
    expect(created.consentAcceptedAt).not.toBeNull();

    // Déconnexion puis reconnexion avec les mêmes identifiants.
    await page.context().clearCookies();
    await signIn(page, email);
    await expect(page).toHaveURL(/\/(app|onboarding)/);

    await page.goto('about:blank');
    await cleanupUser(email);
  });

  test('un mot de passe erroné est refusé sans dire lequel des deux est faux', async ({ page }) => {
    const email = 'e2e-mauvais-mdp@nexteo.test';
    await createAccount({ email });

    await page.goto('/connexion');
    await page.getByLabel('Ton adresse e-mail').fill(email);
    await page.getByLabel('Ton mot de passe').fill('mauvaismotdepasse');
    await page.getByRole('button', { name: 'Se connecter' }).click();

    await expect(page.getByText('Adresse e-mail ou mot de passe incorrect.')).toBeVisible();
    await expect(page).toHaveURL(/connexion/);

    await page.goto('about:blank');
    await cleanupUser(email);
  });

  test('landing publique : une seule action principale, aucun faux témoignage', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByRole('heading', { level: 1 })).toContainText('Construis-le');
    await expect(page.getByRole('link', { name: 'Trouver mon business' }).first()).toBeVisible();

    // Garde-fou n° 1 : sans aventure publiée, le mur reste vide et le dit.
    await expect(page.getByText('Aucune aventure partagée pour l’instant.')).toBeVisible();

    // Garde-fou n° 2 : aucune promesse de revenu nulle part dans la page.
    const body = (await page.locator('body').innerText()).toLowerCase();
    for (const forbidden of ['deviens riche', 'revenus passifs', 'argent facile', 'liberté financière']) {
      expect(body, `formulation interdite trouvée : ${forbidden}`).not.toContain(forbidden);
    }
  });

  test('du diagnostic au premier « J’ai terminé »', async ({ page }) => {
    const user = await createAccount({ email: EMAIL, pro: true });
    await completeProfile(user.id);
    await signIn(page, EMAIL);

    // --- Recommandation ---
    await page.goto('/recommandation');
    await expect(page.getByText('Ton business est prêt.')).toBeVisible();
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Agence UGC');
    await expect(page.getByRole('heading', { name: 'Pourquoi cette activité te correspond' })).toBeVisible();

    // Une seule action en orange signal sur l'écran.
    await expect(page.locator('.bg-signal')).toHaveCount(1);

    await page.getByRole('button', { name: 'Commencer' }).click();

    // --- Les offres, juste après la recommandation ---
    await page.waitForURL('**/offres**');
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Jusqu’où veux-tu aller');
    await expect(page.getByRole('heading', { level: 2 })).toHaveCount(3);
    await expect(page.getByText('29 €')).toBeVisible();
    // Une seule offre est mise en avant : l'orange ne désigne qu'une action.
    await expect(page.locator('.bg-signal')).toHaveCount(1);

    await page.getByRole('button', { name: 'Commencer gratuitement' }).click();

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

  test('une offre payante enregistre le choix sans jamais simuler un paiement', async ({ page }) => {
    const email = 'e2e-offres@nexteo.test';
    const user = await createAccount({ email });
    await completeProfile(user.id);
    await signIn(page, email);

    await page.goto('/recommandation');
    await page.getByRole('button', { name: 'Commencer' }).click();
    await page.waitForURL('**/offres**');

    await page.getByRole('button', { name: 'Choisir Parcours' }).click();
    await page.waitForURL(/paiement=indisponible/);
    await expect(page.getByText(/aucun montant ne t’a été débité/)).toBeVisible();

    const subscription = await db.subscription.findUniqueOrThrow({ where: { userId: user.id } });
    // L'intention est retenue, l'accès ne l'est pas.
    expect(subscription.intendedPlan).toBe('pro');
    expect(subscription.plan).toBe('free');

    await page.goto('about:blank');
    await cleanupUser(email);
  });

  test('la progression ne recule jamais', async ({ page }) => {
    const email = 'e2e-progression@nexteo.test';
    const user = await createAccount({ email, pro: true });
    await completeProfile(user.id);
    await signIn(page, email);

    await page.goto('/recommandation');
    await page.getByRole('button', { name: 'Commencer' }).click();
    await page.waitForURL('**/offres**');
    await page.getByRole('button', { name: 'Commencer gratuitement' }).click();
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

  test('un mineur de moins de 16 ans est refusé et son compte supprimé', async ({ page }) => {
    const email = 'e2e-mineur@nexteo.test';
    const user = await createAccount({ email });
    await signIn(page, email);

    await page.goto('/onboarding?q=0');
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Quel âge as-tu');

    // Tout se coche : aucun champ à saisir dans le tunnel.
    await expect(page.locator('input[type="text"], input[type="number"]')).toHaveCount(0);
    await page.getByRole('button', { name: 'Moins de 16 ans' }).click();

    await page.waitForURL('**/trop-jeune');
    await expect(page.getByRole('heading', { level: 1 })).toContainText('16 ans');

    const deleted = await db.user.findUnique({ where: { id: user.id } });
    expect(deleted).toBeNull();
  });

  test('l’onboarding sauvegarde à chaque réponse et reprend où on s’est arrêté', async ({ page }) => {
    const email = 'e2e-onboarding@nexteo.test';
    const user = await createAccount({ email });
    await signIn(page, email);

    await page.goto('/onboarding?q=0');
    // Un clic répond et enchaîne : pas de bouton « Continuer » à chercher.
    await page.getByRole('button', { name: '25 à 34 ans' }).click();
    await page.waitForURL('**/onboarding?q=1');

    await page.getByRole('button', { name: 'Salarié' }).click();
    await page.waitForURL('**/onboarding?q=2');

    const profile = await db.profile.findUniqueOrThrow({ where: { userId: user.id } });
    expect(profile.age).toBe(29);
    expect(profile.status).toBe('employed');
    expect(profile.onboardingStep).toBe('status');

    // Reprise : sans paramètre, on repart à la question suivante.
    await page.goto('/onboarding');
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Tu vis plutôt où');

    await page.goto('about:blank');
    await cleanupUser(email);
  });
});
