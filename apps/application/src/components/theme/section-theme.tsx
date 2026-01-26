'use client';

import * as React from 'react';
import { Moon, Sun, Settings2 } from 'lucide-react';
import {
  cn,
  Button,
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
} from '@clubvantage/ui';

type SectionTheme = 'inherit' | 'light' | 'dark';

interface SectionThemeContextValue {
  theme: SectionTheme;
  setTheme: (theme: SectionTheme) => void;
}

const SectionThemeContext = React.createContext<SectionThemeContextValue>({
  theme: 'inherit',
  setTheme: () => {},
});

export function useSectionTheme() {
  return React.useContext(SectionThemeContext);
}

interface SectionThemeProviderProps {
  children: React.ReactNode;
  /** Storage key for persisting section theme preference */
  storageKey?: string;
  /** Default theme for this section */
  defaultTheme?: SectionTheme;
}

/**
 * SectionThemeProvider - Allows subsections to have their own theme override
 * Wraps content in a container that can be forced to light or dark mode
 */
export function SectionThemeProvider({
  children,
  storageKey,
  defaultTheme = 'inherit',
}: SectionThemeProviderProps) {
  const [theme, setThemeState] = React.useState<SectionTheme>(defaultTheme);
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
    if (storageKey) {
      const stored = localStorage.getItem(storageKey) as SectionTheme | null;
      if (stored && ['inherit', 'light', 'dark'].includes(stored)) {
        setThemeState(stored);
      }
    }
  }, [storageKey]);

  const setTheme = React.useCallback((newTheme: SectionTheme) => {
    setThemeState(newTheme);
    if (storageKey) {
      localStorage.setItem(storageKey, newTheme);
    }
  }, [storageKey]);

  const value = React.useMemo(() => ({ theme, setTheme }), [theme, setTheme]);

  if (!mounted) {
    return <>{children}</>;
  }

  return (
    <SectionThemeContext.Provider value={value}>
      <div
        className={cn(
          theme === 'dark' && 'dark',
          theme === 'light' && 'light'
        )}
        data-section-theme={theme}
      >
        {children}
      </div>
    </SectionThemeContext.Provider>
  );
}

interface SectionThemeToggleProps {
  /** Additional class names */
  className?: string;
  /** Size of the toggle button */
  size?: 'sm' | 'md';
}

/**
 * SectionThemeToggle - A toggle button for section-level theme control
 * Must be used inside a SectionThemeProvider
 */
export function SectionThemeToggle({ className, size = 'sm' }: SectionThemeToggleProps) {
  const { theme, setTheme } = useSectionTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size={size === 'sm' ? 'icon' : 'default'}
          className={cn(
            'text-muted-foreground hover:text-foreground',
            size === 'sm' ? 'h-8 w-8' : 'h-9',
            className
          )}
        >
          <Settings2 className={cn(size === 'sm' ? 'h-4 w-4' : 'h-5 w-5')} />
          {size !== 'sm' && <span className="ml-2">View</span>}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuLabel className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          Section Theme
        </DropdownMenuLabel>
        <DropdownMenuItem
          onClick={() => setTheme('inherit')}
          className={cn(
            'flex items-center gap-2 cursor-pointer',
            theme === 'inherit' && 'bg-primary/10 text-primary'
          )}
        >
          <div className="flex h-4 w-4 items-center justify-center rounded border border-border">
            <div className="h-2 w-2 rounded-full bg-gradient-to-br from-amber-400 to-stone-600" />
          </div>
          <span>Auto (System)</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setTheme('light')}
          className={cn(
            'flex items-center gap-2 cursor-pointer',
            theme === 'light' && 'bg-primary/10 text-primary'
          )}
        >
          <Sun className="h-4 w-4 text-amber-500" />
          <span>Light</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setTheme('dark')}
          className={cn(
            'flex items-center gap-2 cursor-pointer',
            theme === 'dark' && 'bg-primary/10 text-primary'
          )}
        >
          <Moon className="h-4 w-4 text-indigo-400" />
          <span>Dark</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/**
 * ThemedSection - A wrapper component that applies a specific theme to its children
 * Useful for creating themed cards, panels, or sections
 */
interface ThemedSectionProps {
  children: React.ReactNode;
  theme?: 'light' | 'dark';
  className?: string;
}

export function ThemedSection({ children, theme, className }: ThemedSectionProps) {
  return (
    <div
      className={cn(
        'rounded-lg',
        theme === 'dark' && 'dark bg-background text-foreground',
        theme === 'light' && 'light bg-background text-foreground',
        className
      )}
    >
      {children}
    </div>
  );
}
