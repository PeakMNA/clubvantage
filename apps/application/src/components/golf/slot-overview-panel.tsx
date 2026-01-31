'use client'

import { useState, useCallback } from 'react'
import { cn } from '@clubvantage/ui'
import { RefreshCw, CheckCircle2, Printer, ShoppingCart } from 'lucide-react'
import { SlotCard, type SlotCartData } from './slot-card'
import { BatchActionsBar, BatchTotalsSummary } from './batch-actions-bar'
import { TransferItemDialog } from './transfer-item-dialog'
import { ProShopItemPicker } from './pro-shop-item-picker'
import { LineItemBulkActionBar } from './line-item-bulk-action-bar'

// Product info for add item callback
export interface AddItemProductInfo {
  productId: string
  productName: string
  baseAmount: number
  taxRate: number
  taxType: string
  variantId?: string
  variantName?: string
}

interface SlotOverviewPanelProps {
  teeTimeId: string
  teeTime: string
  courseName: string
  slots: SlotCartData[]
  onRefresh?: () => void
  onPayBatch?: (playerIds: string[], paymentMethodId: string) => Promise<void>
  onCheckInBatch?: (playerIds: string[]) => Promise<void>
  onTransferItem?: (lineItemId: string, fromPlayerId: string, toPlayerId: string) => Promise<void>
  onAddItem?: (playerId: string, product: AddItemProductInfo) => Promise<void>
  onPrintTicket?: () => void
  onUpdateQuantity?: (lineItemId: string, quantity: number) => Promise<void>
  onRemoveItem?: (lineItemId: string) => Promise<void>
  onBulkRemove?: (lineItemIds: string[]) => Promise<void>
  onBulkTransfer?: (lineItemIds: string[], toPlayerId: string) => Promise<void>
  isLoading?: boolean
  hasDraft?: boolean
  className?: string
}

