import Link from 'next/link';
import { Logo } from '@/components/brand/logo';
import { Button } from '@/components/ui/button';

/**
 * Section 2.2 : aucun menu de navigation sur mobile. Un logo, un bouton.
 *
 * Ce bouton est « Se connecter » : quelqu'un qui revient doit pouvoir
 * rejoindre son compte depuis n'importe quel écran, sans refaire le
 * diagnostic. Les écrans de connexion et d'inscription le masquent, sinon il
 * pointerait sur lui-même.
 */
export function TopBar({
  action = 'Se connecter',
  href = '/connexion',
  sansAction,
}: {
  action?: string;
  href?: string;
  sansAction?: boolean;
}) {
  return (
    <header
      className="sticky top-0 z-40 border-b border-gris-700/60 bg-nuit-900/85 backdrop-blur"
      style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}
    >
      <div className="mx-auto flex h-[72px] max-w-5xl items-center justify-between gap-3 px-4">
        <Link href="/" aria-label="Nexteo, accueil">
          <Logo />
        </Link>
        {sansAction ? null : (
          <Button asChild taille="md">
            <Link href={href}>{action}</Link>
          </Button>
        )}
      </div>
    </header>
  );
}
