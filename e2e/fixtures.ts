import { PrismaClient, Role } from '@prisma/client';
import type { Page } from '@playwright/test';
import { hashPassword } from '../src/lib/auth/password';

export const db = new PrismaClient();

export const TEST_PASSWORD = 'motdepassedetest';

/**
 * Crée un compte comme le ferait le formulaire d'inscription. La connexion
 * elle-même passe par l'interface : depuis que les sessions sont signées et
 * non stockées, il n'y a plus de raccourci — et c'est tant mieux, le test
 * emprunte le même chemin que l'utilisateur.
 */
export async function createAccount(options: { email: string; pro?: boolean; name?: string }) {
  await db.user.deleteMany({ where: { email: options.email } });

  const user = await db.user.create({
    data: {
      email: options.email,
      name: options.name ?? 'Testeur',
      passwordHash: await hashPassword(TEST_PASSWORD),
      role: Role.user,
      consentAcceptedAt: new Date(),
      consentVersion: '2026-01',
      subscription: { create: { plan: options.pro ? 'pro' : 'free' } },
      notificationPref: { create: {} },
    },
  });

  return user;
}

/** Connexion par le formulaire, comme un utilisateur. */
export async function signIn(page: Page, email: string, password: string = TEST_PASSWORD) {
  await page.goto('/connexion');
  await page.getByLabel('Ton adresse e-mail').fill(email);
  await page.getByLabel('Ton mot de passe').fill(password);
  await page.getByRole('button', { name: 'Se connecter' }).click();
  await page.waitForURL(/\/(app|onboarding)/);
}

/** Profil complet, pour attaquer directement la recommandation. */
export async function completeProfile(userId: string, overrides: Record<string, unknown> = {}) {
  const profile = await db.profile.upsert({ where: { userId }, update: {}, create: { userId } });

  const [videoShooting, videoEditing, copywriting] = await Promise.all([
    db.skill.findUniqueOrThrow({ where: { slug: 'video_shooting' } }),
    db.skill.findUniqueOrThrow({ where: { slug: 'video_editing' } }),
    db.skill.findUniqueOrThrow({ where: { slug: 'copywriting' } }),
  ]);
  const [fitness, video] = await Promise.all([
    db.interest.findUniqueOrThrow({ where: { slug: 'fitness' } }),
    db.interest.findUniqueOrThrow({ where: { slug: 'video' } }),
  ]);

  await db.userSkill.createMany({
    data: [
      { profileId: profile.id, skillId: videoShooting.id, level: 4 },
      { profileId: profile.id, skillId: videoEditing.id, level: 4 },
      { profileId: profile.id, skillId: copywriting.id, level: 3 },
    ],
    skipDuplicates: true,
  });
  await db.userInterest.createMany({
    data: [
      { profileId: profile.id, interestId: fitness.id },
      { profileId: profile.id, interestId: video.id },
    ],
    skipDuplicates: true,
  });

  return db.profile.update({
    where: { id: profile.id },
    data: {
      age: 27,
      city: 'Lyon',
      status: 'employed',
      educationLevel: 'bac3',
      hoursPerWeek: 15,
      hoursPerDay: 2,
      initialBudget: 100,
      monthlyBudget: 60,
      financialGoal: 2000,
      timeHorizon: 6,
      riskTolerance: 'medium',
      workMode: 'remote',
      showsFace: true,
      createsContent: true,
      likesStrangers: true,
      likesSelling: true,
      likesCreating: true,
      likesAnalyzing: false,
      likesRepetition: false,
      prefersSolo: true,
      prefersFreedom: true,
      onboardingCompleted: true,
      onboardingStep: 'habit_free_saturday',
      ...overrides,
    },
  });
}

export async function cleanupUser(email: string) {
  await db.user.deleteMany({ where: { email } });
}
