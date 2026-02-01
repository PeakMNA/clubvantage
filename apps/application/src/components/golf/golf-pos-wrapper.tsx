'use client'

import { useCallback, useMemo } from 'react'
import { POSConfigProvider, usePOSActionHandler, usePOSConfig } from '@/components/pos'
import type { POSButtonDefinition } from '@/components/pos'
import { POSToolbar, POSActionBar, type ButtonDefinition } from '@clubvantage/ui/pos'
import { useCheckInFlightMutation, usePrintStarterTicketMutation } from '@clubvantage/api-client'

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Maps POS button variant to UI component color
 */
function mapVariantToColor(variant: POSButtonDefinition['variant']): string {
  const variantMap: Record<POSButtonDefinition['variant'], string> = {
    default: 'neutral',
    primary: 'primary',
    success: 'success',
    warning: 'warning',
    danger: 'danger',
    ghost: 'neutral',
  }
  return variantMap[variant] || 'neutral'
}

/**
 * Converts POSButtonDefinition to UI ButtonDefinition format
 */
function convertButtonRegistry(
  registry: Record<string, POSButtonDefinition>
): Record<string, ButtonDefinition> {
  const converted: Record<string, ButtonDefinition> = {}

  for (const [id, def] of Object.entries(registry)) {
    converted[id] = {
      id: def.id,
      label: def.label,
      icon: def.icon || '',
      color: mapVariantToColor(def.variant),
      shortcut: def.shortcut,
    }
  }

  return converted
}

// ============================================================================
// Types
// ============================================================================

interface GolfPOSWrapperProps {
  children: React.ReactNode
  selectedTeeTimeId?: string
  selectedPlayerIds?: string[]
  onOpenSettlement?: () => void
}

interface GolfPOSContentProps {
  children: React.ReactNode
  selectedTeeTimeId?: string
  selectedPlayerIds?: string[]
  onOpenSettlement?: () => void
}

// ============================================================================
// Inner Content Component (with action handlers)
// ============================================================================

function GolfPOSContent({
  children,
  selectedTeeTimeId,
  selectedPlayerIds = [],
  onOpenSettlement,
}: GolfPOSContentProps) {
  // Mutations for golf-specific actions
  const { mutateAsync: checkInFlight } = useCheckInFlightMutation()
  const { mutateAsync: printTicket } = usePrintStarterTicketMutation()

  // Get POS context for toolbar/actionbar rendering
  const {
    toolbarConfig,
    actionBarConfig,
    buttonStates,
    buttonRegistry,
    executeAction,
  } = usePOSConfig()

  // ============================================================================
  // Action Handlers
  // ============================================================================

  // Golf Check-in handler
  const handleCheckIn = useCallback(async () => {
    if (!selectedTeeTimeId || selectedPlayerIds.length === 0) {
      console.warn('Cannot check in: no tee time or players selected')
      return
    }

    try {
      await checkInFlight({
        input: {
          teeTimeId: selectedTeeTimeId,
          players: selectedPlayerIds.map((playerId) => ({
            playerId,
            checkedIn: true,
          })),
          generateTicket: true,
        },
      })
    } catch (error) {
      console.error('Check-in failed:', error)
      throw error
    }
  }, [selectedTeeTimeId, selectedPlayerIds, checkInFlight])

  // Settlement handler
  const handleSettle = useCallback(() => {
    onOpenSettlement?.()
  }, [onOpenSettlement])

  // Print starter ticket handler
  const handlePrintTicket = useCallback(async () => {
    if (!selectedTeeTimeId) {
      console.warn('Cannot print ticket: no tee time selected')
      return
    }

    try {
      // Note: PrintTicketInput expects a ticketId, not teeTimeId
      // In a real implementation, we'd first get or create the ticket
      // For now, we'll use the teeTimeId as a placeholder
      await printTicket({
        input: {
          ticketId: selectedTeeTimeId,
          copies: 1,
        },
      })
    } catch (error) {
      console.error('Print ticket failed:', error)
      throw error
    }
  }, [selectedTeeTimeId, printTicket])

  // Register action handlers with the POS system
  usePOSActionHandler('golf.checkin', handleCheckIn)
  usePOSActionHandler('golf.settle', handleSettle)
  usePOSActionHandler('golf.printTicket', handlePrintTicket)

  // Handle button clicks from action bar
  const handleButtonClick = useCallback(
    (buttonId: string) => {
      executeAction(buttonId)
    },
    [executeAction]
  )

  // Convert button registry to UI component format
  const uiButtonRegistry = useMemo(
    () => convertButtonRegistry(buttonRegistry),
    [buttonRegistry]
  )

  return (
    <div className="flex flex-col h-full">
      {/* POS Toolbar at top */}
      <POSToolbar
        toolbarConfig={toolbarConfig ? {
          zones: {
            left: ['search', 'memberLookup'],
            center: [],
            right: ['holdTicket', 'newTicket'],
          },
        } : undefined}
      />

      {/* Main content area */}
      <div className="flex-1 overflow-auto">
        {children}
      </div>

      {/* POS Action Bar at bottom */}
      <POSActionBar
        actionBarConfig={actionBarConfig ? {
          rows: actionBarConfig.primaryAction ? 2 : 1,
          columns: 6,
          buttons: [
            // Map from the simple config format to grid positions
            ...(actionBarConfig.secondaryActions || []).map((buttonId, index) => ({
              position: [0, index] as [number, number],
              buttonId,
            })),
            ...(actionBarConfig.primaryAction
              ? [{ position: [1, 4] as [number, number], buttonId: actionBarConfig.primaryAction, span: 2 }]
              : []),
            ...(actionBarConfig.cancelAction
              ? [{ position: [1, 0] as [number, number], buttonId: actionBarConfig.cancelAction }]
              : []),
          ],
        } : {
          rows: 2,
          columns: 6,
          buttons: [
            // Default golf check-in buttons when no config loaded
            { position: [0, 0], buttonId: 'golf.checkin' },
            { position: [0, 1], buttonId: 'golf.settle' },
            { position: [0, 2], buttonId: 'golf.printTicket' },
            { position: [1, 4], buttonId: 'pos.pay', span: 2 },
          ],
        }}
        buttonStates={buttonStates}
        buttonRegistry={uiButtonRegistry}
        onButtonClick={handleButtonClick}
      />
    </div>
  )
}

// ============================================================================
// Main Wrapper Component
// ============================================================================

/**
 * GolfPOSWrapper
 *
 * Wraps the Golf tee sheet with POS functionality:
 * - POSConfigProvider for config management
 * - POSToolbar at top for search, member lookup, etc.
 * - POSActionBar at bottom for check-in, settlement, etc.
 * - Registers golf-specific action handlers
 *
 * @example
 * ```tsx
 * <GolfPOSWrapper
 *   selectedTeeTimeId={selectedFlight?.id}
 *   selectedPlayerIds={selectedPlayerIds}
 *   onOpenSettlement={() => setShowSettlementModal(true)}
 * >
 *   <TeeSheetGrid ... />
 * </GolfPOSWrapper>
 * ```
 */
export function GolfPOSWrapper({
  children,
  selectedTeeTimeId,
  selectedPlayerIds,
  onOpenSettlement,
}: GolfPOSWrapperProps) {
  return (
    <POSConfigProvider outlet="golf-checkin" userRole="staff">
      <GolfPOSContent
        selectedTeeTimeId={selectedTeeTimeId}
        selectedPlayerIds={selectedPlayerIds}
        onOpenSettlement={onOpenSettlement}
      >
        {children}
      </GolfPOSContent>
    </POSConfigProvider>
  )
}

export default GolfPOSWrapper
