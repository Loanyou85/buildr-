import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

/*
 * Le variant `signal` matérialise la prochaine action. Il n'apparaît
 * qu'une seule fois par écran d'application (section 4.1).
 */
const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl font-medium transition-[background-color,border-color,color,box-shadow,transform] duration-150 disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-4 [&_svg]:shrink-0 active:scale-[0.99]',
  {
    variants: {
      variant: {
        signal: 'bg-signal text-white shadow-[0_1px_2px_rgba(16,24,40,0.08)] hover:bg-[#f06f12]',
        primary: 'bg-encre text-white hover:bg-[#1d2939]',
        acier: 'bg-acier text-white hover:bg-[#2f6bea]',
        outline: 'border border-beton-300 bg-blanc text-encre hover:border-acier hover:text-acier',
        ghost: 'text-beton-600 hover:bg-beton-100 hover:text-encre',
        link: 'text-acier underline-offset-4 hover:underline',
      },
      size: {
        sm: 'h-10 px-3.5 text-sm',
        md: 'h-11 px-5 text-sm',
        lg: 'h-13 px-7 text-base',
        icon: 'size-10',
      },
    },
    defaultVariants: { variant: 'primary', size: 'md' },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export function Button({ className, variant, size, asChild = false, ...props }: ButtonProps) {
  const Comp = asChild ? Slot : 'button';
  return <Comp className={cn(buttonVariants({ variant, size }), className)} {...props} />;
}

export { buttonVariants };
