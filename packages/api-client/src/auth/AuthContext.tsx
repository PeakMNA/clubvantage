'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef } from 'react';
import type { AuthUser, AuthContextValue, LoginCredentials, AuthState } from './types';
import * as authApi from './api';

const AuthContext = createContext<AuthContextValue | null>(null);

// Inactivity timeout configuration
const INACTIVITY_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes (must be less than JWT expiry of 60m)
const ACTIVITY_CHECK_INTERVAL_MS = 60 * 1000; // Check every 1 minute
const WARNING_BEFORE_LOGOUT_MS = 5 * 60 * 1000; // Show warning 5 minutes before logout

export interface AuthProviderProps {
  children: React.ReactNode;
  apiBaseUrl?: string;
  onAuthStateChange?: (user: AuthUser | null) => void;
  /** Callback when session is about to expire due to inactivity */
  onSessionWarning?: (remainingMs: number) => void;
  /** Callback when session expires due to inactivity */
  onSessionTimeout?: () => void;
}

const initialState: AuthState = {
  user: null,
  isLoading: true,
  isAuthenticated: false,
  error: null,
};

export function AuthProvider({
  children,
  apiBaseUrl,
  onAuthStateChange,
  onSessionWarning,
  onSessionTimeout,
}: AuthProviderProps) {
  const [state, setState] = useState<AuthState>(initialState);
  const lastActivityRef = useRef<number>(Date.now());
  const warningShownRef = useRef<boolean>(false);
  const refreshFailCountRef = useRef<number>(0);
  const sessionEstablishedAtRef = useRef<number>(0); // Track when session was established
  const MAX_REFRESH_FAILURES = 3; // Only logout after 3 consecutive failures
  const SESSION_GRACE_PERIOD_MS = 10_000; // Skip refresh for 10s after session established

  // Configure API base URL
  useEffect(() => {
    if (apiBaseUrl) {
      authApi.configureAuthApi(apiBaseUrl);
    }
  }, [apiBaseUrl]);

  // Track user activity - reset the inactivity timer
  const updateLastActivity = useCallback(() => {
    lastActivityRef.current = Date.now();
    warningShownRef.current = false; // Reset warning flag on activity
  }, []);

  // Set up activity listeners
  useEffect(() => {
    if (!state.isAuthenticated) return;

    const activityEvents = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart', 'click'];

    // Throttle activity updates to avoid excessive updates
    let lastUpdate = 0;
    const throttledUpdate = () => {
      const now = Date.now();
      if (now - lastUpdate > 1000) { // Only update once per second
        lastUpdate = now;
        updateLastActivity();
      }
    };

    activityEvents.forEach(event => {
      window.addEventListener(event, throttledUpdate, { passive: true });
    });

    return () => {
      activityEvents.forEach(event => {
        window.removeEventListener(event, throttledUpdate);
      });
    };
  }, [state.isAuthenticated, updateLastActivity]);

  // Check session on mount
  useEffect(() => {
    const initAuth = async () => {
      try {
        const user = await authApi.checkSession();
        if (user) {
          sessionEstablishedAtRef.current = Date.now();
        }
        setState({
          user,
          isLoading: false,
          isAuthenticated: !!user,
          error: null,
        });
        onAuthStateChange?.(user);
      } catch (error) {
        setState({
          user: null,
          isLoading: false,
          isAuthenticated: false,
          error: error instanceof Error ? error : new Error('Auth check failed'),
        });
        onAuthStateChange?.(null);
      }
    };

    initAuth();
  }, [onAuthStateChange]);

  // Set up activity-based session management
  useEffect(() => {
    if (!state.isAuthenticated) return;

    const checkActivityAndRefresh = async () => {
      const now = Date.now();
      const timeSinceLastActivity = now - lastActivityRef.current;

      // Check if user has been inactive for too long
      if (timeSinceLastActivity >= INACTIVITY_TIMEOUT_MS) {
        // Session timed out due to inactivity
        console.log('[Auth] Session timeout due to inactivity');
        onSessionTimeout?.();
        setState({
          user: null,
          isLoading: false,
          isAuthenticated: false,
          error: new Error('Session expired due to inactivity'),
        });
        onAuthStateChange?.(null);
        try {
          await authApi.signOut();
        } catch {
          // Ignore signout errors
        }
        return;
      }

      // Show warning before logout
      const timeUntilTimeout = INACTIVITY_TIMEOUT_MS - timeSinceLastActivity;
      if (timeUntilTimeout <= WARNING_BEFORE_LOGOUT_MS && !warningShownRef.current) {
        warningShownRef.current = true;
        onSessionWarning?.(timeUntilTimeout);
      }

      // Refresh session if there's been recent activity
      // Only refresh if activity happened in the last 20 minutes
      if (timeSinceLastActivity < 20 * 60 * 1000) {
        // Skip refresh during grace period after session was just established
        // (cookies may not be fully persisted yet after login/page reload)
        const timeSinceEstablished = now - sessionEstablishedAtRef.current;
        if (timeSinceEstablished < SESSION_GRACE_PERIOD_MS) {
          return;
        }

        try {
          await authApi.refreshSession();
          refreshFailCountRef.current = 0; // Reset on success
        } catch (err) {
          const msg = err instanceof Error ? err.message : '';
          const isDefinitive = msg.includes('No refresh token') || msg.includes('Session expired');

          if (isDefinitive) {
            // Before logging out, verify the session is actually gone
            // (refresh can fail due to cookie timing while session is still valid)
            try {
              const user = await authApi.getSession();
              if (user) {
                // Session is still valid — treat as transient refresh failure
                refreshFailCountRef.current = 0;
                return;
              }
            } catch {
              // getSession also failed — session is truly gone
            }

            setState({
              user: null,
              isLoading: false,
              isAuthenticated: false,
              error: new Error('Session expired'),
            });
            onAuthStateChange?.(null);
            return;
          }

          // Transient error (timeout, network, HMR) — retry tolerance
          refreshFailCountRef.current += 1;
          console.warn(`[Auth] Refresh failed (${refreshFailCountRef.current}/${MAX_REFRESH_FAILURES})`);

          if (refreshFailCountRef.current >= MAX_REFRESH_FAILURES) {
            setState({
              user: null,
              isLoading: false,
              isAuthenticated: false,
              error: new Error('Session expired'),
            });
            onAuthStateChange?.(null);
          }
        }
      }
    };

    // Check activity and refresh every minute
    const activityCheckInterval = setInterval(checkActivityAndRefresh, ACTIVITY_CHECK_INTERVAL_MS);

    // Delay the initial refresh to let cookies settle after login/page reload
    const initialRefreshTimeout = setTimeout(checkActivityAndRefresh, SESSION_GRACE_PERIOD_MS);

    return () => {
      clearInterval(activityCheckInterval);
      clearTimeout(initialRefreshTimeout);
    };
  }, [state.isAuthenticated, onAuthStateChange, onSessionWarning, onSessionTimeout]);

  // Refresh session when tab becomes visible again
  useEffect(() => {
    if (!state.isAuthenticated) return;

    const handleVisibilityChange = async () => {
      if (document.visibilityState === 'visible') {
        // Skip if session was just established (cookie timing)
        if (Date.now() - sessionEstablishedAtRef.current < SESSION_GRACE_PERIOD_MS) {
          return;
        }

        try {
          // Silently refresh session when returning to tab
          await authApi.refreshSession();
          refreshFailCountRef.current = 0;
        } catch (err) {
          const msg = err instanceof Error ? err.message : '';
          const isDefinitive = msg.includes('No refresh token') || msg.includes('Session expired');

          // Always verify with getSession before logging out
          try {
            const user = await authApi.getSession();
            if (user) {
              refreshFailCountRef.current = 0;
              return; // Session still valid, don't logout
            }
          } catch {
            // getSession also failed
          }

          if (isDefinitive) {
            setState({
              user: null,
              isLoading: false,
              isAuthenticated: false,
              error: new Error('Session expired'),
            });
            onAuthStateChange?.(null);
            return;
          }

          // Transient error
          refreshFailCountRef.current += 1;
          if (refreshFailCountRef.current >= MAX_REFRESH_FAILURES) {
            setState({
              user: null,
              isLoading: false,
              isAuthenticated: false,
              error: new Error('Session expired'),
            });
            onAuthStateChange?.(null);
          } else {
            console.warn('[Auth] Refresh failed, will retry');
          }
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [state.isAuthenticated, onAuthStateChange]);

  const signIn = useCallback(
    async (credentials: LoginCredentials): Promise<AuthUser> => {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      try {
        const response = await authApi.signIn(credentials);
        const user = response.user;

        sessionEstablishedAtRef.current = Date.now();
        setState({
          user,
          isLoading: false,
          isAuthenticated: true,
          error: null,
        });

        onAuthStateChange?.(user);
        return user;
      } catch (error) {
        const authError = error instanceof Error ? error : new Error('Sign in failed');
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: authError,
        }));
        throw authError;
      }
    },
    [onAuthStateChange]
  );

  const signOut = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true }));

    try {
      await authApi.signOut();
    } catch {
      // Continue even if signout fails on server
    } finally {
      setState({
        user: null,
        isLoading: false,
        isAuthenticated: false,
        error: null,
      });
      onAuthStateChange?.(null);
    }
  }, [onAuthStateChange]);

  const refreshSessionHandler = useCallback(async () => {
    try {
      await authApi.refreshSession();
      const user = await authApi.getSession();
      if (user) {
        setState((prev) => ({ ...prev, user }));
      }
    } catch (error) {
      setState({
        user: null,
        isLoading: false,
        isAuthenticated: false,
        error: error instanceof Error ? error : new Error('Session refresh failed'),
      });
      onAuthStateChange?.(null);
    }
  }, [onAuthStateChange]);

  const checkSession = useCallback(async (): Promise<AuthUser | null> => {
    const user = await authApi.checkSession();
    if (user) {
      setState({
        user,
        isLoading: false,
        isAuthenticated: true,
        error: null,
      });
    }
    return user;
  }, []);

  // Extend session - used when user clicks "Stay logged in" on timeout warning
  const extendSession = useCallback(async () => {
    // Reset activity timer
    lastActivityRef.current = Date.now();
    warningShownRef.current = false;

    // Refresh the session
    try {
      await authApi.refreshSession();
      const user = await authApi.getSession();
      if (user) {
        setState((prev) => ({ ...prev, user }));
      }
    } catch (error) {
      console.error('[Auth] Failed to extend session:', error);
      throw error;
    }
  }, []);

  // Get time until session timeout (for UI display)
  const getTimeUntilTimeout = useCallback((): number => {
    const timeSinceLastActivity = Date.now() - lastActivityRef.current;
    return Math.max(0, INACTIVITY_TIMEOUT_MS - timeSinceLastActivity);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      ...state,
      signIn,
      signOut,
      refreshSession: refreshSessionHandler,
      checkSession,
      extendSession,
      getTimeUntilTimeout,
    }),
    [state, signIn, signOut, refreshSessionHandler, checkSession, extendSession, getTimeUntilTimeout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
}

export { AuthContext };
