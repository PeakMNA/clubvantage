'use client';

import { forwardRef } from 'react';
import { cn } from '@clubvantage/ui';
import { X, Check } from 'lucide-react';

export interface FilterChip {
  id: string;
  label: string;
  isActive: boolean;
  icon?: React.ReactNode;
  count?: number;
}

export interface FilterChipsProps {
  filters: FilterChip[];
  onToggle: (id: string) => void;
  onClearAll: () => void;
  className?: string;
}

/**
 * FilterChips
 *
 * Horizontal row of filter chips for filtering the booking calendar.
 * Users can toggle filters on/off. Shows "Clear all" when any filter is active.
 */
export function FilterChips({
  filters,
  onToggle,
  onClearAll,
  className,
}: FilterChipsProps) {
  const activeCount = filters.filter((f) => f.isActive).length;
  const hasActiveFilters = activeCount > 0;

  return (
    <div className={cn('relative flex items-center gap-2', className)}>
      {/* Filter chips container - horizontal scroll on mobile */}
      <div className="flex min-w-0 flex-1 items-center gap-2 overflow-x-auto scrollbar-hide">
        <div className="flex items-center gap-2 px-0.5 py-1">
          {filters.map((filter) => (
            <FilterChipButton
              key={filter.id}
              label={filter.label}
              isActive={filter.isActive}
              icon={filter.icon}
              count={filter.count}
              onClick={() => onToggle(filter.id)}
            />
          ))}
        </div>
      </div>

      {/* Clear all link - appears when filters are active */}
      {hasActiveFilters && (
        <button
          type="button"
          onClick={onClearAll}
          className="shrink-0 text-xs font-medium text-amber-600 transition-colors hover:text-amber-700 dark:text-amber-400 dark:hover:text-amber-300"
        >
          Clear all
        </button>
      )}

      {/* Fade edge for scroll indication on mobile */}
      <div className="pointer-events-none absolute inset-y-0 right-16 w-8 bg-gradient-to-l from-background to-transparent sm:hidden" />
    </div>
  );
}

/**
 * FilterChipButton
 *
 * Individual filter chip button with active/inactive states.
 */
interface FilterChipButtonProps {
  label: string;
  isActive: boolean;
  icon?: React.ReactNode;
  count?: number;
  onClick: () => void;
  className?: string;
}

export const FilterChipButton = forwardRef<HTMLButtonElement, FilterChipButtonProps>(
  ({ label, isActive, icon, count, onClick, className }, ref) => {
    return (
      <button
        ref={ref}
        type="button"
        onClick={onClick}
        aria-pressed={isActive}
        className={cn(
          // Base styles
          'group relative inline-flex h-8 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full px-3 text-sm font-medium transition-all duration-200',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2',
          // Active state
          isActive && [
            'bg-amber-500 text-white shadow-sm',
            'hover:bg-amber-600',
            'active:scale-[0.98]',
          ],
          // Inactive state
          !isActive && [
            'border border-transparent bg-muted text-muted-foreground',
            'hover:bg-muted/80 hover:text-foreground',
            'active:scale-[0.98]',
          ],
          className
        )}
      >
        {/* Optional icon */}
        {icon && <span className="shrink-0">{icon}</span>}

        {/* Active checkmark */}
        {isActive && !icon && (
          <Check className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
        )}

        {/* Label */}
        <span>{label}</span>

        {/* Optional count badge */}
        {count !== undefined && count > 0 && (
          <span
            className={cn(
              'ml-0.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-semibold',
              isActive
                ? 'bg-white/20 text-white'
                : 'bg-foreground/10 text-muted-foreground'
            )}
          >
            {count}
          </span>
        )}
      </button>
    );
  }
);

FilterChipButton.displayName = 'FilterChipButton';

/**
 * FilterChipGroup
 *
 * A labeled group of filter chips with a title.
 */
