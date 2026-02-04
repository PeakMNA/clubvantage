/**
 * POS Action Types
 *
 * Defines all possible actions that can be triggered by POS buttons.
 * Each action type maps to a handler function in the action registry.
 */

// ============================================================================
// ACTION TYPE CONSTANTS
// ============================================================================

export const POS_ACTION_TYPES = {
  // Payment Actions
  OPEN_PAYMENT_MODAL: 'OPEN_PAYMENT_MODAL',
  PROCESS_CASH_PAYMENT: 'PROCESS_CASH_PAYMENT',
  PROCESS_CARD_PAYMENT: 'PROCESS_CARD_PAYMENT',
  CHARGE_TO_MEMBER: 'CHARGE_TO_MEMBER',
  SPLIT_PAYMENT: 'SPLIT_PAYMENT',

  // Transaction Actions
  CANCEL_TRANSACTION: 'CANCEL_TRANSACTION',
  HOLD_TICKET: 'HOLD_TICKET',
  RECALL_TICKET: 'RECALL_TICKET',
  VOID_TRANSACTION: 'VOID_TRANSACTION',

  // Item Actions
  VOID_ITEM: 'VOID_ITEM',
  APPLY_DISCOUNT: 'APPLY_DISCOUNT',
  APPLY_ITEM_DISCOUNT: 'APPLY_ITEM_DISCOUNT',
  CHANGE_QUANTITY: 'CHANGE_QUANTITY',
  ADD_MODIFIER: 'ADD_MODIFIER',
  PRICE_OVERRIDE: 'PRICE_OVERRIDE',

  // Utility Actions
  PRINT_RECEIPT: 'PRINT_RECEIPT',
  OPEN_DRAWER: 'OPEN_DRAWER',
  PRICE_CHECK: 'PRICE_CHECK',

  // Member Actions
  MEMBER_LOOKUP: 'MEMBER_LOOKUP',
  ATTACH_MEMBER: 'ATTACH_MEMBER',
  DETACH_MEMBER: 'DETACH_MEMBER',

  // Navigation Actions
  NEW_TICKET: 'NEW_TICKET',
  SWITCH_OUTLET: 'SWITCH_OUTLET',

  // Custom Action (for extensibility)
  CUSTOM: 'CUSTOM',
} as const

export type POSActionType = typeof POS_ACTION_TYPES[keyof typeof POS_ACTION_TYPES]

// ============================================================================
// ACTION TYPE METADATA (for UI display)
// ============================================================================

export interface ActionTypeMetadata {
  id: POSActionType
  label: string
  description: string
  category: 'payment' | 'transaction' | 'item' | 'utility' | 'member' | 'navigation'
  defaultIcon: string
  requiresSelection?: boolean // Requires an item to be selected
  requiresMember?: boolean    // Requires a member to be attached
  dangerous?: boolean         // Shows confirmation dialog
}

