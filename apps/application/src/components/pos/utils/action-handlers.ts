/**
 * POS Action Handlers
 *
 * Registry of handler functions for each action type.
 * These handlers receive context and payload, and execute the appropriate logic.
 */

import { POS_ACTION_TYPES, type POSActionType } from './action-types'

// ============================================================================
// TYPES
// ============================================================================

export interface POSActionContext {
  // Cart/Ticket State
  items: Array<{ id: string; name: string; quantity: number; unitPrice: number; totalPrice: number }>
  selectedItemId: string | null
  member: { id: string; name: string; memberNumber?: string } | null
  ticketNumber: string

  // Totals
  subtotal: number
  tax: number
  total: number

  // State Setters
  setItems: (items: POSActionContext['items']) => void
  setSelectedItemId: (id: string | null) => void
  setMember: (member: POSActionContext['member']) => void

  // Modal Controls
  openModal: (modalId: string, props?: Record<string, unknown>) => void
  closeModal: () => void

  // Ticket Management
  newTicket: () => void
  holdTicket: () => void
  recallTicket: (ticketId: string) => void

  // Notifications
  showToast: (message: string, type?: 'success' | 'error' | 'warning' | 'info') => void
  showConfirm: (message: string) => Promise<boolean>

  // Print
  printReceipt: () => void
  openDrawer: () => void
}

export interface POSActionPayload {
  [key: string]: unknown
}

export interface POSActionResult {
  success: boolean
  message?: string
  data?: unknown
}

export type POSActionHandler = (
  context: POSActionContext,
  payload?: POSActionPayload
) => Promise<POSActionResult> | POSActionResult

// ============================================================================
// ACTION HANDLERS
// ============================================================================

