'use client'

import { useState, useCallback } from 'react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@clubvantage/ui/primitives/sheet'
import { Loader2, AlertCircle } from 'lucide-react'
import { SlotOverviewPanel, type AddItemProductInfo } from './slot-overview-panel'
import type { SlotCartData } from './slot-card'
import {
  useGetTeeTimeCartsQuery,
  useTransferLineItemMutation,
  useUndoTransferMutation,
  useProcessBatchPaymentMutation,
  useCheckInSlotsMutation,
  useAddLineItemMutation,
  useGetCartDraftQuery,
  useSaveCartDraftMutation,
  useClearCartDraftMutation,
  useUpdateLineItemQuantityMutation,
  useRemoveLineItemMutation,
  useBulkRemoveLineItemsMutation,
  useBulkTransferLineItemsMutation,
} from '@clubvantage/api-client'
import { UndoToast } from './undo-toast'
import { useQueryClient } from '@tanstack/react-query'

export interface ShoppingCartCheckInPanelProps {
  isOpen: boolean
  teeTimeId: string
  onClose: () => void
  onCheckInComplete?: () => void
}

export function ShoppingCartCheckInPanel({
  isOpen,
  teeTimeId,
  onClose,
  onCheckInComplete,
}: ShoppingCartCheckInPanelProps) {
  const queryClient = useQueryClient()
  const [error, setError] = useState<string | null>(null)
  // Undo state for removed items
  const [undoData, setUndoData] = useState<{
    message: string
    items: any[]
    playerId?: string
  } | null>(null)

  // Fetch slot cart data
  const { data, isLoading, refetch } = useGetTeeTimeCartsQuery(
    { teeTimeId },
    { enabled: isOpen && !!teeTimeId }
  )

  // Check for draft
  const { data: draftData } = useGetCartDraftQuery(
    { teeTimeId },
    { enabled: isOpen && !!teeTimeId }
  )

  // Mutations
  const transferItem = useTransferLineItemMutation()
  const processBatchPayment = useProcessBatchPaymentMutation()
  const checkInSlots = useCheckInSlotsMutation()
  const addLineItem = useAddLineItemMutation()
  const saveDraft = useSaveCartDraftMutation()
  const clearDraft = useClearCartDraftMutation()
  const updateQuantity = useUpdateLineItemQuantityMutation()
  const removeLineItem = useRemoveLineItemMutation()
  const bulkRemove = useBulkRemoveLineItemsMutation()
  const bulkTransfer = useBulkTransferLineItemsMutation()

  // Extract slot data from query
  const teeTimeCarts = data?.teeTimeCarts
  const slots: SlotCartData[] = teeTimeCarts?.slots?.map((slot: any) => ({
    playerId: slot.playerId,
    playerName: slot.playerName,
    playerType: slot.playerType,
    memberId: slot.memberId,
    memberNumber: slot.memberNumber,
    lineItems: slot.lineItems?.map((item: any) => ({
      id: item.id,
      type: item.type,
      description: item.description,
      baseAmount: item.baseAmount,
      taxType: item.taxType,
      taxRate: item.taxRate,
      taxAmount: item.taxAmount,
      totalAmount: item.totalAmount,
      quantity: item.quantity ?? 1,
      isPaid: item.isPaid,
      paidAt: item.paidAt,
      paymentMethod: item.paymentMethod,
      isTransferred: item.isTransferred,
      transferredFromPlayerName: item.transferredFromPlayerName,
    })) || [],
    transferredInItems: slot.transferredInItems?.map((item: any) => ({
      lineItemId: item.lineItemId,
      description: item.description,
      amount: item.amount,
      fromPlayerId: item.fromPlayerId,
      fromPlayerName: item.fromPlayerName,
    })) || [],
    transferredOutItems: slot.transferredOutItems?.map((item: any) => ({
      lineItemId: item.lineItemId,
      description: item.description,
      amount: item.amount,
      toPlayerId: item.toPlayerId,
      toPlayerName: item.toPlayerName,
    })) || [],
    subtotal: slot.subtotal || 0,
    taxTotal: slot.taxTotal || 0,
    grandTotal: slot.grandTotal || 0,
    paidAmount: slot.paidAmount || 0,
    balanceDue: slot.balanceDue || 0,
    isCheckedIn: slot.isCheckedIn || false,
    checkedInAt: slot.checkedInAt,
    isSettled: slot.isSettled || false,
    isSuspended: slot.isSuspended,
    suspensionReason: slot.suspensionReason,
  })) || []

  const teeTime = teeTimeCarts?.teeTime || ''
  const courseName = teeTimeCarts?.courseName || ''
  const hasDraft = !!draftData?.cartDraft

  // Handlers
  const handleRefresh = useCallback(() => {
    refetch()
  }, [refetch])

  const handleTransferItem = useCallback(async (
    lineItemId: string,
    fromPlayerId: string,
    toPlayerId: string
  ) => {
    try {
      setError(null)
      await transferItem.mutateAsync({
        input: {
          lineItemId,
          fromPlayerId,
          toPlayerId,
        }
      })
      refetch()
    } catch (e: any) {
      setError(e.message || 'Failed to transfer item')
    }
  }, [transferItem, refetch])

  const handlePayBatch = useCallback(async (
    playerIds: string[],
    paymentMethodId: string
  ) => {
    try {
      setError(null)
      await processBatchPayment.mutateAsync({
        input: {
          teeTimeId,
          playerIds,
          paymentMethodId,
        }
      })
      refetch()
      // Invalidate tee sheet queries to update status
      queryClient.invalidateQueries({ queryKey: ['teeSheet'] })
    } catch (e: any) {
      setError(e.message || 'Failed to process payment')
    }
  }, [processBatchPayment, teeTimeId, refetch, queryClient])

  const handleCheckInBatch = useCallback(async (playerIds: string[]) => {
    try {
      setError(null)
      await checkInSlots.mutateAsync({
        input: {
          teeTimeId,
          playerIds,
        }
      })
      refetch()
      // Invalidate tee sheet queries to update status
      queryClient.invalidateQueries({ queryKey: ['teeSheet'] })
      onCheckInComplete?.()
    } catch (e: any) {
      setError(e.message || 'Failed to check in players')
    }
  }, [checkInSlots, teeTimeId, refetch, queryClient, onCheckInComplete])

  const handleAddItem = useCallback(async (
    playerId: string,
    product: AddItemProductInfo
  ) => {
    try {
      setError(null)
      await addLineItem.mutateAsync({
        input: {
          playerId,
          type: 'PROSHOP',
          description: product.productName,
          baseAmount: product.baseAmount,
          taxRate: product.taxRate,
          taxType: product.taxType as 'ADD' | 'INCLUDE' | 'NONE',
          productId: product.productId,
          variantId: product.variantId,
        }
      })
      refetch()
    } catch (e: any) {
      setError(e.message || 'Failed to add item')
    }
  }, [addLineItem, refetch])

  const handlePrintTicket = useCallback(() => {
    // Implement ticket printing
    console.log('Print ticket for tee time:', teeTimeId)
  }, [teeTimeId])

  const handleUpdateQuantity = useCallback(async (lineItemId: string, quantity: number) => {
    try {
      setError(null)
      await updateQuantity.mutateAsync({
        input: { lineItemId, quantity }
      })
      refetch()
    } catch (e: any) {
      setError(e.message || 'Failed to update quantity')
    }
  }, [updateQuantity, refetch])

  const handleRemoveItem = useCallback(async (lineItemId: string) => {
    try {
      setError(null)
      const result = await removeLineItem.mutateAsync({
        input: { lineItemId }
      })
      if (result.removeLineItem.success && result.removeLineItem.removedItem) {
        setUndoData({
          message: 'Item removed',
          items: [result.removeLineItem.removedItem],
        })
      }
      refetch()
    } catch (e: any) {
      setError(e.message || 'Failed to remove item')
    }
  }, [removeLineItem, refetch])

  const handleBulkRemove = useCallback(async (lineItemIds: string[]) => {
    try {
      setError(null)
      const result = await bulkRemove.mutateAsync({
        input: { lineItemIds }
      })
      if (result.bulkRemoveLineItems.success && result.bulkRemoveLineItems.removedItems) {
        setUndoData({
          message: `${result.bulkRemoveLineItems.removedCount} items removed`,
          items: result.bulkRemoveLineItems.removedItems,
        })
      }
      refetch()
    } catch (e: any) {
      setError(e.message || 'Failed to remove items')
    }
  }, [bulkRemove, refetch])

  const handleBulkTransfer = useCallback(async (lineItemIds: string[], toPlayerId: string) => {
    try {
      setError(null)
      await bulkTransfer.mutateAsync({
        input: { lineItemIds, toPlayerId }
      })
      refetch()
    } catch (e: any) {
      setError(e.message || 'Failed to transfer items')
    }
  }, [bulkTransfer, refetch])

  const handleUndoRemove = useCallback(async () => {
    if (!undoData) return
    try {
      // Re-add removed items - this is a simplified version
      // In production, you'd want to restore the exact state
      for (const item of undoData.items) {
        await addLineItem.mutateAsync({
          input: {
            playerId: item.teeTimePlayerId || undoData.playerId,
            type: item.type,
            description: item.description,
            baseAmount: item.baseAmount,
            taxRate: item.taxRate || 0,
            taxType: item.taxType || 'NONE',
          }
        })
      }
      setUndoData(null)
      refetch()
    } catch (e: any) {
      setError(e.message || 'Failed to undo removal')
    }
  }, [undoData, addLineItem, refetch])

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-xl md:max-w-2xl lg:max-w-3xl p-0 overflow-hidden"
      >
        <SheetHeader className="sr-only">
          <SheetTitle>Check-In</SheetTitle>
        </SheetHeader>

        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-full gap-4 p-8">
            <AlertCircle className="h-12 w-12 text-red-500" />
            <p className="text-lg font-medium text-red-600">{error}</p>
            <button
              type="button"
              onClick={() => {
                setError(null)
                refetch()
              }}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
            >
              Try Again
            </button>
          </div>
        ) : slots.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-4 p-8">
            <AlertCircle className="h-12 w-12 text-muted-foreground" />
            <p className="text-lg font-medium text-muted-foreground">No players in this tee time</p>
          </div>
        ) : (
          <SlotOverviewPanel
            teeTimeId={teeTimeId}
            teeTime={teeTime}
            courseName={courseName}
            slots={slots}
            onRefresh={handleRefresh}
            onPayBatch={handlePayBatch}
            onCheckInBatch={handleCheckInBatch}
            onTransferItem={handleTransferItem}
            onAddItem={handleAddItem}
            onPrintTicket={handlePrintTicket}
            onUpdateQuantity={handleUpdateQuantity}
            onRemoveItem={handleRemoveItem}
            onBulkRemove={handleBulkRemove}
            onBulkTransfer={handleBulkTransfer}
            isLoading={isLoading}
            hasDraft={hasDraft}
          />
        )}

        {/* Undo toast */}
        {undoData && (
          <UndoToast
            message={undoData.message}
            onUndo={handleUndoRemove}
            onDismiss={() => setUndoData(null)}
          />
        )}
      </SheetContent>
    </Sheet>
  )
}
