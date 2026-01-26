'use client';

import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@clubvantage/ui';
import type { PersonType } from './types';

const personTypeBadgeVariants = cva(
  'inline-flex items-center rounded-full px-1.5 py-0.5 text-[10px] font-semibold uppercase leading-none',
  {
    variants: {
      type: {
        MEMBER: 'bg-blue-500 text-white',
        DEPENDENT: 'bg-purple-500 text-white',
        GUEST: 'bg-amber-500 text-white',
      },
    },
    defaultVariants: {
      type: 'MEMBER',
    },
  }
);

export interface PersonTypeBadgeProps
  extends Omit<VariantProps<typeof personTypeBadgeVariants>, 'type'> {
  type: PersonType;
  className?: string;
}

const typeLabels: Record<PersonType, string> = {
  MEMBER: 'Member',
  DEPENDENT: 'Dependent',
  GUEST: 'Guest',
};

export function PersonTypeBadge({ type, className }: PersonTypeBadgeProps) {
  return (
    <span className={cn(personTypeBadgeVariants({ type }), className)}>
      {typeLabels[type]}
    </span>
  );
}
