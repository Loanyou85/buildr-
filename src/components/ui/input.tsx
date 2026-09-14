import * as React from 'react';
import { cn } from '@/lib/utils';

export function Input({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        'h-11 w-full rounded-xl border border-beton-300 bg-blanc px-3.5 text-base text-encre transition-colors placeholder:text-beton-600/70 focus:border-acier focus:outline-none',
        className,
      )}
      {...props}
    />
  );
}

export function Textarea({ className, ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        'w-full rounded-xl border border-beton-300 bg-blanc p-3.5 text-base text-encre transition-colors placeholder:text-beton-600/70 focus:border-acier focus:outline-none',
        className,
      )}
      {...props}
    />
  );
}
