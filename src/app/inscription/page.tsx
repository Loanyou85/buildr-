import Link from 'next/link';
import { redirect } from 'next/navigation';
import { auth, signIn } from '@/server/auth';
import { Logo } from '@/components/brand/logo';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { register } from '@/server/actions/auth';
import { MIN_PASSWORD_LENGTH } from '@/lib/validation/auth';

export const dynamic = 'force-dynamic';

/** Inscription : prénom, e-mail, mot de passe. Trois champs, une action. */
export default async function SignUpPage({
  searchParams,
}: {
  searchParams: Promise<{ erreur?: string }>;
}) {
  const session = await auth();
  if (session?.user?.id) redirect('/app');

  const { erreur } = await searchParams;
  const googleEnabled = Boolean(process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET);

  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col justify-center px-5 py-16">
      <Link href="/" className="text-encre">
        <Logo />
      </Link>

      <h1 className="mt-10 text-2xl">Commencer ton aventure</h1>
      <p className="prose-nexteo mt-3 text-base text-beton-600">
        Trois informations et tu démarres le diagnostic. Pas de lien à aller chercher dans tes e-mails.
      </p>

      {erreur ? (
        <p className="mt-6 rounded-card border border-beton-300 bg-blanc p-4 text-sm text-encre">{erreur}</p>
      ) : null}

      <form action={register} className="mt-8 space-y-3">
        <label className="block">
          <span className="text-sm font-medium text-encre">Ton prénom</span>
          <Input
            type="text"
            name="firstName"
            required
            minLength={2}
            maxLength={60}
            autoComplete="given-name"
            placeholder="Camille"
            className="mt-1.5"
          />
        </label>

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
            minLength={MIN_PASSWORD_LENGTH}
            autoComplete="new-password"
            placeholder={`${MIN_PASSWORD_LENGTH} caractères minimum`}
            className="mt-1.5"
          />
        </label>

        <Button type="submit" variant="signal" size="lg" className="w-full">
          Créer mon compte
        </Button>
      </form>

      {googleEnabled ? (
        <form
          action={async () => {
            'use server';
            await signIn('google', { redirectTo: '/onboarding' });
          }}
          className="mt-3"
        >
          <Button type="submit" variant="outline" size="lg" className="w-full">
            Continuer avec Google
          </Button>
        </form>
      ) : null}

      <p className="mt-6 text-sm text-beton-600">
        Tu as déjà un compte ?{' '}
        <Link href="/connexion" className="text-acier underline-offset-4 hover:underline">
          Se connecter
        </Link>
      </p>

      {/* Garde-fou n° 4 : consentement explicite, données sensibles annoncées. */}
      <p className="prose-nexteo mt-8 text-xs text-beton-600">
        En créant ton compte, tu acceptes que Nexteo traite les informations que tu donnes pendant le
        diagnostic — situation, niveau d’études, budget, préférences de travail — pour construire ta
        recommandation et ton parcours. Ces données sont hébergées dans l’Union européenne, conservées
        36 mois, et tu peux les exporter ou tout supprimer à tout moment depuis ton compte. Le service
        n’est pas accessible avant 16 ans.
      </p>
    </div>
  );
}
