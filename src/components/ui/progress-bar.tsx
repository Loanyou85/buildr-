import { cn } from '@/lib/utils';

/** Section 2.3 : la barre de progression ne recule jamais. */
export function ProgressBar({ value, className }: { value: number; className?: string }) {
  const pct = Math.max(0, Math.min(100, Math.round(value)));
  return (
    <div
      className={cn('h-1.5 w-full overflow-hidden rounded-full bg-nuit-700', className)}
      role="progressbar"
      aria-valuenow={pct}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className="h-full rounded-full bg-neo-500 transition-[width] duration-500"
        style={{ width: `${pct}%`, transitionTimingFunction: 'var(--ease-nexteo)' }}
      />
    </div>
  );
}
