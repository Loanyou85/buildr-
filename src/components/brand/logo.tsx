import { cn } from '@/lib/utils';

/**
 * Marque Nexteo — « les marches ».
 *
 * Trois blocs qui montent en diagonale, jamais alignés sur une ligne de base
 * commune : c'est un escalier, pas un graphique. Ils grandissent, et le dernier
 * — le prochain — porte l'orange signal.
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
      <rect x="2" y="22" width="8" height="8" rx="2.5" fill="currentColor" />
      <rect x="11.5" y="12" width="9" height="9" rx="2.8" fill="currentColor" />
      <rect x="20" y="2" width="10" height="10" rx="3.1" fill={top} />
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
