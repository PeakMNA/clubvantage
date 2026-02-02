/**
 * POS (Point of Sale) Components
 *
 * This module provides a configurable POS system for various outlet types:
 * - Golf Tee Sheet
 * - Golf Pro Shop
 * - F&B Restaurant/Bar/Banquet
 * - Membership
 * - General POS
 *
 * Usage:
 *
 * ```tsx
 * import { POSConfigProvider, usePOSConfig, usePOSToolbar } from '@/components/pos';
 *
 * function MyPOSPanel() {
 *   return (
 *     <POSConfigProvider outlet="golf-tee-sheet" userRole="staff">
 *       <POSToolbar />
 *       <POSContent />
 *       <POSActionBar />
 *     </POSConfigProvider>
 *   );
 * }
 * ```
 */

// Provider and hooks
export {
  POSConfigProvider,
  usePOSConfig,
  usePOSConfigOptional,
  usePOSSelection,
  usePOSToolbar,
  usePOSActionBar,
  usePOSActionHandler,
  usePOSModal,
} from './pos-config-provider';

// Types
export type {
  // Outlet & Template
  POSOutletType,
  POSTemplate,
  POSOutlet,
  POSOutletRoleConfig,

  // Config
  ToolbarConfig,
  ToolbarGroup,
  ActionBarConfig,

  // Buttons
  POSButtonVariant,
  POSButtonSize,
  POSButtonDefinition,
  POSButtonState,
  POSButtonRegistry,

  // Actions
  POSActionType,
  POSActionHandler,
  POSActionResult,

  // Selection
  POSSelectionType,
  POSSelection,

  // Conditions
  POSCondition,
  POSConditionType,
  POSConditionOperator,

  // Modal
  POSActiveModal,

  // Context
  POSConfigContextValue,
  POSConfigProviderProps,

  // GraphQL responses
  POSResolvedConfig,
  GetPOSConfigResponse,
  GetPOSButtonRegistryResponse,
} from './types';

// Template Editor Modal
export {
  TemplateEditorModal,
  type TemplateEditorModalProps,
  type POSTemplateData,
  type POSTemplateInput,
} from './template-editor-modal';
