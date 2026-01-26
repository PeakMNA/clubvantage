import * as React from 'react';
import { cn } from '../lib/utils';

export interface LoadingSpinnerProps {
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Additional class names */
  className?: string;
}

const sizeClasses = {
  sm: 'h-4 w-4 border-2',
  md: 'h-6 w-6 border-2',
  lg: 'h-8 w-8 border-3',
};

export function LoadingSpinner({ size = 'md', className }: LoadingSpinnerProps) {
  return (
    <div
      className={cn(
        'animate-spin rounded-full border-primary border-t-transparent',
        sizeClasses[size],
        className
      )}
      role="status"
      aria-label="Loading"
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
}

export interface LoadingOverlayProps {
  /** Whether to show the overlay */
  show?: boolean;
  /** Text to display */
  text?: string;
  /** Additional class names */
  className?: string;
}

export function LoadingOverlay({
  show = true,
  text = 'Loading...',
  className,
}: LoadingOverlayProps) {
  if (!show) return null;

  return (
    <div
      className={cn(
        'absolute inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm',
        className
      )}
    >
      <div className="flex flex-col items-center gap-2">
        <LoadingSpinner size="lg" />
        <span className="text-sm text-muted-foreground">{text}</span>
      </div>
    </div>
  );
}
