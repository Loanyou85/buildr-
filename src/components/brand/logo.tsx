import { cn } from '@/lib/utils';

/**
 * Marque Nexteo — « le cap ».
 *
 * Un escalier tracé d'un seul trait, qui monte, et un carré posé au sommet :
 * la marche suivante, celle qui n'est pas encore franchie. C'est elle qui porte
 * l'orange signal.
 *
 * Deux variantes, et la distinction n'est pas décorative :
 * - `accent` dans les territoires où l'orange n'a pas d'autre rôle : landing,
 *   connexion, favicon, carte de partage ;
 * - `mono` dans l'application, où l'orange signifie une seule chose, la
 *   prochaine action, et ne doit apparaître qu'une fois par écran (section 4.1).
 */
export function LogoMark({
  variant = 'accent',
  className,
}: {
  variant?: 'accent' | 'mono';
  className?: string;
}) {
  const top = variant === 'accent' ? 'var(--color-signal)' : 'currentColor';

  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn('size-6 shrink-0', className)}
      role="img"
      aria-label="Nexteo"
    >
      <path
        d="M2 30v-6.5c0-1.4 1.1-2.5 2.5-2.5H11v-6.5c0-1.4 1.1-2.5 2.5-2.5H20"
        stroke="currentColor"
        strokeWidth="6.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <rect x="21" y="2" width="9" height="9" rx="2.8" fill={top} />
    </svg>
  );
}

/** Logotype complet : la marque et le nom. Le nom reste en capitales. */
export function Logo({
  variant = 'accent',
  className,
  markClassName,
  wordClassName,
}: {
  variant?: 'accent' | 'mono';
  className?: string;
  markClassName?: string;
  wordClassName?: string;
}) {
  return (
    <span className={cn('inline-flex items-center gap-2', className)}>
      <LogoMark variant={variant} className={markClassName} />
      <span
        className={cn(
          'font-display text-base font-bold tracking-[0.02em]',
          wordClassName,
        )}
      >
        NEXTEO
      </span>
    </span>
  );
}
