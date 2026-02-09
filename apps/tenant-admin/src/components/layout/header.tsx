'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  Building2,
  ExternalLink,
  ChevronDown,
  User,
  Settings,
  LogOut,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface TenantConfig {
  name: string;
  logoUrl?: string;
  primaryColor?: string;
}

interface HeaderUser {
  name: string;
  email: string;
  avatarUrl?: string;
  role?: string;
}

interface HeaderProps {
  tenant?: TenantConfig;
  user?: HeaderUser;
  onLogout?: () => void;
  className?: string;
}

export function Header({ tenant, user, onLogout, className }: HeaderProps) {
  const [userMenuOpen, setUserMenuOpen] = React.useState(false);

  // Default tenant config
  const tenantConfig: TenantConfig = tenant || {
    name: 'Club Admin',
    logoUrl: undefined,
  };

  // Default user
  const currentUser: HeaderUser = user || {
    name: 'Admin User',
    email: 'admin@example.com',
  };

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-30 h-16 bg-white border-b-2',
        className
      )}
      style={{
        borderBottomColor: tenant?.primaryColor || 'hsl(var(--tenant-primary))',
      }}
    >
      <div className="flex h-full items-center justify-between px-4 lg:px-6">
        {/* Left: Tenant Logo & Name */}
        <div className="flex items-center gap-3">
          {tenantConfig.logoUrl ? (
            <img
              src={tenantConfig.logoUrl}
              alt={tenantConfig.name}
              className="h-10 w-auto object-contain"
            />
          ) : (
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100">
              <Building2 className="h-5 w-5 text-slate-600" />
            </div>
          )}
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-slate-900">
              {tenantConfig.name}
            </span>
            <span className="text-xs text-slate-500">Admin Portal</span>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-4">
          {/* Back to App Link */}
          <Link
            href="/"
            className="hidden sm:flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
          >
            <span>Back to App</span>
            <ExternalLink className="h-3.5 w-3.5" />
          </Link>

          {/* User Dropdown */}
          <div className="relative">
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex items-center gap-2 rounded-lg p-1.5 hover:bg-slate-100 transition-colors"
            >
              {currentUser.avatarUrl ? (
                <img
                  src={currentUser.avatarUrl}
                  alt={currentUser.name}
                  className="h-8 w-8 rounded-full object-cover"
                />
              ) : (
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-700">
                  <span className="text-sm font-medium">
                    {currentUser.name
                      .split(' ')
                      .map((n) => n[0])
                      .join('')
                      .slice(0, 2)}
                  </span>
                </div>
              )}
              <ChevronDown className="h-4 w-4 text-slate-500" />
            </button>

            {/* Dropdown Menu */}
            {userMenuOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setUserMenuOpen(false)}
                />
                <div className="absolute right-0 top-full mt-2 z-50 w-56 rounded-lg bg-white shadow-lg border border-slate-200 py-1">
                  {/* User Info */}
                  <div className="px-4 py-3 border-b border-slate-100">
                    <p className="text-sm font-medium text-slate-900">
                      {currentUser.name}
                    </p>
                    <p className="text-xs text-slate-500 truncate">
                      {currentUser.email}
                    </p>
                  </div>

                  {/* Menu Items */}
                  <div className="py-1">
                    <button className="flex w-full items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">
                      <User className="h-4 w-4" />
                      <span>My Profile</span>
                    </button>
                    <button className="flex w-full items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">
                      <Settings className="h-4 w-4" />
                      <span>Preferences</span>
                    </button>
                  </div>

                  {/* Logout */}
                  <div className="border-t border-slate-100 py-1">
                    <button
                      className="flex w-full items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                      onClick={() => {
                        setUserMenuOpen(false);
                        onLogout?.();
                      }}
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Sign out</span>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
