'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import { subscribe } from '../client';

export interface UseSubscriptionOptions<TData> {
  enabled?: boolean;
  onData?: (data: TData) => void;
  onError?: (error: Error) => void;
  onComplete?: () => void;
}

export interface UseSubscriptionResult<TData> {
  data: TData | null;
  error: Error | null;
  isConnected: boolean;
}

/**
 * Hook for GraphQL subscriptions
 */
export function useSubscription<TData, TVariables extends Record<string, unknown> = Record<string, unknown>>(
  query: string,
  variables?: TVariables,
  options: UseSubscriptionOptions<TData> = {}
): UseSubscriptionResult<TData> {
  const { enabled = true, onData, onError, onComplete } = options;
  const [data, setData] = useState<TData | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const unsubscribeRef = useRef<(() => void) | null>(null);

  const handleData = useCallback(
    (newData: TData) => {
      setData(newData);
      setError(null);
      onData?.(newData);
    },
    [onData]
  );

  const handleError = useCallback(
    (err: Error) => {
      setError(err);
      setIsConnected(false);
      onError?.(err);
    },
    [onError]
  );

  const handleComplete = useCallback(() => {
    setIsConnected(false);
    onComplete?.();
  }, [onComplete]);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    setIsConnected(true);
    unsubscribeRef.current = subscribe<TData, TVariables>(
      query,
      variables,
      handleData,
      handleError,
      handleComplete
    );

    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
      setIsConnected(false);
    };
  }, [query, JSON.stringify(variables), enabled, handleData, handleError, handleComplete]);

  return { data, error, isConnected };
}
