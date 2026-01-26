'use client';

import * as React from 'react';
import { useTheme } from 'next-themes';
import { Moon, Sun, Monitor } from 'lucide-react';
import { cn } from '@clubvantage/ui';

interface ThemeToggleProps {
  /** Compact mode for sidebar (just icon toggle) */
  compact?: boolean;
  /** Show system option */
  showSystem?: boolean;
  /** Additional class names */
  className?: string;
}

export function ThemeToggle({ compact = false, showSystem = true, className }: ThemeToggleProps) {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  // Avoid hydration mismatch
  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className={cn('h-10 animate-pulse rounded-xl bg-stone-200 dark:bg-stone-800', className)} />
    );
  }

  if (compact) {
    return (
      <button
        onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
        className={cn(
          'group relative flex h-10 w-10 items-center justify-center rounded-xl',
          'bg-gradient-to-br from-stone-100 to-stone-200/80',
          'dark:from-stone-800 dark:to-stone-900',
          'border border-stone-200/60 dark:border-stone-700/60',
          'shadow-sm hover:shadow-md',
          'transition-all duration-300 ease-out',
          'hover:scale-105 active:scale-95',
          className
        )}
        aria-label={`Switch to ${resolvedTheme === 'dark' ? 'light' : 'dark'} mode`}
      >
        {/* Sun icon - visible in dark mode */}
        <Sun
          className={cn(
            'absolute h-5 w-5 transition-all duration-500',
            resolvedTheme === 'dark'
              ? 'rotate-0 scale-100 text-amber-400'
              : '-rotate-90 scale-0 text-amber-500'
          )}
        />
        {/* Moon icon - visible in light mode */}
        <Moon
          className={cn(
            'absolute h-5 w-5 transition-all duration-500',
            resolvedTheme === 'dark'
              ? 'rotate-90 scale-0 text-stone-400'
              : 'rotate-0 scale-100 text-stone-600'
          )}
        />

        {/* Glow effect on hover */}
        <div className={cn(
          'absolute inset-0 rounded-xl opacity-0 transition-opacity duration-300',
          'group-hover:opacity-100',
          resolvedTheme === 'dark'
            ? 'bg-amber-500/10 shadow-[0_0_15px_rgba(251,191,36,0.15)]'
            : 'bg-stone-500/5'
        )} />
      </button>
    );
  }

  return (
    <div className={cn('space-y-2', className)}>
      {/* Label */}
      <div className="flex items-center justify-between px-1">
        <span className="text-xs font-medium uppercase tracking-wider text-stone-500 dark:text-stone-400">
          Appearance
        </span>
        <span className="text-xs text-stone-400 dark:text-stone-500 capitalize">
          {theme === 'system' ? `System (${resolvedTheme})` : theme}
        </span>
      </div>

      {/* Toggle buttons */}
      <div className={cn(
        'relative flex rounded-xl p-1',
        'bg-gradient-to-br from-stone-100 to-stone-200/50',
        'dark:from-stone-800/80 dark:to-stone-900/50',
        'border border-stone-200/60 dark:border-stone-700/40',
        'shadow-inner'
      )}>
        {/* Sliding indicator */}
        <div
          className={cn(
            'absolute top-1 bottom-1 rounded-lg transition-all duration-300 ease-out',
            'bg-white dark:bg-stone-700',
            'shadow-sm border border-stone-200/60 dark:border-stone-600/60',
            showSystem ? 'w-[calc(33.333%-4px)]' : 'w-[calc(50%-4px)]',
            theme === 'light' && 'left-1',
            theme === 'dark' && (showSystem ? 'left-[calc(33.333%+2px)]' : 'left-[calc(50%+2px)]'),
            theme === 'system' && 'left-[calc(66.666%+2px)]'
          )}
        />

        {/* Light button */}
        <button
          onClick={() => setTheme('light')}
          className={cn(
            'relative z-10 flex flex-1 items-center justify-center gap-2 rounded-lg py-2 px-3',
            'text-sm font-medium transition-colors duration-200',
            theme === 'light'
              ? 'text-amber-600 dark:text-amber-400'
              : 'text-stone-500 hover:text-stone-700 dark:text-stone-400 dark:hover:text-stone-200'
          )}
        >
          <Sun className={cn(
            'h-4 w-4 transition-transform duration-300',
            theme === 'light' && 'animate-[spin_0.5s_ease-out]'
          )} />
          <span className="hidden sm:inline">Light</span>
        </button>

        {/* Dark button */}
        <button
          onClick={() => setTheme('dark')}
          className={cn(
            'relative z-10 flex flex-1 items-center justify-center gap-2 rounded-lg py-2 px-3',
            'text-sm font-medium transition-colors duration-200',
            theme === 'dark'
              ? 'text-amber-600 dark:text-amber-400'
              : 'text-stone-500 hover:text-stone-700 dark:text-stone-400 dark:hover:text-stone-200'
          )}
        >
          <Moon className={cn(
            'h-4 w-4 transition-transform duration-300',
            theme === 'dark' && 'animate-[spin_0.5s_ease-out]'
          )} />
          <span className="hidden sm:inline">Dark</span>
        </button>

        {/* System button */}
        {showSystem && (
          <button
            onClick={() => setTheme('system')}
            className={cn(
              'relative z-10 flex flex-1 items-center justify-center gap-2 rounded-lg py-2 px-3',
              'text-sm font-medium transition-colors duration-200',
              theme === 'system'
                ? 'text-amber-600 dark:text-amber-400'
                : 'text-stone-500 hover:text-stone-700 dark:text-stone-400 dark:hover:text-stone-200'
            )}
          >
            <Monitor className="h-4 w-4" />
            <span className="hidden sm:inline">Auto</span>
          </button>
        )}
      </div>
    </div>
  );
}

