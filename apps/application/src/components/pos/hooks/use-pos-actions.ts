/**
 * usePOSActions Hook
 *
 * Provides a complete action handling system for POS components.
 * Connects button clicks to action handlers with full context.
 */

import { useCallback, useMemo, useState } from 'react'
import {
  type POSActionType,
  type POSActionContext,
  type POSActionPayload,
  executeAction,
} from '../utils'

// ============================================================================
// TYPES
// ============================================================================

export interface LineItem {
  id: string
  name: string
  quantity: number
  unitPrice: number
  totalPrice: number
  notes?: string
}

export interface POSMember {
  id: string
  name: string
  memberNumber?: string
}

export interface UsePOSActionsOptions {
  /** Current items in the cart */
  items: LineItem[]
  /** Function to update items */
  setItems: (items: LineItem[]) => void
  /** Currently selected member */
  member: POSMember | null
  /** Function to update member */
  setMember: (member: POSMember | null) => void
  /** Current ticket number */
  ticketNumber: string
  /** Tax rate (e.g., 0.07 for 7%) */
  taxRate?: number
  /** Callback when a new ticket is started */
  onNewTicket?: () => void
  /** Callback when ticket is held */
  onHoldTicket?: () => void
  /** Callback to recall a ticket */
  onRecallTicket?: (ticketId: string) => void
  /** Custom modal opener */
  onOpenModal?: (modalId: string, props?: Record<string, unknown>) => void
  /** Custom modal closer */
  onCloseModal?: () => void
  /** Custom toast notification */
  onShowToast?: (message: string, type?: 'success' | 'error' | 'warning' | 'info') => void
  /** Button ID to action type mapping from template */
  buttonActionMap?: Map<string, POSActionType>
}

export interface UsePOSActionsReturn {
  /** Execute an action by type */
  executeActionByType: (actionType: POSActionType, payload?: POSActionPayload) => Promise<void>
  /** Execute an action by button ID (looks up action type from map) */
  executeActionByButtonId: (buttonId: string, payload?: POSActionPayload) => Promise<void>
  /** Handle button click (for use as onClick handler) */
  handleButtonClick: (buttonId: string) => void
  /** Currently selected item ID */
  selectedItemId: string | null
  /** Set selected item */
  setSelectedItemId: (id: string | null) => void
  /** Calculated subtotal */
  subtotal: number
  /** Calculated tax */
  tax: number
  /** Calculated total */
  total: number
  /** Active modal state */
  activeModal: { id: string; props?: Record<string, unknown> } | null
  /** Open a modal */
  openModal: (modalId: string, props?: Record<string, unknown>) => void
  /** Close the active modal */
  closeModal: () => void
}

// ============================================================================
// HOOK
// ============================================================================

export function usePOSActions(options: UsePOSActionsOptions): UsePOSActionsReturn {
  const {
    items,
    setItems,
    member,
    setMember,
    ticketNumber,
    taxRate = 0.07,
    onNewTicket,
    onHoldTicket,
    onRecallTicket,
    onOpenModal,
    onCloseModal,
    onShowToast,
    buttonActionMap,
  } = options

  // Local state
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null)
  const [activeModal, setActiveModal] = useState<{ id: string; props?: Record<string, unknown> } | null>(null)

  // Calculate totals
  const totals = useMemo(() => {
    const subtotal = items.reduce((sum, item) => sum + item.totalPrice, 0)
    const tax = subtotal * taxRate
    const total = subtotal + tax
    return { subtotal, tax, total }
  }, [items, taxRate])

  // Modal handlers
  const openModal = useCallback((modalId: string, props?: Record<string, unknown>) => {
    if (onOpenModal) {
      onOpenModal(modalId, props)
    } else {
      setActiveModal({ id: modalId, props })
    }
  }, [onOpenModal])

  const closeModal = useCallback(() => {
    if (onCloseModal) {
      onCloseModal()
    } else {
      setActiveModal(null)
    }
  }, [onCloseModal])

  // Toast handler
  const showToast = useCallback((message: string, type?: 'success' | 'error' | 'warning' | 'info') => {
    if (onShowToast) {
      onShowToast(message, type)
    } else {
      // Fallback to console and alert for critical messages
      console.log(`[POS ${type || 'info'}] ${message}`)
      if (type === 'error') {
        alert(message)
      }
    }
  }, [onShowToast])

  // Confirm handler
  const showConfirm = useCallback((message: string): Promise<boolean> => {
    return Promise.resolve(window.confirm(message))
  }, [])

  // Print handler (stub - should be implemented based on your print system)
  const printReceipt = useCallback(() => {
    console.log('Printing receipt...')
    // Implement actual print logic
  }, [])

  // Drawer handler (stub - should be implemented based on your hardware)
  const openDrawer = useCallback(() => {
    console.log('Opening cash drawer...')
    // Implement actual drawer logic
  }, [])

  // Create action context
  const createContext = useCallback((): POSActionContext => ({
    items,
    selectedItemId,
    member,
    ticketNumber,
    subtotal: totals.subtotal,
    tax: totals.tax,
    total: totals.total,
    setItems,
    setSelectedItemId,
    setMember,
    openModal,
    closeModal,
    newTicket: onNewTicket || (() => console.log('New ticket')),
    holdTicket: onHoldTicket || (() => console.log('Hold ticket')),
    recallTicket: onRecallTicket || ((id) => console.log('Recall ticket:', id)),
    showToast,
    showConfirm,
    printReceipt,
    openDrawer,
  }), [
    items,
    selectedItemId,
    member,
    ticketNumber,
    totals,
    setItems,
    setMember,
    openModal,
    closeModal,
    onNewTicket,
    onHoldTicket,
    onRecallTicket,
    showToast,
    showConfirm,
    printReceipt,
    openDrawer,
  ])

  // Execute action by type
  const executeActionByType = useCallback(async (
    actionType: POSActionType,
    payload?: POSActionPayload
  ) => {
    const context = createContext()
    const result = await executeAction(actionType, context, payload)

    if (!result.success && result.message) {
      console.warn(`Action ${actionType} failed:`, result.message)
    }
  }, [createContext])

  // Execute action by button ID
  const executeActionByButtonId = useCallback(async (
    buttonId: string,
    payload?: POSActionPayload
  ) => {
    // Look up action type from map
    const actionType = buttonActionMap?.get(buttonId)

    if (!actionType) {
      console.warn(`No action type mapped for button: ${buttonId}`)
      showToast(`Unknown button action: ${buttonId}`, 'warning')
      return
    }

    await executeActionByType(actionType, payload)
  }, [buttonActionMap, executeActionByType, showToast])

  // Simple click handler for buttons
  const handleButtonClick = useCallback((buttonId: string) => {
    executeActionByButtonId(buttonId)
  }, [executeActionByButtonId])

  return {
    executeActionByType,
    executeActionByButtonId,
    handleButtonClick,
    selectedItemId,
    setSelectedItemId,
    subtotal: totals.subtotal,
    tax: totals.tax,
    total: totals.total,
    activeModal,
    openModal,
    closeModal,
  }
}
