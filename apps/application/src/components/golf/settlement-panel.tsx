'use client'

import { useState, useMemo } from 'react'
import { cn } from '@clubvantage/ui'
import {
  Loader2,
  AlertCircle,
  Check,
  ChevronLeft,
  DollarSign,
  CreditCard,
  Banknote,
  Building,
  ArrowRightLeft,
  Plus,
} from 'lucide-react'
import { PlayerTypeBadge } from './player-type-badge'
import { LineItemManager } from './line-item-manager'
import { ProShopItemPicker } from './pro-shop-item-picker'
import { SettlementStatusBadge } from './check-in-status-badge'
import {
  useGetPlayerPaymentInfoQuery,
  useGetCheckInPaymentMethodsQuery,
  useProcessSettlementMutation,
  useSettleAllPlayersMutation,
  useAddLineItemMutation,
  useRemoveLineItemMutation,
  type CheckInPaymentMethodType,
  type TaxType,
} from '@clubvantage/api-client'

// Type for products from the picker
interface ProductForSettlement {
  id: string
  name: string
  price: number
  effectiveTaxRate: number
  effectiveTaxType: string
  variants: VariantForSettlement[]
}

interface VariantForSettlement {
  id: string
  name: string
  finalPrice: number
  priceAdjustment: number
}
import { useQueryClient } from '@tanstack/react-query'

export interface SettlementPanelProps {
  teeTimeId: string
  playerIds: string[]
  onBack: () => void
  onComplete: (ticketId?: string) => void
}

type SettlementMode = 'individual' | 'group'

const paymentMethodIcons: Record<string, React.ElementType> = {
  CASH: Banknote,
  CARD: CreditCard,
  TRANSFER: ArrowRightLeft,
  ACCOUNT: Building,
  CUSTOM: DollarSign,
}

