'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState, useEffect, useCallback, useRef, createContext, useContext, useMemo } from 'react';
import { toast } from 'sonner';
// Direct imports to avoid pulling entire api-client bundle (hundreds of KB of generated hooks)
import { initializeClient, closeClients } from '@clubvantage/api-client/client';
import { AuthProvider } from '@clubvantage/api-client/auth';
import type { AuthUser } from '@clubvantage/api-client/auth';
import { ThemeProvider } from './theme';

// API configuration
// GraphQL uses same-origin rewrite (/graphql → backend) so HttpOnly cookies are sent.
// WebSocket still connects directly to the backend (cookies not needed for WS auth).
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3001';

// --- Session State Context ---

export type SessionStatus = 'active' | 'warning' | 'expired';
export type ExpiredReason = 'inactivity' | 'auth_failure';

export interface SessionState {
  status: SessionStatus;
  remainingMs: number;
  reason: ExpiredReason | null;
}

interface SessionContextValue {
  sessionState: SessionState;
  dismissWarning: () => void;
  getLoginUrl: () => string;
  markIntentionalLogout: () => void;
}

const defaultSessionState: SessionState = {
  status: 'active',
  remainingMs: 0,
  reason: null,
};

const SessionContext = createContext<SessionContextValue | null>(null);

export function useSessionState(): SessionContextValue {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error('useSessionState must be used within Providers');
  }
  return context;
}

// --- Providers ---

interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 minute
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  // Initialize GraphQL client with HttpOnly cookie auth
  useEffect(() => {
    initializeClient({
      endpoint: `${window.location.origin}/graphql`,
      wsEndpoint: `${WS_URL}/graphql`,
    });

    return () => {
      closeClients();
    };
  }, []);

  // Session state management
  const [sessionState, setSessionState] = useState<SessionState>(defaultSessionState);
  const intentionalLogoutRef = useRef(false);
  const previousUserRef = useRef<AuthUser | null | undefined>(undefined);

  const dismissWarning = useCallback(() => {
    setSessionState(defaultSessionState);
  }, []);

  const getLoginUrl = useCallback(() => {
    if (typeof window === 'undefined') return '/login';
    const currentPath = window.location.pathname + window.location.search;
    if (currentPath === '/login' || currentPath === '/') return '/login';
    return `/login?redirect=${encodeURIComponent(currentPath)}`;
  }, []);

  const markIntentionalLogout = useCallback(() => {
    intentionalLogoutRef.current = true;
  }, []);

  // AuthProvider callbacks
  const handleSessionWarning = useCallback((remainingMs: number) => {
    setSessionState({ status: 'warning', remainingMs, reason: null });
    toast.warning('Your session is about to expire due to inactivity.');
  }, []);

  const handleSessionTimeout = useCallback(() => {
    setSessionState({ status: 'expired', remainingMs: 0, reason: 'inactivity' });
  }, []);

  const handleAuthStateChange = useCallback((user: AuthUser | null) => {
    const prevUser = previousUserRef.current;
    previousUserRef.current = user;

    // Skip on initial load (prevUser is undefined)
    if (prevUser === undefined) return;

    // User went from authenticated to unauthenticated
    if (prevUser && !user) {
      // If intentional logout, don't show overlay
      if (intentionalLogoutRef.current) {
        intentionalLogoutRef.current = false;
        setSessionState(defaultSessionState);
        return;
      }

      // Only show expired overlay if not already showing one (e.g. from timeout)
      setSessionState((prev) => {
        if (prev.status === 'expired') return prev;
        return { status: 'expired', remainingMs: 0, reason: 'auth_failure' };
      });
    }

    // User authenticated — reset any stale session state
    if (user && !prevUser) {
      setSessionState(defaultSessionState);
    }
  }, []);

  const sessionContextValue = useMemo<SessionContextValue>(
    () => ({ sessionState, dismissWarning, getLoginUrl, markIntentionalLogout }),
    [sessionState, dismissWarning, getLoginUrl, markIntentionalLogout]
  );

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider
        apiBaseUrl={API_URL}
        onSessionWarning={handleSessionWarning}
        onSessionTimeout={handleSessionTimeout}
        onAuthStateChange={handleAuthStateChange}
      >
        <SessionContext.Provider value={sessionContextValue}>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange={false}
            storageKey="clubvantage-theme"
          >
            {children}
          </ThemeProvider>
        </SessionContext.Provider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
