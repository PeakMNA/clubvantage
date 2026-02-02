'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  LayoutDashboard,
  Users,
  UserCog,
  Receipt,
  Calendar,
  Flag,
  BarChart3,
  Settings,
  HelpCircle,
  ShoppingCart,
  Store,
  LayoutTemplate,
  ClipboardList,
  CreditCard,
  FileBarChart,
  type LucideIcon,
} from 'lucide-react';
import { cn, Button } from '@clubvantage/ui';
import { ThemeToggle, CelestialThemeToggle } from '@/components/theme';

interface NavItem {
  label: string;
  icon: LucideIcon;
  href: string;
  badge?: number;
  children?: NavItem[];
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
  {
    label: 'POS',
    icon: ShoppingCart,
    href: '/pos',
    children: [
      { label: 'Sales', icon: CreditCard, href: '/pos/sales' },
      { label: 'Open Tickets', icon: ClipboardList, href: '/pos/open-tickets' },
      { label: 'Transactions', icon: Receipt, href: '/pos/transactions' },
      { label: 'Reports', icon: FileBarChart, href: '/pos/reports' },
      { label: 'Outlets', icon: Store, href: '/pos/outlets' },
      { label: 'Templates', icon: LayoutTemplate, href: '/pos/templates' },
    ],
  },
  { label: 'Reports', icon: BarChart3, href: '/reports' },
];

const footerNavigation: NavItem[] = [
  { label: 'Users', icon: UserCog, href: '/users' },
  { label: 'Settings', icon: Settings, href: '/settings' },
  { label: 'Help', icon: HelpCircle, href: '/help' },
];

export function Sidebar({ collapsed, onToggle, currentPath }: SidebarProps) {
  const [expandedItems, setExpandedItems] = React.useState<string[]>(['/pos']);

  const isActive = (href: string) => {
    if (href === '/') return currentPath === '/';
    return currentPath.startsWith(href);
  };

  const toggleExpanded = (href: string) => {
    setExpandedItems((prev) =>
      prev.includes(href) ? prev.filter((h) => h !== href) : [...prev, href]
    );
  };

  const isExpanded = (href: string) => expandedItems.includes(href);

  // Auto-expand parent when child is active
  React.useEffect(() => {
    navigation.forEach((item) => {
      if (item.children) {
        const childIsActive = item.children.some((child) => {
          if (child.href === '/') return currentPath === '/';
          return currentPath.startsWith(child.href);
        });
        if (childIsActive) {
          setExpandedItems((prev) =>
            prev.includes(item.href) ? prev : [...prev, item.href]
          );
        }
      }
    });
  }, [currentPath]);

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
              {item.children ? (
                // Expandable nav item
                <div>
                  <button
                    onClick={() => toggleExpanded(item.href)}
                    className={cn(
                      'flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                      isActive(item.href)
                        ? 'bg-primary/10 text-primary'
                        : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                      collapsed && 'justify-center px-2'
                    )}
                    title={collapsed ? item.label : undefined}
                  >
                    <item.icon className="h-5 w-5 shrink-0" />
                    {!collapsed && (
                      <>
                        <span className="flex-1 text-left">{item.label}</span>
                        <ChevronDown
                          className={cn(
                            'h-4 w-4 transition-transform',
                            isExpanded(item.href) && 'rotate-180'
                          )}
                        />
                      </>
                    )}
                  </button>
                  {/* Sub-navigation */}
                  {!collapsed && isExpanded(item.href) && (
                    <ul className="ml-4 mt-1 space-y-1 border-l border-sidebar-border pl-3">
                      {item.children.map((child) => (
                        <li key={child.href}>
                          <Link
                            href={child.href}
                            className={cn(
                              'flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors',
                              isActive(child.href)
                                ? 'bg-primary/10 text-primary font-medium'
                                : 'text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                            )}
                          >
                            <child.icon className="h-4 w-4 shrink-0" />
                            <span>{child.label}</span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ) : (
                // Regular nav item
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
              )}
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
