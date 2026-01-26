import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Platform Manager Button Component
 *
 * Blue-based color scheme for admin interface:
 * - Primary: Blue 600 with hover to Blue 700
 * - Secondary: White with slate border
 * - Destructive: Red 600
 * - Ghost: Transparent with slate hover
 * - Link: Blue text with underline
 */
const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        // Primary: Solid Blue
        default:
          'bg-blue-600 text-white shadow-sm hover:bg-blue-700 active:bg-blue-800',

        // Secondary: White with border
        secondary:
          'bg-white text-slate-700 border border-slate-300 shadow-sm hover:bg-slate-50 hover:border-slate-400 active:bg-slate-100',

        // Destructive: Red
        destructive:
          'bg-red-600 text-white shadow-sm hover:bg-red-700 active:bg-red-800',

        // Ghost: Transparent
        ghost:
          'text-slate-700 hover:bg-slate-100 hover:text-slate-900 active:bg-slate-200',

        // Link: Text only
        link:
          'text-blue-600 underline-offset-4 hover:underline hover:text-blue-700',

        // Outline: Border without fill
        outline:
          'border border-slate-300 bg-transparent text-slate-700 hover:bg-slate-50 hover:border-slate-400',

        // Success: Emerald
        success:
          'bg-emerald-600 text-white shadow-sm hover:bg-emerald-700 active:bg-emerald-800',

        // Warning: Amber
        warning:
          'bg-amber-500 text-white shadow-sm hover:bg-amber-600 active:bg-amber-700',
      },
      size: {
        sm: 'h-8 px-3 py-1.5 text-xs rounded',
        default: 'h-10 px-4 py-2.5 rounded',
        lg: 'h-12 px-6 py-3 text-base rounded-md',
        icon: 'h-10 w-10 rounded',
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
  loading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, loading = false, children, disabled, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';

    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? (
          <>
            <Loader2 className="animate-spin" />
            <span className="sr-only">Loading</span>
          </>
        ) : (
          children
        )}
      </Comp>
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
