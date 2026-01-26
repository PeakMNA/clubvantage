'use client';

import * as React from 'react';
import { Bell, Search, User, Settings, HelpCircle, LogOut } from 'lucide-react';
import { cn, Button, Avatar, AvatarFallback, AvatarImage } from '@clubvantage/ui';

interface HeaderProps {
  clubName?: string;
  user?: {
    name: string;
    email: string;
    avatarUrl?: string;
    role?: string;
  };
  onSearch?: () => void;
  onLogout?: () => void;
  notificationCount?: number;
  className?: string;
}

export function Header({
  clubName,
  user,
  onSearch,
  onLogout,
  notificationCount = 0,
  className,
}: HeaderProps) {
  const [userMenuOpen, setUserMenuOpen] = React.useState(false);
  const [notificationsOpen, setNotificationsOpen] = React.useState(false);
  const userMenuRef = React.useRef<HTMLDivElement>(null);
  const notificationsRef = React.useRef<HTMLDivElement>(null);

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

  // Close dropdowns when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(e.target as Node)) {
        setNotificationsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const userInitials = user?.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className={cn('flex h-14 sm:h-16 items-center justify-between px-3 sm:px-6', className)}>
      {/* Left side - Club name */}
      <div className="flex items-center gap-4 min-w-0">
        {clubName && (
          <h2 className="text-sm sm:text-lg font-semibold text-foreground truncate max-w-[150px] sm:max-w-none">
            {clubName}
          </h2>
        )}
      </div>

      {/* Right side - Search, notifications, user */}
      <div className="flex items-center gap-1 sm:gap-2">
        {/* Global Search - Desktop */}
        {onSearch && (
          <Button
            variant="outline"
            className="hidden w-48 lg:w-64 justify-start text-muted-foreground md:flex"
            onClick={onSearch}
          >
            <Search className="mr-2 h-4 w-4" />
            <span className="flex-1 text-left">Search...</span>
            <kbd className="pointer-events-none hidden lg:inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
              <span className="text-xs">⌘</span>K
            </kbd>
          </Button>
        )}

        {/* Mobile search button */}
        {onSearch && (
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 md:hidden"
            onClick={onSearch}
          >
            <Search className="h-5 w-5" />
          </Button>
        )}

        {/* Notifications */}
        <div className="relative" ref={notificationsRef}>
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9"
            onClick={() => {
              setNotificationsOpen(!notificationsOpen);
              setUserMenuOpen(false);
            }}
          >
            <Bell className="h-5 w-5" />
            {notificationCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 sm:h-5 min-w-[16px] sm:min-w-[20px] items-center justify-center rounded-full bg-destructive px-1 text-[10px] sm:text-xs font-medium text-destructive-foreground">
                {notificationCount > 99 ? '99+' : notificationCount}
              </span>
            )}
          </Button>

          {notificationsOpen && (
            <div className="absolute right-0 mt-2 w-72 sm:w-80 rounded-md border bg-popover shadow-lg">
              <div className="p-3 sm:p-4 border-b">
                <h3 className="font-medium text-sm sm:text-base">Notifications</h3>
              </div>
              <div className="p-4 text-sm text-muted-foreground text-center">
                No new notifications
              </div>
            </div>
          )}
        </div>

        {/* User menu */}
        <div className="relative" ref={userMenuRef}>
          <Button
            variant="ghost"
            className="flex items-center gap-2 px-1.5 sm:px-2 h-9"
            onClick={() => {
              setUserMenuOpen(!userMenuOpen);
              setNotificationsOpen(false);
            }}
          >
            <Avatar className="h-7 w-7 sm:h-8 sm:w-8">
              <AvatarImage src={user?.avatarUrl} />
              <AvatarFallback className="text-xs sm:text-sm">
                {userInitials || <User className="h-4 w-4" />}
              </AvatarFallback>
            </Avatar>
            <div className="hidden flex-col items-start lg:flex">
              <span className="text-sm font-medium">{user?.name}</span>
              {user?.role && (
                <span className="text-xs text-muted-foreground">{user.role}</span>
              )}
            </div>
          </Button>

          {userMenuOpen && (
            <div className="absolute right-0 mt-2 w-52 sm:w-56 rounded-md border bg-popover shadow-lg">
              <div className="p-2 border-b">
                <p className="font-medium text-sm truncate">{user?.name}</p>
                <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
              </div>
              <div className="p-1">
                <button className="flex w-full items-center gap-2 rounded-md px-2 py-2 sm:py-1.5 text-sm hover:bg-accent">
                  <Settings className="h-4 w-4" />
                  <span>Profile Settings</span>
                </button>
                <button className="flex w-full items-center gap-2 rounded-md px-2 py-2 sm:py-1.5 text-sm hover:bg-accent">
                  <HelpCircle className="h-4 w-4" />
                  <span>Help & Support</span>
                </button>
                <div className="my-1 h-px bg-border" />
                <button
                  className="flex w-full items-center gap-2 rounded-md px-2 py-2 sm:py-1.5 text-sm text-destructive hover:bg-accent"
                  onClick={() => {
                    setUserMenuOpen(false);
                    onLogout?.();
                  }}
                >
                  <LogOut className="h-4 w-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
