'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Building2,
  Palette,
  Receipt,
  Users,
  Shield,
  CreditCard,
  FileText,
  BarChart3,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavItem {
  id: string;
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface NavSection {
  title?: string;
  items: NavItem[];
}

const navigation: NavSection[] = [
  {
    items: [
      { id: 'overview', label: 'Overview', href: '/dashboard', icon: LayoutDashboard },
    ],
  },
  {
    title: 'SETTINGS',
    items: [
      { id: 'club-info', label: 'Club Info', href: '/settings/club', icon: Building2 },
      { id: 'branding', label: 'Branding', href: '/settings/branding', icon: Palette },
      { id: 'tax', label: 'Tax Settings', href: '/settings/tax', icon: Receipt },
    ],
  },
  {
    title: 'USERS',
    items: [
      { id: 'staff', label: 'Staff', href: '/users/staff', icon: Users },
      { id: 'roles', label: 'Roles', href: '/users/roles', icon: Shield },
    ],
  },
  {
    title: 'BILLING',
    items: [
      { id: 'plan', label: 'Plan', href: '/billing/plan', icon: CreditCard },
      { id: 'invoices', label: 'Invoices', href: '/billing/invoices', icon: FileText },
      { id: 'payment', label: 'Payment', href: '/billing/payment', icon: CreditCard },
    ],
  },
  {
    title: 'ANALYTICS',
    items: [
      { id: 'reports', label: 'Reports', href: '/reports', icon: BarChart3 },
    ],
  },
];

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        'fixed left-0 top-16 bottom-0 w-60 bg-white border-r border-slate-200 overflow-y-auto scrollbar-thin',
        className
      )}
    >
      <nav className="p-4 space-y-6">
        {navigation.map((section, sectionIdx) => (
          <div key={sectionIdx}>
            {section.title && (
              <h3 className="mb-2 px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                {section.title}
              </h3>
            )}
            <ul className="space-y-1">
              {section.items.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                const Icon = item.icon;

                return (
                  <li key={item.id}>
                    <Link
                      href={item.href}
                      className={cn(
                        'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                        isActive
                          ? 'bg-blue-50 text-blue-700 border-l-2 border-blue-600 -ml-0.5 pl-[calc(0.75rem+2px)]'
                          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                      )}
                    >
                      <Icon className="h-5 w-5 flex-shrink-0" />
                      <span>{item.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>
    </aside>
  );
}

// Mobile Sidebar Drawer
interface MobileSidebarProps {
  onClose: () => void;
}

export function MobileSidebar({ onClose }: MobileSidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Drawer */}
      <aside className="fixed left-0 top-0 bottom-0 z-50 w-72 bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
              <Building2 className="h-4 w-4 text-white" />
            </div>
            <span className="font-semibold text-slate-900">Admin Portal</span>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="h-5 w-5 text-slate-500" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-6 overflow-y-auto h-[calc(100%-4rem)]">
          {navigation.map((section, sectionIdx) => (
            <div key={sectionIdx}>
              {section.title && (
                <h3 className="mb-2 px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  {section.title}
                </h3>
              )}
              <ul className="space-y-1">
                {section.items.map((item) => {
                  const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                  const Icon = item.icon;

                  return (
                    <li key={item.id}>
                      <Link
                        href={item.href}
                        onClick={onClose}
                        className={cn(
                          'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                          isActive
                            ? 'bg-blue-50 text-blue-700'
                            : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                        )}
                      >
                        <Icon className="h-5 w-5 flex-shrink-0" />
                        <span>{item.label}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>
      </aside>
    </>
  );
}
