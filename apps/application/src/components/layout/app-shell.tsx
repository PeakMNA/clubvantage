'use client';

import * as React from 'react';
import { Menu, X } from 'lucide-react';
import { cn, Button } from '@clubvantage/ui';

interface AppShellProps {
  sidebar?: React.ReactNode;
  header?: React.ReactNode;
  children: React.ReactNode;
  sidebarCollapsed?: boolean;
  onSidebarToggle?: () => void;
}

export function AppShell({
  sidebar,
  header,
  children,
  sidebarCollapsed = false,
  onSidebarToggle,
}: AppShellProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  // Close mobile menu on route change or resize
  React.useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setMobileMenuOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Prevent body scroll when mobile menu is open
  React.useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Mobile menu backdrop */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar - Desktop */}
      {sidebar && (
        <aside
          className={cn(
            'fixed inset-y-0 left-0 z-30 hidden flex-col border-r bg-sidebar-background transition-all duration-300 lg:flex',
            sidebarCollapsed ? 'w-16' : 'w-64'
          )}
        >
          {sidebar}
        </aside>
      )}

      {/* Sidebar - Mobile (slide-out drawer) */}
      {sidebar && (
        <aside
          className={cn(
            'fixed inset-y-0 left-0 z-50 w-72 flex-col border-r bg-sidebar-background transition-transform duration-300 ease-out lg:hidden',
            mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
          )}
        >
          {/* Mobile sidebar close button */}
          <div className="absolute -right-12 top-4">
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 rounded-full bg-background/90 text-foreground shadow-lg backdrop-blur-sm"
              onClick={() => setMobileMenuOpen(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
          {sidebar}
        </aside>
      )}

      {/* Main content area */}
      <div
        className={cn(
          'flex flex-1 flex-col transition-all duration-300',
          sidebar && 'lg:ml-64',
          sidebar && sidebarCollapsed && 'lg:ml-16'
        )}
      >
        {/* Header with mobile menu button */}
        {header && (
          <header className="sticky top-0 z-20 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="flex items-center">
              {/* Mobile menu trigger */}
              <Button
                variant="ghost"
                size="icon"
                className="ml-2 lg:hidden"
                onClick={() => setMobileMenuOpen(true)}
              >
                <Menu className="h-5 w-5" />
              </Button>
              <div className="flex-1">{header}</div>
            </div>
          </header>
        )}

        {/* Page content */}
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
