import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '../lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        // Primary: Amber gradient with white text for contrast
        default:
          'bg-gradient-to-br from-amber-500 to-amber-600 text-white shadow-lg shadow-amber-500/25 hover:shadow-xl hover:shadow-amber-500/35 hover:from-amber-400 hover:to-amber-500',
        // Destructive: Red with white text
        destructive:
          'bg-gradient-to-br from-red-500 to-red-600 text-white shadow-lg shadow-red-500/20 hover:shadow-xl hover:shadow-red-500/30 hover:from-red-400 hover:to-red-500',
        // Outline: Border with dark mode support
        outline:
          'border border-border bg-background text-foreground hover:bg-muted hover:border-border/80',
        // Secondary: Emerald with white text
        secondary:
          'bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-500/20 hover:shadow-xl hover:shadow-emerald-500/30 hover:from-emerald-400 hover:to-emerald-500',
        // Ghost: Subtle hover with dark mode support
        ghost:
          'text-muted-foreground hover:bg-muted hover:text-foreground',
        // Link: Primary underline with dark mode support
        link:
          'text-primary underline-offset-4 hover:underline hover:text-primary/80',
        // Success: Emerald with white text
        success:
          'bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-500/20 hover:shadow-xl hover:shadow-emerald-500/30',
        // Warning: Amber with white text
        warning:
          'bg-gradient-to-br from-amber-500 to-amber-600 text-white shadow-lg shadow-amber-500/25 hover:shadow-xl hover:shadow-amber-500/35',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 rounded-lg px-3 text-xs',
        lg: 'h-11 rounded-xl px-8',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
