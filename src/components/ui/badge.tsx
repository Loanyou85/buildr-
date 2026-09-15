import { cn } from '@/lib/utils';

/** Section 4.3 : rayon 999 px. */
export function Badge({
  className,
  ton = 'neutre',
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & { ton?: 'neutre' | 'neo' | 'revenu' }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs',
        ton === 'neo' && 'border-neo-500/30 bg-neo-500/10 text-neo-100',
        // Le vert ne sort qu'ici, et seulement autour d'un montant.
        ton === 'revenu' && 'border-[#16C784]/30 bg-[#16C784]/10 text-[#16C784] tabular',
        ton === 'neutre' && 'border-gris-700 bg-nuit-800 text-gris-300',
        className,
      )}
      {...props}
    />
  );
}
