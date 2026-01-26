'use client';

import { useState, useCallback } from 'react';
import { cn, Button } from '@clubvantage/ui';
import { Copy, Check } from 'lucide-react';

// Types
export interface DayHours {
  dayOfWeek: string;
  isOpen: boolean;
  openTime?: string;
  closeTime?: string;
}

export interface OperatingHoursEditorProps {
  value: DayHours[];
  onChange: (hours: DayHours[]) => void;
  className?: string;
}

const DAYS = [
  { value: 'monday', label: 'Monday' },
  { value: 'tuesday', label: 'Tuesday' },
  { value: 'wednesday', label: 'Wednesday' },
  { value: 'thursday', label: 'Thursday' },
  { value: 'friday', label: 'Friday' },
  { value: 'saturday', label: 'Saturday' },
  { value: 'sunday', label: 'Sunday' },
];

// Generate time options in 15-minute increments
const TIME_OPTIONS: string[] = [];
for (let hour = 0; hour < 24; hour++) {
  for (let minute = 0; minute < 60; minute += 15) {
    const h = hour.toString().padStart(2, '0');
    const m = minute.toString().padStart(2, '0');
    TIME_OPTIONS.push(`${h}:${m}`);
  }
}

function getDefaultHours(): DayHours[] {
  return DAYS.map((day) => ({
    dayOfWeek: day.value,
    isOpen: day.value !== 'sunday',
    openTime: '06:00',
    closeTime: '22:00',
  }));
}

/**
 * OperatingHoursEditor
 *
 * A form component for configuring operating hours day-by-day.
 * Used in Facility and Staff modals to set when a resource is available.
 */
export function OperatingHoursEditor({
  value = getDefaultHours(),
  onChange,
  className,
}: OperatingHoursEditorProps) {
  const [copied, setCopied] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Ensure all days are present
  const hours = DAYS.map((day) => {
    const existing = value.find((h) => h.dayOfWeek === day.value);
    return existing || {
      dayOfWeek: day.value,
      isOpen: day.value !== 'sunday',
      openTime: '06:00',
      closeTime: '22:00',
    };
  });

  const updateDay = useCallback(
    (dayOfWeek: string, updates: Partial<DayHours>) => {
      const newHours = hours.map((h) =>
        h.dayOfWeek === dayOfWeek ? { ...h, ...updates } : h
      );

      // Validate
      const day = newHours.find((h) => h.dayOfWeek === dayOfWeek);
      if (day?.isOpen && day.openTime && day.closeTime) {
        if (day.openTime >= day.closeTime) {
          setErrors((prev) => ({
            ...prev,
            [dayOfWeek]: 'End time must be after start time',
          }));
        } else {
          setErrors((prev) => {
            const newErrors = { ...prev };
            delete newErrors[dayOfWeek];
            return newErrors;
          });
        }
      } else {
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[dayOfWeek];
          return newErrors;
        });
      }

      onChange(newHours);
    },
    [hours, onChange]
  );

  const copyToWeekdays = useCallback(() => {
    const tuesday = hours.find((h) => h.dayOfWeek === 'tuesday');
    if (!tuesday) return;

    const newHours = hours.map((h) => {
      if (['monday', 'wednesday', 'thursday', 'friday'].includes(h.dayOfWeek)) {
        return {
          ...h,
          isOpen: tuesday.isOpen,
          openTime: tuesday.openTime,
          closeTime: tuesday.closeTime,
        };
      }
      return h;
    });

    onChange(newHours);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [hours, onChange]);

  return (
    <div className={cn('space-y-2', className)}>
      {hours.map((day, index) => {
        const dayConfig = DAYS.find((d) => d.value === day.dayOfWeek);
        const hasError = errors[day.dayOfWeek];
        const isTuesday = day.dayOfWeek === 'tuesday';

        return (
          <div key={day.dayOfWeek}>
            <div
              className={cn(
                'flex items-center gap-3 rounded-lg p-2 transition-colors',
                hasError && 'bg-red-50 dark:bg-red-500/10'
              )}
            >
              {/* Checkbox */}
              <label className="flex cursor-pointer items-center gap-2">
                <input
                  type="checkbox"
                  checked={day.isOpen}
                  onChange={(e) => updateDay(day.dayOfWeek, { isOpen: e.target.checked })}
                  className="h-4 w-4 rounded border-stone-300 text-amber-500 focus:ring-amber-500 focus:ring-offset-0"
                />
                <span
                  className={cn(
                    'w-24 text-sm font-medium',
                    day.isOpen ? 'text-foreground' : 'text-muted-foreground'
                  )}
                >
                  {dayConfig?.label}
                </span>
              </label>

              {/* Time inputs or Closed */}
              {day.isOpen ? (
                <div className="flex items-center gap-2">
                  <select
                    value={day.openTime || '06:00'}
                    onChange={(e) => updateDay(day.dayOfWeek, { openTime: e.target.value })}
                    className={cn(
                      'h-9 w-24 rounded-md border bg-background px-2 text-sm',
                      hasError
                        ? 'border-red-500 focus:ring-red-500'
                        : 'border-border focus:border-amber-500 focus:ring-amber-500/20'
                    )}
                  >
                    {TIME_OPTIONS.map((time) => (
                      <option key={time} value={time}>
                        {time}
                      </option>
                    ))}
                  </select>
                  <span className="text-muted-foreground">–</span>
                  <select
                    value={day.closeTime || '22:00'}
                    onChange={(e) => updateDay(day.dayOfWeek, { closeTime: e.target.value })}
                    className={cn(
                      'h-9 w-24 rounded-md border bg-background px-2 text-sm',
                      hasError
                        ? 'border-red-500 focus:ring-red-500'
                        : 'border-border focus:border-amber-500 focus:ring-amber-500/20'
                    )}
                  >
                    {TIME_OPTIONS.map((time) => (
                      <option key={time} value={time}>
                        {time}
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <span className="text-sm italic text-muted-foreground">Closed</span>
              )}

              {/* Copy to weekdays button (after Tuesday) */}
              {isTuesday && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={copyToWeekdays}
                  className="ml-auto text-xs"
                >
                  {copied ? (
                    <>
                      <Check className="mr-1 h-3 w-3 text-emerald-500" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="mr-1 h-3 w-3" />
                      Copy to all weekdays
                    </>
                  )}
                </Button>
              )}
            </div>

            {/* Error message */}
            {hasError && (
              <p className="mt-1 pl-9 text-xs text-red-500">{hasError}</p>
            )}
          </div>
        );
      })}
    </div>
  );
}

export { getDefaultHours };
