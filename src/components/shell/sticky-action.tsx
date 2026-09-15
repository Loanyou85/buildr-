import { cn } from '@/lib/utils';

/**
 * Barre d'action collée en bas (section 2.2), toujours visible, qui suit le
 * scroll. Elle porte l'action principale de l'écran — une seule.
 */
export function StickyAction({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        'fixed inset-x-0 bottom-0 z-40 border-t border-gris-700/60 bg-nuit-900/95 px-4 pt-3 backdrop-blur',
        className,
      )}
      style={{ paddingBottom: 'calc(0.75rem + env(safe-area-inset-bottom, 0px))' }}
    >
      <div className="mx-auto max-w-md">{children}</div>
    </div>
  );
}
