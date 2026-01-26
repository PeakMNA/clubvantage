'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthContext } from './AuthContext';
import type { AuthUser, UserRole } from './types';

/**
 * Primary auth hook - provides full auth context
 */
export function useAuth() {
  return useAuthContext();
}

/**
 * Get the current user
 * Returns null if not authenticated
 */
export function useUser(): AuthUser | null {
  const { user } = useAuthContext();
  return user;
}

/**
 * Check if user is authenticated
 */
export function useIsAuthenticated(): boolean {
  const { isAuthenticated } = useAuthContext();
  return isAuthenticated;
}

/**
 * Hook that requires authentication
 * Redirects to login if not authenticated
 */
export function useRequireAuth(redirectTo = '/login'): AuthUser | null {
  const router = useRouter();
  const { user, isLoading, isAuthenticated } = useAuthContext();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace(redirectTo);
    }
  }, [isLoading, isAuthenticated, router, redirectTo]);

  return user;
}

/**
 * Hook that requires a specific role
 * Redirects if user doesn't have the required role
 */
export function useRequireRole(
  allowedRoles: UserRole[],
  redirectTo = '/login'
): AuthUser | null {
  const router = useRouter();
  const { user, isLoading, isAuthenticated } = useAuthContext();

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.replace(redirectTo);
      } else if (user && !allowedRoles.includes(user.role)) {
        router.replace('/unauthorized');
      }
    }
  }, [isLoading, isAuthenticated, user, allowedRoles, router, redirectTo]);

  return user;
}

/**
 * Check if user has a specific permission
 */
export function useHasPermission(permission: string): boolean {
  const { user } = useAuthContext();
  return user?.permissions?.includes(permission) ?? false;
}

/**
 * Check if user has any of the specified roles
 */
export function useHasRole(roles: UserRole[]): boolean {
  const { user } = useAuthContext();
  return user ? roles.includes(user.role) : false;
}

/**
 * Get user's display name
 */
export function useUserDisplayName(): string {
  const { user } = useAuthContext();
  if (!user) return '';
  return `${user.firstName} ${user.lastName}`.trim() || user.email;
}

/**
 * Get user's initials
 */
export function useUserInitials(): string {
  const { user } = useAuthContext();
  if (!user) return '';
  const first = user.firstName?.[0] || '';
  const last = user.lastName?.[0] || '';
  return (first + last).toUpperCase() || (user.email?.[0] || '?').toUpperCase();
}
