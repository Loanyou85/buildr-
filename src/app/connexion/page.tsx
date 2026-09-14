import Link from 'next/link';
import { redirect } from 'next/navigation';
import { auth, signIn } from '@/server/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export const dynamic = 'force-dynamic';

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const session = await auth();
  if (session?.user?.id) redirect('/app');

  const { error } = await searchParams;
  const googleEnabled = Boolean(process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET);

  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col justify-center px-5 py-16">
      <Link href="/" className="font-display text-base font-bold tracking-[-0.02em] text-encre">
        BUILDR
      </Link>

      <h1 className="mt-10 text-2xl">Commencer ton aventure</h1>
      <p className="prose-buildr mt-3 text-base text-beton-600">
        Un lien de connexion t’est envoyé par e-mail. Pas de mot de passe à retenir.
      </p>

      {error ? (
        <p className="mt-6 rounded-card border border-beton-300 bg-blanc p-4 text-sm text-encre">
          La connexion n’a pas abouti. Redemande un lien : il est peut-être expiré.
        </p>
      ) : null}

      <form
        action={async (formData: FormData) => {
          'use server';
          await signIn('resend', {
            email: String(formData.get('email') ?? ''),
            redirectTo: '/onboarding',
          });
        }}
        className="mt-8 space-y-3"
      >
        <Input type="email" name="email" required placeholder="ton@email.fr" autoComplete="email" />
        <Button type="submit" variant="signal" size="lg" className="w-full">
          Recevoir mon lien
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

      {/* Garde-fou n° 4 : consentement explicite, données sensibles annoncées. */}
      <p className="prose-buildr mt-8 text-xs text-beton-600">
        En continuant, tu acceptes que Buildr traite les informations que tu donnes pendant le diagnostic
        — situation, niveau d’études, budget, préférences de travail — pour construire ta recommandation
        et ton parcours. Ces données sont hébergées dans l’Union européenne, conservées 36 mois, et tu
        peux les exporter ou tout supprimer à tout moment depuis ton compte. Le service n’est pas
        accessible avant 16 ans.
      </p>
    </div>
  );
}
