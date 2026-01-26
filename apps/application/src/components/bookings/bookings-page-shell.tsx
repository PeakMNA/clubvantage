'use client';

import { useState, type ReactNode } from 'react';
import { Plus, ChevronDown } from 'lucide-react';
import { cn, Button, PageHeader } from '@clubvantage/ui';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@clubvantage/ui';
import {
  BookingsTabsLayout,
  type BookingsTab,
} from './bookings-tabs-layout';
import { BookingsSubheader } from './bookings-subheader';

type ViewMode = 'day' | 'week';

interface Outlet {
  id: string;
  name: string;
}

interface BookingsPageShellProps {
  /** Currently selected outlet ID */
  selectedOutlet?: string;
  /** Callback when outlet changes */
  onOutletChange?: (outletId: string) => void;
  /** Available outlets */
  outlets?: Outlet[];
  /** Callback when "New Booking" is clicked */
  onNewBooking?: () => void;
  /** Render function for each tab's content */
  renderTabContent?: (tab: BookingsTab) => ReactNode;
  /** Custom className for the shell */
  className?: string;
}

const defaultOutlets: Outlet[] = [
  { id: 'all', name: 'All Outlets' },
  { id: 'tennis', name: 'Tennis Courts' },
  { id: 'pool', name: 'Swimming Pool' },
  { id: 'spa', name: 'Spa & Wellness' },
  { id: 'banquet', name: 'Banquet Hall' },
];

export function BookingsPageShell({
  selectedOutlet = 'all',
  onOutletChange,
  outlets = defaultOutlets,
  onNewBooking,
  renderTabContent,
  className,
}: BookingsPageShellProps) {
  const [activeTab, setActiveTab] = useState<BookingsTab>('calendar');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>('day');
  const [activeFilterCount, setActiveFilterCount] = useState(0);

  const selectedOutletName =
    outlets.find((o) => o.id === selectedOutlet)?.name ?? 'All Outlets';

  const handleFilterClick = () => {
    // Placeholder - filter modal would open here
    console.log('Open filters');
  };

  return (
    <div className={cn('flex h-full flex-col', className)}>
      {/* Header - Fixed Height: 64px */}
      <div className="shrink-0 border-b border-border bg-background px-4 sm:px-6">
        <div className="flex h-16 items-center justify-between">
          {/* Left: Title */}
          <h1 className="text-xl font-semibold text-foreground sm:text-2xl">
            Bookings
          </h1>

          {/* Right: Actions */}
          <div className="flex items-center gap-3">
            {/* Outlet Selector */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <span className="max-w-[120px] truncate sm:max-w-none">
                    {selectedOutletName}
                  </span>
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                {outlets.map((outlet) => (
                  <DropdownMenuItem
                    key={outlet.id}
                    onClick={() => onOutletChange?.(outlet.id)}
                    className={cn(
                      outlet.id === selectedOutlet &&
                        'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400'
                    )}
                  >
                    {outlet.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* New Booking Button */}
            <Button onClick={onNewBooking} className="gap-2">
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">New Booking</span>
              <span className="sm:hidden">New</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Tabs - Fixed Height: 48px */}
      <div className="shrink-0 bg-background">
        <BookingsTabsLayout
          activeTab={activeTab}
          onTabChange={setActiveTab}
          renderContent={(tab) => (
            <>
              {/* Sub-header - Only visible on Calendar tab - Fixed Height: 56px */}
              {tab === 'calendar' && (
                <BookingsSubheader
                  currentDate={currentDate}
                  onDateChange={setCurrentDate}
                  viewMode={viewMode}
                  onViewModeChange={setViewMode}
                  activeFilterCount={activeFilterCount}
                  onFilterClick={handleFilterClick}
                />
              )}

              {/* Main Content Area - Remaining Height */}
              <div className="flex-1 overflow-auto p-4 sm:p-6">
                {renderTabContent ? (
                  renderTabContent(tab)
                ) : (
                  <TabContentPlaceholder tab={tab} />
                )}
              </div>
            </>
          )}
        />
      </div>
    </div>
  );
}

/** Placeholder component for tab content during development */
function TabContentPlaceholder({ tab }: { tab: BookingsTab }) {
  const placeholderContent: Record<BookingsTab, { title: string; description: string }> = {
    calendar: {
      title: 'Booking Calendar',
      description: 'View and manage all bookings in a calendar view',
    },
    facilities: {
      title: 'Facilities',
      description: 'Manage bookable facilities like courts, rooms, and spaces',
    },
    services: {
      title: 'Services',
      description: 'Configure bookable services like lessons and sessions',
    },
    staff: {
      title: 'Staff',
      description: 'Manage staff availability and scheduling',
    },
    equipment: {
      title: 'Equipment',
      description: 'Track and manage bookable equipment',
    },
    waitlist: {
      title: 'Waitlist',
      description: 'View and manage booking waitlist entries',
    },
  };

  const content = placeholderContent[tab];

  return (
    <div className="flex h-full min-h-[400px] flex-col items-center justify-center rounded-xl border-2 border-dashed border-border bg-muted/30">
      <div className="text-center">
        <h3 className="text-lg font-medium text-foreground">{content.title}</h3>
        <p className="mt-1 text-sm text-muted-foreground">{content.description}</p>
        <p className="mt-4 text-xs text-muted-foreground/70">
          Content placeholder - implement in next prompts
        </p>
      </div>
    </div>
  );
}
