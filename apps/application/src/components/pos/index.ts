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

// Action hooks
export { usePOSActions } from './hooks';

// Config mappers and utilities
export {
  // Mappers
  mapToolbarConfig,
  mapActionBarConfig,
  mapTemplateToComponentConfig,
  createButtonRegistry,
  createButtonStates,
  // Constants
  DEFAULT_BUTTON_REGISTRY,
  // Action Types
  POS_ACTION_TYPES,
  ACTION_TYPE_METADATA,
  getActionTypesByCategory,
  getActionTypeOptions,
  getActionTypeIcon,
  actionRequiresSelection,
  actionRequiresMember,
  isActionDangerous,
  // Action Handlers
  executeAction,
  createActionExecutor,
} from './utils';

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
  type ToolbarGroup as TemplateToolbarGroup,
  type ToolbarConfig as TemplateToolbarConfig,
  type ActionButton as TemplateActionButton,
  type ActionBarConfig as TemplateActionBarConfig,
} from './template-editor-modal';

// Visibility Rules Builder
export {
  VisibilityRulesBuilder,
  type VisibilityRule,
  type VisibilityRuleType,
  type VisibilityRuleOperator,
  type VisibilityRulesBuilderProps,
} from './visibility-rules-builder';