const handlers: Record<POSActionType, POSActionHandler> = {
  // -------------------------------------------------------------------------
  // Payment Actions
  // -------------------------------------------------------------------------

  [POS_ACTION_TYPES.OPEN_PAYMENT_MODAL]: (context) => {
    if (context.items.length === 0) {
      context.showToast('No items in cart', 'warning')
      return { success: false, message: 'No items in cart' }
    }
    context.openModal('payment', { total: context.total })
    return { success: true }
  },

  [POS_ACTION_TYPES.PROCESS_CASH_PAYMENT]: (context, payload) => {
    if (context.items.length === 0) {
      context.showToast('No items in cart', 'warning')
      return { success: false, message: 'No items in cart' }
    }
    context.openModal('cash-payment', {
      total: context.total,
      amountTendered: payload?.amount,
    })
    return { success: true }
  },

  [POS_ACTION_TYPES.PROCESS_CARD_PAYMENT]: (context) => {
    if (context.items.length === 0) {
      context.showToast('No items in cart', 'warning')
      return { success: false, message: 'No items in cart' }
    }
    context.openModal('card-payment', { total: context.total })
    return { success: true }
  },

  [POS_ACTION_TYPES.CHARGE_TO_MEMBER]: (context) => {
    if (!context.member) {
      context.showToast('No member attached to ticket', 'warning')
      return { success: false, message: 'No member attached' }
    }
    if (context.items.length === 0) {
      context.showToast('No items in cart', 'warning')
      return { success: false, message: 'No items in cart' }
    }
    context.openModal('member-charge', {
      member: context.member,
      total: context.total,
    })
    return { success: true }
  },

  [POS_ACTION_TYPES.SPLIT_PAYMENT]: (context) => {
    if (context.items.length === 0) {
      context.showToast('No items in cart', 'warning')
      return { success: false, message: 'No items in cart' }
    }
    context.openModal('split-payment', { total: context.total })
    return { success: true }
  },

  // -------------------------------------------------------------------------
  // Transaction Actions
  // -------------------------------------------------------------------------

  [POS_ACTION_TYPES.CANCEL_TRANSACTION]: async (context) => {
    if (context.items.length === 0) {
      return { success: true, message: 'Nothing to cancel' }
    }

    const confirmed = await context.showConfirm(
      'Are you sure you want to cancel this transaction? All items will be removed.'
    )

    if (confirmed) {
      context.newTicket()
      context.showToast('Transaction cancelled', 'info')
      return { success: true }
    }

    return { success: false, message: 'Cancelled by user' }
  },

  [POS_ACTION_TYPES.HOLD_TICKET]: (context) => {
    if (context.items.length === 0) {
      context.showToast('No items to hold', 'warning')
      return { success: false, message: 'No items to hold' }
    }
    context.holdTicket()
    context.showToast(`Ticket ${context.ticketNumber} held`, 'success')
    return { success: true }
  },

  [POS_ACTION_TYPES.RECALL_TICKET]: (context) => {
    context.openModal('recall-ticket')
    return { success: true }
  },

  [POS_ACTION_TYPES.VOID_TRANSACTION]: async (context) => {
    if (context.items.length === 0) {
      return { success: true, message: 'Nothing to void' }
    }

    const confirmed = await context.showConfirm(
      'Are you sure you want to void this entire transaction? This action cannot be undone.'
    )

    if (confirmed) {
      // In a real implementation, this would also record the void in the system
      context.newTicket()
      context.showToast('Transaction voided', 'warning')
      return { success: true }
    }

    return { success: false, message: 'Cancelled by user' }
  },

  // -------------------------------------------------------------------------
  // Item Actions
  // -------------------------------------------------------------------------

  [POS_ACTION_TYPES.VOID_ITEM]: async (context) => {
    if (!context.selectedItemId) {
      context.showToast('No item selected', 'warning')
      return { success: false, message: 'No item selected' }
    }

    const item = context.items.find((i) => i.id === context.selectedItemId)
    if (!item) {
      return { success: false, message: 'Item not found' }
    }

    const confirmed = await context.showConfirm(
      `Remove "${item.name}" from the ticket?`
    )

    if (confirmed) {
      const newItems = context.items.filter((i) => i.id !== context.selectedItemId)
      context.setItems(newItems)
      context.setSelectedItemId(null)
      context.showToast('Item removed', 'info')
      return { success: true }
    }

    return { success: false, message: 'Cancelled by user' }
  },

  [POS_ACTION_TYPES.APPLY_DISCOUNT]: (context) => {
    context.openModal('discount', {
      type: 'transaction',
      subtotal: context.subtotal,
    })
    return { success: true }
  },

  [POS_ACTION_TYPES.APPLY_ITEM_DISCOUNT]: (context) => {
    if (!context.selectedItemId) {
      context.showToast('No item selected', 'warning')
      return { success: false, message: 'No item selected' }
    }

    const item = context.items.find((i) => i.id === context.selectedItemId)
    if (!item) {
      return { success: false, message: 'Item not found' }
    }

    context.openModal('discount', {
      type: 'item',
      item,
    })
    return { success: true }
  },

  [POS_ACTION_TYPES.CHANGE_QUANTITY]: (context) => {
    if (!context.selectedItemId) {
      context.showToast('No item selected', 'warning')
      return { success: false, message: 'No item selected' }
    }

    const item = context.items.find((i) => i.id === context.selectedItemId)
    if (!item) {
      return { success: false, message: 'Item not found' }
    }

    context.openModal('quantity', { item })
    return { success: true }
  },

  [POS_ACTION_TYPES.ADD_MODIFIER]: (context) => {
    if (!context.selectedItemId) {
      context.showToast('No item selected', 'warning')
      return { success: false, message: 'No item selected' }
    }

    const item = context.items.find((i) => i.id === context.selectedItemId)
    if (!item) {
      return { success: false, message: 'Item not found' }
    }

    context.openModal('modifier', { item })
    return { success: true }
  },

  [POS_ACTION_TYPES.PRICE_OVERRIDE]: (context) => {
    if (!context.selectedItemId) {
      context.showToast('No item selected', 'warning')
      return { success: false, message: 'No item selected' }
    }

    const item = context.items.find((i) => i.id === context.selectedItemId)
    if (!item) {
      return { success: false, message: 'Item not found' }
    }

    context.openModal('price-override', { item })
    return { success: true }
  },

  // -------------------------------------------------------------------------
  // Utility Actions
  // -------------------------------------------------------------------------

  [POS_ACTION_TYPES.PRINT_RECEIPT]: (context) => {
    if (context.items.length === 0) {
      context.showToast('No items to print', 'warning')
      return { success: false, message: 'No items to print' }
    }
    context.printReceipt()
    context.showToast('Receipt sent to printer', 'success')
    return { success: true }
  },

  [POS_ACTION_TYPES.OPEN_DRAWER]: (context) => {
    context.openDrawer()
    context.showToast('Cash drawer opened', 'info')
    return { success: true }
  },

  [POS_ACTION_TYPES.PRICE_CHECK]: (context) => {
    context.openModal('price-check')
    return { success: true }
  },

  // -------------------------------------------------------------------------
  // Member Actions
  // -------------------------------------------------------------------------

  [POS_ACTION_TYPES.MEMBER_LOOKUP]: (context) => {
    context.openModal('member-lookup')
    return { success: true }
  },

  [POS_ACTION_TYPES.ATTACH_MEMBER]: (context) => {
    context.openModal('member-lookup', { mode: 'attach' })
    return { success: true }
  },

  [POS_ACTION_TYPES.DETACH_MEMBER]: async (context) => {
    if (!context.member) {
      return { success: true, message: 'No member attached' }
    }

    const confirmed = await context.showConfirm(
      `Remove ${context.member.name} from this ticket?`
    )

    if (confirmed) {
      context.setMember(null)
      context.showToast('Member removed from ticket', 'info')
      return { success: true }
    }

    return { success: false, message: 'Cancelled by user' }
  },

  // -------------------------------------------------------------------------
  // Navigation Actions
  // -------------------------------------------------------------------------

  [POS_ACTION_TYPES.NEW_TICKET]: (context) => {
    context.newTicket()
    context.showToast('New ticket started', 'success')
    return { success: true }
  },

  [POS_ACTION_TYPES.SWITCH_OUTLET]: (context) => {
    context.openModal('switch-outlet')
    return { success: true }
  },

  // -------------------------------------------------------------------------
  // Custom Action
  // -------------------------------------------------------------------------

  [POS_ACTION_TYPES.CUSTOM]: (context, payload) => {
    // Custom actions should be handled by the outlet-specific configuration
    console.log('Custom action triggered:', payload)
    context.showToast('Custom action executed', 'info')
    return { success: true, data: payload }
  },
}

// ============================================================================
// EXECUTE ACTION
// ============================================================================

/**
 * Execute a POS action by its type
 */
export async function executeAction(
  actionType: POSActionType,
  context: POSActionContext,
  payload?: POSActionPayload
): Promise<POSActionResult> {
  const handler = handlers[actionType]

  if (!handler) {
    console.error(`No handler found for action type: ${actionType}`)
    return {
      success: false,
      message: `Unknown action type: ${actionType}`,
    }
  }

  try {
    const result = await handler(context, payload)
    return result
  } catch (error) {
    console.error(`Error executing action ${actionType}:`, error)
    context.showToast('An error occurred', 'error')
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * Create a bound action executor for a specific context
 */
export function createActionExecutor(context: POSActionContext) {
  return (actionType: POSActionType, payload?: POSActionPayload) =>
    executeAction(actionType, context, payload)
}
