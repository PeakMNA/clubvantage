'use client';

import { useState, useEffect, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@clubvantage/api-client';

import { AppShell } from '@/components/layout/app-shell';
import { Sidebar } from '@/components/layout/sidebar';
import { Header } from '@/components/layout/header';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { user, signOut, isLoading, isAuthenticated } = useAuth();
  const hasRedirected = useRef(false);

  const handleLogout = async () => {
    await signOut();
    window.location.href = '/login';
  };

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated && !hasRedirected.current) {
      hasRedirected.current = true;
      router.replace('/login');
    }
  }, [isLoading, isAuthenticated, router]);

  // Show loading while checking auth
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500" />
      </div>
    );
  }

  // Show nothing while redirecting to login
  if (!isAuthenticated) {
    return null;
  }

  return (
    <AppShell
      sidebarCollapsed={sidebarCollapsed}
      sidebar={
        <Sidebar
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
          currentPath={pathname}
        />
      }
      header={
        <Header
          clubName={user?.club?.name || 'ClubVantage'}
          user={{
            name: user ? `${user.firstName} ${user.lastName}` : 'User',
            email: user?.email || '',
            role: user?.role || 'Staff',
          }}
          onSearch={() => console.log('Search triggered')}
          onLogout={handleLogout}
        />
      }
    >
      <div className="page-enter">{children}</div>
    </AppShell>
  );
}
