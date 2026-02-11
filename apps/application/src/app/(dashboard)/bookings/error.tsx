'use client';

import { useEffect } from 'react';
import { AlertTriangle, RefreshCw, ArrowLeft } from 'lucide-react';
import { Button } from '@clubvantage/ui';

export default function BookingsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Bookings page error:', error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <div className="relative overflow-hidden rounded-2xl border border-slate-200/60 dark:border-stone-700/60 bg-white/80 dark:bg-stone-900/80 p-8 shadow-xl shadow-slate-200/50 dark:shadow-stone-900/30 backdrop-blur-sm">
          <div className="absolute inset-0 bg-gradient-to-br from-slate-50/50 to-transparent dark:from-stone-900/50" />
          <div className="absolute left-0 top-0 h-1 w-full bg-gradient-to-r from-red-300 via-red-500 to-red-300" />

          <div className="relative text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-50 dark:bg-red-500/10">
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>

            <h1 className="mt-6 text-xl font-bold tracking-tight text-slate-900 dark:text-stone-100">
              Bookings Page Error
            </h1>
            <p className="mt-2 text-sm text-slate-500 dark:text-stone-400">
              An error occurred while loading the bookings page. Check the console for details.
            </p>

            <div className="mt-4 rounded-xl bg-slate-50/80 dark:bg-stone-900/40 p-4 text-left backdrop-blur-sm">
              <p className="text-xs font-medium uppercase tracking-wider text-slate-400 dark:text-stone-500">
                Error details
              </p>
              <p className="mt-2 break-all font-mono text-sm text-red-600 dark:text-red-400">
                {error.message}
              </p>
              {error.stack && (
                <pre className="mt-2 max-h-40 overflow-auto rounded-lg bg-slate-100 dark:bg-stone-800 p-2 font-mono text-xs text-slate-600 dark:text-stone-400">
                  {error.stack.split('\n').slice(0, 8).join('\n')}
                </pre>
              )}
              {error.digest && (
                <p className="mt-2 font-mono text-xs text-slate-400 dark:text-stone-500">
                  Digest: {error.digest}
                </p>
              )}
            </div>

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
                className="border-slate-200 dark:border-stone-700 bg-white/80 dark:bg-stone-900/80 shadow-sm backdrop-blur-sm transition-all hover:bg-white dark:hover:bg-stone-800 hover:shadow-md"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Go to Dashboard
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
