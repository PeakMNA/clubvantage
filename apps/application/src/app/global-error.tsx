'use client';

import { useEffect } from 'react';
import './globals.css';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Global error:', error);
  }, [error]);

  return (
    <html lang="en">
      <body className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 font-sans antialiased">
        <div className="flex min-h-screen items-center justify-center p-4">
          <div className="w-full max-w-md">
            <div className="relative overflow-hidden rounded-2xl border border-slate-200/60 bg-white/80 p-8 shadow-xl shadow-slate-200/50 backdrop-blur-sm">
              {/* Decorative accent line */}
              <div className="absolute left-0 top-0 h-1 w-full bg-gradient-to-r from-red-300 via-red-500 to-red-300" />

              <div className="text-center">
                {/* Error icon */}
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-50">
                  <svg
                    className="h-8 w-8 text-red-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                </div>

                <h1 className="mt-6 text-xl font-bold tracking-tight text-slate-900">
                  Something went wrong
                </h1>
                <p className="mt-2 text-sm text-slate-500">
                  An unexpected error occurred. Please try again or contact support if the problem
                  persists.
                </p>

                {/* Error details (development only) */}
                {process.env.NODE_ENV === 'development' && (
                  <div className="mt-4 rounded-lg bg-slate-50 p-3 text-left">
                    <p className="text-xs font-medium text-slate-500">Error details:</p>
                    <p className="mt-1 break-all font-mono text-xs text-red-600">
                      {error.message}
                    </p>
                    {error.digest && (
                      <p className="mt-1 font-mono text-xs text-slate-400">
                        Digest: {error.digest}
                      </p>
                    )}
                  </div>
                )}

                {/* Actions */}
                <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
                  <button
                    onClick={reset}
                    className="inline-flex items-center justify-center rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:bg-slate-800 hover:shadow-md"
                  >
                    Try again
                  </button>
                  <button
                    onClick={() => (window.location.href = '/')}
                    className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition-all hover:bg-slate-50 hover:shadow-md"
                  >
                    Go to Dashboard
                  </button>
                </div>
              </div>
            </div>

            {/* Footer */}
            <p className="mt-6 text-center text-xs text-slate-400">
              ClubVantage &bull; AI-First Club Management
            </p>
          </div>
        </div>
      </body>
    </html>
  );
}
