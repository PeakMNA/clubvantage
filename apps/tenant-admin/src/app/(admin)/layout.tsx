'use client';

import { useRouter } from 'next/navigation';
// Direct import to avoid pulling entire api-client bundle
import { useAuth } from '@clubvantage/api-client/auth';
import { AppShell } from '@/components/layout';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user, signOut, isLoading } = useAuth();

  const handleLogout = async () => {
    await signOut();
    router.push('/login');
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500" />
      </div>
    );
  }

  const tenant = {
    name: user?.club?.name || 'Club Administration',
    logoUrl: undefined,
    primaryColor: '38 92% 50%', // Amber
  };

  return (
    <AppShell
      tenant={tenant}
      user={user ? {
        name: `${user.firstName} ${user.lastName}`,
        email: user.email,
        role: user.role,
      } : undefined}
      onLogout={handleLogout}
    >
      {children}
    </AppShell>
  );
}
