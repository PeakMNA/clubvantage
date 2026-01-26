'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { initializeClient, closeClients, AuthProvider } from '@clubvantage/api-client';
import { ThemeProvider } from 'next-themes';

// API configuration - uses environment variables
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
      endpoint: `${API_URL}/graphql`,
      wsEndpoint: `${WS_URL}/graphql`,
    });

    return () => {
      closeClients();
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider apiBaseUrl={API_URL}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange={false}
          storageKey="clubvantage-member-theme"
        >
          {children}
        </ThemeProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