/**
 * Celestial Theme Toggle - A premium animated toggle with sun/moon transition
 * For a more dramatic, memorable visual effect
 */
export function CelestialThemeToggle({ className }: { className?: string }) {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className={cn('h-8 w-16 animate-pulse rounded-full bg-stone-200', className)} />;
  }

  const isDark = resolvedTheme === 'dark';

  return (
    <button
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className={cn(
        'group relative h-8 w-16 rounded-full transition-all duration-500 ease-out',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2',
        isDark
          ? 'bg-gradient-to-r from-indigo-950 via-slate-900 to-slate-950'
          : 'bg-gradient-to-r from-amber-200 via-orange-200 to-amber-300',
        className
      )}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
    >
      {/* Stars (visible in dark mode) */}
      <div className={cn(
        'absolute inset-0 overflow-hidden rounded-full transition-opacity duration-500',
        isDark ? 'opacity-100' : 'opacity-0'
      )}>
        <div className="absolute h-0.5 w-0.5 rounded-full bg-white top-2 left-3 animate-pulse" />
        <div className="absolute h-1 w-1 rounded-full bg-white/80 top-4 left-6 animate-pulse delay-100" />
        <div className="absolute h-0.5 w-0.5 rounded-full bg-white/60 top-2 left-9 animate-pulse delay-200" />
        <div className="absolute h-0.5 w-0.5 rounded-full bg-white/70 top-5 left-4 animate-pulse delay-300" />
      </div>

      {/* Clouds (visible in light mode) */}
      <div className={cn(
        'absolute inset-0 overflow-hidden rounded-full transition-opacity duration-500',
        isDark ? 'opacity-0' : 'opacity-100'
      )}>
        <div className="absolute h-2 w-4 rounded-full bg-white/50 top-2 left-2 blur-[1px]" />
        <div className="absolute h-1.5 w-3 rounded-full bg-white/40 top-4 left-5 blur-[1px]" />
      </div>

      {/* Sun/Moon orb */}
      <div
        className={cn(
          'absolute top-1 h-6 w-6 rounded-full transition-all duration-500 ease-out',
          'shadow-lg',
          isDark
            ? 'left-9 bg-gradient-to-br from-slate-200 via-slate-100 to-slate-300 shadow-slate-400/30'
            : 'left-1 bg-gradient-to-br from-amber-300 via-yellow-300 to-orange-400 shadow-amber-500/50'
        )}
      >
        {/* Moon craters (visible in dark mode) */}
        <div className={cn(
          'absolute inset-0 transition-opacity duration-500',
          isDark ? 'opacity-100' : 'opacity-0'
        )}>
          <div className="absolute h-1.5 w-1.5 rounded-full bg-slate-300 top-1 left-1" />
          <div className="absolute h-1 w-1 rounded-full bg-slate-300/70 top-3 left-3" />
          <div className="absolute h-0.5 w-0.5 rounded-full bg-slate-300/50 top-2 left-4" />
        </div>

        {/* Sun rays (visible in light mode) */}
        <div className={cn(
          'absolute inset-0 transition-opacity duration-500',
          isDark ? 'opacity-0' : 'opacity-100'
        )}>
          <div className="absolute -inset-1 rounded-full bg-amber-400/30 animate-pulse" />
        </div>
      </div>
    </button>
  );
}
