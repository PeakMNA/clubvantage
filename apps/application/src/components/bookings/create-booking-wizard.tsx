'use client';

import { useCallback } from 'react';
import { cn } from '@clubvantage/ui';
import { X, Building2, Sparkles, Dumbbell, Users } from 'lucide-react';

export type BookingType = 'facility' | 'service' | 'staff';

export type WizardStep = 'type' | 'staff' | 'select' | 'facility' | 'time' | 'options' | 'confirm';

// Default step order for facility/service flows
const DEFAULT_WIZARD_STEPS: { id: WizardStep; label: string }[] = [
  { id: 'type', label: 'Type' },
  { id: 'select', label: 'Select' },
  { id: 'time', label: 'Time' },
  { id: 'options', label: 'Options' },
  { id: 'confirm', label: 'Confirm' },
];

// Step order for staff-first flow (with facility)
const STAFF_FLOW_WITH_FACILITY_STEPS: { id: WizardStep; label: string }[] = [
  { id: 'type', label: 'Type' },
  { id: 'staff', label: 'Staff' },
  { id: 'select', label: 'Service' },
  { id: 'facility', label: 'Facility' },
  { id: 'time', label: 'Time' },
  { id: 'options', label: 'Options' },
  { id: 'confirm', label: 'Confirm' },
];

// Step order for staff-first flow (without facility)
const STAFF_FLOW_STEPS: { id: WizardStep; label: string }[] = [
  { id: 'type', label: 'Type' },
  { id: 'staff', label: 'Staff' },
  { id: 'select', label: 'Service' },
  { id: 'time', label: 'Time' },
  { id: 'options', label: 'Options' },
  { id: 'confirm', label: 'Confirm' },
];

export function getWizardSteps(bookingType: BookingType | null, needsFacility = false): { id: WizardStep; label: string }[] {
  if (bookingType === 'staff') {
    return needsFacility ? STAFF_FLOW_WITH_FACILITY_STEPS : STAFF_FLOW_STEPS;
  }
  return DEFAULT_WIZARD_STEPS;
}

interface StepIndicatorProps {
  currentStep: WizardStep;
  steps?: { id: WizardStep; label: string }[];
  className?: string;
}

/**
 * StepIndicator
 *
 * Shows progress through the booking wizard with dots and labels.
 */
