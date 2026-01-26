'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  Users,
  UserCog,
  Receipt,
  Calendar,
  Flag,
  BarChart3,
  Settings,
  HelpCircle,
  type LucideIcon,
} from 'lucide-react';
import { cn, Button } from '@clubvantage/ui';
import { ThemeToggle, CelestialThemeToggle } from '@/components/theme';

interface NavItem {
  label: string;
  icon: LucideIcon;
  href: string;
  badge?: number;
}

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  currentPath: string;
}

const navigation: NavItem[] = [
  { label: 'Dashboard', icon: LayoutDashboard, href: '/' },
  { label: 'Members', icon: Users, href: '/members' },
  { label: 'Billing', icon: Receipt, href: '/billing' },
  { label: 'Facility', icon: Calendar, href: '/facility' },
  { label: 'Golf', icon: Flag, href: '/golf' },
  { label: 'Reports', icon: BarChart3, href: '/reports' },
];

const footerNavigation: NavItem[] = [
  { label: 'Users', icon: UserCog, href: '/users' },
  { label: 'Settings', icon: Settings, href: '/settings' },
  { label: 'Help', icon: HelpCircle, href: '/help' },
];

export function Sidebar({ collapsed, onToggle, currentPath }: SidebarProps) {
  const isActive = (href: string) => {
    if (href === '/') return currentPath === '/';
    return currentPath.startsWith(href);
  };

  return (
    <div className="flex h-full flex-col bg-sidebar-background text-sidebar-foreground">
      {/* Logo */}
      <div className="flex h-16 items-center justify-between border-b px-4">
        {!collapsed && (
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <span className="text-lg font-bold text-primary-foreground">C</span>
            </div>
            <span className="font-semibold">ClubVantage</span>
          </Link>
        )}
        {collapsed && (
          <Link href="/" className="mx-auto flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <span className="text-lg font-bold text-primary-foreground">C</span>
          </Link>
        )}
      </div>

      {/* Main navigation */}
      <nav className="flex-1 overflow-y-auto p-2">
        <ul className="space-y-1">
          {navigation.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                  isActive(item.href)
                    ? 'bg-primary/10 text-primary border-l-2 border-primary'
                    : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                  collapsed && 'justify-center px-2'
                )}
                title={collapsed ? item.label : undefined}
              >
                <item.icon className="h-5 w-5 shrink-0" />
                {!collapsed && (
                  <>
                    <span className="flex-1">{item.label}</span>
                    {item.badge !== undefined && item.badge > 0 && (
                      <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-primary px-1.5 text-xs font-medium text-primary-foreground">
                        {item.badge > 99 ? '99+' : item.badge}
                      </span>
                    )}
                  </>
                )}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* Footer navigation */}
      <nav className="border-t border-sidebar-border p-2">
        <ul className="space-y-1">
          {footerNavigation.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                  isActive(item.href)
                    ? 'bg-primary/10 text-primary'
                    : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                  collapsed && 'justify-center px-2'
                )}
                title={collapsed ? item.label : undefined}
              >
                <item.icon className="h-5 w-5 shrink-0" />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            </li>
          ))}
        </ul>

        {/* Theme Toggle */}
        <div className={cn(
          'mt-3 pt-3 border-t border-sidebar-border',
          collapsed ? 'flex justify-center' : ''
        )}>
          {collapsed ? (
            <ThemeToggle compact />
          ) : (
            <ThemeToggle />
          )}
        </div>

        {/* Collapse toggle */}
        <div className="mt-3 pt-3 border-t border-sidebar-border">
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggle}
            className={cn(
              'w-full text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
              collapsed && 'px-2'
            )}
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
      </nav>
    </div>
  );
}
