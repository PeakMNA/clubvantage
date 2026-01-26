'use client';

import { useState, useEffect, useCallback } from 'react';
import { AlertCircle, X, Loader2, ArrowLeft } from 'lucide-react';
import { Button } from '@clubvantage/ui';
import { cn } from '@clubvantage/ui';

// =============================================================================
// Error Message Presets
// =============================================================================

export const errorMessages = {
  listLoadFailed: {
    heading: 'Failed to load members',
    description: "We couldn't fetch the member list. Please try again.",
  },
  detailLoadFailed: {
    heading: 'Member not found',
    description: "This member may have been deleted or you don't have access.",
  },
  saveFailed: {
    heading: "Couldn't save changes",
    description: "Your changes weren't saved. Please try again.",
  },
  searchFailed: {
    heading: 'Search unavailable',
    description: 'Search is temporarily unavailable. Please try again later.',
  },
  permissionDenied: {
    heading: 'Access denied',
    description: "You don't have permission to view this content.",
  },
} as const;

// =============================================================================
// Inline Banner Error
// =============================================================================

interface InlineBannerErrorProps {
  message: string;
  onRetry?: () => void;
  isRetrying?: boolean;
  onDismiss?: () => void;
  className?: string;
}

export function InlineBannerError({
  message,
  onRetry,
  isRetrying = false,
  onDismiss,
  className,
}: InlineBannerErrorProps) {
  return (
    <div
      className={cn(
        'flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3',
        'border-l-4 border-l-red-500',
        className
      )}
      role="alert"
    >
      <AlertCircle className="h-5 w-5 shrink-0 text-red-500" />
      <p className="flex-1 text-sm text-foreground">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          disabled={isRetrying}
          className="flex items-center gap-1 text-sm text-red-600 hover:text-red-700 hover:underline disabled:opacity-50"
        >
          {isRetrying && <Loader2 className="h-3 w-3 animate-spin" />}
          Retry
        </button>
      )}
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="ml-2 text-muted-foreground hover:text-muted-foreground"
          aria-label="Dismiss"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}

// =============================================================================
// Full Page Error
// =============================================================================

interface FullPageErrorProps {
  heading: string;
  description: string;
  onRetry?: () => void;
  onGoBack?: () => void;
  isRetrying?: boolean;
  className?: string;
}

export function FullPageError({
  heading,
  description,
  onRetry,
  onGoBack,
  isRetrying = false,
  className,
}: FullPageErrorProps) {
  return (
    <div
      className={cn(
        'flex min-h-[400px] flex-col items-center justify-center text-center',
        className
      )}
      role="alert"
    >
      {/* Large alert icon */}
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-red-100">
        <AlertCircle className="h-12 w-12 text-red-500" />
      </div>

      {/* Heading */}
      <h2 className="mb-2 text-2xl font-semibold text-foreground">{heading}</h2>

      {/* Description */}
      <p className="mb-8 max-w-md text-sm text-muted-foreground">{description}</p>

      {/* Actions */}
      <div className="flex gap-3">
        {onGoBack && (
          <Button variant="outline" onClick={onGoBack}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Go back
          </Button>
        )}
        {onRetry && (
          <Button onClick={onRetry} disabled={isRetrying}>
            {isRetrying && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Retry
          </Button>
        )}
      </div>
    </div>
  );
}

// =============================================================================
// Toast Notification Error
// =============================================================================

interface ToastErrorProps {
  id: string;
  message: string;
  onRetry?: () => void;
  onDismiss: (id: string) => void;
  variant?: 'solid' | 'light';
  autoDismiss?: boolean;
  autoDismissDelay?: number;
}

export function ToastError({
  id,
  message,
  onRetry,
  onDismiss,
  variant = 'light',
  autoDismiss = true,
  autoDismissDelay = 5000,
}: ToastErrorProps) {
  const [isExiting, setIsExiting] = useState(false);

  const handleDismiss = useCallback(() => {
    setIsExiting(true);
    setTimeout(() => onDismiss(id), 200);
  }, [id, onDismiss]);

  useEffect(() => {
    if (autoDismiss) {
      const timer = setTimeout(handleDismiss, autoDismissDelay);
      return () => clearTimeout(timer);
    }
  }, [autoDismiss, autoDismissDelay, handleDismiss]);

  const isSolid = variant === 'solid';

  return (
    <div
      className={cn(
        'flex items-center gap-3 rounded-lg px-4 py-3 shadow-lg transition-all duration-200',
        isSolid
          ? 'bg-red-500 text-white'
          : 'border border-red-200 bg-white border-l-4 border-l-red-500',
        isExiting && 'translate-x-full opacity-0'
      )}
      role="alert"
    >
      <AlertCircle
        className={cn('h-5 w-5 shrink-0', isSolid ? 'text-white' : 'text-red-500')}
      />
      <p
        className={cn(
          'flex-1 text-sm',
          isSolid ? 'text-white' : 'text-foreground'
        )}
      >
        {message}
      </p>
      {onRetry && (
        <button
          onClick={onRetry}
          className={cn(
            'text-sm hover:underline',
            isSolid ? 'text-white/90 hover:text-white' : 'text-red-600 hover:text-red-700'
          )}
        >
          Retry
        </button>
      )}
      <button
        onClick={handleDismiss}
        className={cn(
          'ml-1',
          isSolid ? 'text-white/70 hover:text-white' : 'text-muted-foreground hover:text-muted-foreground'
        )}
        aria-label="Dismiss"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

// =============================================================================
// Toast Container (for stacking multiple toasts)
// =============================================================================

interface ToastItem {
  id: string;
  message: string;
  onRetry?: () => void;
  variant?: 'solid' | 'light';
}

interface ToastContainerProps {
  toasts: ToastItem[];
  onDismiss: (id: string) => void;
  className?: string;
}

export function ToastContainer({
  toasts,
  onDismiss,
  className,
}: ToastContainerProps) {
  return (
    <div
      className={cn(
        'fixed bottom-4 right-4 z-50 flex flex-col gap-2',
        className
      )}
    >
      {toasts.map((toast) => (
        <ToastError
          key={toast.id}
          id={toast.id}
          message={toast.message}
          onRetry={toast.onRetry}
          onDismiss={onDismiss}
          variant={toast.variant}
        />
      ))}
    </div>
  );
}

// =============================================================================
// Inline Field Error
// =============================================================================

interface InlineFieldErrorProps {
  message: string;
  className?: string;
}

export function InlineFieldError({ message, className }: InlineFieldErrorProps) {
  return (
    <div
      className={cn('mt-1.5 flex items-center gap-1 text-red-500', className)}
      role="alert"
    >
      <AlertCircle className="h-3.5 w-3.5 shrink-0" />
      <p className="text-xs">{message}</p>
    </div>
  );
}

// =============================================================================
// Hook for managing toast errors
// =============================================================================

export function useToastErrors() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const addToast = useCallback(
    (message: string, options?: { onRetry?: () => void; variant?: 'solid' | 'light' }) => {
      const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      setToasts((prev) => [
        ...prev,
        { id, message, onRetry: options?.onRetry, variant: options?.variant },
      ]);
      return id;
    },
    []
  );

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const clearToasts = useCallback(() => {
    setToasts([]);
  }, []);

  return { toasts, addToast, removeToast, clearToasts };
}