export function SlotOverviewPanel({
  teeTimeId,
  teeTime,
  courseName,
  slots,
  onRefresh,
  onPayBatch,
  onCheckInBatch,
  onTransferItem,
  onAddItem,
  onPrintTicket,
  onUpdateQuantity,
  onRemoveItem,
  onBulkRemove,
  onBulkTransfer,
  isLoading = false,
  hasDraft = false,
  className,
}: SlotOverviewPanelProps) {
  const [selectedSlotIds, setSelectedSlotIds] = useState<Set<string>>(new Set())
  const [selectedLineItemIds, setSelectedLineItemIds] = useState<Set<string>>(new Set())
  const [transferDialogOpen, setTransferDialogOpen] = useState(false)
  const [transferringItemId, setTransferringItemId] = useState<string | null>(null)
  const [transferringFromPlayerId, setTransferringFromPlayerId] = useState<string | null>(null)
  const [bulkTransferDialogOpen, setBulkTransferDialogOpen] = useState(false)
  const [addItemDialogOpen, setAddItemDialogOpen] = useState(false)
  const [addingToPlayerId, setAddingToPlayerId] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  // Selected slots data
  const selectedSlots = slots.filter(slot => selectedSlotIds.has(slot.playerId))

  // Derived state
  const allCheckedIn = slots.every(slot => slot.isCheckedIn)
  const allSettled = slots.every(slot => slot.balanceDue <= 0)
  const totalBalance = slots.reduce((sum, slot) => sum + slot.balanceDue, 0)

  // Selection handlers
  const handleSlotSelect = useCallback((playerId: string, selected: boolean) => {
    setSelectedSlotIds(prev => {
      const next = new Set(prev)
      if (selected) {
        next.add(playerId)
      } else {
        next.delete(playerId)
      }
      return next
    })
  }, [])

  const handleSelectAll = useCallback(() => {
    setSelectedSlotIds(new Set(slots.map(s => s.playerId)))
  }, [slots])

  const handleClearSelection = useCallback(() => {
    setSelectedSlotIds(new Set())
  }, [])

  // Line item selection handlers
  const handleSelectLineItem = useCallback((lineItemId: string, selected: boolean) => {
    setSelectedLineItemIds(prev => {
      const next = new Set(prev)
      if (selected) {
        next.add(lineItemId)
      } else {
        next.delete(lineItemId)
      }
      return next
    })
  }, [])

  // Get all selectable line items (unpaid and not transferred)
  const allSelectableLineItems = slots.flatMap(slot =>
    slot.lineItems.filter(item => !item.isPaid && !item.isTransferred)
  )
  const allSelectableLineItemIds = new Set(allSelectableLineItems.map(item => item.id))
  const isAllLineItemsSelected = allSelectableLineItems.length > 0 &&
    allSelectableLineItems.every(item => selectedLineItemIds.has(item.id))

  const handleSelectAllLineItems = useCallback(() => {
    setSelectedLineItemIds(new Set(allSelectableLineItemIds))
  }, [allSelectableLineItemIds])

  const handleDeselectAllLineItems = useCallback(() => {
    setSelectedLineItemIds(new Set())
  }, [])

  // Bulk action handlers
  const handleBulkTransferItems = useCallback(async (toPlayerId: string) => {
    if (!onBulkTransfer || selectedLineItemIds.size === 0) return
    setIsProcessing(true)
    try {
      await onBulkTransfer(Array.from(selectedLineItemIds), toPlayerId)
      setSelectedLineItemIds(new Set())
      setBulkTransferDialogOpen(false)
    } finally {
      setIsProcessing(false)
    }
  }, [onBulkTransfer, selectedLineItemIds])

  const handleBulkRemoveItems = useCallback(async () => {
    if (!onBulkRemove || selectedLineItemIds.size === 0) return
    setIsProcessing(true)
    try {
      await onBulkRemove(Array.from(selectedLineItemIds))
      setSelectedLineItemIds(new Set())
    } finally {
      setIsProcessing(false)
    }
  }, [onBulkRemove, selectedLineItemIds])

  const handleBulkPayItems = useCallback(async () => {
    // TODO: Implement bulk pay with payment method picker
    console.log('Bulk pay items:', Array.from(selectedLineItemIds))
  }, [selectedLineItemIds])

  // Transfer handler
  const handleTransferItem = useCallback((lineItemId: string, playerId: string) => {
    setTransferringItemId(lineItemId)
    setTransferringFromPlayerId(playerId)
    setTransferDialogOpen(true)
  }, [])

  const handleConfirmTransfer = useCallback(async (toPlayerId: string) => {
    if (!transferringItemId || !transferringFromPlayerId || !onTransferItem) return
    setIsProcessing(true)
    try {
      await onTransferItem(transferringItemId, transferringFromPlayerId, toPlayerId)
      setTransferDialogOpen(false)
      setTransferringItemId(null)
      setTransferringFromPlayerId(null)
    } finally {
      setIsProcessing(false)
    }
  }, [transferringItemId, transferringFromPlayerId, onTransferItem])

  // Add item handler
  const handleAddItem = useCallback((playerId: string) => {
    setAddingToPlayerId(playerId)
    setAddItemDialogOpen(true)
  }, [])

  const handleConfirmAddItem = useCallback(async (product: AddItemProductInfo) => {
    if (!addingToPlayerId || !onAddItem) return
    setIsProcessing(true)
    try {
      await onAddItem(addingToPlayerId, product)
      setAddItemDialogOpen(false)
      setAddingToPlayerId(null)
    } finally {
      setIsProcessing(false)
    }
  }, [addingToPlayerId, onAddItem])

  // Batch payment handler
  const handlePaySelected = useCallback(async () => {
    if (!onPayBatch || selectedSlots.length === 0) return
    // For now, show payment method selection (would be a modal in real implementation)
    // This is a placeholder - real implementation would show payment method picker
    const playerIds = selectedSlots.map(s => s.playerId)
    setIsProcessing(true)
    try {
      // Default to first payment method - real implementation would show picker
      await onPayBatch(playerIds, 'cash')
      handleClearSelection()
    } finally {
      setIsProcessing(false)
    }
  }, [onPayBatch, selectedSlots, handleClearSelection])

  // Batch check-in handler
  const handleCheckInSelected = useCallback(async () => {
    if (!onCheckInBatch || selectedSlots.length === 0) return
    const playerIds = selectedSlots.map(s => s.playerId)
    setIsProcessing(true)
    try {
      await onCheckInBatch(playerIds)
      handleClearSelection()
    } finally {
      setIsProcessing(false)
    }
  }, [onCheckInBatch, selectedSlots, handleClearSelection])

  // Find other players for transfer dialog
  const otherPlayers = transferringFromPlayerId
    ? slots.filter(s => s.playerId !== transferringFromPlayerId)
    : []

  return (
    <div className={cn('flex flex-col h-full', className)}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-card">
        <div className="flex items-center gap-3">
          <div>
            <h2 className="font-semibold text-lg">{teeTime}</h2>
            <p className="text-sm text-muted-foreground">{courseName}</p>
          </div>
          {hasDraft && (
            <div className="flex items-center gap-1 text-xs text-amber-600 bg-amber-50 dark:bg-amber-900/20 dark:text-amber-400 px-2 py-1 rounded">
              <ShoppingCart className="h-3 w-3" />
              Draft
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          {onRefresh && (
            <button
              type="button"
              onClick={onRefresh}
              disabled={isLoading}
              className="p-2 hover:bg-muted rounded-lg transition-colors disabled:opacity-50"
              title="Refresh"
            >
              <RefreshCw className={cn('h-4 w-4', isLoading && 'animate-spin')} />
            </button>
          )}
          {allCheckedIn && onPrintTicket && (
            <button
              type="button"
              onClick={onPrintTicket}
              className="flex items-center gap-2 px-3 py-2 bg-muted hover:bg-muted/80 rounded-lg text-sm transition-colors"
            >
              <Printer className="h-4 w-4" />
              Print Ticket
            </button>
          )}
        </div>
      </div>

      {/* Status summary */}
      <div className="flex items-center justify-between px-4 py-2 bg-muted/30 border-b">
        <div className="flex items-center gap-4 text-sm">
          <span className="text-muted-foreground">
            {slots.length} players
          </span>
          {allSettled ? (
            <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
              <CheckCircle2 className="h-4 w-4" />
              All settled
            </span>
          ) : (
            <span className="text-amber-600 dark:text-amber-400">
              ${totalBalance.toFixed(2)} balance due
            </span>
          )}
        </div>
        {selectedSlots.length > 0 && (
          <BatchTotalsSummary selectedSlots={selectedSlots} />
        )}
      </div>

      {/* Slots grid */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {slots.map((slot, index) => (
            <SlotCard
              key={slot.playerId}
              slot={slot}
              position={(index + 1) as 1 | 2 | 3 | 4}
              isSelected={selectedSlotIds.has(slot.playerId)}
              onSelect={(selected) => handleSlotSelect(slot.playerId, selected)}
              onTransferItem={(lineItemId) => handleTransferItem(lineItemId, slot.playerId)}
              onAddItem={() => handleAddItem(slot.playerId)}
              onUpdateQuantity={onUpdateQuantity}
              onRemoveItem={onRemoveItem}
              onSelectItem={handleSelectLineItem}
              selectedItemIds={selectedLineItemIds}
            />
          ))}
        </div>
      </div>

      {/* Line item bulk actions bar (when line items selected) */}
      {selectedLineItemIds.size > 0 && (
        <LineItemBulkActionBar
          selectedCount={selectedLineItemIds.size}
          totalSelectableCount={allSelectableLineItems.length}
          isAllSelected={isAllLineItemsSelected}
          onSelectAll={handleSelectAllLineItems}
          onDeselectAll={handleDeselectAllLineItems}
          onTransfer={() => setBulkTransferDialogOpen(true)}
          onPay={handleBulkPayItems}
          onRemove={handleBulkRemoveItems}
          disabled={isProcessing}
        />
      )}

      {/* Batch actions bar (when slots selected) */}
      {selectedSlotIds.size > 0 && selectedLineItemIds.size === 0 && (
        <BatchActionsBar
          selectedSlots={selectedSlots}
          onClearSelection={handleClearSelection}
          onSelectAll={handleSelectAll}
          onPaySelected={handlePaySelected}
          onCheckInSelected={handleCheckInSelected}
          totalSlots={slots.length}
        />
      )}

      {/* Transfer item dialog */}
      {transferDialogOpen && (
        <TransferItemDialog
          open={transferDialogOpen}
          onClose={() => {
            setTransferDialogOpen(false)
            setTransferringItemId(null)
            setTransferringFromPlayerId(null)
          }}
          onConfirm={handleConfirmTransfer}
          players={otherPlayers.map(p => ({
            id: p.playerId,
            name: p.playerName,
            type: p.playerType,
          }))}
          isProcessing={isProcessing}
        />
      )}

      {/* Add item dialog (pro shop picker with slot selector) */}
      <ProShopItemPicker
        isOpen={addItemDialogOpen}
        onClose={() => {
          setAddItemDialogOpen(false)
          setAddingToPlayerId(null)
        }}
        onSelect={(product, variant) => {
          handleConfirmAddItem({
            productId: product.id,
            productName: variant ? `${product.name} - ${variant.name}` : product.name,
            baseAmount: variant ? variant.finalPrice : product.price,
            taxRate: product.effectiveTaxRate,
            taxType: product.effectiveTaxType,
            variantId: variant?.id,
            variantName: variant?.name,
          })
        }}
        players={slots.map((slot, index) => ({
          id: slot.playerId,
          name: slot.playerName,
          type: slot.playerType,
          position: (index + 1) as 1 | 2 | 3 | 4,
        }))}
        selectedPlayerId={addingToPlayerId || undefined}
        onPlayerChange={(playerId) => setAddingToPlayerId(playerId)}
      />

      {/* Bulk transfer dialog */}
      {bulkTransferDialogOpen && (
        <TransferItemDialog
          open={bulkTransferDialogOpen}
          onClose={() => {
            setBulkTransferDialogOpen(false)
          }}
          onConfirm={handleBulkTransferItems}
          players={slots.map(p => ({
            id: p.playerId,
            name: p.playerName,
            type: p.playerType,
          }))}
          isProcessing={isProcessing}
        />
      )}
    </div>
  )
}
