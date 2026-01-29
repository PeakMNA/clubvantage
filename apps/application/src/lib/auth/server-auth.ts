'use server';

import { cookies } from 'next/headers';

/**
 * Session data returned from authentication
 */
export interface Session {
  user: {
    id: string;
    email: string;
    name: string;
    role: 'admin' | 'staff' | 'member';
    permissions: string[];
  };
  expiresAt: Date;
}

/**
 * Result of an auth check - either authenticated session or error
 */
export type AuthResult =
  | { authenticated: true; session: Session }
  | { authenticated: false; error: string };

/**
 * Verify the current request has a valid session
 * Checks for JWT token in cookies and validates it
 *
 * @returns AuthResult indicating if user is authenticated
 */
export async function getSession(): Promise<AuthResult> {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token')?.value;

  if (!token) {
    return { authenticated: false, error: 'No authentication token found' };
  }

  try {
    // TODO: Replace with actual JWT verification
    // For now, decode the token without verification for development
    // In production, this should verify the signature with the same secret as the API
    const payload = parseJwtPayload(token);

    if (!payload) {
      return { authenticated: false, error: 'Invalid token format' };
    }

    // Check token expiration
    if (payload.exp && payload.exp * 1000 < Date.now()) {
      return { authenticated: false, error: 'Token expired' };
    }

    return {
      authenticated: true,
      session: {
        user: {
          id: payload.sub || '',
          email: payload.email || '',
          name: payload.name || '',
          role: payload.role || 'staff',
          permissions: payload.permissions || [],
        },
        expiresAt: new Date(payload.exp ? payload.exp * 1000 : Date.now() + 3600000),
      },
    };
  } catch (error) {
    return {
      authenticated: false,
      error: 'Failed to verify authentication token',
    };
  }
}

/**
 * Parse JWT payload without verification (for development)
 * In production, use a proper JWT library with signature verification
 */
function parseJwtPayload(token: string): JwtPayload | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      return null;
    }

    const payload = parts[1];
    if (!payload) {
      return null;
    }

    const decoded = Buffer.from(payload, 'base64').toString('utf-8');
    return JSON.parse(decoded) as JwtPayload;
  } catch {
    return null;
  }
}

interface JwtPayload {
  sub?: string;
  email?: string;
  name?: string;
  role?: 'admin' | 'staff' | 'member';
  permissions?: string[];
  exp?: number;
  iat?: number;
}

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

  // Admins have all permissions
  if (result.session.user.role === 'admin') {
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

  // Admins have all permissions
  if (session.user.role === 'admin') {
    return session;
  }

  if (!session.user.permissions.includes(permission)) {
    throw new Error(`Forbidden: Missing permission '${permission}'`);
  }

  return session;
}
