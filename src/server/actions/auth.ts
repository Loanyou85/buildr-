'use server';

import { AuthError } from 'next-auth';
import { redirect } from 'next/navigation';
import { Role } from '@prisma/client';
import { db } from '@/server/db';
import { signIn, signOut, isAdminEmail } from '@/server/auth';
import { hashPassword } from '@/lib/auth/password';
import { registerSchema } from '@/lib/validation/auth';
import { rattacherProfil } from '@/server/diagnostic';
import { demarrerParcours } from '@/server/journey';

export interface AuthState {
  error?: string;
  champ?: 'firstName' | 'email' | 'password';
}

const CONSENT_VERSION = '2026-09';

/**
 * Inscription : prénom, e-mail, mot de passe. Pas de lien magique, pas de
 * vérification par boîte mail avant de pouvoir entrer.
 *
 * C'est aussi ici que le diagnostic anonyme est rattaché au compte
 * (section 14.7) : la personne ne doit pas avoir l'impression d'avoir répondu
 * pour rien.
 */
export async function inscrire(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const parsed = registerSchema.safeParse({
    firstName: formData.get('firstName'),
    email: formData.get('email'),
    password: formData.get('password'),
  });

  if (!parsed.success) {
    const premier = parsed.error.issues[0];
    return { error: premier?.message ?? 'Vérifie ce que tu as saisi.', champ: premier?.path[0] as AuthState['champ'] };
  }
  if (formData.get('consent') !== 'on') {
    return { error: 'Il faut accepter les conditions pour créer un compte.' };
  }

  const { firstName, email, password } = parsed.data;

  const existe = await db.user.findUnique({ where: { email }, select: { id: true } });
  if (existe) {
    return { error: 'Un compte existe déjà avec cette adresse. Connecte-toi.', champ: 'email' };
  }

  const user = await db.user.create({
    data: {
      email,
      name: firstName,
      passwordHash: await hashPassword(password),
      role: isAdminEmail(email) ? Role.admin : Role.user,
      consentAcceptedAt: new Date(),
      consentVersion: CONSENT_VERSION,
      subscription: { create: {} },
      notificationPref: { create: {} },
    },
  });

  await rattacherProfil(user.id);

  const ideaId = String(formData.get('idee') ?? '').trim();
  if (ideaId) {
    const idea = await db.idea.findFirst({ where: { id: ideaId, userId: user.id } });
    if (idea) {
      await db.idea.update({ where: { id: idea.id }, data: { status: 'selected' } });
      await demarrerParcours(user.id, idea.id);
    }
  }

  try {
    await signIn('credentials', { email, password, redirect: false });
  } catch (error) {
    if (error instanceof AuthError) return { error: 'Compte créé, mais la connexion a échoué. Connecte-toi.' };
    throw error;
  }

  redirect(ideaId ? '/offres' : '/app');
}

export async function connecter(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const email = String(formData.get('email') ?? '').trim().toLowerCase();
  const password = String(formData.get('password') ?? '');
  const suite = String(formData.get('suite') ?? '/app');

  if (!email || !password) return { error: 'Renseigne ton adresse et ton mot de passe.' };

  try {
    await signIn('credentials', { email, password, redirect: false });
  } catch (error) {
    // Un message unique : ne jamais révéler laquelle des deux informations
    // est fausse.
    if (error instanceof AuthError) return { error: 'Identifiants incorrects.' };
    throw error;
  }

  const user = await db.user.findUnique({ where: { email }, select: { id: true } });
  if (user) await rattacherProfil(user.id);

  redirect(suite.startsWith('/') ? suite : '/app');
}

export async function deconnecter(): Promise<void> {
  await signOut({ redirectTo: '/' });
}
