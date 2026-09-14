import NextAuth, { type DefaultSession } from 'next-auth';
import { PrismaAdapter } from '@auth/prisma-adapter';
import Google from 'next-auth/providers/google';
import Resend from 'next-auth/providers/resend';
import { Role } from '@prisma/client';
import { db } from '@/server/db';

declare module 'next-auth' {
  interface Session {
    user: { id: string; role: Role } & DefaultSession['user'];
  }
}

const adminEmails = (process.env.ADMIN_EMAILS ?? '')
  .split(',')
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

const providers = [
  Resend({
    apiKey: process.env.AUTH_RESEND_KEY ?? 'dev-noop',
    from: process.env.EMAIL_FROM ?? 'Buildr <bonjour@buildr.app>',
    async sendVerificationRequest({ identifier, url, provider }) {
      // Sans clé Resend (développement, CI), le lien part dans la console :
      // le parcours reste testable de bout en bout.
      if (!process.env.AUTH_RESEND_KEY) {
        console.info(`[auth] lien de connexion pour ${identifier} : ${url}`);
        return;
      }
      const { renderMagicLinkEmail } = await import('@/emails/magic-link');
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.AUTH_RESEND_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: provider.from,
          to: identifier,
          subject: 'Ton lien pour continuer sur Buildr',
          html: await renderMagicLinkEmail(url),
        }),
      });
      if (!response.ok) throw new Error(`Resend: ${await response.text()}`);
    },
  }),
];

if (process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET) {
  providers.push(
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
      allowDangerousEmailAccountLinking: true,
    }) as (typeof providers)[number],
  );
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(db),
  session: { strategy: 'database' },
  pages: {
    signIn: '/connexion',
    verifyRequest: '/verifier-email',
    error: '/connexion',
  },
  providers,
  callbacks: {
    async session({ session, user }) {
      session.user.id = user.id;
      session.user.role = (user as { role?: Role }).role ?? Role.user;
      return session;
    },
  },
  events: {
    async createUser({ user }) {
      if (!user.id || !user.email) return;
      const isAdmin = adminEmails.includes(user.email.toLowerCase());
      await db.$transaction([
        db.user.update({
          where: { id: user.id },
          data: {
            role: isAdmin ? Role.admin : Role.user,
            // Garde-fou n° 4 : le consentement est recueilli au moment de
            // l'inscription, sur l'écran de connexion.
            consentAcceptedAt: new Date(),
            consentVersion: '2026-01',
          },
        }),
        db.subscription.create({ data: { userId: user.id } }),
        db.notificationPref.create({ data: { userId: user.id } }),
      ]);
    },
  },
});

/** Session obligatoire : lève si l'utilisateur n'est pas connecté. */
export async function requireUser() {
  const session = await auth();
  if (!session?.user?.id) throw new Error('UNAUTHENTICATED');
  return session.user;
}
