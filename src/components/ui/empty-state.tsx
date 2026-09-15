import { cn } from '@/lib/utils';

/**
 * Jamais « aucune donnée ». Un état vide dit ce qu'on y mettra et porte le
 * bouton pour le faire.
 */
export function EmptyState({
  title,
  description,
  action,
  className,
}: {
  title: string;
  description: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('rounded-card border border-dashed border-gris-700 p-6 text-center', className)}>
      <p className="text-base font-bold text-white">{title}</p>
      <p className="mx-auto mt-2 max-w-sm text-sm text-gris-300">{description}</p>
      {action ? <div className="mt-4 flex justify-center">{action}</div> : null}
    </div>
  );
}
