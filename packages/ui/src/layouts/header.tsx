'use client';

import * as React from 'react';
import { Bell, Search, User } from 'lucide-react';

import { cn } from '../lib/utils';
import { Button } from '../primitives/button';
import { Avatar, AvatarFallback, AvatarImage } from '../primitives/avatar';

export interface HeaderProps {
  /** Club/tenant name */
  clubName?: string;
  /** Current user info */
  user?: {
    name: string;
    email: string;
    avatarUrl?: string;
    role?: string;
  };
  /** Search callback (Cmd+K) */
  onSearch?: () => void;
  /** Notifications count */
  notificationCount?: number;
  /** Notification click callback */
  onNotificationsClick?: () => void;
  /** User menu click callback */
  onUserMenuClick?: () => void;
  /** Additional actions */
  actions?: React.ReactNode;
  /** Additional class names */
  className?: string;
}

export function Header({
  clubName,
  user,
  onSearch,
  notificationCount = 0,
  onNotificationsClick,
  onUserMenuClick,
  actions,
  className,
}: HeaderProps) {
  // Global keyboard shortcut for search
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        onSearch?.();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onSearch]);

  const userInitials = user?.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className={cn('flex h-16 items-center justify-between px-6', className)}>
      {/* Left side - Club name */}
      <div className="flex items-center gap-4">
        {clubName && (
          <h2 className="text-lg font-semibold text-foreground">{clubName}</h2>
        )}
      </div>

      {/* Right side - Search, notifications, user */}
      <div className="flex items-center gap-2">
        {/* Global Search */}
        {onSearch && (
          <Button
            variant="outline"
            className="hidden w-64 justify-start text-muted-foreground md:flex"
            onClick={onSearch}
          >
            <Search className="mr-2 h-4 w-4" />
            <span className="flex-1 text-left">Search...</span>
            <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
              <span className="text-xs">⌘</span>K
            </kbd>
          </Button>
        )}

        {/* Mobile search button */}
        {onSearch && (
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={onSearch}
          >
            <Search className="h-5 w-5" />
          </Button>
        )}

        {/* Additional actions */}
        {actions}

        {/* Notifications */}
        <Button
          variant="ghost"
          size="icon"
          className="relative"
          onClick={onNotificationsClick}
        >
          <Bell className="h-5 w-5" />
          {notificationCount > 0 && (
            <span className="absolute -right-1 -top-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-destructive px-1 text-xs font-medium text-destructive-foreground">
              {notificationCount > 99 ? '99+' : notificationCount}
            </span>
          )}
        </Button>

        {/* User menu */}
        <Button
          variant="ghost"
          className="flex items-center gap-2 px-2"
          onClick={onUserMenuClick}
        >
          <Avatar className="h-8 w-8">
            <AvatarImage src={user?.avatarUrl} />
            <AvatarFallback>{userInitials || <User className="h-4 w-4" />}</AvatarFallback>
          </Avatar>
          <div className="hidden flex-col items-start lg:flex">
            <span className="text-sm font-medium">{user?.name}</span>
            {user?.role && (
              <span className="text-xs text-muted-foreground">{user.role}</span>
            )}
          </div>
        </Button>
      </div>
    </div>
  );
}
