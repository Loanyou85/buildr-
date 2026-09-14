import Link from 'next/link';
import { redirect } from 'next/navigation';
import { auth } from '@/server/auth';

export const dynamic = 'force-dynamic';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user?.id) redirect('/connexion');
  if (session.user.role !== 'admin') redirect('/app');

  return (
    <div className="min-h-dvh bg-beton-100">
      <header className="border-b border-beton-300 bg-blanc">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-5">
          <Link href="/admin" className="font-display text-base font-bold tracking-[-0.02em] text-encre">
            BUILDR <span className="text-beton-600">admin</span>
          </Link>
          <Link href="/app" className="text-sm text-beton-600 hover:text-encre">
            Retour à l’app
          </Link>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-5 py-10">{children}</main>
    </div>
  );
}
