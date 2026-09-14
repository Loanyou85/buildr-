import * as React from 'react';
import { cn } from '@/lib/utils';

/** État vide honnête : on n'invente jamais de contenu pour remplir (garde-fou n° 1). */
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
    <div
      className={cn(
        'flex flex-col items-center gap-3 rounded-card border border-dashed border-beton-300 px-6 py-12 text-center',
        className,
      )}
    >
      <p className="text-lg text-encre">{title}</p>
      <p className="prose-buildr text-sm text-beton-600">{description}</p>
      {action}
    </div>
  );
}
