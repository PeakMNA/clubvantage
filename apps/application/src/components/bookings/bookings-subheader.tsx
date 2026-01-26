'use client';

import { useState } from 'react';
import { cn, Button, Badge } from '@clubvantage/ui';
import { ChevronLeft, ChevronRight, Calendar, Filter } from 'lucide-react';

type ViewMode = 'day' | 'week';

interface BookingsSubheaderProps {
  currentDate: Date;
  onDateChange: (date: Date) => void;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  activeFilterCount?: number;
  onFilterClick?: () => void;
}

function formatDateDisplay(date: Date): string {
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function BookingsSubheader({
  currentDate,
  onDateChange,
  viewMode,
  onViewModeChange,
  activeFilterCount = 0,
  onFilterClick,
}: BookingsSubheaderProps) {
  const handlePrevious = () => {
    const newDate = new Date(currentDate);
    if (viewMode === 'day') {
      newDate.setDate(newDate.getDate() - 1);
    } else {
      newDate.setDate(newDate.getDate() - 7);
    }
    onDateChange(newDate);
  };

  const handleNext = () => {
    const newDate = new Date(currentDate);
    if (viewMode === 'day') {
      newDate.setDate(newDate.getDate() + 1);
    } else {
      newDate.setDate(newDate.getDate() + 7);
    }
    onDateChange(newDate);
  };

  const handleToday = () => {
    onDateChange(new Date());
  };

  return (
    <div className="flex h-14 shrink-0 items-center justify-between border-b border-border bg-card/50 px-4 sm:px-6">
      {/* Left: Date Navigation */}
      <div className="flex items-center gap-2">
        <div className="flex items-center rounded-lg border border-border bg-background">
          <button
            type="button"
            onClick={handlePrevious}
            className="flex h-9 w-9 items-center justify-center text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label="Previous"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={handleToday}
            className="flex h-9 items-center gap-2 border-x border-border px-3 text-sm font-medium transition-colors hover:bg-muted"
          >
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="hidden sm:inline">{formatDateDisplay(currentDate)}</span>
            <span className="sm:hidden">
              {currentDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </span>
          </button>
          <button
            type="button"
            onClick={handleNext}
            className="flex h-9 w-9 items-center justify-center text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label="Next"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Center: View Toggle */}
      <div className="flex items-center">
        <div className="inline-flex rounded-lg border border-border bg-background p-0.5">
          {(['day', 'week'] as ViewMode[]).map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => onViewModeChange(mode)}
              className={cn(
                'rounded-md px-3 py-1.5 text-sm font-medium capitalize transition-all duration-200',
                viewMode === mode
                  ? 'bg-amber-500 text-white shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {mode}
            </button>
          ))}
        </div>
      </div>

      {/* Right: Filter Button */}
      <div className="flex items-center">
        <Button
          variant="outline"
          size="sm"
          onClick={onFilterClick}
          className="relative gap-2"
        >
          <Filter className="h-4 w-4" />
          <span className="hidden sm:inline">Filters</span>
          {activeFilterCount > 0 && (
            <Badge
              className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-amber-500 px-1.5 text-xs font-medium text-white"
            >
              {activeFilterCount}
            </Badge>
          )}
        </Button>
      </div>
    </div>
  );
}
