'use client'

import { useState } from 'react'
import { cn } from '@clubvantage/ui'
import { Loader2, AlertCircle, Check, CreditCard, Wallet, Banknote } from 'lucide-react'
import { Modal } from './modal'
import { PlayerTypeBadge } from './player-type-badge'
import type { Flight, Player } from './types'

type SettlementType = 'individual' | 'group' | 'split'
type PaymentMethod = 'member-account' | 'credit-card' | 'cash'

interface Charge {
  label: string
  amount: number
}

export interface SettlementModalProps {
  isOpen: boolean
  onClose: () => void
  flight: Flight
  charges: Charge[]
  onComplete: (data: {
    settlementType: SettlementType
    payerId?: string
    paymentMethod: PaymentMethod
    payments: { playerId: string; amount: number; paid: boolean }[]
  }) => Promise<void>
}

export function SettlementModal({
  isOpen,
  onClose,
  flight,
  charges,
  onComplete,
}: SettlementModalProps) {
  const players = flight.players.filter(Boolean) as Player[]

  const [settlementType, setSettlementType] = useState<SettlementType>('individual')
  const [selectedPayer, setSelectedPayer] = useState<string>(players[0]?.id || '')
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('member-account')
  const [paidPlayers, setPaidPlayers] = useState<Set<string>>(new Set())
  const [notes, setNotes] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const subtotal = charges.reduce((sum, c) => sum + c.amount, 0)
  const total = subtotal
  const perPlayerAmount = Math.ceil(total / players.length)

  const togglePlayerPaid = (playerId: string) => {
    const newSet = new Set(paidPlayers)
    if (newSet.has(playerId)) {
      newSet.delete(playerId)
    } else {
      newSet.add(playerId)
    }
    setPaidPlayers(newSet)
  }

  const handleComplete = async () => {
    setIsSubmitting(true)
    setError(null)

    try {
      await onComplete({
        settlementType,
        payerId: settlementType === 'group' ? selectedPayer : undefined,
        paymentMethod,
        payments: players.map((p) => ({
          playerId: p.id,
          amount: settlementType === 'group' ? 0 : perPlayerAmount,
          paid: settlementType === 'group' || paidPlayers.has(p.id),
        })),
      })
      onClose()
    } catch (err) {
      setError('Failed to complete settlement. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const allPaid =
    settlementType === 'group' ||
    (settlementType === 'individual' && paidPlayers.size === players.length)

  const footer = (
    <>
      <button
        onClick={onClose}
        className="px-4 py-2 border border-border rounded-md font-medium hover:bg-muted/50 transition-colors"
      >
        Cancel
      </button>
      <button
        onClick={handleComplete}
        disabled={!allPaid || isSubmitting}
        className="px-4 py-2 bg-primary text-primary-foreground rounded-md font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
      >
        {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
        Complete Settlement
      </button>
    </>
  )

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Settle Flight"
      subtitle={flight.time}
      footer={footer}
      size="lg"
    >
      <div className="space-y-6">
        {/* Error Banner */}
        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-50 text-red-700 rounded-lg">
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        {/* Charges Summary */}
        <div className="bg-muted/50 rounded-lg p-4">
          <h4 className="font-medium mb-3">Charges Summary</h4>
          <div className="space-y-2 text-sm">
            {charges.map((charge, index) => (
              <div key={index} className="flex justify-between">
                <span>{charge.label}</span>
                <span>฿{charge.amount.toLocaleString()}</span>
              </div>
            ))}
            <div className="flex justify-between font-bold pt-2 border-t mt-2 text-base">
              <span>Total</span>
              <span>฿{total.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Settlement Type */}
        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-3">
            Settlement Type
          </label>
          <div className="grid grid-cols-3 gap-3">
            <button
              onClick={() => setSettlementType('individual')}
              className={cn(
                'p-4 border rounded-lg text-left transition-colors',
                settlementType === 'individual'
                  ? 'bg-primary/10 border-primary'
                  : 'hover:border-border'
              )}
            >
              <div className="font-medium">Individual</div>
              <div className="text-sm text-muted-foreground">
                Each player pays their own share
              </div>
            </button>
            <button
              onClick={() => setSettlementType('group')}
              className={cn(
                'p-4 border rounded-lg text-left transition-colors',
                settlementType === 'group'
                  ? 'bg-primary/10 border-primary'
                  : 'hover:border-border'
              )}
            >
              <div className="font-medium">Group</div>
              <div className="text-sm text-muted-foreground">
                One player pays for everyone
              </div>
            </button>
            <button
              disabled
              className="p-4 border rounded-lg text-left opacity-50 cursor-not-allowed relative"
            >
              <div className="font-medium">Split</div>
              <div className="text-sm text-muted-foreground">Custom allocation</div>
              <span className="absolute top-2 right-2 text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded">
                Coming Soon
              </span>
            </button>
          </div>
        </div>

        {/* Individual Settlement */}
        {settlementType === 'individual' && (
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-3">
              Per-Player Breakdown (฿{perPlayerAmount.toLocaleString()} each)
            </label>
            <div className="space-y-2">
              {players.map((player) => (
                <div
                  key={player.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-medium">{player.name}</span>
                    <PlayerTypeBadge type={player.type} />
                  </div>
                  <div className="flex items-center gap-3">
                    <span>฿{perPlayerAmount.toLocaleString()}</span>
                    {paidPlayers.has(player.id) ? (
                      <span className="flex items-center gap-1 text-emerald-600 text-sm">
                        <Check className="h-4 w-4" />
                        Paid
                      </span>
                    ) : (
                      <button
                        onClick={() => togglePlayerPaid(player.id)}
                        className="px-3 py-1 text-sm bg-primary text-primary-foreground rounded hover:bg-primary/90"
                      >
                        Settle
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Group Settlement */}
        {settlementType === 'group' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">
                Select Payer
              </label>
              <select
                value={selectedPayer}
                onChange={(e) => setSelectedPayer(e.target.value)}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              >
                {players.map((player) => (
                  <option key={player.id} value={player.id}>
                    {player.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="p-4 bg-muted/50 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="font-medium">Total to charge</span>
                <span className="text-xl font-bold">฿{total.toLocaleString()}</span>
              </div>
            </div>
          </div>
        )}

        {/* Payment Method */}
        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-3">
            Payment Method
          </label>
          <div className="grid grid-cols-3 gap-3">
            <button
              onClick={() => setPaymentMethod('member-account')}
              className={cn(
                'p-3 border rounded-lg flex items-center gap-2 transition-colors',
                paymentMethod === 'member-account'
                  ? 'bg-primary/10 border-primary'
                  : 'hover:border-border'
              )}
            >
              <Wallet className="h-5 w-5" />
              <div className="text-left">
                <div className="font-medium text-sm">Member Account</div>
                <div className="text-xs text-muted-foreground">Charge to account</div>
              </div>
            </button>
            <button
              onClick={() => setPaymentMethod('credit-card')}
              className={cn(
                'p-3 border rounded-lg flex items-center gap-2 transition-colors',
                paymentMethod === 'credit-card'
                  ? 'bg-primary/10 border-primary'
                  : 'hover:border-border'
              )}
            >
              <CreditCard className="h-5 w-5" />
              <div className="text-left">
                <div className="font-medium text-sm">Credit Card</div>
                <div className="text-xs text-muted-foreground">Process separately</div>
              </div>
            </button>
            <button
              onClick={() => setPaymentMethod('cash')}
              className={cn(
                'p-3 border rounded-lg flex items-center gap-2 transition-colors',
                paymentMethod === 'cash'
                  ? 'bg-primary/10 border-primary'
                  : 'hover:border-border'
              )}
            >
              <Banknote className="h-5 w-5" />
              <div className="text-left">
                <div className="font-medium text-sm">Cash</div>
                <div className="text-xs text-muted-foreground">Manual handling</div>
              </div>
            </button>
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-2">
            Settlement Notes (optional)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Any settlement notes..."
            rows={2}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary resize-none"
          />
        </div>
      </div>
    </Modal>
  )
}
