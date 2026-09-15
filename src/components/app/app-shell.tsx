import Link from 'next/link';
import { Logo } from '@/components/brand/logo';
import { cn } from '@/lib/utils';

const ONGLETS = [
  { href: '/app', label: 'Aujourd’hui' },
  { href: '/app/chemin', label: 'Le chemin' },
  { href: '/app/prompts', label: 'Prompts' },
  { href: '/app/compte', label: 'Compte' },
] as const;

export function AppShell({
  children,
  actif,
}: {
  children: React.ReactNode;
  actif: (typeof ONGLETS)[number]['href'];
}) {
  return (
    <>
      <header
        className="sticky top-0 z-40 border-b border-gris-700/60 bg-nuit-900/85 backdrop-blur"
        style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}
      >
        <div className="mx-auto flex h-14 max-w-2xl items-center px-4">
          <Link href="/app" aria-label="Nexteo">
            <Logo />
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 pb-28 pt-6">{children}</main>

      <nav
        className="fixed inset-x-0 bottom-0 z-40 border-t border-gris-700/60 bg-nuit-900/95 backdrop-blur"
        style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
        aria-label="Navigation principale"
      >
        <ul className="mx-auto flex max-w-2xl">
          {ONGLETS.map((onglet) => (
            <li key={onglet.href} className="flex-1">
              <Link
                href={onglet.href}
                aria-current={actif === onglet.href ? 'page' : undefined}
                className={cn(
                  'tactile flex h-14 items-center justify-center text-xs transition-colors',
                  actif === onglet.href ? 'text-white' : 'text-gris-300',
                )}
              >
                {onglet.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </>
  );
}
