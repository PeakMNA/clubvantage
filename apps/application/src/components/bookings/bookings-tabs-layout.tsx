'use client';

import { useState, type ReactNode } from 'react';
import { cn } from '@clubvantage/ui';
import {
  Calendar,
  Building2,
  Sparkles,
  Users,
  Wrench,
  Clock,
} from 'lucide-react';

export type BookingsTab =
  | 'calendar'
  | 'facilities'
  | 'services'
  | 'staff'
  | 'equipment'
  | 'waitlist';

interface BookingsTabsLayoutProps {
  activeTab?: BookingsTab;
  onTabChange?: (tab: BookingsTab) => void;
  defaultTab?: BookingsTab;
  children?: ReactNode;
  renderContent?: (activeTab: BookingsTab) => ReactNode;
}

const tabs: Array<{
  id: BookingsTab;
  label: string;
  icon: typeof Calendar;
}> = [
  { id: 'calendar', label: 'Calendar', icon: Calendar },
  { id: 'facilities', label: 'Facilities', icon: Building2 },
  { id: 'services', label: 'Services', icon: Sparkles },
  { id: 'staff', label: 'Staff', icon: Users },
  { id: 'equipment', label: 'Equipment', icon: Wrench },
  { id: 'waitlist', label: 'Waitlist', icon: Clock },
];

export function BookingsTabsLayout({
  activeTab: controlledActiveTab,
  onTabChange,
  defaultTab = 'calendar',
  children,
  renderContent,
}: BookingsTabsLayoutProps) {
  const [internalActiveTab, setInternalActiveTab] =
    useState<BookingsTab>(defaultTab);

  const isControlled = controlledActiveTab !== undefined;
  const activeTab = isControlled ? controlledActiveTab : internalActiveTab;

  const setActiveTab = (tab: BookingsTab) => {
    if (isControlled) {
      onTabChange?.(tab);
    } else {
      setInternalActiveTab(tab);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      const nextIndex = (index + 1) % tabs.length;
      const nextTab = tabs[nextIndex];
      if (nextTab) setActiveTab(nextTab.id);
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      const prevIndex = (index - 1 + tabs.length) % tabs.length;
      const prevTab = tabs[prevIndex];
      if (prevTab) setActiveTab(prevTab.id);
    }
  };

  return (
    <div className="flex h-full min-h-0 flex-col">
      {/* Tab Navigation - Underline Style */}
      <div className="relative shrink-0 border-b border-border">
        {/* Tab container with horizontal scroll on mobile */}
        <div className="relative -mb-px">
          <nav
            className="flex gap-1 overflow-x-auto px-1 scrollbar-hide sm:gap-2"
            role="tablist"
            aria-label="Bookings management tabs"
          >
            {tabs.map((tab, index) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  role="tab"
                  aria-selected={isActive}
                  aria-controls={`panel-${tab.id}`}
                  id={`tab-${tab.id}`}
                  tabIndex={isActive ? 0 : -1}
                  onClick={() => setActiveTab(tab.id)}
                  onKeyDown={(e) => handleKeyDown(e, index)}
                  className={cn(
                    'group relative flex items-center gap-1.5 whitespace-nowrap px-3 py-3 text-sm font-medium transition-all duration-200 sm:gap-2 sm:px-4',
                    'focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/40 focus-visible:ring-offset-2',
                    isActive
                      ? 'text-amber-600 dark:text-amber-400'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  <Icon
                    className={cn(
                      'h-4 w-4 shrink-0 transition-colors duration-200',
                      isActive
                        ? 'text-amber-600 dark:text-amber-400'
                        : 'text-muted-foreground group-hover:text-foreground'
                    )}
                  />
                  <span>{tab.label}</span>

                  {/* Active indicator - bottom border */}
                  <span
                    className={cn(
                      'absolute inset-x-0 -bottom-px h-0.5 rounded-full transition-all duration-200',
                      isActive
                        ? 'bg-amber-500'
                        : 'bg-transparent group-hover:bg-muted'
                    )}
                  />
                </button>
              );
            })}
          </nav>
        </div>

        {/* Fade edges for scroll indication on mobile */}
        <div className="pointer-events-none absolute inset-y-0 left-0 w-6 bg-gradient-to-r from-background to-transparent sm:hidden" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-6 bg-gradient-to-l from-background to-transparent sm:hidden" />
      </div>

      {/* Content Area */}
      <div
        className="mt-0 flex-1 overflow-auto"
        role="tabpanel"
        id={`panel-${activeTab}`}
        aria-labelledby={`tab-${activeTab}`}
      >
        {renderContent ? renderContent(activeTab) : children}
      </div>
    </div>
  );
}

export function useBookingsTab() {
  const [activeTab, setActiveTab] = useState<BookingsTab>('calendar');
  return { activeTab, setActiveTab };
}
