'use client';

import { useState, useCallback } from 'react';
import { Search, X, SlidersHorizontal, Loader2 } from 'lucide-react';
import { cn } from '@clubvantage/ui';
import { Input } from '@clubvantage/ui';
import { Button } from '@clubvantage/ui';
import { Badge } from '@clubvantage/ui';
import { QuickFilterChips, type QuickFilterOption } from './quick-filter-chips';
import { useDebouncedCallback } from 'use-debounce';

interface FilterBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  quickFilter: QuickFilterOption;
  onQuickFilterChange: (filter: QuickFilterOption) => void;
  activeFiltersCount: number;
  onOpenAdvancedFilters: () => void;
  isSearching?: boolean;
  className?: string;
}

export function FilterBar({
  searchQuery,
  onSearchChange,
  quickFilter,
  onQuickFilterChange,
  activeFiltersCount,
  onOpenAdvancedFilters,
  isSearching = false,
  className,
}: FilterBarProps) {
  const [localSearch, setLocalSearch] = useState(searchQuery);
  const [isFocused, setIsFocused] = useState(false);

  const debouncedSearch = useDebouncedCallback((value: string) => {
    onSearchChange(value);
  }, 300);

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setLocalSearch(value);
      debouncedSearch(value);
    },
    [debouncedSearch]
  );

  const handleClearSearch = useCallback(() => {
    setLocalSearch('');
    onSearchChange('');
  }, [onSearchChange]);

  return (
    <div
      className={cn(
        'flex flex-col gap-4 rounded-lg border border-border bg-card p-4 sm:flex-row sm:items-center',
        className
      )}
    >
      {/* Search Input */}
      <div className="relative">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
          {isSearching ? (
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          ) : (
            <Search className="h-4 w-4 text-muted-foreground" />
          )}
        </div>
        <Input
          type="text"
          placeholder="Search members..."
          value={localSearch}
          onChange={handleSearchChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className={cn(
            'h-10 pl-10 pr-10 transition-all duration-200',
            isFocused ? 'w-80 sm:w-96' : 'w-80'
          )}
        />
        {localSearch && (
          <button
            type="button"
            onClick={handleClearSearch}
            className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Quick Filter Chips */}
      <QuickFilterChips
        value={quickFilter}
        onChange={onQuickFilterChange}
        className="flex-1"
      />

      {/* Advanced Filters Button */}
      <Button
        variant="outline"
        onClick={onOpenAdvancedFilters}
        className="shrink-0"
      >
        <SlidersHorizontal className="mr-2 h-4 w-4" />
        Filters
        {activeFiltersCount > 0 && (
          <Badge variant="secondary" className="ml-2 h-5 min-w-[20px] px-1.5">
            {activeFiltersCount}
          </Badge>
        )}
      </Button>
    </div>
  );
}
