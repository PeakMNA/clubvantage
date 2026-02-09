'use client';

import { cn } from '@clubvantage/ui';
import type { MemberStatus } from './types';

export type QuickFilterOption = 'ALL' | MemberStatus;

interface QuickFilterChipsProps {
  value: QuickFilterOption;
  onChange: (value: QuickFilterOption) => void;
  className?: string;
}

const filterOptions: { value: QuickFilterOption; label: string }[] = [
  { value: 'ALL', label: 'All Members' },
  { value: 'ACTIVE', label: 'Active' },
  { value: 'APPLICANT', label: 'Applicant' },
  { value: 'SUSPENDED', label: 'Suspended' },
  { value: 'LAPSED', label: 'Lapsed' },
];

export function QuickFilterChips({
  value,
  onChange,
  className,
}: QuickFilterChipsProps) {
  return (
    <div
      className={cn(
        'flex items-center gap-2 overflow-x-auto scrollbar-hide',
        className
      )}
    >
      {filterOptions.map((option) => {
        const isSelected = value === option.value;
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={cn(
              'inline-flex h-8 shrink-0 items-center justify-center rounded-full px-4 text-sm font-medium transition-colors',
              isSelected
                ? 'bg-amber-500 text-white'
                : 'border border-border bg-card text-foreground hover:bg-muted'
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
