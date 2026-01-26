'use client';

import * as React from 'react';
import { cn } from '../lib/utils';

export interface AppShellProps {
  /** Sidebar component */
  sidebar?: React.ReactNode;
  /** Header component */
  header?: React.ReactNode;
  /** Main content */
  children: React.ReactNode;
  /** Whether sidebar is collapsed */
  sidebarCollapsed?: boolean;
  /** Additional class names */
  className?: string;
}

export function AppShell({
  sidebar,
  header,
  children,
  sidebarCollapsed = false,
  className,
}: AppShellProps) {
  return (
    <div className={cn('flex min-h-screen bg-background', className)}>
      {/* Sidebar */}
      {sidebar && (
        <aside
          className={cn(
            'fixed inset-y-0 left-0 z-30 flex flex-col border-r bg-sidebar-background transition-all duration-300',
            sidebarCollapsed ? 'w-16' : 'w-64'
          )}
        >
          {sidebar}
        </aside>
      )}

      {/* Main content area */}
      <div
        className={cn(
          'flex flex-1 flex-col transition-all duration-300',
          sidebar && (sidebarCollapsed ? 'ml-16' : 'ml-64')
        )}
      >
        {/* Header */}
        {header && (
          <header className="sticky top-0 z-20 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            {header}
          </header>
        )}

        {/* Page content */}
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  );
}

export interface PageContainerProps {
  /** Page content */
  children: React.ReactNode;
  /** Maximum width constraint */
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  /** Additional class names */
  className?: string;
}

const maxWidthClasses = {
  sm: 'max-w-screen-sm',
  md: 'max-w-screen-md',
  lg: 'max-w-screen-lg',
  xl: 'max-w-screen-xl',
  '2xl': 'max-w-screen-2xl',
  full: 'max-w-full',
};

export function PageContainer({
  children,
  maxWidth = 'full',
  className,
}: PageContainerProps) {
  return (
    <div className={cn('mx-auto w-full px-6 py-6', maxWidthClasses[maxWidth], className)}>
      {children}
    </div>
  );
}
