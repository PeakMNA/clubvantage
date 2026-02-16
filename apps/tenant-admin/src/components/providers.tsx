'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
// Direct imports to avoid pulling entire api-client bundle
import { initializeClient, closeClients } from '@clubvantage/api-client/client';
import { AuthProvider } from '@clubvantage/api-client/auth';

// API configuration
// GraphQL uses same-origin rewrite (/graphql -> backend) so HttpOnly cookies are sent.
// WebSocket still connects directly to the backend (cookies not needed for WS auth).
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3001';

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

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider apiBaseUrl={API_URL}>
        {children}
      </AuthProvider>
    </QueryClientProvider>
  );
}
