'use client';

import { forwardRef, useState } from 'react';
import { cn } from '@clubvantage/ui';
import { Plus, Lock, Clock, Users, Info, AlertCircle } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@clubvantage/ui/primitives/tooltip';

export interface SlotConstraint {
  /** Type of constraint */
  type: 'capacity' | 'buffer' | 'operating_hours' | 'maintenance' | 'custom';
  /** Human-readable label */
  label: string;
  /** Optional value (e.g., "3/4 spots") */
  value?: string;
}

export interface EmptySlotProps {
  /** Start time of the slot (ISO string or display format) */
  startTime: string;
  /** End time of the slot (ISO string or display format) */
  endTime: string;
  /** Click handler for creating a booking */
  onClick: () => void;
  /** Whether the slot is available for booking */
  isAvailable?: boolean;
  /** Reason why slot is unavailable (shown in tooltip) */
  unavailableReason?: string;
  /** Resource name for accessibility */
  resourceName?: string;
  /** Height per 15-minute slot in pixels */
  slotHeight?: number;
  /** Duration in minutes (auto-calculated if not provided) */
  durationMinutes?: number;
  /** Show the plus icon on hover */
  showPlusIcon?: boolean;
  /** Show tooltip with slot info on hover */
  showTooltip?: boolean;
  /** Constraints affecting this slot (shown in tooltip) */
  constraints?: SlotConstraint[];
  /** Available capacity for this slot (e.g., "2 of 4 spots available") */
  availableCapacity?: { current: number; max: number };
  /** Additional class names */
  className?: string;
}

/**
 * EmptySlot
 *
 * A clickable empty time slot component for the calendar grid.
 * Shows availability status and enables quick booking creation.
 *
 * States:
 * - Default: Transparent/white background
 * - Hover: Amber-50 background with plus icon
 * - Unavailable: Subtle pattern with lock icon tooltip
 * - Focus: Amber-500 ring outline
 */
