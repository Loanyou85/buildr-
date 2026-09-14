import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium',
  {
    variants: {
      variant: {
        neutral: 'bg-beton-100 text-beton-600',
        acier: 'bg-acier-50 text-acier',
        niveau: 'bg-niveau-50 text-niveau',
        /* Exemple / démonstration — garde-fou n° 1 */
        demo: 'border border-dashed border-beton-300 bg-beton-100 text-beton-600',
        outline: 'border border-beton-300 text-beton-600',
      },
    },
    defaultVariants: { variant: 'neutral' },
  },
);

export function Badge({
  className,
  variant,
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & VariantProps<typeof badgeVariants>) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}
