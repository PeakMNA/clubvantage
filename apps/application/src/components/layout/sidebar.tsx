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
  CalendarCheck,
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
  FileText,
  MapPin,
  Car,
  ListOrdered,
  Building2,
  Sparkles,
  Wrench,
  Clock,
  Shield,
  Key,
  Lock,
  Activity,
  TrendingUp,
  PieChart,
  DollarSign,
  type LucideIcon,
} from 'lucide-react';
import { cn, Button } from '@clubvantage/ui';
import { ThemeToggle } from '@/components/theme';
import { Logo, LogoIcon } from '@/components/brand';

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
  {
    label: 'Billing',
    icon: Receipt,
    href: '/billing',
    children: [
      { label: 'Invoices & Payments', icon: CreditCard, href: '/billing' },
      { label: 'AR Profiles', icon: UserCog, href: '/billing/profiles' },
      { label: 'AR Statements', icon: FileText, href: '/billing/statements' },
    ],
  },
  {
    label: 'Golf',
    icon: Flag,
    href: '/golf',
    children: [
      { label: 'Tee Sheet', icon: Calendar, href: '/golf/tee-sheet' },
      { label: 'Bookings', icon: ListOrdered, href: '/golf/bookings' },
      { label: 'Courses', icon: MapPin, href: '/golf/courses' },
      { label: 'Carts', icon: Car, href: '/golf/carts' },
      { label: 'Caddies', icon: Users, href: '/golf/caddies' },
      { label: 'Settings', icon: Settings, href: '/golf/settings' },
    ],
  },
  {
    label: 'Bookings',
    icon: CalendarCheck,
    href: '/bookings',
    children: [
      { label: 'Facility', icon: Building2, href: '/bookings/facility' },
      { label: 'Service', icon: Sparkles, href: '/bookings/service' },
      { label: 'Staff', icon: Users, href: '/bookings/staff' },
      { label: 'Bookings', icon: Calendar, href: '/bookings/list' },
      { label: 'Manage Facilities', icon: Settings, href: '/bookings/facilities' },
      { label: 'Manage Services', icon: Settings, href: '/bookings/services' },
      { label: 'Equipment', icon: Wrench, href: '/bookings/equipment' },
      { label: 'Waitlist', icon: Clock, href: '/bookings/waitlist' },
    ],
  },
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
  {
    label: 'Reports',
    icon: BarChart3,
    href: '/reports',
    children: [
      { label: 'Dashboard', icon: PieChart, href: '/reports/dashboard' },
      { label: 'Financial', icon: DollarSign, href: '/reports/financial' },
      { label: 'Revenue', icon: TrendingUp, href: '/reports/revenue' },
      { label: 'Receivables', icon: FileText, href: '/reports/receivables' },
      { label: 'WHT', icon: FileBarChart, href: '/reports/wht' },
      { label: 'Collections', icon: CreditCard, href: '/reports/collections' },
      { label: 'Membership', icon: Users, href: '/reports/membership' },
    ],
  },
];

const footerNavigation: NavItem[] = [
  {
    label: 'Users',
    icon: UserCog,
    href: '/users',
    children: [
      { label: 'Users', icon: Users, href: '/users/list' },
      { label: 'Roles', icon: Shield, href: '/users/roles' },
      { label: 'Permissions', icon: Key, href: '/users/permissions' },
      { label: 'Security', icon: Lock, href: '/users/security' },
      { label: 'Activity', icon: Activity, href: '/users/activity' },
    ],
  },
  { label: 'Settings', icon: Settings, href: '/settings' },
  { label: 'Help', icon: HelpCircle, href: '/help' },
];

const allNavItems = [...navigation, ...footerNavigation];

export function Sidebar({ collapsed, onToggle, currentPath }: SidebarProps) {
  const [expandedSection, setExpandedSection] = React.useState<string | null>(null);

  const isActive = (href: string) => {
    if (href === '/') return currentPath === '/';
    return currentPath.startsWith(href);
  };

  const toggleSection = (label: string) => {
    setExpandedSection((prev) => (prev === label ? null : label));
  };

  const isSectionExpanded = (label: string) => expandedSection === label;

  // Auto-expand parent when child route is active
  React.useEffect(() => {
    const activeParent = allNavItems.find((item) =>
      item.children?.some((child) => {
        if (child.href === '/') return currentPath === '/';
        return currentPath.startsWith(child.href);
      })
    );
    if (activeParent) {
      setExpandedSection(activeParent.label);
    }
  }, [currentPath]);

  const renderNavItem = (item: NavItem) => {
    if (item.children) {
      return (
        <div>
          <button
            onClick={() => toggleSection(item.label)}
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
                    isSectionExpanded(item.label) && 'rotate-180'
                  )}
                />
              </>
            )}
          </button>
          {!collapsed && isSectionExpanded(item.label) && (
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
      );
    }

    return (
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
    );
  };

  return (
    <div className="flex h-full flex-col bg-sidebar-background text-sidebar-foreground">
      {/* Logo */}
      <div className="flex h-16 items-center justify-between border-b px-4">
        {!collapsed && (
          <Link href="/" className="flex items-center">
            <Logo width={160} />
          </Link>
        )}
        {collapsed && (
          <Link href="/" className="mx-auto flex items-center justify-center">
            <LogoIcon size={36} />
          </Link>
        )}
      </div>

      {/* Main navigation */}
      <nav className="flex-1 overflow-y-auto p-2">
        <ul className="space-y-1">
          {navigation.map((item) => (
            <li key={item.label}>{renderNavItem(item)}</li>
          ))}
        </ul>
      </nav>

      {/* Footer navigation */}
      <nav className="border-t border-sidebar-border p-2">
        <ul className="space-y-1">
          {footerNavigation.map((item) => (
            <li key={item.label}>{renderNavItem(item)}</li>
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