export function SettlementPanel({
  teeTimeId,
  playerIds,
  onBack,
  onComplete,
}: SettlementPanelProps) {
  const queryClient = useQueryClient()

  // State
  const [settlementMode, setSettlementMode] = useState<SettlementMode>('individual')
  const [selectedPaymentMethodId, setSelectedPaymentMethodId] = useState<string | null>(null)
  const [reference, setReference] = useState('')
  const [settledPlayers, setSettledPlayers] = useState<Set<string>>(new Set())
  const [processingPlayerId, setProcessingPlayerId] = useState<string | null>(null)
  const [isProcessingAll, setIsProcessingAll] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showProShopPicker, setShowProShopPicker] = useState(false)
  const [addingItemForPlayer, setAddingItemForPlayer] = useState<string | null>(null)

  // Fetch payment methods
  const { data: paymentMethodsData } = useGetCheckInPaymentMethodsQuery()
  const paymentMethods = paymentMethodsData?.checkInPaymentMethods || []
  const enabledPaymentMethods = paymentMethods.filter((m) => m.isEnabled)

  // Selected payment method details
  const selectedPaymentMethod = paymentMethods.find(
    (m) => m.id === selectedPaymentMethodId
  )

  // Mutations
  const processSettlement = useProcessSettlementMutation()
  const settleAllPlayers = useSettleAllPlayersMutation()
  const addLineItem = useAddLineItemMutation()
  const removeLineItem = useRemoveLineItemMutation()

  // Calculate totals
  const totalBalance = useMemo(() => {
    return playerIds.reduce((total, playerId) => {
      if (settledPlayers.has(playerId)) return total
      // This would need to be calculated from player payment info
      return total
    }, 0)
  }, [playerIds, settledPlayers])

  const allSettled = settledPlayers.size === playerIds.length

  // Handlers
  const handleSettlePlayer = async (playerId: string, amount: number) => {
    if (!selectedPaymentMethodId) {
      setError('Please select a payment method')
      return
    }

    setProcessingPlayerId(playerId)
    setError(null)

    try {
      await processSettlement.mutateAsync({
        input: {
          teeTimeId,
          payments: [{ playerId, amount }],
          paymentMethodId: selectedPaymentMethodId,
          reference: reference || undefined,
        },
      })

      setSettledPlayers((prev) => new Set([...prev, playerId]))

      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: ['GetPlayerPaymentInfo'] })
      queryClient.invalidateQueries({ queryKey: ['GetFlightCheckInInfo'] })
    } catch (err) {
      setError('Failed to process settlement. Please try again.')
    } finally {
      setProcessingPlayerId(null)
    }
  }

  const handleSettleAll = async () => {
    if (!selectedPaymentMethodId) {
      setError('Please select a payment method')
      return
    }

    setIsProcessingAll(true)
    setError(null)

    try {
      const result = await settleAllPlayers.mutateAsync({
        input: {
          teeTimeId,
          paymentMethodId: selectedPaymentMethodId,
          reference: reference || undefined,
        },
      })

      if (result.settleAllPlayers.success) {
        // Mark all as settled
        setSettledPlayers(new Set(playerIds))

        // Complete with ticket if generated
        onComplete(result.settleAllPlayers.transactionId || undefined)
      } else {
        setError(result.settleAllPlayers.error || 'Settlement failed')
      }

      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: ['GetPlayerPaymentInfo'] })
      queryClient.invalidateQueries({ queryKey: ['GetFlightCheckInInfo'] })
    } catch (err) {
      setError('Failed to process settlement. Please try again.')
    } finally {
      setIsProcessingAll(false)
    }
  }

  const handleAddItem = (
    product: ProductForSettlement,
    variant?: VariantForSettlement
  ) => {
    if (!addingItemForPlayer) return

    addLineItem.mutate(
      {
        input: {
          playerId: addingItemForPlayer,
          type: 'PROSHOP',
          description: variant
            ? `${product.name} - ${variant.name}`
            : product.name,
          baseAmount: variant ? variant.finalPrice : product.price,
          taxRate: product.effectiveTaxRate,
          taxType: product.effectiveTaxType as TaxType,
          productId: product.id,
          variantId: variant?.id,
        },
      },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ['GetPlayerPaymentInfo'] })
        },
      }
    )
  }

  const handleRemoveItem = (playerId: string, lineItemId: string) => {
    removeLineItem.mutate(
      { input: { lineItemId } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ['GetPlayerPaymentInfo'] })
        },
      }
    )
  }

  const handleCompleteCheckIn = () => {
    onComplete()
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-3 pb-4 border-b">
        <button
          onClick={onBack}
          className="p-1 hover:bg-muted rounded transition-colors"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <div>
          <h2 className="font-semibold">Settlement</h2>
          <p className="text-sm text-muted-foreground">
            {playerIds.length} player{playerIds.length !== 1 ? 's' : ''} selected
          </p>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="flex items-center gap-2 p-3 mt-4 bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400 rounded-lg">
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          <span className="text-sm">{error}</span>
        </div>
      )}

      {/* Settlement Mode Toggle */}
      <div className="flex gap-2 mt-4">
        <button
          onClick={() => setSettlementMode('individual')}
          className={cn(
            'flex-1 py-2 px-4 rounded-md font-medium transition-colors',
            settlementMode === 'individual'
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted hover:bg-muted/80'
          )}
        >
          Individual
        </button>
        <button
          onClick={() => setSettlementMode('group')}
          className={cn(
            'flex-1 py-2 px-4 rounded-md font-medium transition-colors',
            settlementMode === 'group'
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted hover:bg-muted/80'
          )}
        >
          Group
        </button>
      </div>

      {/* Payment Method Selection */}
      <div className="mt-4">
        <label className="text-sm font-medium text-muted-foreground">
          Payment Method
        </label>
        <div className="grid grid-cols-2 gap-2 mt-2">
          {enabledPaymentMethods.map((method) => {
            const Icon = paymentMethodIcons[method.type] || DollarSign
            return (
              <button
                key={method.id}
                onClick={() => setSelectedPaymentMethodId(method.id)}
                className={cn(
                  'flex items-center gap-2 p-3 rounded-lg border transition-colors',
                  selectedPaymentMethodId === method.id
                    ? 'border-primary bg-primary/5'
                    : 'hover:border-muted-foreground/30'
                )}
              >
                <Icon className="h-5 w-5" />
                <span className="font-medium">{method.name}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Reference Input (conditional) */}
      {selectedPaymentMethod?.requiresRef && (
        <div className="mt-4">
          <label className="text-sm font-medium text-muted-foreground">
            Reference Number
          </label>
          <input
            type="text"
            value={reference}
            onChange={(e) => setReference(e.target.value)}
            placeholder="Enter transaction reference"
            className="w-full mt-2 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      )}

      {/* Player Cards */}
      <div className="flex-1 mt-4 overflow-y-auto space-y-3">
        {playerIds.map((playerId) => (
          <PlayerSettlementCard
            key={playerId}
            playerId={playerId}
            teeTimeId={teeTimeId}
            mode={settlementMode}
            isSettled={settledPlayers.has(playerId)}
            isProcessing={processingPlayerId === playerId}
            paymentMethodSelected={!!selectedPaymentMethodId}
            onSettle={handleSettlePlayer}
            onAddItem={() => {
              setAddingItemForPlayer(playerId)
              setShowProShopPicker(true)
            }}
            onRemoveItem={(lineItemId) => handleRemoveItem(playerId, lineItemId)}
          />
        ))}
      </div>

      {/* Footer */}
      <div className="pt-4 mt-4 border-t space-y-3">
        {settlementMode === 'group' && !allSettled && (
          <button
            onClick={handleSettleAll}
            disabled={!selectedPaymentMethodId || isProcessingAll}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-primary text-primary-foreground rounded-md font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isProcessingAll && <Loader2 className="h-4 w-4 animate-spin" />}
            Settle All Players
          </button>
        )}

        {allSettled && (
          <button
            onClick={handleCompleteCheckIn}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-emerald-600 text-white rounded-md font-medium hover:bg-emerald-700 transition-colors"
          >
            <Check className="h-4 w-4" />
            Complete & Generate Ticket
          </button>
        )}
      </div>

      {/* Pro Shop Item Picker */}
      <ProShopItemPicker
        isOpen={showProShopPicker}
        onClose={() => {
          setShowProShopPicker(false)
          setAddingItemForPlayer(null)
        }}
        onSelect={handleAddItem}
      />
    </div>
  )
}

// Individual Player Settlement Card
interface PlayerSettlementCardProps {
  playerId: string
  teeTimeId: string
  mode: SettlementMode
  isSettled: boolean
  isProcessing: boolean
  paymentMethodSelected: boolean
  onSettle: (playerId: string, amount: number) => void
  onAddItem: () => void
  onRemoveItem: (lineItemId: string) => void
}

function PlayerSettlementCard({
  playerId,
  teeTimeId,
  mode,
  isSettled,
  isProcessing,
  paymentMethodSelected,
  onSettle,
  onAddItem,
  onRemoveItem,
}: PlayerSettlementCardProps) {
  const { data, isLoading } = useGetPlayerPaymentInfoQuery({ playerId })
  const playerInfo = data?.playerPaymentInfo

  if (isLoading || !playerInfo) {
    return (
      <div className="p-4 border rounded-lg animate-pulse">
        <div className="h-4 bg-muted rounded w-1/3 mb-2" />
        <div className="h-3 bg-muted rounded w-1/2" />
      </div>
    )
  }

  const balance = playerInfo.balanceDue

  return (
    <div
      className={cn(
        'p-4 border rounded-lg transition-colors',
        isSettled && 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/30'
      )}
    >
      {/* Player Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="font-medium">{playerInfo.playerName}</span>
          <PlayerTypeBadge type={playerInfo.playerType as any} />
        </div>
        <SettlementStatusBadge
          isSettled={playerInfo.isSettled || isSettled}
          balanceDue={balance}
        />
      </div>

      {/* Line Items */}
      <LineItemManager
        lineItems={playerInfo.lineItems}
        isEditable={!isSettled && !playerInfo.isSettled}
        showAddButton={!isSettled && !playerInfo.isSettled}
        onAddItem={onAddItem}
        onRemoveItem={(lineItemId) => onRemoveItem(lineItemId)}
      />

      {/* Settle Button (Individual Mode) */}
      {mode === 'individual' && !isSettled && !playerInfo.isSettled && balance > 0 && (
        <button
          onClick={() => onSettle(playerId, balance)}
          disabled={!paymentMethodSelected || isProcessing}
          className="w-full mt-3 flex items-center justify-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isProcessing && <Loader2 className="h-4 w-4 animate-spin" />}
          Settle ${balance.toFixed(2)}
        </button>
      )}
    </div>
  )
}
