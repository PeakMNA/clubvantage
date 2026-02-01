'use client';

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  useMemo,
} from 'react';
import { useQuery } from '@tanstack/react-query';
import { request } from '@clubvantage/api-client';
import type {
  POSConfigContextValue,
  POSConfigProviderProps,
  POSSelection,
  POSButtonState,
  POSButtonDefinition,
  POSActiveModal,
  POSActionHandler,
  POSActionResult,
  POSResolvedConfig,
  POSButtonRegistry,
  GetPOSConfigResponse,
  GetPOSButtonRegistryResponse,
} from './types';

// ============================================================================
// GRAPHQL QUERIES
// ============================================================================

const GET_POS_CONFIG_QUERY = `
  query GetPOSConfig($outletId: ID!, $userRole: String!, $userPermissions: [String!]) {
    posConfig(outletId: $outletId, userRole: $userRole, userPermissions: $userPermissions) {
      outlet {
        id
        clubId
        name
        outletType
        templateId
        customConfig
        isActive
        createdAt
        updatedAt
      }
      template {
        id
        clubId
        name
        description
        outletType
        toolbarConfig
        actionBarConfig
        isDefault
        createdAt
        updatedAt
      }
      toolbarConfig
      actionBarConfig
      buttonStates {
        buttonId
        visible
        enabled
        requiresApproval
      }
    }
  }
`;

const GET_POS_BUTTON_REGISTRY_QUERY = `
  query GetPOSButtonRegistry {
    posButtonRegistry {
      clubId
      registry
      updatedAt
    }
  }
`;

// ============================================================================
// CONTEXT
// ============================================================================

const POSConfigContext = createContext<POSConfigContextValue | null>(null);

/**
 * Hook to access POS configuration context
 */
export function usePOSConfig(): POSConfigContextValue {
  const context = useContext(POSConfigContext);
  if (!context) {
    throw new Error('usePOSConfig must be used within a POSConfigProvider');
  }
  return context;
}

/**
 * Optional hook that returns null if not within provider
 */
export function usePOSConfigOptional(): POSConfigContextValue | null {
  return useContext(POSConfigContext);
}

// ============================================================================
// DEFAULT VALUES
// ============================================================================

const DEFAULT_SELECTION: POSSelection = {
  type: 'none',
  id: null,
};

// ============================================================================
// KEYBOARD SHORTCUT HOOK
// ============================================================================

