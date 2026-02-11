'use server';

import { cache } from 'react';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';

/**
 * Session data returned from authentication
 */
export interface Session {
  user: {
    id: string;
    email: string;
    role: string;
    permissions: string[];
    tenantId: string;
  };
  expiresAt: Date;
}

/**
 * Result of an auth check - either authenticated session or error
 */
export type AuthResult =
  | { authenticated: true; session: Session }
  | { authenticated: false; error: string };

interface JwtPayload {
  sub?: string;
  email?: string;
  tenantId?: string;
  roles?: string[];
  permissions?: string[];
}

// Encode secret once at module load (reused across requests)
const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'clubvantage-super-secret-jwt-token-for-local-dev-only-min-32-chars'
);

/**
 * Verify the current request has a valid session.
 * Uses jose for HS256 JWT signature verification (Edge-compatible).
 * Wrapped in React.cache() for per-request deduplication — multiple server
 * components calling getSession() in the same render only verify the JWT once.
 */
export const getSession = cache(async (): Promise<AuthResult> => {
  const cookieStore = await cookies();
  const token = cookieStore.get('sb-access-token')?.value;

  if (!token) {
    return { authenticated: false, error: 'No authentication token found' };
  }

  try {
    // jose verifies signature + expiration automatically
    const { payload } = await jwtVerify(token, JWT_SECRET, {
      algorithms: ['HS256'],
    });

    const claims = payload as unknown as JwtPayload;
    const role = claims.roles?.[0] || 'staff';

    return {
      authenticated: true,
      session: {
        user: {
          id: claims.sub || '',
          email: claims.email || '',
          role,
          permissions: claims.permissions || [],
          tenantId: claims.tenantId || '',
        },
        expiresAt: new Date(payload.exp ? payload.exp * 1000 : Date.now() + 3600000),
      },
    };
  } catch (error) {
    // jose throws specific errors for expired/invalid tokens
    const message = error instanceof Error ? error.message : 'Unknown error';

    if (message.includes('expired')) {
      return { authenticated: false, error: 'Token expired' };
    }

    return {
      authenticated: false,
      error: 'Failed to verify authentication token',
    };
  }
});

/**
 * Require authentication for a server action
 * Returns the session if authenticated, throws if not
 *
 * @throws Error if not authenticated
 */
export async function requireAuth(): Promise<Session> {
  const result = await getSession();

  if (!result.authenticated) {
    throw new Error(`Unauthorized: ${result.error}`);
  }

  return result.session;
}

/**
 * Check if the current session has a specific permission
 */
export async function hasPermission(permission: string): Promise<boolean> {
  const result = await getSession();

  if (!result.authenticated) {
    return false;
  }

  // Admin-level roles have all permissions
  const adminRoles = ['SUPER_ADMIN', 'PLATFORM_ADMIN', 'TENANT_ADMIN'];
  if (adminRoles.includes(result.session.user.role)) {
    return true;
  }

  return result.session.user.permissions.includes(permission);
}

/**
 * Require a specific permission for a server action
 *
 * @throws Error if not authenticated or lacks permission
 */
export async function requirePermission(permission: string): Promise<Session> {
  const session = await requireAuth();

  // Admin-level roles have all permissions
  const adminRoles = ['SUPER_ADMIN', 'PLATFORM_ADMIN', 'TENANT_ADMIN'];
  if (adminRoles.includes(session.user.role)) {
    return session;
  }

  if (!session.user.permissions.includes(permission)) {
    throw new Error(`Forbidden: Missing permission '${permission}'`);
  }

  return session;
}
