'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import type { AuthUser, AuthContextValue, LoginCredentials, AuthState } from './types';
import * as authApi from './api';

const AuthContext = createContext<AuthContextValue | null>(null);

export interface AuthProviderProps {
  children: React.ReactNode;
  apiBaseUrl?: string;
  onAuthStateChange?: (user: AuthUser | null) => void;
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
}: AuthProviderProps) {
  const [state, setState] = useState<AuthState>(initialState);

  // Configure API base URL
  useEffect(() => {
    if (apiBaseUrl) {
      authApi.configureAuthApi(apiBaseUrl);
    }
  }, [apiBaseUrl]);

  // Check session on mount
  useEffect(() => {
    const initAuth = async () => {
      try {
        const user = await authApi.checkSession();
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

  // Set up session refresh interval
  useEffect(() => {
    if (!state.isAuthenticated) return;

    // Refresh session every 10 minutes
    const refreshInterval = setInterval(async () => {
      try {
        await authApi.refreshSession();
      } catch {
        // If refresh fails, session is invalid
        setState({
          user: null,
          isLoading: false,
          isAuthenticated: false,
          error: new Error('Session expired'),
        });
        onAuthStateChange?.(null);
      }
    }, 10 * 60 * 1000);

    return () => clearInterval(refreshInterval);
  }, [state.isAuthenticated, onAuthStateChange]);

  const signIn = useCallback(
    async (credentials: LoginCredentials): Promise<AuthUser> => {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      try {
        const response = await authApi.signIn(credentials);
        const user = response.user;

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

  const value = useMemo<AuthContextValue>(
    () => ({
      ...state,
      signIn,
      signOut,
      refreshSession: refreshSessionHandler,
      checkSession,
    }),
    [state, signIn, signOut, refreshSessionHandler, checkSession]
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
