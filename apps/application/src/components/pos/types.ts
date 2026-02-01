/**
 * POS Configuration Types
 *
 * Type definitions for the Point of Sale system configuration,
 * including outlets, templates, button states, and action handlers.
 */

// ============================================================================
// OUTLET & TEMPLATE TYPES
// ============================================================================

/**
 * Outlet types determine which template options are available
 */
export type POSOutletType =
  | 'GOLF_TEE_SHEET'
  | 'GOLF_PRO_SHOP'
  | 'FNB_RESTAURANT'
  | 'FNB_BAR'
  | 'FNB_BANQUET'
  | 'MEMBERSHIP'
  | 'GENERAL';

/**
 * POS Template defines the base configuration for a type of outlet
 */
export interface POSTemplate {
  id: string;
  clubId: string;
  name: string;
  description?: string;
  outletType: POSOutletType;
  toolbarConfig: ToolbarConfig;
  actionBarConfig: ActionBarConfig;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * POS Outlet represents a physical or virtual point of sale location
 */
export interface POSOutlet {
  id: string;
  clubId: string;
  name: string;
  outletType: POSOutletType;
  templateId?: string;
  template?: POSTemplate;
  customConfig: Partial<ToolbarConfig & ActionBarConfig>;
  roleConfigs?: POSOutletRoleConfig[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Role-specific configuration overrides for an outlet
 */
export interface POSOutletRoleConfig {
  id: string;
  outletId: string;
  role: string;
  buttonOverrides: Record<string, Partial<POSButtonState>>;
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// TOOLBAR & ACTION BAR CONFIGURATION
// ============================================================================

/**
 * Toolbar configuration - top row of quick-access buttons
 */
export interface ToolbarConfig {
  groups: ToolbarGroup[];
}

/**
 * Group of related toolbar buttons
 */
export interface ToolbarGroup {
  id: string;
  label: string;
  position: number;
  buttons: string[]; // Button IDs from the registry
}

/**
 * Action bar configuration - bottom row of action buttons
 */
export interface ActionBarConfig {
  primaryAction: string; // Button ID
  secondaryActions: string[]; // Button IDs
  cancelAction: string; // Button ID
}

// ============================================================================
// BUTTON TYPES
// ============================================================================

/**
 * Button style variants
 */
export type POSButtonVariant =
  | 'default'
  | 'primary'
  | 'success'
  | 'warning'
  | 'danger'
  | 'ghost';

/**
 * Button size options
 */
export type POSButtonSize = 'sm' | 'md' | 'lg';

/**
 * Button definition in the registry
 */
export interface POSButtonDefinition {
  id: string;
  label: string;
  icon?: string;
  variant: POSButtonVariant;
  size: POSButtonSize;
  shortcut?: string; // e.g., "Ctrl+P", "F2"
  tooltip?: string;

  // Access control
  requiredPermission?: string;
  requiresApproval?: boolean;
  approvalRoles?: string[];

  // Behavior
  actionType: POSActionType;
  actionPayload?: Record<string, any>;
  opensModal?: string; // Modal ID to open

  // Conditional visibility/enablement
  visibleWhen?: POSCondition;
  enabledWhen?: POSCondition;
}

/**
 * Current state of a button (resolved for the current context)
 */
export interface POSButtonState {
  buttonId: string;
  visible: boolean;
  enabled: boolean;
  requiresApproval: boolean;
}

/**
 * Button registry - all available buttons for a club
 */
export interface POSButtonRegistry {
  clubId: string;
  registry: Record<string, POSButtonDefinition>;
  updatedAt: string;
}

// ============================================================================
// ACTION TYPES
// ============================================================================

/**
 * Types of actions buttons can trigger
 */
export type POSActionType =
  | 'add_line_item'
  | 'remove_line_item'
  | 'apply_discount'
  | 'process_payment'
  | 'void_transaction'
  | 'print_receipt'
  | 'open_drawer'
  | 'check_in'
  | 'cancel_sale'
  | 'hold_sale'
  | 'recall_sale'
  | 'split_payment'
  | 'transfer_items'
  | 'open_modal'
  | 'custom';

/**
 * Handler function for button actions
 */
export type POSActionHandler = (
  payload?: Record<string, any>
) => Promise<void> | void;

/**
 * Result of an action execution
 */
export interface POSActionResult {
  success: boolean;
  message?: string;
  data?: any;
}

// ============================================================================
// SELECTION STATE
// ============================================================================

/**
 * What type of item is selected in the POS
 */
export type POSSelectionType =
  | 'none'
  | 'player'
  | 'line_item'
  | 'flight'
  | 'booking';

/**
 * Current selection state in the POS
 */
export interface POSSelection {
  type: POSSelectionType;
  id: string | null;
  data?: any;

  // Multiple selection support
  multiSelect?: boolean;
  selectedIds?: string[];
}

// ============================================================================
// CONDITIONS
// ============================================================================

/**
 * Condition for conditional button visibility/enablement
 */
export interface POSCondition {
  type: POSConditionType;
  field?: string;
  operator?: POSConditionOperator;
  value?: any;
  conditions?: POSCondition[]; // For AND/OR grouping
}

export type POSConditionType =
  | 'selection_type'
  | 'selection_count'
  | 'has_line_items'
  | 'line_item_type'
  | 'payment_status'
  | 'user_permission'
  | 'and'
  | 'or'
  | 'not';

export type POSConditionOperator =
  | 'equals'
  | 'not_equals'
  | 'greater_than'
  | 'less_than'
  | 'in'
  | 'not_in'
  | 'exists'
  | 'not_exists';

// ============================================================================
// MODAL TYPES
// ============================================================================

/**
 * Active modal state
 */
export interface POSActiveModal {
  id: string;
  props?: Record<string, any>;
}

// ============================================================================
// CONTEXT VALUE
// ============================================================================

/**
 * Full context value provided by POSConfigProvider
 */
export interface POSConfigContextValue {
  // Config data
  outlet: POSOutlet | null;
  template: POSTemplate | null;
  toolbarConfig: ToolbarConfig | null;
  actionBarConfig: ActionBarConfig | null;
  buttonStates: Map<string, POSButtonState>;
  buttonRegistry: Record<string, POSButtonDefinition>;

  // Loading states
  isLoading: boolean;
  error: Error | null;

  // Selection state (passed from wrapped panel)
  selection: POSSelection;
  setSelection: (selection: POSSelection) => void;

  // Action execution
  executeAction: (buttonId: string, payload?: Record<string, any>) => Promise<POSActionResult>;
  registerActionHandler: (buttonId: string, handler: POSActionHandler) => () => void;

  // Modal controls
  openModal: (modalId: string, props?: Record<string, any>) => void;
  closeModal: () => void;
  activeModal: POSActiveModal | null;

  // Approval workflow
  requestApproval: (buttonId: string, reason?: string) => Promise<boolean>;

  // Utility
  getButtonState: (buttonId: string) => POSButtonState | undefined;
  isButtonEnabled: (buttonId: string) => boolean;
  isButtonVisible: (buttonId: string) => boolean;
}

/**
 * Props for POSConfigProvider component
 */
export interface POSConfigProviderProps {
  outlet: string; // outlet ID or name
  children: React.ReactNode;
  userRole?: string;
  userPermissions?: string[];
  onError?: (error: Error) => void;

  // Initial selection (optional)
  initialSelection?: POSSelection;
}

// ============================================================================
// GRAPHQL RESPONSE TYPES
// ============================================================================

/**
 * Resolved config from GraphQL API
 */
export interface POSResolvedConfig {
  outlet: POSOutlet;
  template?: POSTemplate;
  toolbarConfig: ToolbarConfig;
  actionBarConfig: ActionBarConfig;
  buttonStates: POSButtonState[];
}

/**
 * GraphQL query response for getPOSConfig
 */
export interface GetPOSConfigResponse {
  posConfig: POSResolvedConfig;
}

/**
 * GraphQL query response for getPOSButtonRegistry
 */
export interface GetPOSButtonRegistryResponse {
  posButtonRegistry: POSButtonRegistry;
}
