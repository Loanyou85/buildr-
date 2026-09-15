import { cn } from '@/lib/utils';

/** Section 4.3 : rayon 16 px, bordure 1 px, aucune ombre portée. */
export function Card({ className, actif, ...props }: React.HTMLAttributes<HTMLDivElement> & { actif?: boolean }) {
  return (
    <div
      className={cn(
        'rounded-[--radius-card] border bg-nuit-800 p-4',
        actif ? 'border-neo-500/30' : 'border-gris-700',
        className,
      )}
      {...props}
    />
  );
}

export function CardTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h3 className={cn('text-base font-bold text-white', className)} {...props} />;
}

export function CardText({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn('text-sm text-gris-300', className)} {...props} />;
}
