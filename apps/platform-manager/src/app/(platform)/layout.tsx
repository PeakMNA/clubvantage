'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@clubvantage/api-client';
import { AppShell } from '@/components/layout';

export default function PlatformLayout({
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
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <AppShell
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
