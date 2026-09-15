import Link from 'next/link';
import { TopBar } from '@/components/shell/top-bar';
import { ConnexionForm } from '@/components/auth/auth-form';
import { connecter } from '@/server/actions/auth';

export const dynamic = 'force-dynamic';

export const metadata = { title: 'Me connecter — Nexteo' };

export default async function ConnexionPage({
  searchParams,
}: {
  searchParams: Promise<{ suite?: string }>;
}) {
  const { suite } = await searchParams;
  return (
    <>
      <TopBar />
      <main className="mx-auto max-w-md px-4 py-8">
        <h1 className="text-xl font-extrabold text-white">Content de te revoir.</h1>
        <div className="mt-8">
          <ConnexionForm action={connecter} suite={suite} />
        </div>
        <p className="mt-6 text-center text-sm text-gris-300">
          Pas encore de compte ?{' '}
          <Link href="/diagnostic" className="text-neo-100 underline underline-offset-4">
            Trouve ton idée d’abord
          </Link>
        </p>
      </main>
    </>
  );
}
