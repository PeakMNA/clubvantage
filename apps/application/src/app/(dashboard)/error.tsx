'use client';

import { useEffect } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Button } from '@clubvantage/ui';

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Dashboard error:', error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <div className="relative overflow-hidden rounded-2xl border border-slate-200/60 bg-white/80 p-8 shadow-xl shadow-slate-200/50 backdrop-blur-sm">
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-slate-50/50 to-transparent" />

          {/* Decorative accent line */}
          <div className="absolute left-0 top-0 h-1 w-full bg-gradient-to-r from-amber-300 via-amber-500 to-amber-300" />

          <div className="relative text-center">
            {/* Error icon */}
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-amber-50">
              <AlertTriangle className="h-8 w-8 text-amber-500" />
            </div>

            <h1 className="mt-6 text-xl font-bold tracking-tight text-slate-900">
              Something went wrong
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              We encountered an error while loading this page. Please try again or navigate to
              another section.
            </p>

            {/* Error details (development only) */}
            {process.env.NODE_ENV === 'development' && (
              <div className="mt-4 rounded-xl bg-slate-50/80 p-4 text-left backdrop-blur-sm">
                <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
                  Error details
                </p>
                <p className="mt-2 break-all font-mono text-sm text-red-600">
                  {error.message}
                </p>
                {error.stack && (
                  <pre className="mt-2 max-h-32 overflow-auto rounded-lg bg-slate-100 p-2 font-mono text-xs text-slate-600">
                    {error.stack.split('\n').slice(0, 5).join('\n')}
                  </pre>
                )}
                {error.digest && (
                  <p className="mt-2 font-mono text-xs text-slate-400">
                    Digest: {error.digest}
                  </p>
                )}
              </div>
            )}

            {/* Actions */}
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Button
                onClick={reset}
                className="shadow-md transition-all hover:shadow-lg"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Try again
              </Button>
              <Button
                variant="outline"
                onClick={() => (window.location.href = '/')}
                className="border-slate-200 bg-white/80 shadow-sm backdrop-blur-sm transition-all hover:bg-white hover:shadow-md"
              >
                <Home className="mr-2 h-4 w-4" />
                Go to Dashboard
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