function useKeyboardShortcuts(
  buttonRegistry: Record<string, POSButtonDefinition>,
  buttonStates: Map<string, POSButtonState>,
  executeAction: (buttonId: string) => Promise<POSActionResult>
) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Skip if user is typing in an input
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement ||
        (event.target instanceof HTMLElement && event.target.isContentEditable)
      ) {
        return;
      }

      // Build the shortcut string from the event
      const parts: string[] = [];
      if (event.ctrlKey || event.metaKey) parts.push('Ctrl');
      if (event.altKey) parts.push('Alt');
      if (event.shiftKey) parts.push('Shift');

      // Handle special keys
      const key = event.key.length === 1 ? event.key.toUpperCase() : event.key;
      parts.push(key);

      const pressedShortcut = parts.join('+');

      // Find a button with this shortcut
      for (const [buttonId, definition] of Object.entries(buttonRegistry)) {
        if (definition.shortcut === pressedShortcut) {
          const state = buttonStates.get(buttonId);
          if (state?.enabled && state?.visible) {
            event.preventDefault();
            event.stopPropagation();
            executeAction(buttonId);
            return;
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [buttonRegistry, buttonStates, executeAction]);
}

// ============================================================================
// PROVIDER COMPONENT
// ============================================================================

export function POSConfigProvider({
  outlet,
  children,
  userRole = 'staff',
  userPermissions = [],
  onError,
  initialSelection,
}: POSConfigProviderProps) {
  // ============================================================================
  // STATE
  // ============================================================================

  const [selection, setSelection] = useState<POSSelection>(
    initialSelection || DEFAULT_SELECTION
  );
  const [activeModal, setActiveModal] = useState<POSActiveModal | null>(null);

  // Action handlers registry - stored in ref to avoid re-renders
  const actionHandlersRef = useRef<Map<string, POSActionHandler>>(new Map());

  // ============================================================================
  // DATA FETCHING
  // ============================================================================

  // Fetch resolved POS config for the outlet
  const {
    data: configData,
    isLoading: isConfigLoading,
    error: configError,
  } = useQuery<GetPOSConfigResponse>({
    queryKey: ['GetPOSConfig', outlet, userRole, JSON.stringify(userPermissions?.sort() || [])],
    queryFn: async () => {
      return request<GetPOSConfigResponse>(GET_POS_CONFIG_QUERY, {
        outletId: outlet,
        userRole,
        userPermissions,
      });
    },
    enabled: !!outlet,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });

  // Fetch button registry
  const {
    data: registryData,
    isLoading: isRegistryLoading,
    error: registryError,
  } = useQuery<GetPOSButtonRegistryResponse>({
    queryKey: ['GetPOSButtonRegistry'],
    queryFn: async () => {
      return request<GetPOSButtonRegistryResponse>(GET_POS_BUTTON_REGISTRY_QUERY);
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
  });

  // ============================================================================
  // ERROR HANDLING
  // ============================================================================

  const error = useMemo(() => {
    if (configError) return configError as Error;
    if (registryError) return registryError as Error;
    return null;
  }, [configError, registryError]);

  useEffect(() => {
    if (error && onError) {
      onError(error);
    }
  }, [error, onError]);

  // ============================================================================
  // DERIVED STATE
  // ============================================================================

  const resolvedConfig = configData?.posConfig;
  const buttonRegistry = registryData?.posButtonRegistry?.registry || {};

  // Convert button states array to Map for O(1) lookup
  const buttonStates = useMemo(() => {
    const states = new Map<string, POSButtonState>();
    if (resolvedConfig?.buttonStates) {
      for (const state of resolvedConfig.buttonStates) {
        states.set(state.buttonId, state);
      }
    }
    return states;
  }, [resolvedConfig?.buttonStates]);

  // ============================================================================
  // ACTION HANDLERS
  // ============================================================================

  const registerActionHandler = useCallback(
    (buttonId: string, handler: POSActionHandler) => {
      actionHandlersRef.current.set(buttonId, handler);

      // Return cleanup function
      return () => {
        actionHandlersRef.current.delete(buttonId);
      };
    },
    []
  );

  const executeAction = useCallback(
    async (buttonId: string, payload?: Record<string, any>): Promise<POSActionResult> => {
      // Check if button exists and is enabled
      const buttonState = buttonStates.get(buttonId);
      if (!buttonState) {
        return {
          success: false,
          message: `Button "${buttonId}" not found`,
        };
      }

      if (!buttonState.enabled) {
        return {
          success: false,
          message: `Button "${buttonId}" is disabled`,
        };
      }

      if (!buttonState.visible) {
        return {
          success: false,
          message: `Button "${buttonId}" is not visible`,
        };
      }

      // Check if approval is required
      if (buttonState.requiresApproval) {
        const approved = await requestApproval(buttonId);
        if (!approved) {
          return { success: false, message: 'Manager approval required' };
        }
      }

      // Get the button definition for action type
      const buttonDef = buttonRegistry[buttonId];
      if (!buttonDef) {
        return {
          success: false,
          message: `Button definition for "${buttonId}" not found`,
        };
      }

      // If button opens a modal, open it
      if (buttonDef.opensModal) {
        setActiveModal({
          id: buttonDef.opensModal,
          props: { ...buttonDef.actionPayload, ...payload },
        });
        return { success: true };
      }

      // Look for registered handler
      const handler = actionHandlersRef.current.get(buttonId);
      if (handler) {
        try {
          await handler({ ...buttonDef.actionPayload, ...payload });
          return { success: true };
        } catch (err) {
          const message = err instanceof Error ? err.message : 'Action failed';
          console.error(`POS action handler error for button "${buttonId}":`, err);
          return { success: false, message };
        }
      }

      // No handler registered - this might be okay for some button types
      console.warn(`No handler registered for button "${buttonId}"`);
      return {
        success: false,
        message: `No handler registered for button "${buttonId}"`,
      };
    },
    [buttonStates, buttonRegistry]
  );

  // ============================================================================
  // MODAL CONTROLS
  // ============================================================================

  const openModal = useCallback((modalId: string, props?: Record<string, any>) => {
    setActiveModal({ id: modalId, props });
  }, []);

  const closeModal = useCallback(() => {
    setActiveModal(null);
  }, []);

  // ============================================================================
  // APPROVAL WORKFLOW
  // ============================================================================

  const requestApproval = useCallback(
    async (buttonId: string, reason?: string): Promise<boolean> => {
      // TODO: Implement approval workflow
      // This would typically open a modal asking for manager approval
      // For now, return true to allow the action
      console.warn(
        `Approval requested for button "${buttonId}" with reason: ${reason || 'none'}`
      );
      return true;
    },
    []
  );

  // ============================================================================
  // UTILITY FUNCTIONS
  // ============================================================================

  const getButtonState = useCallback(
    (buttonId: string): POSButtonState | undefined => {
      return buttonStates.get(buttonId);
    },
    [buttonStates]
  );

  const isButtonEnabled = useCallback(
    (buttonId: string): boolean => {
      const state = buttonStates.get(buttonId);
      return state?.enabled ?? false;
    },
    [buttonStates]
  );

  const isButtonVisible = useCallback(
    (buttonId: string): boolean => {
      const state = buttonStates.get(buttonId);
      return state?.visible ?? false;
    },
    [buttonStates]
  );

  // ============================================================================
  // KEYBOARD SHORTCUTS
  // ============================================================================

  useKeyboardShortcuts(buttonRegistry, buttonStates, executeAction);

  // ============================================================================
  // CONTEXT VALUE
  // ============================================================================

  const contextValue: POSConfigContextValue = useMemo(
    () => ({
      // Config data
      outlet: resolvedConfig?.outlet || null,
      template: resolvedConfig?.template || null,
      toolbarConfig: resolvedConfig?.toolbarConfig || null,
      actionBarConfig: resolvedConfig?.actionBarConfig || null,
      buttonStates,
      buttonRegistry,

      // Loading states
      isLoading: isConfigLoading || isRegistryLoading,
      error,

      // Selection state
      selection,
      setSelection,

      // Action execution
      executeAction,
      registerActionHandler,

      // Modal controls
      openModal,
      closeModal,
      activeModal,

      // Approval workflow
      requestApproval,

      // Utility
      getButtonState,
      isButtonEnabled,
      isButtonVisible,
    }),
    [
      resolvedConfig,
      buttonStates,
      buttonRegistry,
      isConfigLoading,
      isRegistryLoading,
      error,
      selection,
      executeAction,
      registerActionHandler,
      openModal,
      closeModal,
      activeModal,
      requestApproval,
      getButtonState,
      isButtonEnabled,
      isButtonVisible,
    ]
  );

  return (
    <POSConfigContext.Provider value={contextValue}>
      {children}
    </POSConfigContext.Provider>
  );
}

// ============================================================================
// CONVENIENCE HOOKS
// ============================================================================

/**
 * Hook to get the current selection
 */
export function usePOSSelection() {
  const { selection, setSelection } = usePOSConfig();
  return { selection, setSelection };
}

/**
 * Hook to get toolbar configuration
 */
export function usePOSToolbar() {
  const { toolbarConfig, buttonRegistry, getButtonState, executeAction } = usePOSConfig();
  return { toolbarConfig, buttonRegistry, getButtonState, executeAction };
}

/**
 * Hook to get action bar configuration
 */
export function usePOSActionBar() {
  const { actionBarConfig, buttonRegistry, getButtonState, executeAction } = usePOSConfig();
  return { actionBarConfig, buttonRegistry, getButtonState, executeAction };
}

/**
 * Hook to register an action handler
 */
export function usePOSActionHandler(buttonId: string, handler: POSActionHandler) {
  const { registerActionHandler } = usePOSConfig();

  useEffect(() => {
    const unregister = registerActionHandler(buttonId, handler);
    return unregister;
  }, [buttonId, handler, registerActionHandler]);
}

/**
 * Hook to get modal controls
 */
export function usePOSModal() {
  const { activeModal, openModal, closeModal } = usePOSConfig();
  return { activeModal, openModal, closeModal };
}

export default POSConfigProvider;
