/**
 * Auth API Functions
 * Communicates with the backend auth endpoints
 */

import type { AuthUser, LoginCredentials, SignInResponse, RefreshResponse } from './types';

let apiBaseUrl = '';

/**
 * Configure the API base URL for auth requests
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
 * Uses local database authentication (bcrypt)
 */
export async function signIn(credentials: LoginCredentials): Promise<SignInResponse> {
  console.log('[Auth API] Starting sign in...');

  const response = await fetchWithCredentials<{
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
    user: {
      id: string;
      email: string;
      firstName: string;
      lastName: string;
      role: string;
      permissions?: string[];
      club?: { id: string; name: string; slug: string } | null;
    };
  }>('/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  });

  console.log('[Auth API] Login successful, setting session cookies...');

  // Set cookies via the session endpoint
  try {
    await fetchWithCredentials('/session', {
      method: 'POST',
      body: JSON.stringify({
        accessToken: response.accessToken,
        refreshToken: response.refreshToken,
      }),
    });
    console.log('[Auth API] Session cookies set successfully');
  } catch (sessionError) {
    console.error('[Auth API] Failed to set session cookies:', sessionError);
    // Continue anyway - login was successful, cookies may work with a refresh
  }

  return {
    expiresIn: response.expiresIn,
    expiresAt: Date.now() + response.expiresIn * 1000,
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
 */
export async function signOut(): Promise<void> {
  try {
    await fetchWithCredentials<{ message: string }>('/logout', {
      method: 'POST',
    });
  } catch {
    // Ignore errors - we'll clear cookies client-side anyway
  }
}

/**
 * Refresh the current session
 * Uses the refresh token from cookies (set by /session endpoint)
 */
export async function refreshSession(): Promise<RefreshResponse> {
  // Use /refresh-session which reads refresh token from cookies
  const url = `${apiBaseUrl}/api/v1/auth/refresh-session`;

  // Create abort controller for timeout (3 second timeout)
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 3000);

  let response: Response;
  try {
    response = await fetch(url, {
      method: 'POST',
      credentials: 'include',
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (err) {
    clearTimeout(timeoutId);
    if (err instanceof Error && err.name === 'AbortError') {
      throw new Error('Session refresh timeout');
    }
    throw new Error('Network error during session refresh');
  } finally {
    clearTimeout(timeoutId);
  }

  // 401 means no valid refresh token
  if (response.status === 401) {
    throw new Error('No valid session to refresh');
  }

  if (!response.ok) {
    throw new Error('Session refresh failed');
  }

  const json = await response.json();
  const data = json.data || json;

  return {
    expiresIn: data.expiresIn,
    expiresAt: Date.now() + data.expiresIn * 1000,
  };
}

/**
 * Get the current session user info
 * Uses the access token cookie
 */
export async function getSession(): Promise<AuthUser | null> {
  const url = `${apiBaseUrl}/api/v1/auth/me`;

  // Create abort controller for timeout (3 second timeout for session check)
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 3000);

  let response: Response;
  try {
    response = await fetch(url, {
      method: 'GET',
      credentials: 'include',
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch {
    clearTimeout(timeoutId);
    // Network error or timeout - no session
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
  let user = await getSession();

  if (user) {
    return user;
  }

  // If no session, try to refresh
  try {
    await refreshSession();
    user = await getSession();
    return user;
  } catch {
    // Refresh failed, no valid session
    return null;
  }
}
