import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

/**
 * Section 2.1 : un seul bouton principal par écran. La variante `principal`
 * est en `--neo-500` et ne doit apparaître qu'une fois.
 *
 * Section 2.2 : 48 px de haut minimum, partout, sans exception.
 */
const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 rounded-bouton font-semibold transition-[transform,background-color,border-color] duration-150 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neo-400',
  {
    variants: {
      variant: {
        principal: 'bg-neo-500 text-white hover:bg-neo-400',
        secondaire: 'border border-gris-700 bg-nuit-800 text-white hover:border-neo-500/30',
        fantome: 'text-gris-300 hover:text-white',
        danger: 'border border-gris-700 bg-nuit-800 text-white hover:border-red-500/40',
      },
      taille: {
        // 48 px est le plancher de zone tactile (section 2.2), jamais la
        // cible : sur un écran de téléphone tenu à une main, un bouton
        // d'action se vise sans regarder.
        sm: 'min-h-[48px] px-5 text-sm',
        md: 'min-h-[56px] px-7 text-base',
        lg: 'min-h-[64px] px-8 text-lg',
        bloc: 'min-h-[64px] w-full px-8 text-lg',
      },
    },
    defaultVariants: { variant: 'principal', taille: 'md' },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  /** React 19 : `ref` est une prop ordinaire, il suffit de la déclarer. */
  ref?: React.Ref<HTMLButtonElement>;
}

export function Button({ className, variant, taille, asChild = false, ...props }: ButtonProps) {
  const Comp = asChild ? Slot : 'button';
  return <Comp className={cn(buttonVariants({ variant, taille }), className)} {...props} />;
}

export { buttonVariants };
