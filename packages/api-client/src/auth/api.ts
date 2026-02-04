/**
 * Auth API Functions
 *
 * Uses same-origin route handlers for authentication to avoid cross-origin cookie issues.
 * The Next.js route handlers at /api/auth/* proxy requests to the backend and set
 * HttpOnly cookies on the frontend domain.
 */

import type { AuthUser, LoginCredentials, SignInResponse, RefreshResponse } from './types';

let apiBaseUrl = '';

/**
 * Configure the API base URL for auth requests
 * Note: For same-origin auth routes, this is typically empty (uses relative URLs)
 */
export function configureAuthApi(baseUrl: string): void {
  apiBaseUrl = baseUrl.replace(/\/$/, '');
}

/**
 * Get the configured API base URL
 */
export function getApiBaseUrl(): string {
  return apiBaseUrl;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  timestamp: string;
}

/**
 * Fetch helper for same-origin auth routes
 * Uses /api/auth/* routes which handle cookie setting on the frontend domain
 */
async function fetchSameOrigin<T>(
  endpoint: string,
  options: RequestInit = {},
  timeoutMs: number = 5000
): Promise<T> {
  // Use same-origin routes (no cross-origin cookie issues)
  const url = `/api/auth${endpoint}`;

  // Create abort controller for timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  let response: Response;
  try {
    response = await fetch(url, {
      ...options,
      credentials: 'same-origin', // Same-origin is safer and works for same-domain requests
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });
  } catch (fetchError) {
    clearTimeout(timeoutId);
    // Check if it was a timeout
    if (fetchError instanceof Error && fetchError.name === 'AbortError') {
      console.error('[Auth API] Request timeout:', endpoint);
      throw new Error('Request timeout');
    }
    // Network error
    console.error('[Auth API] Network error:', fetchError);
    throw new Error('Network error - unable to reach server');
  } finally {
    clearTimeout(timeoutId);
  }

  if (!response.ok) {
    let errorMessage = `HTTP ${response.status}`;
    try {
      const errorBody = await response.json();
      errorMessage = errorBody.message || errorBody.error || errorMessage;
    } catch {
      // Could not parse error body
    }
    console.error('[Auth API] Error response:', response.status, errorMessage);
    throw new Error(errorMessage);
  }

  const json = await response.json();

  // Handle wrapped response format: { success: true, data: {...} }
  if (json && typeof json === 'object' && 'success' in json && 'data' in json) {
    return json.data as T;
  }

  // Handle direct response format
  return json as T;
}

/**
 * Legacy fetch function for backward compatibility (uses backend API directly)
 */
async function fetchWithCredentials<T>(
  endpoint: string,
  options: RequestInit = {},
  timeoutMs: number = 5000
): Promise<T> {
  const url = `${apiBaseUrl}/api/v1/auth${endpoint}`;

  // Create abort controller for timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  let response: Response;
  try {
    response = await fetch(url, {
      ...options,
      credentials: 'include',
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });
  } catch (fetchError) {
    clearTimeout(timeoutId);
    // Check if it was a timeout
    if (fetchError instanceof Error && fetchError.name === 'AbortError') {
      console.error('[Auth API] Request timeout:', endpoint);
      throw new Error('Request timeout');
    }
    // Network error - likely CORS or server not reachable
    console.error('[Auth API] Network error:', fetchError);
    throw new Error('Network error - unable to reach server');
  } finally {
    clearTimeout(timeoutId);
  }

  if (!response.ok) {
    let errorMessage = `HTTP ${response.status}`;
    try {
      const errorBody = await response.json();
      errorMessage = errorBody.message || errorBody.error || errorMessage;
    } catch {
      // Could not parse error body
    }
    console.error('[Auth API] Error response:', response.status, errorMessage);
    throw new Error(errorMessage);
  }

  const json = await response.json();

  // Handle wrapped response format: { success: true, data: {...} }
  if (json && typeof json === 'object' && 'success' in json && 'data' in json) {
    return json.data as T;
  }

  // Handle direct response format
  return json as T;
}

/**
 * Sign in with email and password
 * Uses same-origin route handler which sets HttpOnly cookies on the frontend domain
 */
export async function signIn(credentials: LoginCredentials): Promise<SignInResponse> {
  console.log('[Auth API] Starting sign in via same-origin route...');

  const response = await fetchSameOrigin<{
    user: {
      id: string;
      email: string;
      firstName: string;
      lastName: string;
      role: string;
      permissions?: string[];
      club?: { id: string; name: string; slug: string } | null;
    };
    expiresIn: number;
    expiresAt: number;
  }>('/signin', {
    method: 'POST',
    body: JSON.stringify(credentials),
  });

  console.log('[Auth API] Sign in successful, cookies set by route handler');

  return {
    expiresIn: response.expiresIn,
    expiresAt: response.expiresAt,
    user: {
      id: response.user.id,
      email: response.user.email,
      firstName: response.user.firstName,
      lastName: response.user.lastName,
      role: response.user.role as any,
      permissions: response.user.permissions || [],
      clubId: response.user.club?.id || null,
      club: response.user.club || null,
    },
  };
}

/**
 * Sign out and clear session cookies
 * Uses same-origin route handler which clears HttpOnly cookies
 */
export async function signOut(): Promise<void> {
  try {
    await fetchSameOrigin<{ message: string }>('/signout', {
      method: 'POST',
    });
  } catch {
    // Ignore errors - route handler still clears cookies even on backend errors
  }
}

/**
 * Refresh the current session
 * Uses same-origin route handler which reads refresh token from cookies
 */
export async function refreshSession(): Promise<RefreshResponse> {
  const response = await fetchSameOrigin<{
    expiresIn: number;
    expiresAt: number;
  }>('/refresh', {
    method: 'POST',
  }, 3000);

  return {
    expiresIn: response.expiresIn,
    expiresAt: response.expiresAt,
  };
}

/**
 * Get the current session user info
 * Uses same-origin route handler which reads access token from cookies
 */
export async function getSession(): Promise<AuthUser | null> {
  // Use same-origin route (no cross-origin cookie issues)
  const url = `/api/auth/me`;

  // Create abort controller for timeout (5 second timeout for session check)
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000);

  let response: Response;
  try {
    response = await fetch(url, {
      method: 'GET',
      credentials: 'same-origin',
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    clearTimeout(timeoutId);
    // Network error or timeout - log it for debugging
    console.error('[Auth API] getSession network error:', error instanceof Error ? error.message : 'Unknown error');
    return null;
  } finally {
    clearTimeout(timeoutId);
  }

  // 401 is expected when not logged in - return null silently
  if (response.status === 401) {
    return null;
  }

  if (!response.ok) {
    console.error('[Auth API] getSession error:', response.status);
    return null;
  }

  try {
    const json = await response.json();
    const data = json.data || json;

    return {
      id: data.id,
      email: data.email,
      firstName: data.firstName,
      lastName: data.lastName,
      role: data.role as any,
      permissions: data.permissions || [],
      clubId: data.clubId || null,
      club: data.club || null,
    };
  } catch {
    return null;
  }
}

/**
 * Get the current user's profile
 * Alias for getSession
 */
export async function getMe(): Promise<AuthUser | null> {
  return getSession();
}

/**
 * Check if there's a valid session
 * Attempts to refresh if access token is expired
 */
export async function checkSession(): Promise<AuthUser | null> {
  // First try to get the current session
  const user = await getSession();

  // If we have a user, great - return it
  // If not, don't bother with refresh - the user needs to log in
  // (Refresh is only useful when access token expired but refresh token is valid,
  // which is handled by the auto-refresh interval when user IS authenticated)
  return user;
}
