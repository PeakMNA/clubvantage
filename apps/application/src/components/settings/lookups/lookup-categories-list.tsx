'use client';

import { useState } from 'react';
import { ChevronRight, Layers, Info, Search } from 'lucide-react';
import { Button, Input, Badge, cn } from '@clubvantage/ui';
import { useLookupCategories, type LookupCategoryWithValues } from '@/hooks/use-lookups';
import { LookupValuesManager } from './lookup-values-manager';

export function LookupCategoriesList() {
  const { categories, isLoading, error, refetch } = useLookupCategories();
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Filter categories
  const filteredCategories = searchQuery
    ? categories.filter(
        (cat) =>
          cat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          cat.code.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : categories;

  const handleCategoryClick = (categoryCode: string) => {
    setExpandedCategory(expandedCategory === categoryCode ? null : categoryCode);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="h-16 animate-pulse rounded-xl bg-stone-100"
          />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl bg-red-50 p-8 text-center">
        <p className="text-red-600">Failed to load lookup categories</p>
        <Button variant="outline" size="sm" onClick={() => refetch()} className="mt-3">
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-stone-900">Lookup Values</h2>
          <p className="text-sm text-stone-500">
            Configure dropdown options used throughout the system
          </p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
          <Input
            placeholder="Search categories..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-64 pl-9"
          />
        </div>
      </div>

      {/* Info banner */}
      <div className="flex items-start gap-3 rounded-xl bg-blue-50 p-4">
        <Info className="mt-0.5 h-5 w-5 shrink-0 text-blue-600" />
        <div className="text-sm text-blue-800">
          <p className="font-medium">About Lookup Values</p>
          <p className="mt-1 text-blue-700">
            Lookup values power dropdowns and selection fields across the application.
            System categories have default values that cannot be deleted, but you can add
            custom values or create club-specific overrides.
          </p>
        </div>
      </div>

      {/* Categories list */}
      {filteredCategories.length === 0 ? (
        <div className="rounded-xl border-2 border-dashed border-stone-200 p-12 text-center">
          <p className="text-stone-500">
            {searchQuery ? 'No categories match your search' : 'No lookup categories found'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredCategories.map((category) => (
            <CategoryAccordion
              key={category.id}
              category={category}
              isExpanded={expandedCategory === category.code}
              onToggle={() => handleCategoryClick(category.code)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Category Accordion Component
// ============================================================================

interface CategoryAccordionProps {
  category: LookupCategoryWithValues;
  isExpanded: boolean;
  onToggle: () => void;
}

function CategoryAccordion({ category, isExpanded, onToggle }: CategoryAccordionProps) {
  return (
    <div className="overflow-hidden rounded-xl border bg-white shadow-sm">
      {/* Header */}
      <button
        onClick={onToggle}
        className={cn(
          'flex w-full items-center justify-between p-4 text-left transition-colors',
          'hover:bg-stone-50',
          isExpanded && 'bg-stone-50 border-b'
        )}
      >
        <div className="flex items-center gap-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100">
            <Layers className="h-5 w-5 text-amber-600" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-medium text-stone-900">{category.name}</h3>
              {category.isSystem && (
                <Badge variant="secondary" className="text-xs">
                  System
                </Badge>
              )}
            </div>
            <p className="text-sm text-stone-500">
              {category.valueCount} value{category.valueCount !== 1 ? 's' : ''} · {category.code}
            </p>
          </div>
        </div>
        <ChevronRight
          className={cn(
            'h-5 w-5 text-stone-400 transition-transform duration-200',
            isExpanded && 'rotate-90'
          )}
        />
      </button>

      {/* Expanded content */}
      {isExpanded && (
        <div className="border-t bg-stone-50/50 p-4">
          <LookupValuesManager
            categoryId={category.id}
            categoryCode={category.code}
            categoryName={category.name}
            isSystemCategory={category.isSystem}
          />
        </div>
      )}
    </div>
  );
}
