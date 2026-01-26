'use client';

import * as React from 'react';
import { Menu } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Header } from './header';
import { Sidebar, MobileSidebar } from './sidebar';

/**
 * Tenant Admin Portal App Shell
 *
 * Simpler layout than Platform Manager:
 * - Fixed header (64px) with tenant branding
 * - Fixed sidebar (240px, no collapse option)
 * - Scrollable main content area
 *
 * Responsive behavior:
 * - lg+: Full sidebar visible
 * - md: Sidebar as drawer (hamburger menu)
 * - sm: Mobile warning but allows access
 */

interface TenantConfig {
  name: string;
  logoUrl?: string;
  primaryColor?: string;
  secondaryColor?: string;
  accentColor?: string;
}

interface AppShellUser {
  name: string;
  email: string;
  role: string;
}

interface AppShellProps {
  children: React.ReactNode;
  tenant?: TenantConfig;
  user?: AppShellUser;
  onLogout?: () => void;
}

export function AppShell({ children, tenant, user, onLogout }: AppShellProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  // Apply tenant branding colors as CSS variables
  React.useEffect(() => {
    if (tenant?.primaryColor) {
      document.documentElement.style.setProperty(
        '--tenant-primary',
        tenant.primaryColor
      );
    }
    if (tenant?.secondaryColor) {
      document.documentElement.style.setProperty(
        '--tenant-secondary',
        tenant.secondaryColor
      );
    }
    if (tenant?.accentColor) {
      document.documentElement.style.setProperty(
        '--tenant-accent',
        tenant.accentColor
      );
    }

    // Cleanup on unmount
    return () => {
      document.documentElement.style.removeProperty('--tenant-primary');
      document.documentElement.style.removeProperty('--tenant-secondary');
      document.documentElement.style.removeProperty('--tenant-accent');
    };
  }, [tenant]);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <Header tenant={tenant} user={user} onLogout={onLogout} />

      {/* Mobile Menu Button (md and below) */}
      <button
        onClick={() => setMobileMenuOpen(true)}
        className="fixed left-4 top-20 z-20 lg:hidden flex items-center justify-center h-10 w-10 rounded-lg bg-white border border-slate-200 shadow-sm hover:bg-slate-50 transition-colors"
      >
        <Menu className="h-5 w-5 text-slate-600" />
      </button>

      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      {/* Mobile Sidebar */}
      {mobileMenuOpen && (
        <MobileSidebar onClose={() => setMobileMenuOpen(false)} />
      )}

      {/* Main Content */}
      <main className="min-h-screen pt-16 lg:pl-60">
        <div className="mx-auto max-w-6xl p-6 lg:p-8">
          {children}
        </div>
      </main>

      {/* Mobile Info Banner (sm screens) */}
      <div className="fixed bottom-0 left-0 right-0 bg-blue-50 border-t border-blue-200 px-4 py-3 text-center sm:hidden">
        <p className="text-sm text-blue-800">
          For the best experience, use a tablet or desktop device.
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
        <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
        {description && (
          <p className="mt-1 text-sm text-slate-500">{description}</p>
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
            <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
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
