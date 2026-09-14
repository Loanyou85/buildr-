import { PrismaClient } from '@prisma/client';

export const db = new PrismaClient();

/**
 * Crée un utilisateur avec une session valide, sans passer par l'e-mail.
 * Auth.js en stratégie base de données : un cookie de session suffit.
 */
export async function createSignedInUser(options: { email: string; pro?: boolean; age?: number }) {
  await db.user.deleteMany({ where: { email: options.email } });

  const user = await db.user.create({
    data: {
      email: options.email,
      emailVerified: new Date(),
      name: 'Testeur',
      consentAcceptedAt: new Date(),
      consentVersion: '2026-01',
      subscription: { create: { plan: options.pro ? 'pro' : 'free' } },
      notificationPref: { create: {} },
    },
  });

  const sessionToken = `e2e-${Math.random().toString(36).slice(2)}-${Date.now()}`;
  await db.session.create({
    data: {
      sessionToken,
      userId: user.id,
      expires: new Date(Date.now() + 86_400_000),
    },
  });

  return { user, sessionToken };
}

/** Profil complet, pour attaquer directement la recommandation. */
export async function completeProfile(userId: string, overrides: Record<string, unknown> = {}) {
  const profile = await db.profile.upsert({
    where: { userId },
    update: {},
    create: { userId },
  });

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
