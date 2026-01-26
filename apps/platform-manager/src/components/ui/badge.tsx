import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

/**
 * Platform Manager Badge Component
 *
 * Status indicator badges with semantic colors:
 * - default: Slate (neutral)
 * - active/success: Emerald
 * - pending/warning: Amber
 * - suspended/destructive: Red
 * - archived: Stone
 * - converted/info: Blue
 */
const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors',
  {
    variants: {
      variant: {
        // Default: Neutral slate
        default: 'border-slate-200 bg-slate-100 text-slate-700',

        // Active/Success: Emerald
        active: 'border-emerald-200 bg-emerald-50 text-emerald-700',
        success: 'border-emerald-200 bg-emerald-50 text-emerald-700',

        // Pending/Warning: Amber
        pending: 'border-amber-200 bg-amber-50 text-amber-700',
        warning: 'border-amber-200 bg-amber-50 text-amber-700',

        // Suspended/Destructive: Red
        suspended: 'border-red-200 bg-red-50 text-red-700',
        destructive: 'border-red-200 bg-red-50 text-red-700',

        // Archived: Stone
        archived: 'border-stone-200 bg-stone-100 text-stone-600',

        // Converted/Info: Blue
        converted: 'border-blue-200 bg-blue-50 text-blue-700',
        info: 'border-blue-200 bg-blue-50 text-blue-700',

        // Tier badges
        starter: 'border-slate-200 bg-slate-100 text-slate-600',
        professional: 'border-blue-200 bg-blue-50 text-blue-700',
        enterprise: 'border-purple-200 bg-purple-50 text-purple-700',

        // Feature status
        considering: 'border-stone-200 bg-stone-100 text-stone-600',
        planned: 'border-blue-200 bg-blue-50 text-blue-700',
        'in-progress': 'border-amber-200 bg-amber-50 text-amber-700',
        completed: 'border-emerald-200 bg-emerald-50 text-emerald-700',

        // Solid variants for more emphasis
        'solid-default': 'border-transparent bg-slate-500 text-white',
        'solid-active': 'border-transparent bg-emerald-500 text-white',
        'solid-pending': 'border-transparent bg-amber-500 text-white',
        'solid-suspended': 'border-transparent bg-red-500 text-white',
        'solid-info': 'border-transparent bg-blue-500 text-white',
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

// Dot indicator for status badges
function BadgeDot({ className }: { className?: string }) {
  return <span className={cn('mr-1.5 h-1.5 w-1.5 rounded-full', className)} />;
}

// Badge with dot
interface StatusBadgeProps extends BadgeProps {
  showDot?: boolean;
}

function StatusBadge({ children, variant, showDot = true, className, ...props }: StatusBadgeProps) {
  const dotColorMap: Record<string, string> = {
    active: 'bg-emerald-500',
    success: 'bg-emerald-500',
    pending: 'bg-amber-500',
    warning: 'bg-amber-500',
    suspended: 'bg-red-500',
    destructive: 'bg-red-500',
    archived: 'bg-stone-400',
    converted: 'bg-blue-500',
    info: 'bg-blue-500',
    default: 'bg-slate-400',
  };

  return (
    <Badge variant={variant} className={className} {...props}>
      {showDot && <BadgeDot className={dotColorMap[variant || 'default']} />}
      {children}
    </Badge>
  );
}

export { Badge, BadgeDot, StatusBadge, badgeVariants };