export const EmptySlot = forwardRef<HTMLButtonElement, EmptySlotProps>(
  (
    {
      startTime,
      endTime,
      onClick,
      isAvailable = true,
      unavailableReason,
      resourceName,
      slotHeight = 44,
      durationMinutes,
      showPlusIcon = true,
      showTooltip = true,
      constraints,
      availableCapacity,
      className,
    },
    ref
  ) => {
    const [isHovered, setIsHovered] = useState(false);

    // Calculate slot height based on duration
    const duration = durationMinutes || 15;
    const slotCount = Math.ceil(duration / 15);
    const minHeight = slotCount * slotHeight;

    const handleClick = () => {
      if (isAvailable) {
        onClick();
      }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
      if ((e.key === 'Enter' || e.key === ' ') && isAvailable) {
        e.preventDefault();
        onClick();
      }
    };

    const ariaLabel = isAvailable
      ? `Book ${resourceName ? `${resourceName} ` : ''}at ${startTime}${endTime ? ` to ${endTime}` : ''}`
      : `Unavailable: ${unavailableReason || 'Slot is blocked'}`;

    const slotContent = (
      <button
        ref={ref}
        type="button"
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        disabled={!isAvailable}
        aria-label={ariaLabel}
        style={{ minHeight: `${minHeight}px` }}
        className={cn(
          // Base styles
          'group relative w-full transition-all duration-150',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-inset',
          // Available state
          isAvailable && [
            'bg-transparent',
            'hover:bg-amber-50/70 dark:hover:bg-amber-500/10',
            'cursor-crosshair',
          ],
          // Unavailable state
          !isAvailable && [
            'bg-stone-50/50 dark:bg-stone-800/30',
            'cursor-not-allowed',
          ],
          className
        )}
      >
        {/* Plus icon on hover (available slots only) */}
        {isAvailable && showPlusIcon && (
          <div
            className={cn(
              'absolute inset-0 flex items-center justify-center transition-opacity duration-150',
              isHovered ? 'opacity-100' : 'opacity-0'
            )}
          >
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-500/20 dark:bg-amber-500/30">
              <Plus className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
            </div>
          </div>
        )}

        {/* Lock indicator for unavailable slots */}
        {!isAvailable && (
          <div className="absolute inset-0 flex items-center justify-center opacity-30">
            <Lock className="h-3 w-3 text-stone-400" />
          </div>
        )}

        {/* Subtle border when hovered (available) */}
        {isAvailable && isHovered && (
          <div
            className="pointer-events-none absolute inset-0 border border-dashed border-amber-300 dark:border-amber-500/50"
            aria-hidden="true"
          />
        )}
      </button>
    );

    // Helper to get constraint icon
    const getConstraintIcon = (type: SlotConstraint['type']) => {
      switch (type) {
        case 'capacity':
          return <Users className="h-3 w-3 text-blue-500" />;
        case 'buffer':
          return <Clock className="h-3 w-3 text-amber-500" />;
        case 'operating_hours':
          return <Clock className="h-3 w-3 text-stone-400" />;
        case 'maintenance':
          return <AlertCircle className="h-3 w-3 text-red-500" />;
        default:
          return <Info className="h-3 w-3 text-stone-400" />;
      }
    };

    // Determine if we should show tooltip
    const shouldShowTooltip =
      showTooltip &&
      ((!isAvailable && unavailableReason) ||
        (isAvailable && (constraints?.length || availableCapacity)));

    if (shouldShowTooltip) {
      return (
        <TooltipProvider delayDuration={300}>
          <Tooltip>
            <TooltipTrigger asChild>{slotContent}</TooltipTrigger>
            <TooltipContent side="top" className="max-w-[200px]">
              {!isAvailable ? (
                // Unavailable slot tooltip
                <div className="flex items-center gap-1.5 text-xs">
                  <Lock className="h-3 w-3 shrink-0" />
                  <span>{unavailableReason}</span>
                </div>
              ) : (
                // Available slot tooltip with constraints
                <div className="space-y-1.5">
                  {/* Time range */}
                  <div className="flex items-center gap-1.5 text-xs font-medium">
                    <Clock className="h-3 w-3 text-amber-500" />
                    <span>
                      {startTime} – {endTime}
                    </span>
                  </div>

                  {/* Capacity info */}
                  {availableCapacity && (
                    <div className="flex items-center gap-1.5 text-xs text-stone-500">
                      <Users className="h-3 w-3" />
                      <span>
                        {availableCapacity.current} of {availableCapacity.max}{' '}
                        spots available
                      </span>
                    </div>
                  )}

                  {/* Constraints */}
                  {constraints && constraints.length > 0 && (
                    <div className="space-y-1 border-t border-stone-200 pt-1.5 dark:border-stone-700">
                      {constraints.map((constraint, idx) => (
                        <div
                          key={idx}
                          className="flex items-center gap-1.5 text-xs text-stone-500"
                        >
                          {getConstraintIcon(constraint.type)}
                          <span>
                            {constraint.label}
                            {constraint.value && (
                              <span className="ml-1 font-medium text-stone-700 dark:text-stone-300">
                                {constraint.value}
                              </span>
                            )}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Click hint */}
                  <div className="border-t border-stone-200 pt-1.5 text-[10px] text-stone-400 dark:border-stone-700">
                    Click to book
                  </div>
                </div>
              )}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }

    return slotContent;
  }
);

EmptySlot.displayName = 'EmptySlot';

/**
 * EmptySlotRow
 *
 * A full-width empty slot that spans multiple resources.
 * Used for indicating available time ranges in list views.
 */
export interface EmptySlotRowProps {
  startTime: string;
  endTime: string;
  onClick: () => void;
  className?: string;
}

export function EmptySlotRow({
  startTime,
  endTime,
  onClick,
  className,
}: EmptySlotRowProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'group flex w-full items-center gap-3 rounded-lg border border-dashed border-stone-200 bg-stone-50/50 px-4 py-3 transition-all',
        'hover:border-amber-300 hover:bg-amber-50/50',
        'dark:border-stone-700 dark:bg-stone-800/30',
        'dark:hover:border-amber-500/50 dark:hover:bg-amber-500/10',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500',
        className
      )}
    >
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-500/20">
        <Plus className="h-4 w-4 text-amber-600 dark:text-amber-400" />
      </div>
      <div className="text-left">
        <p className="text-sm font-medium text-stone-700 dark:text-stone-300">
          Available
        </p>
        <p className="text-xs text-stone-500">
          {startTime} – {endTime}
        </p>
      </div>
    </button>
  );
}
