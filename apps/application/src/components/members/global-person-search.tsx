'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { Search, X, Loader2 } from 'lucide-react';
import { cn } from '@clubvantage/ui';
import { Input } from '@clubvantage/ui';
import { PersonSearchResultCard } from './person-search-result-card';
import { Skeleton } from '@clubvantage/ui';
import { useDebouncedCallback } from 'use-debounce';
import type { PersonSearchResult, PersonType } from './types';

interface GlobalPersonSearchProps {
  onSearch: (query: string, filter?: PersonType | 'ALL') => Promise<PersonSearchResult[]>;
  onSelect: (person: PersonSearchResult) => void;
  placeholder?: string;
  className?: string;
}

type FilterType = PersonType | 'ALL';

const filterOptions: { value: FilterType; label: string }[] = [
  { value: 'ALL', label: 'All' },
  { value: 'MEMBER', label: 'Members' },
  { value: 'DEPENDENT', label: 'Dependents' },
  { value: 'GUEST', label: 'Guests' },
];

export function GlobalPersonSearch({
  onSearch,
  onSelect,
  placeholder = 'Search by phone, name, or member #',
  className,
}: GlobalPersonSearchProps) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<PersonSearchResult[]>([]);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const [filter, setFilter] = useState<FilterType>('ALL');
  const [isFocused, setIsFocused] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const debouncedSearch = useDebouncedCallback(
    async (searchQuery: string, searchFilter: FilterType) => {
      if (searchQuery.length < 2) {
        setResults([]);
        setIsLoading(false);
        return;
      }

      try {
        setError(null);
        const searchResults = await onSearch(searchQuery, searchFilter);
        setResults(searchResults.slice(0, 10));
      } catch (err) {
        setError('Search unavailable');
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    },
    300
  );

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setQuery(value);
      setIsOpen(true);
      setFocusedIndex(-1);

      if (value.length >= 2) {
        setIsLoading(true);
        debouncedSearch(value, filter);
      } else {
        setResults([]);
        setIsLoading(false);
      }
    },
    [debouncedSearch, filter]
  );

  const handleFilterChange = useCallback(
    (newFilter: FilterType) => {
      setFilter(newFilter);
      setFocusedIndex(-1);
      if (query.length >= 2) {
        setIsLoading(true);
        debouncedSearch(query, newFilter);
      }
    },
    [query, debouncedSearch]
  );

  const handleClear = useCallback(() => {
    setQuery('');
    setResults([]);
    setIsOpen(false);
    setFocusedIndex(-1);
    inputRef.current?.focus();
  }, []);

  const handleSelect = useCallback(
    (person: PersonSearchResult) => {
      onSelect(person);
      setQuery('');
      setResults([]);
      setIsOpen(false);
      setFocusedIndex(-1);
    },
    [onSelect]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!isOpen) return;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setFocusedIndex((prev) => Math.min(prev + 1, results.length - 1));
          break;
        case 'ArrowUp':
          e.preventDefault();
          setFocusedIndex((prev) => Math.max(prev - 1, -1));
          break;
        case 'Enter':
          e.preventDefault();
          if (focusedIndex >= 0 && results[focusedIndex]) {
            handleSelect(results[focusedIndex]);
          }
          break;
        case 'Escape':
          e.preventDefault();
          setIsOpen(false);
          setFocusedIndex(-1);
          break;
      }
    },
    [isOpen, results, focusedIndex, handleSelect]
  );

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredResults =
    filter === 'ALL'
      ? results
      : results.filter((r) => r.personType === filter);

  return (
    <div className={cn('relative', className)}>
      {/* Search Input */}
      <div className="relative">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          ) : (
            <Search className="h-4 w-4 text-muted-foreground" />
          )}
        </div>
        <Input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={handleSearchChange}
          onFocus={() => {
            setIsFocused(true);
            if (query.length >= 2) setIsOpen(true);
          }}
          onBlur={() => setIsFocused(false)}
          onKeyDown={handleKeyDown}
          className={cn(
            'h-10 pl-10 pr-10 transition-all duration-200',
            isFocused ? 'w-80 sm:w-96' : 'w-80'
          )}
        />
        {query && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-muted-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Results Dropdown */}
      {isOpen && query.length >= 2 && (
        <div
          ref={dropdownRef}
          className="absolute left-0 top-full z-50 mt-1 w-96 overflow-hidden rounded-lg border border-border bg-card shadow-md"
        >
          {/* Filter Chips */}
          <div className="flex items-center gap-1 border-b border-border p-2">
            {filterOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => handleFilterChange(option.value)}
                className={cn(
                  'rounded-md px-2.5 py-1 text-xs font-medium transition-colors',
                  filter === option.value
                    ? 'bg-amber-500 text-white'
                    : 'bg-muted text-foreground hover:bg-muted'
                )}
              >
                {option.label}
              </button>
            ))}
          </div>

          {/* Results List */}
          <div className="max-h-[400px] overflow-y-auto">
            {isLoading ? (
              // Loading skeletons
              <div className="space-y-1 p-2">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex items-center gap-3 p-3">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-24" />
                      <Skeleton className="h-3 w-40" />
                    </div>
                    <Skeleton className="h-4 w-16 rounded-full" />
                  </div>
                ))}
              </div>
            ) : error ? (
              // Error state
              <div className="p-6 text-center">
                <p className="text-sm text-muted-foreground">{error}</p>
                <button
                  type="button"
                  onClick={() => debouncedSearch(query, filter)}
                  className="mt-2 text-sm text-blue-500 hover:underline"
                >
                  Retry
                </button>
              </div>
            ) : filteredResults.length === 0 ? (
              // No results
              <div className="p-6 text-center">
                <p className="text-sm text-muted-foreground">
                  No results for "{query}"
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Try a different search term
                </p>
              </div>
            ) : (
              // Results
              <>
                {filteredResults.map((person, index) => (
                  <PersonSearchResultCard
                    key={person.id}
                    person={person}
                    isFocused={focusedIndex === index}
                    onClick={() => handleSelect(person)}
                  />
                ))}
              </>
            )}
          </div>

          {/* Footer */}
          {results.length > 10 && (
            <div className="border-t border-border p-2 text-center">
              <button
                type="button"
                className="text-sm text-blue-500 hover:underline"
              >
                View all {results.length} results
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
