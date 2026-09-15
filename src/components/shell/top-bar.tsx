import Link from 'next/link';
import { Logo } from '@/components/brand/logo';
import { Button } from '@/components/ui/button';

/**
 * Section 2.2 : aucun menu de navigation sur mobile. Un logo, un bouton.
 * C'est tout.
 */
export function TopBar({
  action,
  href,
  compact,
}: {
  action?: string;
  href?: string;
  compact?: boolean;
}) {
  return (
    <header
      className="sticky top-0 z-40 border-b border-gris-700/60 bg-nuit-900/85 backdrop-blur"
      style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}
    >
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4">
        <Link href="/" aria-label="Nexteo, accueil">
          <Logo />
        </Link>
        {action && href ? (
          <Button asChild taille="sm" variant={compact ? 'secondaire' : 'principal'}>
            <Link href={href}>{action}</Link>
          </Button>
        ) : null}
      </div>
    </header>
  );
}
