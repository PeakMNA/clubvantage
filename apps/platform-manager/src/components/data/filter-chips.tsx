'use client';

import * as React from 'react';
import { X, ChevronDown, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FilterOption {
  id: string;
  label: string;
  count?: number;
}

interface FilterChipsProps {
  filters: FilterOption[];
  selected: string[];
  onChange: (selected: string[]) => void;
  multiSelect?: boolean;
  showAll?: boolean;
  allLabel?: string;
  className?: string;
}

export function FilterChips({
  filters,
  selected,
  onChange,
  multiSelect = true,
  showAll = true,
  allLabel = 'All',
  className,
}: FilterChipsProps) {
  const isAllSelected = selected.length === 0;

  const handleChipClick = (filterId: string) => {
    if (multiSelect) {
      if (selected.includes(filterId)) {
        onChange(selected.filter((id) => id !== filterId));
      } else {
        onChange([...selected, filterId]);
      }
    } else {
      if (selected.includes(filterId)) {
        onChange([]);
      } else {
        onChange([filterId]);
      }
    }
  };

  const handleClear = () => {
    onChange([]);
  };

  return (
    <div
      className={cn(
        'flex items-center gap-2 overflow-x-auto scrollbar-thin pb-1',
        className
      )}
    >
      {/* All Chip */}
      {showAll && (
        <FilterChip
          label={allLabel}
          isSelected={isAllSelected}
          onClick={handleClear}
        />
      )}

      {/* Filter Chips */}
      {filters.map((filter) => {
        const isSelected = selected.includes(filter.id);
        return (
          <FilterChip
            key={filter.id}
            label={filter.label}
            count={filter.count}
            isSelected={isSelected}
            showRemove={isSelected}
            onClick={() => handleChipClick(filter.id)}
            onRemove={() => onChange(selected.filter((id) => id !== filter.id))}
          />
        );
      })}

      {/* Clear All Link */}
      {selected.length > 0 && (
        <button
          onClick={handleClear}
          className="ml-2 text-sm font-medium text-slate-500 hover:text-slate-700 whitespace-nowrap"
        >
          Clear
        </button>
      )}
    </div>
  );
}

// Individual Filter Chip
interface FilterChipProps {
  label: string;
  count?: number;
  isSelected?: boolean;
  showRemove?: boolean;
  onClick?: () => void;
  onRemove?: () => void;
}

function FilterChip({
  label,
  count,
  isSelected = false,
  showRemove = false,
  onClick,
  onRemove,
}: FilterChipProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all whitespace-nowrap',
        'border focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1',
        isSelected
          ? 'bg-blue-100 border-blue-300 text-blue-800'
          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
      )}
    >
      <span>{label}</span>
      {count !== undefined && (
        <span
          className={cn(
            'text-xs px-1.5 py-0.5 rounded-full',
            isSelected
              ? 'bg-blue-200 text-blue-800'
              : 'bg-slate-100 text-slate-500'
          )}
        >
          {count}
        </span>
      )}
      {showRemove && (
        <X
          className="h-3.5 w-3.5 ml-0.5 hover:text-blue-900"
          onClick={(e) => {
            e.stopPropagation();
            onRemove?.();
          }}
        />
      )}
    </button>
  );
}

// Dropdown Filter (for "All" with advanced options)
interface DropdownFilterProps {
  label: string;
  options: FilterOption[];
  selected: string[];
  onChange: (selected: string[]) => void;
  multiSelect?: boolean;
  className?: string;
}

export function DropdownFilter({
  label,
  options,
  selected,
  onChange,
  multiSelect = true,
  className,
}: DropdownFilterProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  // Close on outside click
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleOptionClick = (optionId: string) => {
    if (multiSelect) {
      if (selected.includes(optionId)) {
        onChange(selected.filter((id) => id !== optionId));
      } else {
        onChange([...selected, optionId]);
      }
    } else {
      onChange([optionId]);
      setIsOpen(false);
    }
  };

  const displayLabel = selected.length > 0
    ? `${label} (${selected.length})`
    : label;

  return (
    <div ref={dropdownRef} className={cn('relative', className)}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all',
          'border focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1',
          selected.length > 0
            ? 'bg-blue-50 border-blue-200 text-blue-700'
            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
        )}
      >
        <span>{displayLabel}</span>
        <ChevronDown className={cn('h-4 w-4 transition-transform', isOpen && 'rotate-180')} />
      </button>

      {isOpen && (
        <div className="absolute left-0 top-full mt-1 z-50 w-56 bg-white rounded-lg shadow-lg border border-slate-200 py-1 max-h-64 overflow-y-auto">
          {options.map((option) => {
            const isSelected = selected.includes(option.id);
            return (
              <button
                key={option.id}
                onClick={() => handleOptionClick(option.id)}
                className="flex items-center justify-between w-full px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
              >
                <div className="flex items-center gap-2">
                  {multiSelect && (
                    <div
                      className={cn(
                        'h-4 w-4 rounded border flex items-center justify-center',
                        isSelected
                          ? 'bg-blue-600 border-blue-600'
                          : 'border-slate-300'
                      )}
                    >
                      {isSelected && <Check className="h-3 w-3 text-white" />}
                    </div>
                  )}
                  <span>{option.label}</span>
                </div>
                {option.count !== undefined && (
                  <span className="text-xs text-slate-400">{option.count}</span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
