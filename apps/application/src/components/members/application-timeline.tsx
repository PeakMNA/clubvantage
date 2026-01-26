'use client';

import { Check, X } from 'lucide-react';
import { cn } from '@clubvantage/ui';
import type { ApplicationStatus } from './types';

interface TimelineStep {
  id: string;
  label: string;
  status: 'completed' | 'active' | 'pending' | 'rejected';
  timestamp?: string;
}

interface ApplicationTimelineProps {
  applicationStatus: ApplicationStatus;
  submittedDate?: string;
  underReviewDate?: string;
  pendingBoardDate?: string;
  approvedDate?: string;
  rejectedDate?: string;
  className?: string;
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

function getSteps(props: ApplicationTimelineProps): TimelineStep[] {
  const {
    applicationStatus,
    submittedDate,
    underReviewDate,
    pendingBoardDate,
    approvedDate,
    rejectedDate,
  } = props;

  const isRejected = applicationStatus === 'REJECTED';
  const isWithdrawn = applicationStatus === 'WITHDRAWN';

  // Determine step states based on application status
  const getStepStatus = (
    stepOrder: number,
    currentStep: number
  ): 'completed' | 'active' | 'pending' | 'rejected' => {
    if (stepOrder < currentStep) return 'completed';
    if (stepOrder === currentStep) return 'active';
    return 'pending';
  };

  const statusOrder: Record<ApplicationStatus, number> = {
    SUBMITTED: 1,
    UNDER_REVIEW: 2,
    PENDING_BOARD: 3,
    APPROVED: 4,
    REJECTED: 4,
    WITHDRAWN: 0,
  };

  const currentStep = statusOrder[applicationStatus];

  // Build steps based on current status
  const steps: TimelineStep[] = [
    {
      id: 'submitted',
      label: 'Submitted',
      status: currentStep >= 1 ? 'completed' : 'pending',
      timestamp: submittedDate,
    },
    {
      id: 'under_review',
      label: 'Under Review',
      status: getStepStatus(2, currentStep),
      timestamp: underReviewDate,
    },
    {
      id: 'pending_board',
      label: 'Pending Board',
      status: getStepStatus(3, currentStep),
      timestamp: pendingBoardDate,
    },
    {
      id: 'decision',
      label: isRejected
        ? 'Rejected'
        : applicationStatus === 'APPROVED'
          ? 'Approved'
          : 'Awaiting Decision',
      status: isRejected
        ? 'rejected'
        : applicationStatus === 'APPROVED'
          ? 'completed'
          : currentStep === 4
            ? 'active'
            : 'pending',
      timestamp: isRejected ? rejectedDate : approvedDate,
    },
  ];

  return steps;
}

export function ApplicationTimeline(props: ApplicationTimelineProps) {
  const { className } = props;
  const steps = getSteps(props);

  return (
    <div className={cn('flex flex-col', className)}>
      {steps.map((step, index) => {
        const isLast = index === steps.length - 1;

        return (
          <div key={step.id} className="flex">
            {/* Step Indicator Column */}
            <div className="flex flex-col items-center">
              {/* Circle */}
              <div
                className={cn(
                  'flex h-6 w-6 items-center justify-center rounded-full border-2',
                  step.status === 'completed' &&
                    'border-emerald-500 bg-emerald-500',
                  step.status === 'active' &&
                    'border-amber-500 bg-white',
                  step.status === 'pending' &&
                    'border-border bg-white',
                  step.status === 'rejected' &&
                    'border-red-500 bg-red-500'
                )}
              >
                {step.status === 'completed' && (
                  <Check className="h-3.5 w-3.5 text-white" />
                )}
                {step.status === 'rejected' && (
                  <X className="h-3.5 w-3.5 text-white" />
                )}
                {step.status === 'active' && (
                  <div className="h-2 w-2 rounded-full bg-amber-500" />
                )}
              </div>

              {/* Connector Line */}
              {!isLast && (
                <div
                  className={cn(
                    'w-0.5 flex-1 min-h-[24px]',
                    step.status === 'completed' && 'bg-emerald-500',
                    step.status === 'rejected' && 'bg-red-500',
                    step.status === 'active' && 'border-l-2 border-dashed border-border',
                    step.status === 'pending' && 'bg-border'
                  )}
                />
              )}
            </div>

            {/* Label & Timestamp Column */}
            <div className="ml-3 pb-6">
              <div
                className={cn(
                  'text-sm font-medium',
                  step.status === 'completed' && 'text-foreground',
                  step.status === 'active' && 'font-semibold text-foreground',
                  step.status === 'pending' && 'text-muted-foreground',
                  step.status === 'rejected' && 'text-red-600'
                )}
              >
                {step.label}
              </div>
              {step.timestamp && step.status !== 'pending' && (
                <div className="mt-0.5 text-xs text-muted-foreground">
                  {formatDate(step.timestamp)}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
