'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Header } from './header';
import { Sidebar, MobileSidebar } from './sidebar';

/**
 * Platform Manager App Shell
 *
 * Main layout wrapper that combines:
 * - Fixed header (64px)
 * - Fixed sidebar (240px, collapsible to 64px)
 * - Scrollable main content area
 *
 * Responsive behavior:
 * - lg+: Sidebar visible, collapsible via toggle
 * - md: Sidebar hidden, hamburger menu
 * - sm: "Desktop recommended" message
 */

interface AppShellUser {
  name: string;
  email: string;
  role: string;
}

interface AppShellProps {
  children: React.ReactNode;
  user?: AppShellUser;
  onLogout?: () => void;
}

const SIDEBAR_COLLAPSED_KEY = 'platform-manager-sidebar-collapsed';

export function AppShell({ children, user, onLogout }: AppShellProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  // Load sidebar state from localStorage
  React.useEffect(() => {
    const stored = localStorage.getItem(SIDEBAR_COLLAPSED_KEY);
    if (stored !== null) {
      setSidebarCollapsed(stored === 'true');
    }
  }, []);

  // Save sidebar state to localStorage
  const handleSidebarCollapsedChange = (collapsed: boolean) => {
    setSidebarCollapsed(collapsed);
    localStorage.setItem(SIDEBAR_COLLAPSED_KEY, String(collapsed));
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <Header
        onMobileMenuClick={() => setMobileMenuOpen(true)}
        user={user}
        onLogout={onLogout}
      />

      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <Sidebar
          collapsed={sidebarCollapsed}
          onCollapsedChange={handleSidebarCollapsedChange}
        />
      </div>

      {/* Mobile Sidebar */}
      {mobileMenuOpen && (
        <MobileSidebar onClose={() => setMobileMenuOpen(false)} />
      )}

      {/* Main Content */}
      <main
        className={cn(
          'min-h-screen pt-16 transition-all duration-200',
          // Desktop sidebar margin
          'lg:pl-60',
          sidebarCollapsed && 'lg:pl-16'
        )}
      >
        <div className="mx-auto max-w-7xl p-6 lg:p-8">
          {children}
        </div>
      </main>

      {/* Mobile Warning (sm screens) */}
      <div className="fixed bottom-0 left-0 right-0 bg-amber-50 border-t border-amber-200 px-4 py-3 text-center sm:hidden">
        <p className="text-sm text-amber-800">
          For the best experience, use Platform Manager on a desktop or tablet device.
        </p>
      </div>
    </div>
  );
}

// Page header component for consistent page titles
interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
}

export function PageHeader({ title, description, actions }: PageHeaderProps) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-h1 text-slate-900">{title}</h1>
        {description && (
          <p className="mt-1 text-body text-slate-500">{description}</p>
        )}
      </div>
      {actions && <div className="flex items-center gap-3">{actions}</div>}
    </div>
  );
}

// Section component for content organization
interface SectionProps {
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

export function Section({ title, description, children, className }: SectionProps) {
  return (
    <section className={cn('space-y-4', className)}>
      {(title || description) && (
        <div>
          {title && (
            <h2 className="text-h3 text-slate-900">{title}</h2>
          )}
          {description && (
            <p className="mt-1 text-sm text-slate-500">{description}</p>
          )}
        </div>
      )}
      {children}
    </section>
  );
}
