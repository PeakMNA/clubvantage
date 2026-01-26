'use client';

import { useState, useEffect, useCallback } from 'react';
import { cn } from '@clubvantage/ui';
import { HelpCircle, X, ChevronDown, Sparkles } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@clubvantage/ui/primitives/popover';
import type { BookingStatus } from '../types';
import { bookingStatusConfig, getBookingStatusStyles } from '../booking-status-utils';

export interface StatusLegendProps {
  /** Which statuses to show in the legend */
  statuses?: BookingStatus[];
  /** Display mode */
  variant?: 'inline' | 'popover' | 'compact';
  /** Show help icon trigger for popover mode */
  showTrigger?: boolean;
  /** Additional class names */
  className?: string;
}

const defaultStatuses: BookingStatus[] = [
  'confirmed',
  'checked_in',
  'in_progress',
  'completed',
  'no_show',
  'cancelled',
  'maintenance',
];

/**
 * StatusLegend
 *
 * A color key showing what each booking status color means.
 * Can be displayed inline, as a popover, or in compact mode.
 */
export function StatusLegend({
  statuses = defaultStatuses,
  variant = 'inline',
  showTrigger = true,
  className,
}: StatusLegendProps) {
  if (variant === 'popover') {
    return (
      <StatusLegendPopover
        statuses={statuses}
        showTrigger={showTrigger}
        className={className}
      />
    );
  }

  if (variant === 'compact') {
    return (
      <StatusLegendCompact statuses={statuses} className={className} />
    );
  }

  return <StatusLegendInline statuses={statuses} className={className} />;
}

/**
 * StatusLegendInline
 *
 * Horizontal inline display of status colors.
 */
