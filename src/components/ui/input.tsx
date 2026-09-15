import { cn } from '@/lib/utils';

/**
 * 16 px de taille de texte minimum : en dessous, les navigateurs mobiles
 * zooment tout seuls quand on tape dans le champ.
 */
const base =
  'w-full rounded-champ border border-gris-700 bg-nuit-800 px-4 text-base text-white placeholder:text-gris-300/60 focus:border-neo-500/50 focus:outline-none';

export function Input({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn(base, 'min-h-[52px]', className)} {...props} />;
}

export function Textarea({ className, ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={cn(base, 'min-h-[120px] py-3 leading-relaxed', className)} {...props} />;
}

export function Field({
  label,
  hint,
  error,
  children,
}: {
  label: string;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-white">{label}</span>
      {children}
      {hint && !error ? <span className="mt-1.5 block text-xs text-gris-300">{hint}</span> : null}
      {error ? (
        <span role="alert" className="mt-1.5 block text-xs text-red-400">
          {error}
        </span>
      ) : null}
    </label>
  );
}
