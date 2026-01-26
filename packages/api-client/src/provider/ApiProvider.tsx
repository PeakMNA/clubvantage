'use client';

import React, { useEffect, useMemo } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { initializeClient, closeClients, type ApiClientConfig } from '../client';

export interface ApiProviderProps {
  children: React.ReactNode;
  config: ApiClientConfig;
  queryClientOptions?: {
    defaultOptions?: {
      queries?: {
        staleTime?: number;
        gcTime?: number;
        refetchOnWindowFocus?: boolean;
        retry?: number | boolean;
      };
      mutations?: {
        retry?: number | boolean;
      };
    };
  };
}

/**
 * Provider component that sets up the GraphQL client and React Query
 * for use in frontend applications with HttpOnly cookie authentication
 */
export function ApiProvider({
  children,
  config,
  queryClientOptions,
}: ApiProviderProps) {
  // Initialize GraphQL client
  useEffect(() => {
    initializeClient(config);

    return () => {
      closeClients();
    };
  }, [config.endpoint, config.wsEndpoint]);

  // Create QueryClient instance
  const queryClient = useMemo(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 1000 * 60 * 5, // 5 minutes
            gcTime: 1000 * 60 * 30, // 30 minutes
            refetchOnWindowFocus: false,
            retry: 1,
            ...queryClientOptions?.defaultOptions?.queries,
          },
          mutations: {
            retry: 0,
            ...queryClientOptions?.defaultOptions?.mutations,
          },
        },
      }),
    []
  );

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

export default ApiProvider;