interface FilterChipGroupProps {
  label: string;
  children: React.ReactNode;
  className?: string;
}

export function FilterChipGroup({ label, children, className }: FilterChipGroupProps) {
  return (
    <div className={cn('space-y-2', className)}>
      <h4 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </h4>
      <div className="flex flex-wrap items-center gap-2">{children}</div>
    </div>
  );
}

/**
 * FilterSection
 *
 * A full filter section with multiple chip groups, used in filter panels.
 */
interface FilterSectionProps {
  facilityFilters: FilterChip[];
  statusFilters: FilterChip[];
  onToggle: (id: string) => void;
  onClearAll: () => void;
  className?: string;
}

export function FilterSection({
  facilityFilters,
  statusFilters,
  onToggle,
  onClearAll,
  className,
}: FilterSectionProps) {
  const allFilters = [...facilityFilters, ...statusFilters];
  const activeCount = allFilters.filter((f) => f.isActive).length;
  const hasActiveFilters = activeCount > 0;

  return (
    <div className={cn('space-y-4', className)}>
      {/* Header with clear all */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">Filters</h3>
        {hasActiveFilters && (
          <button
            type="button"
            onClick={onClearAll}
            className="flex items-center gap-1 text-xs font-medium text-amber-600 transition-colors hover:text-amber-700 dark:text-amber-400 dark:hover:text-amber-300"
          >
            <X className="h-3 w-3" />
            Clear all ({activeCount})
          </button>
        )}
      </div>

      {/* Facility Type */}
      <FilterChipGroup label="Facility Type">
        {facilityFilters.map((filter) => (
          <FilterChipButton
            key={filter.id}
            label={filter.label}
            isActive={filter.isActive}
            icon={filter.icon}
            count={filter.count}
            onClick={() => onToggle(filter.id)}
          />
        ))}
      </FilterChipGroup>

      {/* Status */}
      <FilterChipGroup label="Status">
        {statusFilters.map((filter) => (
          <FilterChipButton
            key={filter.id}
            label={filter.label}
            isActive={filter.isActive}
            icon={filter.icon}
            count={filter.count}
            onClick={() => onToggle(filter.id)}
          />
        ))}
      </FilterChipGroup>
    </div>
  );
}

/**
 * ActiveFilterBar
 *
 * Compact bar showing only active filters with remove buttons.
 */
interface ActiveFilterBarProps {
  filters: FilterChip[];
  onRemove: (id: string) => void;
  onClearAll: () => void;
  className?: string;
}

export function ActiveFilterBar({
  filters,
  onRemove,
  onClearAll,
  className,
}: ActiveFilterBarProps) {
  const activeFilters = filters.filter((f) => f.isActive);

  if (activeFilters.length === 0) {
    return null;
  }

  return (
    <div
      className={cn(
        'flex items-center gap-2 rounded-lg bg-amber-50 px-3 py-2 dark:bg-amber-500/10',
        className
      )}
    >
      <span className="shrink-0 text-xs font-medium text-amber-700 dark:text-amber-400">
        Filtered by:
      </span>

      <div className="flex min-w-0 flex-1 items-center gap-1.5 overflow-x-auto scrollbar-hide">
        {activeFilters.map((filter) => (
          <span
            key={filter.id}
            className="inline-flex shrink-0 items-center gap-1 rounded-full bg-amber-500 px-2 py-0.5 text-xs font-medium text-white"
          >
            {filter.label}
            <button
              type="button"
              onClick={() => onRemove(filter.id)}
              className="ml-0.5 rounded-full p-0.5 transition-colors hover:bg-white/20"
              aria-label={`Remove ${filter.label} filter`}
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
      </div>

      <button
        type="button"
        onClick={onClearAll}
        className="shrink-0 text-xs font-medium text-amber-700 transition-colors hover:text-amber-800 dark:text-amber-400 dark:hover:text-amber-300"
      >
        Clear
      </button>
    </div>
  );
}