export function StepIndicator({ currentStep, steps = DEFAULT_WIZARD_STEPS, className }: StepIndicatorProps) {
  const currentIndex = steps.findIndex((s) => s.id === currentStep);

  return (
    <div className={cn('flex items-center justify-center gap-2', className)}>
      {steps.map((step, index) => {
        const isActive = index === currentIndex;
        const isCompleted = index < currentIndex;

        return (
          <div key={step.id} className="flex flex-col items-center gap-1.5">
            {/* Dot */}
            <div
              className={cn(
                'h-2.5 w-2.5 rounded-full transition-all duration-200',
                isActive && 'bg-amber-500 ring-4 ring-amber-500/20',
                isCompleted && 'bg-amber-500',
                !isActive && !isCompleted && 'bg-muted'
              )}
            />
            {/* Label - hidden on mobile for compactness */}
            <span
              className={cn(
                'hidden text-[10px] font-medium uppercase tracking-wide sm:block',
                isActive && 'text-amber-600 dark:text-amber-400',
                isCompleted && 'text-muted-foreground',
                !isActive && !isCompleted && 'text-muted-foreground/60'
              )}
            >
              {step.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

interface BookingTypeCardProps {
  type: BookingType;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  isSelected?: boolean;
  onClick: () => void;
}

/**
 * BookingTypeCard
 *
 * Selectable card for choosing between facility and service booking.
 */
function BookingTypeCard({
  type,
  title,
  subtitle,
  icon,
  isSelected,
  onClick,
}: BookingTypeCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'group relative flex h-40 w-full flex-col items-center justify-center gap-3 rounded-lg border p-4 text-center transition-all duration-200',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2',
        'sm:h-40 sm:w-[180px]',
        isSelected
          ? 'border-amber-500 bg-amber-50 ring-2 ring-amber-500 dark:bg-amber-500/10'
          : 'border-border bg-card hover:border-amber-400 hover:bg-amber-50/50 dark:hover:bg-amber-500/5'
      )}
    >
      {/* Icon container */}
      <div
        className={cn(
          'flex h-14 w-14 items-center justify-center rounded-xl transition-colors duration-200',
          isSelected
            ? 'bg-amber-500 text-white'
            : 'bg-muted text-muted-foreground group-hover:bg-amber-100 group-hover:text-amber-600 dark:group-hover:bg-amber-500/20 dark:group-hover:text-amber-400'
        )}
      >
        {icon}
      </div>

      {/* Text */}
      <div>
        <h3
          className={cn(
            'text-base font-semibold transition-colors',
            isSelected
              ? 'text-amber-700 dark:text-amber-400'
              : 'text-foreground'
          )}
        >
          {title}
        </h3>
        <p className="mt-0.5 text-xs text-muted-foreground">{subtitle}</p>
      </div>

      {/* Selected checkmark */}
      {isSelected && (
        <span
          className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-amber-500 text-white shadow-sm"
          aria-hidden="true"
        >
          <svg
            className="h-3 w-3"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={3}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5 13l4 4L19 7"
            />
          </svg>
        </span>
      )}

      {/* Hover shine effect */}
      <span
        className="pointer-events-none absolute inset-0 rounded-lg bg-gradient-to-br from-white/0 to-white/0 transition-all duration-200 group-hover:from-white/5 group-hover:to-transparent"
        aria-hidden="true"
      />
    </button>
  );
}

export interface CreateBookingTypeSelectionProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (type: BookingType) => void;
  className?: string;
}

/**
 * CreateBookingTypeSelection
 *
 * Step 1 of the booking wizard - choose between facility or service booking.
 */
export function CreateBookingTypeSelection({
  isOpen,
  onClose,
  onSelect,
  className,
}: CreateBookingTypeSelectionProps) {
  const handleBackdropClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) {
        onClose();
      }
    },
    [onClose]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    },
    [onClose]
  );

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
        onClick={handleBackdropClick}
        onKeyDown={handleKeyDown}
        role="presentation"
      >
        {/* Modal */}
        <div
          className={cn(
            'relative w-full max-w-[480px] rounded-xl bg-card p-6 shadow-xl',
            'animate-in fade-in-0 zoom-in-95 duration-200',
            className
          )}
          role="dialog"
          aria-modal="true"
          aria-labelledby="booking-type-title"
        >
          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>

          {/* Header */}
          <div className="mb-6 text-center">
            <h2
              id="booking-type-title"
              className="text-xl font-semibold text-foreground"
            >
              What would you like to book?
            </h2>
          </div>

          {/* Step Indicator */}
          <StepIndicator currentStep="type" className="mb-8" />

          {/* Selection Cards */}
          <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:justify-center">
            <BookingTypeCard
              type="facility"
              title="Facility"
              subtitle="Book a specific court, room, or lane"
              icon={<Building2 className="h-7 w-7" />}
              onClick={() => onSelect('facility')}
            />
            <BookingTypeCard
              type="service"
              title="Service"
              subtitle="Book a treatment or class"
              icon={<Sparkles className="h-7 w-7" />}
              onClick={() => onSelect('service')}
            />
            <BookingTypeCard
              type="staff"
              title="Staff"
              subtitle="Book with a specific trainer or therapist"
              icon={<Users className="h-7 w-7" />}
              onClick={() => onSelect('staff')}
            />
          </div>

          {/* Footer */}
          <div className="mt-8 flex justify-center">
            <button
              type="button"
              onClick={onClose}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

/**
 * useCreateBookingWizard
 *
 * Hook for managing the booking wizard state.
 */
export function useCreateBookingWizard() {
  return {
    // Will be expanded in future prompts
  };
}
