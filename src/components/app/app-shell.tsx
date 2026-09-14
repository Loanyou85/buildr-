import Link from 'next/link';
import { cn } from '@/lib/utils';

/**
 * Coquille de l'application : sobre, claire, sans décoration (section 4.4).
 * Trois destinations, pas trente. La navigation est instantanée : aucune
 * transition de page (section 5.2).
 */
const LINKS = [
  { href: '/app', label: 'Aujourd’hui' },
  { href: '/app/chemin', label: 'Le chemin' },
  { href: '/app/jalons', label: 'Jalons' },
] as const;

export function AppShell({
  children,
  active,
  aside,
}: {
  children: React.ReactNode;
  active: string;
  aside?: React.ReactNode;
}) {
  return (
    <div className="min-h-dvh">
      <header className="sticky top-0 z-30 border-b border-beton-300 bg-blanc/90 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-4xl items-center justify-between gap-4 px-5">
          <Link href="/app" className="font-display text-base font-bold tracking-[-0.02em] text-encre">
            NEXTEO
          </Link>
          <nav className="flex items-center gap-1">
            {LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'rounded-lg px-3 py-1.5 text-sm transition-colors',
                  active === link.href
                    ? 'bg-acier-50 text-acier'
                    : 'text-beton-600 hover:bg-beton-100 hover:text-encre',
                )}
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/app/compte"
              className="rounded-lg px-3 py-1.5 text-sm text-beton-600 transition-colors hover:bg-beton-100 hover:text-encre"
            >
              Compte
            </Link>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-4xl px-5 py-10 pb-28">{children}</main>
      {aside}
    </div>
  );
}
