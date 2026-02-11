'use client';

import { useMemo, useState } from 'react';
import { cn } from '@clubvantage/ui';
import { Sparkles, Dumbbell, Waves, Heart, Music, Palette } from 'lucide-react';
import { BookingSearchBar } from './booking-search-bar';

// ============================================================================
// TYPES
// ============================================================================

export interface ServiceCard {
  id: string;
  name: string;
  category: string;
  durationMinutes: number;
  basePrice: number;
  isActive: boolean;
  description?: string | null;
  enforceQualification?: boolean;
  requiredCapabilities?: string[];
}

export interface ServicePosPanelProps {
  services: ServiceCard[];
  isLoading?: boolean;
  selectedServiceId?: string | null;
  onServiceSelect: (service: ServiceCard) => void;
  className?: string;
}

// ============================================================================
// HELPERS
// ============================================================================

const categoryIcons: Record<string, typeof Sparkles> = {
  Spa: Sparkles,
  Massage: Sparkles,
  Fitness: Dumbbell,
  Tennis: Dumbbell,
  Swimming: Waves,
  Pool: Waves,
  Wellness: Heart,
  Music: Music,
  Art: Palette,
};

function getCategoryIcon(category: string): typeof Sparkles {
  return categoryIcons[category] || Sparkles;
}

const categoryColors: Record<string, string> = {
  Spa: 'bg-purple-100 text-purple-600 dark:bg-purple-500/20 dark:text-purple-400',
  Massage: 'bg-purple-100 text-purple-600 dark:bg-purple-500/20 dark:text-purple-400',
  Fitness: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400',
  Tennis: 'bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400',
  Swimming: 'bg-cyan-100 text-cyan-600 dark:bg-cyan-500/20 dark:text-cyan-400',
  Pool: 'bg-cyan-100 text-cyan-600 dark:bg-cyan-500/20 dark:text-cyan-400',
  Wellness: 'bg-rose-100 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400',
};

function getCategoryColor(category: string): string {
  return categoryColors[category] || 'bg-amber-100 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400';
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('th-TH', {
    style: 'currency',
    currency: 'THB',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

// ============================================================================
// COMPONENT
// ============================================================================

export function ServicePosPanel({
  services,
  isLoading,
  selectedServiceId,
  onServiceSelect,
  className,
}: ServicePosPanelProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  // Derive unique categories
  const categories = useMemo(() => {
    const cats = new Set(services.map((s) => s.category));
    return Array.from(cats).sort();
  }, [services]);

  // Filter services
  const filteredServices = useMemo(() => {
    let list = services.filter((s) => s.isActive);

    if (activeCategory) {
      list = list.filter((s) => s.category === activeCategory);
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.category.toLowerCase().includes(q)
      );
    }

    return list;
  }, [services, activeCategory, searchQuery]);

  if (isLoading) {
    return <ServicePosPanelSkeleton className={className} />;
  }

  return (
    <div className={cn('flex flex-col gap-3', className)}>
      {/* Search Bar */}
      <BookingSearchBar
        placeholder="Search services..."
        value={searchQuery}
        onChange={setSearchQuery}
      />

      {/* Category Filter Chips */}
      {categories.length > 1 && (
        <div className="flex gap-1.5 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveCategory(null)}
            className={cn(
              'whitespace-nowrap rounded-full px-3 py-1 text-xs font-medium transition-colors',
              !activeCategory
                ? 'bg-amber-500 text-white'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200 dark:bg-stone-800 dark:text-stone-400'
            )}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setActiveCategory(cat === activeCategory ? null : cat)}
              className={cn(
                'whitespace-nowrap rounded-full px-3 py-1 text-xs font-medium transition-colors',
                cat === activeCategory
                  ? 'bg-amber-500 text-white'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200 dark:bg-stone-800 dark:text-stone-400'
              )}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {/* Service Grid */}
      {filteredServices.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <p className="text-sm text-muted-foreground">
            {searchQuery ? 'No services match your search.' : 'No services available.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {filteredServices.map((service) => {
            const Icon = getCategoryIcon(service.category);
            const colorClass = getCategoryColor(service.category);
            const isSelected = service.id === selectedServiceId;

            return (
              <button
                key={service.id}
                type="button"
                onClick={() => onServiceSelect(service)}
                className={cn(
                  'group flex flex-col items-center gap-2 rounded-xl border p-4 text-center transition-all',
                  'hover:border-amber-300 hover:shadow-md dark:hover:border-amber-500/50',
                  'focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/40',
                  isSelected
                    ? 'border-amber-400 bg-amber-50 shadow-md dark:border-amber-500/50 dark:bg-amber-500/10'
                    : 'border-border bg-card'
                )}
              >
                <div className={cn('flex h-10 w-10 items-center justify-center rounded-lg', colorClass)}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-foreground">{service.name}</p>
                  <p className="text-xs text-muted-foreground">{service.durationMinutes} min</p>
                </div>
                <p className="text-sm font-semibold text-amber-600 dark:text-amber-400">
                  {formatCurrency(service.basePrice)}
                </p>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// SKELETON
// ============================================================================

function ServicePosPanelSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('flex flex-col gap-3', className)}>
      <div className="h-10 animate-pulse rounded-lg bg-muted" />
      <div className="flex gap-1.5">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-6 w-16 animate-pulse rounded-full bg-muted" />
        ))}
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="flex h-32 animate-pulse flex-col items-center justify-center gap-2 rounded-xl border border-border bg-muted/30"
          >
            <div className="h-10 w-10 rounded-lg bg-muted" />
            <div className="h-3 w-16 rounded bg-muted" />
            <div className="h-2.5 w-12 rounded bg-muted" />
          </div>
        ))}
      </div>
    </div>
  );
}

export { ServicePosPanelSkeleton };