export const ACTION_TYPE_METADATA: Record<POSActionType, ActionTypeMetadata> = {
  // Payment Actions
  [POS_ACTION_TYPES.OPEN_PAYMENT_MODAL]: {
    id: POS_ACTION_TYPES.OPEN_PAYMENT_MODAL,
    label: 'Open Payment',
    description: 'Opens the payment modal to complete the transaction',
    category: 'payment',
    defaultIcon: 'CreditCard',
  },
  [POS_ACTION_TYPES.PROCESS_CASH_PAYMENT]: {
    id: POS_ACTION_TYPES.PROCESS_CASH_PAYMENT,
    label: 'Cash Payment',
    description: 'Process payment with cash',
    category: 'payment',
    defaultIcon: 'Banknote',
  },
  [POS_ACTION_TYPES.PROCESS_CARD_PAYMENT]: {
    id: POS_ACTION_TYPES.PROCESS_CARD_PAYMENT,
    label: 'Card Payment',
    description: 'Process payment with credit/debit card',
    category: 'payment',
    defaultIcon: 'CreditCard',
  },
  [POS_ACTION_TYPES.CHARGE_TO_MEMBER]: {
    id: POS_ACTION_TYPES.CHARGE_TO_MEMBER,
    label: 'Charge to Member',
    description: 'Charge the transaction to member account',
    category: 'payment',
    defaultIcon: 'UserCheck',
    requiresMember: true,
  },
  [POS_ACTION_TYPES.SPLIT_PAYMENT]: {
    id: POS_ACTION_TYPES.SPLIT_PAYMENT,
    label: 'Split Payment',
    description: 'Split payment between multiple methods',
    category: 'payment',
    defaultIcon: 'Split',
  },

  // Transaction Actions
  [POS_ACTION_TYPES.CANCEL_TRANSACTION]: {
    id: POS_ACTION_TYPES.CANCEL_TRANSACTION,
    label: 'Cancel Transaction',
    description: 'Cancel and clear the current transaction',
    category: 'transaction',
    defaultIcon: 'X',
    dangerous: true,
  },
  [POS_ACTION_TYPES.HOLD_TICKET]: {
    id: POS_ACTION_TYPES.HOLD_TICKET,
    label: 'Hold Ticket',
    description: 'Save the current ticket for later',
    category: 'transaction',
    defaultIcon: 'Pause',
  },
  [POS_ACTION_TYPES.RECALL_TICKET]: {
    id: POS_ACTION_TYPES.RECALL_TICKET,
    label: 'Recall Ticket',
    description: 'Recall a held ticket',
    category: 'transaction',
    defaultIcon: 'Play',
  },
  [POS_ACTION_TYPES.VOID_TRANSACTION]: {
    id: POS_ACTION_TYPES.VOID_TRANSACTION,
    label: 'Void Transaction',
    description: 'Void the entire transaction',
    category: 'transaction',
    defaultIcon: 'Trash2',
    dangerous: true,
  },

  // Item Actions
  [POS_ACTION_TYPES.VOID_ITEM]: {
    id: POS_ACTION_TYPES.VOID_ITEM,
    label: 'Void Item',
    description: 'Remove the selected item from the ticket',
    category: 'item',
    defaultIcon: 'Trash2',
    requiresSelection: true,
    dangerous: true,
  },
  [POS_ACTION_TYPES.APPLY_DISCOUNT]: {
    id: POS_ACTION_TYPES.APPLY_DISCOUNT,
    label: 'Apply Discount',
    description: 'Apply a discount to the transaction',
    category: 'item',
    defaultIcon: 'Percent',
  },
  [POS_ACTION_TYPES.APPLY_ITEM_DISCOUNT]: {
    id: POS_ACTION_TYPES.APPLY_ITEM_DISCOUNT,
    label: 'Item Discount',
    description: 'Apply a discount to the selected item',
    category: 'item',
    defaultIcon: 'Percent',
    requiresSelection: true,
  },
  [POS_ACTION_TYPES.CHANGE_QUANTITY]: {
    id: POS_ACTION_TYPES.CHANGE_QUANTITY,
    label: 'Change Quantity',
    description: 'Change the quantity of the selected item',
    category: 'item',
    defaultIcon: 'Hash',
    requiresSelection: true,
  },
  [POS_ACTION_TYPES.ADD_MODIFIER]: {
    id: POS_ACTION_TYPES.ADD_MODIFIER,
    label: 'Add Modifier',
    description: 'Add a modifier to the selected item',
    category: 'item',
    defaultIcon: 'Plus',
    requiresSelection: true,
  },
  [POS_ACTION_TYPES.PRICE_OVERRIDE]: {
    id: POS_ACTION_TYPES.PRICE_OVERRIDE,
    label: 'Price Override',
    description: 'Override the price of the selected item',
    category: 'item',
    defaultIcon: 'DollarSign',
    requiresSelection: true,
  },

  // Utility Actions
  [POS_ACTION_TYPES.PRINT_RECEIPT]: {
    id: POS_ACTION_TYPES.PRINT_RECEIPT,
    label: 'Print Receipt',
    description: 'Print a receipt for the transaction',
    category: 'utility',
    defaultIcon: 'Printer',
  },
  [POS_ACTION_TYPES.OPEN_DRAWER]: {
    id: POS_ACTION_TYPES.OPEN_DRAWER,
    label: 'Open Drawer',
    description: 'Open the cash drawer',
    category: 'utility',
    defaultIcon: 'Archive',
  },
  [POS_ACTION_TYPES.PRICE_CHECK]: {
    id: POS_ACTION_TYPES.PRICE_CHECK,
    label: 'Price Check',
    description: 'Check the price of a product',
    category: 'utility',
    defaultIcon: 'Search',
  },

  // Member Actions
  [POS_ACTION_TYPES.MEMBER_LOOKUP]: {
    id: POS_ACTION_TYPES.MEMBER_LOOKUP,
    label: 'Member Lookup',
    description: 'Search for a member',
    category: 'member',
    defaultIcon: 'Search',
  },
  [POS_ACTION_TYPES.ATTACH_MEMBER]: {
    id: POS_ACTION_TYPES.ATTACH_MEMBER,
    label: 'Attach Member',
    description: 'Attach a member to this transaction',
    category: 'member',
    defaultIcon: 'UserPlus',
  },
  [POS_ACTION_TYPES.DETACH_MEMBER]: {
    id: POS_ACTION_TYPES.DETACH_MEMBER,
    label: 'Detach Member',
    description: 'Remove member from this transaction',
    category: 'member',
    defaultIcon: 'UserMinus',
    requiresMember: true,
  },

  // Navigation Actions
  [POS_ACTION_TYPES.NEW_TICKET]: {
    id: POS_ACTION_TYPES.NEW_TICKET,
    label: 'New Ticket',
    description: 'Start a new transaction',
    category: 'navigation',
    defaultIcon: 'Plus',
  },
  [POS_ACTION_TYPES.SWITCH_OUTLET]: {
    id: POS_ACTION_TYPES.SWITCH_OUTLET,
    label: 'Switch Outlet',
    description: 'Switch to a different POS outlet',
    category: 'navigation',
    defaultIcon: 'RefreshCw',
  },

  // Custom Action
  [POS_ACTION_TYPES.CUSTOM]: {
    id: POS_ACTION_TYPES.CUSTOM,
    label: 'Custom Action',
    description: 'A custom action defined by the outlet',
    category: 'utility',
    defaultIcon: 'Settings',
  },
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get action types grouped by category for UI display
 */
export function getActionTypesByCategory(): Record<string, ActionTypeMetadata[]> {
  const grouped: Record<string, ActionTypeMetadata[]> = {
    payment: [],
    transaction: [],
    item: [],
    utility: [],
    member: [],
    navigation: [],
  }

  for (const metadata of Object.values(ACTION_TYPE_METADATA)) {
    const category = grouped[metadata.category]
    if (category) {
      category.push(metadata)
    }
  }

  return grouped
}

/**
 * Get action type options for a dropdown select
 */
export function getActionTypeOptions(): { value: POSActionType; label: string; category: string }[] {
  return Object.values(ACTION_TYPE_METADATA).map((meta) => ({
    value: meta.id,
    label: meta.label,
    category: meta.category,
  }))
}

/**
 * Get the default icon for an action type
 */
export function getActionTypeIcon(actionType: POSActionType): string {
  return ACTION_TYPE_METADATA[actionType]?.defaultIcon || 'Circle'
}

/**
 * Check if an action type requires item selection
 */
export function actionRequiresSelection(actionType: POSActionType): boolean {
  return ACTION_TYPE_METADATA[actionType]?.requiresSelection || false
}

/**
 * Check if an action type requires a member
 */
export function actionRequiresMember(actionType: POSActionType): boolean {
  return ACTION_TYPE_METADATA[actionType]?.requiresMember || false
}

/**
 * Check if an action is dangerous (requires confirmation)
 */
export function isActionDangerous(actionType: POSActionType): boolean {
  return ACTION_TYPE_METADATA[actionType]?.dangerous || false
}
