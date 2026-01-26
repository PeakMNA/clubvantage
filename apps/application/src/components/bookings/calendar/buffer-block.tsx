'use client';

import { cn } from '@clubvantage/ui';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@clubvantage/ui/primitives/tooltip';

export interface BufferBlockProps {
  /** Duration of the buffer in minutes */
  durationMinutes: number;
  /** Custom tooltip text */
  tooltipText?: string;
  /** Type of buffer - affects visual styling */
  bufferType?: 'setup' | 'cleanup' | 'transition';
  /** Height per 15-minute slot in pixels */
  slotHeight?: number;
  /** Additional class names */
  className?: string;
}

/**
 * BufferBlock
 *
 * A non-interactive block indicating buffer/setup/cleanup time between bookings.
 * Uses diagonal stripe pattern to clearly distinguish from bookable slots.
 *
 * Visual characteristics:
 * - Diagonal stripes (Stone-300 on Stone-200)
 * - Non-interactive: no hover effects, default cursor
 * - Tooltip on hover explains what the buffer is for
 */
export function BufferBlock({
  durationMinutes,
  tooltipText,
  bufferType = 'transition',
  slotHeight = 44,
  className,
}: BufferBlockProps) {
  const slotCount = Math.ceil(durationMinutes / 15);
  const minHeight = slotCount * slotHeight;

  const defaultTooltips: Record<string, string> = {
    setup: 'Setup time — preparing for next session',
    cleanup: 'Cleanup time — resetting for next booking',
    transition: 'Buffer time — setup and cleanup period',
  };

  const tooltip = tooltipText || defaultTooltips[bufferType];

  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            role="presentation"
            aria-label={tooltip}
            style={{ minHeight: `${minHeight}px` }}
            className={cn(
              // Base styles
              'relative w-full rounded-md border select-none',
              // Non-interactive styling
              'cursor-default pointer-events-auto',
              // Colors and pattern
              'border-stone-300 dark:border-stone-600',
              'bg-stone-100 dark:bg-stone-800/50',
              className
            )}
          >
            {/* Diagonal stripes overlay using CSS pattern */}
            <div
              className="absolute inset-0 rounded-[inherit] opacity-60"
              style={{
                backgroundImage: `repeating-linear-gradient(
                  -45deg,
                  transparent,
                  transparent 4px,
                  hsl(var(--stone-300, 214 32% 78%) / 0.5) 4px,
                  hsl(var(--stone-300, 214 32% 78%) / 0.5) 8px
                )`,
              }}
              aria-hidden="true"
            />

            {/* Buffer type indicator (subtle) */}
            {durationMinutes >= 30 && (
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-[10px] font-medium uppercase tracking-wider text-stone-400 dark:text-stone-500">
                  {bufferType}
                </span>
              </div>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent
          side="top"
          className="bg-stone-900 text-stone-100 dark:bg-stone-100 dark:text-stone-900"
        >
          <p className="text-xs">{tooltip}</p>
          <p className="mt-0.5 text-[10px] text-stone-400 dark:text-stone-500">
            {durationMinutes} minutes
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

/**
 * BufferBlockCompact
 *
 * A minimal buffer indicator for tight spaces.
 * Shows only the striped pattern without text.
 */
export function BufferBlockCompact({
  className,
}: {
  className?: string;
}) {
  return (
    <div
      role="presentation"
      aria-label="Buffer time"
      className={cn(
        'h-1.5 w-full rounded-sm',
        'bg-stone-200 dark:bg-stone-700',
        'buffer-stripes-compact',
        className
      )}
      style={{
        backgroundImage: `repeating-linear-gradient(
          -45deg,
          transparent,
          transparent 2px,
          hsl(var(--stone-400, 214 32% 60%) / 0.3) 2px,
          hsl(var(--stone-400, 214 32% 60%) / 0.3) 4px
        )`,
      }}
    />
  );
}
