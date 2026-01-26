'use client';

import * as React from 'react';
import {
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  Users,
  Receipt,
  Calendar,
  Flag,
  Settings,
  HelpCircle,
  Sparkles,
} from 'lucide-react';

import { cn } from '../lib/utils';
import { Button } from '../primitives/button';

export interface SidebarNavItem {
  /** Unique identifier */
  id: string;
  /** Display label */
  label: string;
  /** Navigation href */
  href: string;
  /** Icon component */
  icon: React.ReactNode;
  /** Badge count */
  badge?: number;
  /** Whether item is active */
  active?: boolean;
  /** Child items for nested navigation */
  children?: SidebarNavItem[];
}

export interface SidebarProps {
  /** Logo component or image */
  logo?: React.ReactNode;
  /** Collapsed logo (smaller version) */
  logoCollapsed?: React.ReactNode;
  /** Navigation items */
  items: SidebarNavItem[];
  /** Footer items */
  footerItems?: SidebarNavItem[];
  /** Whether sidebar is collapsed */
  collapsed?: boolean;
  /** Collapse toggle callback */
  onCollapsedChange?: (collapsed: boolean) => void;
  /** Active item ID */
  activeItem?: string;
  /** Item click callback */
  onItemClick?: (item: SidebarNavItem) => void;
  /** AI Assistant component */
  aiAssistant?: React.ReactNode;
  /** Additional class names */
  className?: string;
}

export function Sidebar({
  logo,
  logoCollapsed,
  items,
  footerItems,
  collapsed = false,
  onCollapsedChange,
  activeItem,
  onItemClick,
  aiAssistant,
  className,
}: SidebarProps) {
  return (
    <div className={cn(
      'flex h-full flex-col bg-stone-50 border-r border-stone-200/80',
      className
    )}>
      {/* Logo */}
      <div className="flex h-16 items-center justify-between border-b border-stone-200/80 px-4">
        <div className="flex items-center gap-3">
          {collapsed ? logoCollapsed : logo}
        </div>
        {onCollapsedChange && (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-stone-500 hover:text-stone-900 hover:bg-stone-100"
            onClick={() => onCollapsedChange(!collapsed)}
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>
        )}
      </div>

      {/* Main navigation */}
      <nav className="flex-1 overflow-y-auto p-3 scrollbar-thin">
        <ul className="space-y-1">
          {items.map((item) => (
            <SidebarNavButton
              key={item.id}
              item={item}
              collapsed={collapsed}
              active={activeItem === item.id || item.active}
              onClick={() => onItemClick?.(item)}
            />
          ))}
        </ul>
      </nav>

      {/* AI Assistant */}
      {aiAssistant && !collapsed && (
        <div className="border-t border-stone-200/80 p-4">
          {aiAssistant}
        </div>
      )}

      {/* Footer navigation */}
      {footerItems && footerItems.length > 0 && (
        <nav className="border-t border-stone-200/80 p-3">
          <ul className="space-y-1">
            {footerItems.map((item) => (
              <SidebarNavButton
                key={item.id}
                item={item}
                collapsed={collapsed}
                active={activeItem === item.id || item.active}
                onClick={() => onItemClick?.(item)}
              />
            ))}
          </ul>
        </nav>
      )}
    </div>
  );
}

interface SidebarNavButtonProps {
  item: SidebarNavItem;
  collapsed: boolean;
  active?: boolean;
  onClick?: () => void;
}

function SidebarNavButton({
  item,
  collapsed,
  active,
  onClick,
}: SidebarNavButtonProps) {
  return (
    <li>
      <button
        onClick={onClick}
        className={cn(
          'flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200',
          active
            ? 'bg-amber-50 text-amber-700 border border-amber-200/60 shadow-sm'
            : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900',
          collapsed && 'justify-center px-2'
        )}
        title={collapsed ? item.label : undefined}
      >
        <span className={cn(
          'shrink-0 transition-colors',
          active ? 'text-amber-600' : 'text-stone-500'
        )}>
          {item.icon}
        </span>
        {!collapsed && (
          <>
            <span className="flex-1 text-left">{item.label}</span>
            {item.badge !== undefined && item.badge > 0 && (
              <span className={cn(
                'flex h-5 min-w-[20px] items-center justify-center rounded-full px-1.5 text-xs font-semibold',
                active
                  ? 'bg-amber-500 text-white'
                  : 'bg-amber-100 text-amber-700'
              )}>
                {item.badge > 99 ? '99+' : item.badge}
              </span>
            )}
          </>
        )}
      </button>
    </li>
  );
}

// Default navigation items based on UX spec
export const defaultSidebarItems: SidebarNavItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    href: '/dashboard',
    icon: <LayoutDashboard className="h-5 w-5" />,
  },
  {
    id: 'members',
    label: 'Members',
    href: '/members',
    icon: <Users className="h-5 w-5" />,
  },
  {
    id: 'billing',
    label: 'Billing',
    href: '/billing',
    icon: <Receipt className="h-5 w-5" />,
  },
  {
    id: 'facility',
    label: 'Facility',
    href: '/facility',
    icon: <Calendar className="h-5 w-5" />,
  },
  {
    id: 'golf',
    label: 'Golf',
    href: '/golf',
    icon: <Flag className="h-5 w-5" />,
  },
];

export const defaultFooterItems: SidebarNavItem[] = [
  {
    id: 'settings',
    label: 'Settings',
    href: '/settings',
    icon: <Settings className="h-5 w-5" />,
  },
  {
    id: 'help',
    label: 'Help',
    href: '/help',
    icon: <HelpCircle className="h-5 w-5" />,
  },
];
