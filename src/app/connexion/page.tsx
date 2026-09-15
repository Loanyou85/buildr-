import Link from 'next/link';
import { redirect } from 'next/navigation';
import { auth, signIn } from '@/server/auth';
import { Logo } from '@/components/brand/logo';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { login } from '@/server/actions/auth';

export const dynamic = 'force-dynamic';

/** Connexion : adresse e-mail et mot de passe. */
export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ erreur?: string; error?: string }>;
}) {
  const session = await auth();
  if (session?.user?.id) redirect('/app');

  const { erreur, error } = await searchParams;
  const message = erreur ?? (error ? 'La connexion n’a pas abouti. Réessaie.' : null);
  const googleEnabled = Boolean(process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET);

  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col justify-center px-5 py-16">
      <Link href="/" className="text-encre">
        <Logo />
      </Link>

      <h1 className="mt-10 text-2xl">Reprendre ton parcours</h1>
      <p className="prose-nexteo mt-3 text-base text-beton-600">
        Connecte-toi pour retrouver ton chemin là où tu l’as laissé.
      </p>

      {message ? (
        <p className="mt-6 rounded-card border border-beton-300 bg-blanc p-4 text-sm text-encre">{message}</p>
      ) : null}

      <form action={login} className="mt-8 space-y-3">
        <label className="block">
          <span className="text-sm font-medium text-encre">Ton adresse e-mail</span>
          <Input
            type="email"
            name="email"
            required
            autoComplete="email"
            placeholder="ton@email.fr"
            className="mt-1.5"
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium text-encre">Ton mot de passe</span>
          <Input
            type="password"
            name="password"
            required
            autoComplete="current-password"
            className="mt-1.5"
          />
        </label>

        <Button type="submit" variant="signal" size="lg" className="w-full">
          Se connecter
        </Button>
      </form>

      {googleEnabled ? (
        <form
          action={async () => {
            'use server';
            await signIn('google', { redirectTo: '/app' });
          }}
          className="mt-3"
        >
          <Button type="submit" variant="outline" size="lg" className="w-full">
            Continuer avec Google
          </Button>
        </form>
      ) : null}

      <p className="mt-6 text-sm text-beton-600">
        Pas encore de compte ?{' '}
        <Link href="/inscription" className="text-acier underline-offset-4 hover:underline">
          Créer mon compte
        </Link>
      </p>
    </div>
  );
}
