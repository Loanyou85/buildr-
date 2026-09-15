'use server';

import { redirect } from 'next/navigation';
import { AuthError } from 'next-auth';
import { Role } from '@prisma/client';
import { db } from '@/server/db';
import { isAdminEmail, signIn } from '@/server/auth';
import { hashPassword } from '@/lib/auth/password';
import { loginSchema, registerSchema } from '@/lib/validation/auth';

/**
 * Inscription : prénom, e-mail, mot de passe. Aucune confirmation par e-mail,
 * l'utilisateur entre dans le produit immédiatement.
 */
export async function register(formData: FormData): Promise<void> {
  const parsed = registerSchema.safeParse({
    firstName: String(formData.get('firstName') ?? ''),
    email: String(formData.get('email') ?? ''),
    password: String(formData.get('password') ?? ''),
  });

  if (!parsed.success) {
    const first = parsed.error.issues[0]?.message ?? 'Vérifie les informations saisies.';
    redirect(`/inscription?erreur=${encodeURIComponent(first)}`);
  }

  const { firstName, email, password } = parsed.data;

  const existing = await db.user.findUnique({ where: { email }, select: { id: true } });
  if (existing) {
    redirect(
      `/inscription?erreur=${encodeURIComponent('Un compte existe déjà avec cette adresse. Connecte-toi.')}`,
    );
  }

  await db.user.create({
    data: {
      email,
      name: firstName,
      passwordHash: await hashPassword(password),
      role: isAdminEmail(email) ? Role.admin : Role.user,
      // Garde-fou n° 4 : le consentement est recueilli sur le formulaire.
      consentAcceptedAt: new Date(),
      consentVersion: '2026-01',
      subscription: { create: {} },
      notificationPref: { create: {} },
    },
  });

  await signIn('credentials', { email, password, redirect: false });
  redirect('/onboarding');
}

/** Connexion : e-mail et mot de passe, rien d'autre. */
export async function login(formData: FormData): Promise<void> {
  const parsed = loginSchema.safeParse({
    email: String(formData.get('email') ?? ''),
    password: String(formData.get('password') ?? ''),
  });

  if (!parsed.success) {
    redirect(`/connexion?erreur=${encodeURIComponent('Renseigne ton adresse e-mail et ton mot de passe.')}`);
  }

  try {
    await signIn('credentials', { ...parsed.data, redirect: false });
  } catch (error) {
    if (error instanceof AuthError) {
      // Message volontairement indistinct : préciser laquelle des deux
      // informations est fausse aide surtout celui qui teste des adresses.
      redirect(
        `/connexion?erreur=${encodeURIComponent('Adresse e-mail ou mot de passe incorrect.')}`,
      );
    }
    throw error;
  }

  // L'écran du jour renvoie vers l'onboarding s'il n'est pas terminé.
  redirect('/app');
}