function StatusLegendInline({
  statuses,
  className,
}: {
  statuses: BookingStatus[];
  className?: string;
}) {
  return (
    <div
      className={cn(
        'flex flex-wrap items-center gap-x-4 gap-y-2',
        className
      )}
      role="list"
      aria-label="Booking status legend"
    >
      {statuses.map((status) => {
        const styles = getBookingStatusStyles(status);
        const config = styles.config;

        return (
          <div
            key={status}
            className="flex items-center gap-1.5"
            role="listitem"
          >
            <span
              className={cn(
                'h-2.5 w-2.5 rounded-full',
                config.dotColor,
                config.pulse && 'animate-pulse'
              )}
              aria-hidden="true"
            />
            <span className="text-xs text-muted-foreground">
              {config.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

/**
 * StatusLegendCompact
 *
 * Very compact display - just colored dots.
 */
function StatusLegendCompact({
  statuses,
  className,
}: {
  statuses: BookingStatus[];
  className?: string;
}) {
  return (
    <div
      className={cn('flex items-center gap-1', className)}
      role="list"
      aria-label="Booking status legend"
    >
      {statuses.map((status) => {
        const styles = getBookingStatusStyles(status);
        const config = styles.config;

        return (
          <span
            key={status}
            className={cn(
              'h-2 w-2 rounded-full',
              config.dotColor
            )}
            title={config.label}
            aria-label={config.label}
          />
        );
      })}
    </div>
  );
}

/**
 * StatusLegendPopover
 *
 * Legend displayed in a popover, triggered by a help icon.
 */
function StatusLegendPopover({
  statuses,
  showTrigger,
  className,
}: {
  statuses: BookingStatus[];
  showTrigger?: boolean;
  className?: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      {showTrigger && (
        <PopoverTrigger asChild>
          <button
            type="button"
            className={cn(
              'flex items-center gap-1.5 rounded-md px-2 py-1 text-xs text-muted-foreground transition-colors',
              'hover:bg-muted hover:text-foreground',
              'focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500',
              className
            )}
            aria-label="Show booking status legend"
          >
            <HelpCircle className="h-3.5 w-3.5" />
            <span>Legend</span>
            <ChevronDown
              className={cn(
                'h-3 w-3 transition-transform',
                open && 'rotate-180'
              )}
            />
          </button>
        </PopoverTrigger>
      )}
      <PopoverContent
        align="end"
        className="w-64 p-0"
        sideOffset={8}
      >
        <div className="border-b border-border px-3 py-2">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium">Status Legend</h4>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded p-0.5 text-muted-foreground hover:bg-muted hover:text-foreground"
              aria-label="Close legend"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
        <div className="p-2">
          <div className="grid gap-1">
            {statuses.map((status) => {
              const styles = getBookingStatusStyles(status);
              const config = styles.config;

              return (
                <div
                  key={status}
                  className="flex items-center gap-2 rounded px-2 py-1.5 hover:bg-muted/50"
                >
                  <div
                    className={cn(
                      'flex h-6 w-6 items-center justify-center rounded',
                      config.bgColor,
                      config.borderColor && `border ${config.borderColor}`
                    )}
                  >
                    <span
                      className={cn(
                        'h-2 w-2 rounded-full',
                        config.dotColor,
                        config.pulse && 'animate-pulse'
                      )}
                    />
                  </div>
                  <div className="flex-1">
                    <span
                      className={cn(
                        'text-sm font-medium',
                        config.strikethrough && 'line-through'
                      )}
                    >
                      {config.label}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Buffer/Maintenance explanation */}
        <div className="border-t border-border px-3 py-2">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <div
              className="h-4 w-8 rounded border border-stone-300"
              style={{
                backgroundImage: `repeating-linear-gradient(
                  -45deg,
                  transparent,
                  transparent 2px,
                  hsl(var(--stone-300) / 0.4) 2px,
                  hsl(var(--stone-300) / 0.4) 4px
                )`,
              }}
            />
            <span>Striped = Buffer/Setup time</span>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

/**
 * StatusLegendCard
 *
 * A card-style legend suitable for first-time user onboarding or help sections.
 */
export function StatusLegendCard({
  statuses = defaultStatuses,
  onDismiss,
  className,
}: {
  statuses?: BookingStatus[];
  onDismiss?: () => void;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-500/30 dark:bg-amber-500/10',
        className
      )}
      role="region"
      aria-label="Booking status guide"
    >
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <HelpCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
          <h4 className="text-sm font-semibold text-amber-900 dark:text-amber-100">
            Understanding Booking Colors
          </h4>
        </div>
        {onDismiss && (
          <button
            type="button"
            onClick={onDismiss}
            className="rounded p-1 text-amber-600 hover:bg-amber-100 dark:text-amber-400 dark:hover:bg-amber-500/20"
            aria-label="Dismiss guide"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
        {statuses.map((status) => {
          const styles = getBookingStatusStyles(status);
          const config = styles.config;

          return (
            <div
              key={status}
              className="flex items-center gap-2 rounded-md bg-white/60 px-2 py-1.5 dark:bg-stone-900/30"
            >
              <span
                className={cn(
                  'h-3 w-3 shrink-0 rounded-full',
                  config.dotColor,
                  config.pulse && 'animate-pulse'
                )}
              />
              <span className="text-xs font-medium text-stone-700 dark:text-stone-300">
                {config.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Storage key for first visit tracking
const LEGEND_DISMISSED_KEY = 'clubvantage_calendar_legend_dismissed';

/**
 * useFirstVisitLegend
 *
 * Hook to track whether the user has seen the status legend.
 * Uses localStorage to persist the dismissed state.
 */
export function useFirstVisitLegend(storageKey = LEGEND_DISMISSED_KEY) {
  const [isFirstVisit, setIsFirstVisit] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check localStorage on mount
    const dismissed = localStorage.getItem(storageKey);
    setIsFirstVisit(!dismissed);
    setIsLoading(false);
  }, [storageKey]);

  const dismiss = useCallback(() => {
    localStorage.setItem(storageKey, 'true');
    setIsFirstVisit(false);
  }, [storageKey]);

  const reset = useCallback(() => {
    localStorage.removeItem(storageKey);
    setIsFirstVisit(true);
  }, [storageKey]);

  return { isFirstVisit, isLoading, dismiss, reset };
}

export interface FirstVisitStatusLegendProps {
  /** Which statuses to show in the legend */
  statuses?: BookingStatus[];
  /** Custom storage key for persistence */
  storageKey?: string;
  /** Auto-dismiss after delay (in ms). Set to 0 to disable. */
  autoDismissDelay?: number;
  /** Callback when legend is dismissed */
  onDismiss?: () => void;
  /** Additional class names */
  className?: string;
  /** Position of the legend */
  position?: 'top' | 'bottom';
}

/**
 * FirstVisitStatusLegend
 *
 * Shows a status legend card on the user's first visit to the calendar.
 * The legend is dismissible and the dismissed state is persisted in localStorage.
 *
 * Features:
 * - Auto-detects first visit using localStorage
 * - Optional auto-dismiss after a delay
 * - Smooth enter/exit animations
 * - Remembers dismissal across sessions
 */
export function FirstVisitStatusLegend({
  statuses = defaultStatuses,
  storageKey = LEGEND_DISMISSED_KEY,
  autoDismissDelay = 0,
  onDismiss,
  className,
  position = 'top',
}: FirstVisitStatusLegendProps) {
  const { isFirstVisit, isLoading, dismiss } = useFirstVisitLegend(storageKey);
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  // Handle initial appearance with animation
  useEffect(() => {
    if (!isLoading && isFirstVisit) {
      // Small delay to trigger entrance animation
      const timer = setTimeout(() => setIsVisible(true), 100);
      return () => clearTimeout(timer);
    }
  }, [isLoading, isFirstVisit]);

  // Auto-dismiss after delay
  useEffect(() => {
    if (isVisible && autoDismissDelay > 0) {
      const timer = setTimeout(() => handleDismiss(), autoDismissDelay);
      return () => clearTimeout(timer);
    }
  }, [isVisible, autoDismissDelay]);

  const handleDismiss = useCallback(() => {
    setIsExiting(true);
    // Wait for exit animation before actually dismissing
    setTimeout(() => {
      dismiss();
      setIsVisible(false);
      setIsExiting(false);
      onDismiss?.();
    }, 300);
  }, [dismiss, onDismiss]);

  // Don't render anything if loading or not first visit
  if (isLoading || !isFirstVisit) {
    return null;
  }

  return (
    <div
      className={cn(
        'transition-all duration-300 ease-out',
        position === 'top' ? 'mb-4' : 'mt-4',
        isVisible && !isExiting
          ? 'translate-y-0 opacity-100'
          : position === 'top'
          ? '-translate-y-2 opacity-0'
          : 'translate-y-2 opacity-0',
        className
      )}
    >
      <div
        className={cn(
          'rounded-lg border border-amber-200 bg-gradient-to-r from-amber-50 to-amber-100/50 p-4',
          'dark:border-amber-500/30 dark:from-amber-500/10 dark:to-amber-500/5'
        )}
        role="region"
        aria-label="Welcome guide - Booking status colors"
      >
        {/* Header */}
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-500/20">
              <Sparkles className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-amber-900 dark:text-amber-100">
                Welcome! Here's what the colors mean
              </h4>
              <p className="text-xs text-amber-700/70 dark:text-amber-300/70">
                This guide will only show once
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleDismiss}
            className="rounded-lg p-1.5 text-amber-600 transition-colors hover:bg-amber-200/50 dark:text-amber-400 dark:hover:bg-amber-500/20"
            aria-label="Dismiss guide"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Status grid */}
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
          {statuses.map((status) => {
            const styles = getBookingStatusStyles(status);
            const config = styles.config;

            return (
              <div
                key={status}
                className="flex items-center gap-2 rounded-md bg-white/60 px-2.5 py-2 dark:bg-stone-900/30"
              >
                <span
                  className={cn(
                    'h-3 w-3 shrink-0 rounded-full',
                    config.dotColor,
                    config.pulse && 'animate-pulse'
                  )}
                />
                <span className="text-xs font-medium text-stone-700 dark:text-stone-300">
                  {config.label}
                </span>
              </div>
            );
          })}
        </div>

        {/* Buffer explanation */}
        <div className="mt-3 flex items-center gap-2 border-t border-amber-200/50 pt-3 text-xs text-amber-700/80 dark:border-amber-500/20 dark:text-amber-300/70">
          <div
            className="h-4 w-8 rounded border border-stone-300/50"
            style={{
              backgroundImage: `repeating-linear-gradient(
                -45deg,
                transparent,
                transparent 2px,
                hsl(var(--stone-300) / 0.4) 2px,
                hsl(var(--stone-300) / 0.4) 4px
              )`,
            }}
          />
          <span>Striped blocks indicate setup or buffer time</span>
        </div>

        {/* Got it button */}
        <div className="mt-3 flex justify-end">
          <button
            type="button"
            onClick={handleDismiss}
            className={cn(
              'rounded-lg px-4 py-1.5 text-sm font-medium transition-colors',
              'bg-amber-500 text-white hover:bg-amber-600',
              'focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2'
            )}
          >
            Got it!
          </button>
        </div>
      </div>
    </div>
  );
}
