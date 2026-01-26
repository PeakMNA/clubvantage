import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '../lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        // Default: Amber (primary)
        default:
          'border-amber-200/60 dark:border-amber-500/30 bg-amber-50 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-500/30',
        // Secondary: Stone (neutral)
        secondary:
          'border-border bg-muted text-muted-foreground hover:bg-muted/80',
        // Destructive: Red
        destructive:
          'border-red-200/60 dark:border-red-500/30 bg-red-50 dark:bg-red-500/20 text-red-700 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-500/30',
        // Outline: Border only
        outline:
          'border-border bg-transparent text-foreground hover:bg-muted',
        // Success: Emerald
        success:
          'border-emerald-200/60 dark:border-emerald-500/30 bg-emerald-50 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-500/30',
        // Warning: Amber
        warning:
          'border-amber-200/60 dark:border-amber-500/30 bg-amber-50 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-500/30',
        // Info: Blue
        info:
          'border-blue-200/60 dark:border-blue-500/30 bg-blue-50 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-500/30',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
