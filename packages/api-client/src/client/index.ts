import { GraphQLClient, RequestDocument, Variables } from 'graphql-request';
import { createClient as createWSClient, Client as WSClient } from 'graphql-ws';

export interface ApiClientConfig {
  endpoint: string;
  wsEndpoint?: string;
}

let graphqlClient: GraphQLClient | null = null;
let wsClient: WSClient | null = null;
let currentConfig: ApiClientConfig | null = null;

/**
 * Initialize the API client with configuration
 */
export function initializeClient(config: ApiClientConfig): void {
  currentConfig = config;

  graphqlClient = new GraphQLClient(config.endpoint, {
    // In graphql-request v7+, fetch options must be passed via the fetch property
    fetch: (url, options) => fetch(url, {
      ...options,
      credentials: 'include', // Required for HttpOnly cookies
      mode: 'cors',
    }),
  });

  // Initialize WebSocket client for subscriptions if wsEndpoint provided
  if (config.wsEndpoint && typeof window !== 'undefined') {
    wsClient = createWSClient({
      url: config.wsEndpoint,
      connectionParams: async () => {
        // Cookies are sent automatically with WebSocket upgrade request
        return {};
      },
    });
  }
}

/**
 * Get the GraphQL client instance
 */
export function getClient(): GraphQLClient {
  if (!graphqlClient) {
    throw new Error(
      'API client not initialized. Call initializeClient() first.'
    );
  }
  return graphqlClient;
}

/**
 * Get the WebSocket client for subscriptions
 */
export function getWSClient(): WSClient | null {
  return wsClient;
}

/**
 * GraphQL fetcher function for React Query hooks
 * This is used by the generated hooks
 */
export function graphqlFetcher<TData, TVariables extends Variables = Variables>(
  document: RequestDocument,
  variables?: TVariables,
  requestHeaders?: HeadersInit
): () => Promise<TData> {
  return async () => {
    const client = getClient();
    return client.request<TData>(document, variables, requestHeaders);
  };
}

/**
 * Direct request function for manual queries
 */
export async function request<TData, TVariables extends Variables = Variables>(
  document: RequestDocument,
  variables?: TVariables,
  requestHeaders?: HeadersInit
): Promise<TData> {
  const client = getClient();
  return client.request<TData>(document, variables, requestHeaders);
}

/**
 * Subscribe to GraphQL subscriptions
 */
export function subscribe<TData, TVariables extends Record<string, unknown> = Record<string, unknown>>(
  query: string,
  variables?: TVariables,
  onData: (data: TData) => void = () => {},
  onError: (error: Error) => void = () => {},
  onComplete: () => void = () => {}
): () => void {
  const client = getWSClient();

  if (!client) {
    console.warn('WebSocket client not initialized. Subscriptions unavailable.');
    return () => {};
  }

  const unsubscribe = client.subscribe<TData>(
    {
      query,
      variables,
    },
    {
      next: (result) => {
        if (result.data) {
          onData(result.data);
        }
      },
      error: (error) => {
        // GraphQL-WS can send various error types, normalize them
        let normalizedError: Error;
        if (error instanceof Error) {
          normalizedError = error;
        } else if (Array.isArray(error)) {
          // Array of GraphQL errors
          normalizedError = new Error(error.map(e => e.message || JSON.stringify(e)).join(', '));
        } else if (error && typeof error === 'object' && 'message' in error) {
          normalizedError = new Error((error as { message: string }).message);
        } else {
          normalizedError = new Error(JSON.stringify(error));
        }
        onError(normalizedError);
      },
      complete: onComplete,
    }
  );

  return unsubscribe;
}

/**
 * Close all client connections
 */
export function closeClients(): void {
  if (wsClient) {
    wsClient.dispose();
    wsClient = null;
  }
  graphqlClient = null;
  currentConfig = null;
}

export { GraphQLClient };
