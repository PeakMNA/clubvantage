'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Building2,
  Plus,
  AlertTriangle,
  Users,
  Lightbulb,
  MessageSquare,
  DollarSign,
  Receipt,
  Activity,
  FileText,
  UserCog,
  ChevronLeft,
  ChevronRight,
  ToggleLeft,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

/**
 * Platform Manager Sidebar
 *
 * Navigation structure:
 * - Dashboard
 * - TENANTS: All Tenants, New Tenant, At Risk
 * - WAITLIST: Queue (with pending count)
 * - FEATURES: Roadmap, Suggestions (with pending count)
 * - BILLING: Revenue, Invoices
 * - PLATFORM: Health, Audit Logs
 * - SUPPORT: Impersonation
 */

interface NavSection {
  title?: string;
  items: NavItem[];
}

interface NavItem {
  id: string;
  label: string;
  href: string;
  icon: React.ElementType;
  badge?: number;
}

const navigation: NavSection[] = [
  {
    items: [
      { id: 'dashboard', label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    ],
  },
  {
    title: 'TENANTS',
    items: [
      { id: 'tenants', label: 'All Tenants', href: '/tenants', icon: Building2 },
      { id: 'tenants-new', label: 'New Tenant', href: '/tenants/new', icon: Plus },
      { id: 'tenants-at-risk', label: 'At Risk', href: '/tenants/at-risk', icon: AlertTriangle },
    ],
  },
  {
    title: 'WAITLIST',
    items: [
      { id: 'waitlist', label: 'Queue', href: '/waitlist', icon: Users, badge: 12 },
    ],
  },
  {
    title: 'FEATURES',
    items: [
      { id: 'features-flags', label: 'Feature Flags', href: '/features', icon: ToggleLeft },
      { id: 'features-roadmap', label: 'Roadmap', href: '/features/roadmap', icon: Lightbulb },
      { id: 'features-suggestions', label: 'Suggestions', href: '/features/suggestions', icon: MessageSquare, badge: 5 },
    ],
  },
  {
    title: 'BILLING',
    items: [
      { id: 'billing-revenue', label: 'Revenue', href: '/billing/revenue', icon: DollarSign },
      { id: 'billing-invoices', label: 'Invoices', href: '/billing/invoices', icon: Receipt },
    ],
  },
  {
    title: 'PLATFORM',
    items: [
      { id: 'platform-health', label: 'Health', href: '/platform/health', icon: Activity },
      { id: 'platform-audit', label: 'Audit Logs', href: '/platform/audit', icon: FileText },
    ],
  },
  {
    title: 'SUPPORT',
    items: [
      { id: 'support-impersonation', label: 'Impersonation', href: '/support/impersonation', icon: UserCog },
    ],
  },
];

interface SidebarProps {
  collapsed: boolean;
  onCollapsedChange: (collapsed: boolean) => void;
}

export function Sidebar({ collapsed, onCollapsedChange }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        'fixed left-0 top-16 bottom-0 z-30 flex flex-col bg-white border-r border-slate-200 transition-all duration-200',
        collapsed ? 'w-16' : 'w-60'
      )}
    >
      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 scrollbar-thin">
        {navigation.map((section, sectionIndex) => (
          <div key={sectionIndex} className={cn('mb-4', sectionIndex > 0 && 'mt-2')}>
            {/* Section Title */}
            {section.title && !collapsed && (
              <h3 className="px-4 mb-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                {section.title}
              </h3>
            )}

            {/* Section Separator for collapsed mode */}
            {section.title && collapsed && sectionIndex > 0 && (
              <div className="mx-3 my-2 border-t border-slate-200" />
            )}

            {/* Nav Items */}
            <ul className="space-y-1 px-2">
              {section.items.map((item) => {
                const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
                const Icon = item.icon;

                return (
                  <li key={item.id}>
                    <Link
                      href={item.href}
                      className={cn(
                        'flex items-center gap-3 rounded px-3 py-2 text-sm font-medium transition-colors',
                        isActive
                          ? 'bg-blue-50 text-blue-700 border-l-2 border-blue-600 -ml-0.5 pl-[calc(0.75rem-2px)]'
                          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900',
                        collapsed && 'justify-center px-2'
                      )}
                      title={collapsed ? item.label : undefined}
                    >
                      <Icon
                        className={cn(
                          'h-5 w-5 shrink-0',
                          isActive ? 'text-blue-600' : 'text-slate-400'
                        )}
                      />
                      {!collapsed && (
                        <>
                          <span className="flex-1">{item.label}</span>
                          {item.badge !== undefined && item.badge > 0 && (
                            <span
                              className={cn(
                                'flex h-5 min-w-[20px] items-center justify-center rounded-full px-1.5 text-xs font-semibold',
                                isActive
                                  ? 'bg-blue-600 text-white'
                                  : 'bg-blue-100 text-blue-700'
                              )}
                            >
                              {item.badge > 99 ? '99+' : item.badge}
                            </span>
                          )}
                        </>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Collapse Toggle */}
      <div className="border-t border-slate-200 p-2">
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            'w-full justify-center text-slate-500 hover:text-slate-900',
            !collapsed && 'justify-start'
          )}
          onClick={() => onCollapsedChange(!collapsed)}
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <>
              <ChevronLeft className="h-4 w-4 mr-2" />
              <span>Collapse</span>
            </>
          )}
        </Button>
      </div>
    </aside>
  );
}

// For mobile drawer
export function MobileSidebar({ onClose }: { onClose: () => void }) {
  const pathname = usePathname();

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50"
        onClick={onClose}
      />

      {/* Sidebar */}
      <aside className="fixed left-0 top-0 bottom-0 w-72 bg-white shadow-xl animate-slide-in-from-right">
        {/* Header */}
        <div className="flex h-16 items-center justify-between border-b border-slate-200 px-4">
          <span className="text-lg font-semibold text-slate-900">Platform Manager</span>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <ChevronLeft className="h-5 w-5" />
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 scrollbar-thin">
          {navigation.map((section, sectionIndex) => (
            <div key={sectionIndex} className="mb-4">
              {section.title && (
                <h3 className="px-4 mb-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  {section.title}
                </h3>
              )}
              <ul className="space-y-1 px-2">
                {section.items.map((item) => {
                  const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
                  const Icon = item.icon;

                  return (
                    <li key={item.id}>
                      <Link
                        href={item.href}
                        onClick={onClose}
                        className={cn(
                          'flex items-center gap-3 rounded px-3 py-2 text-sm font-medium transition-colors',
                          isActive
                            ? 'bg-blue-50 text-blue-700 border-l-2 border-blue-600 -ml-0.5 pl-[calc(0.75rem-2px)]'
                            : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                        )}
                      >
                        <Icon
                          className={cn(
                            'h-5 w-5 shrink-0',
                            isActive ? 'text-blue-600' : 'text-slate-400'
                          )}
                        />
                        <span className="flex-1">{item.label}</span>
                        {item.badge !== undefined && item.badge > 0 && (
                          <span
                            className={cn(
                              'flex h-5 min-w-[20px] items-center justify-center rounded-full px-1.5 text-xs font-semibold',
                              isActive
                                ? 'bg-blue-600 text-white'
                                : 'bg-blue-100 text-blue-700'
                            )}
                          >
                            {item.badge > 99 ? '99+' : item.badge}
                          </span>
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>
      </aside>
    </div>
  );
}
