'use client';

import * as React from 'react';
import { AlertTriangle, RefreshCw, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui';

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  override componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log to error reporting service
    console.error('Error caught by boundary:', error, errorInfo);
  }

  override render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <ErrorFallback
          error={this.state.error}
          onReset={() => this.setState({ hasError: false, error: null })}
        />
      );
    }

    return this.props.children;
  }
}

// Error Fallback Component
interface ErrorFallbackProps {
  error: Error | null;
  onReset?: () => void;
}

export function ErrorFallback({ error, onReset }: ErrorFallbackProps) {
  return (
    <div className="min-h-[400px] flex items-center justify-center p-8">
      <div className="text-center max-w-md">
        <div className="h-16 w-16 mx-auto rounded-full bg-red-100 flex items-center justify-center mb-6">
          <AlertTriangle className="h-8 w-8 text-red-600" />
        </div>
        <h2 className="text-xl font-semibold text-slate-900 mb-2">
          Something went wrong
        </h2>
        <p className="text-slate-600 mb-6">
          We encountered an unexpected error. Please try again or contact support if the problem persists.
        </p>
        {error && (
          <details className="mb-6 text-left">
            <summary className="text-sm text-slate-500 cursor-pointer hover:text-slate-700">
              Technical details
            </summary>
            <pre className="mt-2 p-3 bg-slate-100 rounded text-xs text-slate-700 overflow-auto">
              {error.message}
            </pre>
          </details>
        )}
        <div className="flex items-center justify-center gap-3">
          <Button variant="secondary" onClick={() => window.location.href = 'mailto:support@clubvantage.com'}>
            <MessageCircle className="h-4 w-4 mr-2" />
            Contact Support
          </Button>
          <Button onClick={onReset}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        </div>
      </div>
    </div>
  );
}

// Error Banner for inline errors
interface ErrorBannerProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  onDismiss?: () => void;
  className?: string;
}

export function ErrorBanner({
  title = 'Something went wrong',
  message,
  onRetry,
  onDismiss,
  className,
}: ErrorBannerProps) {
  return (
    <div className={`p-4 bg-red-50 border border-red-200 rounded-lg ${className}`}>
      <div className="flex items-start gap-3">
        <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <h3 className="font-medium text-red-800">{title}</h3>
          <p className="text-sm text-red-700 mt-1">{message}</p>
          {(onRetry || onDismiss) && (
            <div className="flex items-center gap-3 mt-3">
              {onDismiss && (
                <button
                  onClick={onDismiss}
                  className="text-sm font-medium text-red-700 hover:text-red-800"
                >
                  Dismiss
                </button>
              )}
              {onRetry && (
                <Button variant="destructive" size="sm" onClick={onRetry}>
                  Retry
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
