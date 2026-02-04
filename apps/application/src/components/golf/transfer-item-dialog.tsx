'use client'

import { useState } from 'react'
import { cn } from '@clubvantage/ui'
import { ArrowRight, User, Check, Loader2 } from 'lucide-react'
import { PlayerTypeBadge, type PlayerType } from './player-type-badge'

interface TransferPlayer {
  id: string
  name: string
  type: 'MEMBER' | 'GUEST' | 'DEPENDENT' | 'WALK_UP'
}

// Helper to normalize player type from backend format to frontend format
function normalizePlayerType(type: string): PlayerType {
  const typeMap: Record<string, PlayerType> = {
    'MEMBER': 'member',
    'GUEST': 'guest',
    'DEPENDENT': 'dependent',
    'WALK_UP': 'walkup',
  }
  return typeMap[type] || 'guest'
}

interface TransferItemDialogProps {
  open: boolean
  onClose: () => void
  onConfirm: (toPlayerId: string) => Promise<void>
  players: TransferPlayer[]
  itemDescription?: string
  itemAmount?: number
  isProcessing?: boolean
}

export function TransferItemDialog({
  open,
  onClose,
  onConfirm,
  players,
  itemDescription,
  itemAmount,
  isProcessing = false,
}: TransferItemDialogProps) {
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null)

  const handleConfirm = async () => {
    if (!selectedPlayerId) return
    await onConfirm(selectedPlayerId)
    setSelectedPlayerId(null)
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 animate-in fade-in duration-200">
      <div className="bg-card rounded-lg shadow-lg w-full max-w-md mx-4 animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-4 border-b">
          <h3 className="font-semibold text-lg flex items-center gap-2">
            <ArrowRight className="h-5 w-5 text-primary" />
            Transfer Item
          </h3>
          {itemDescription && (
            <p className="text-sm text-muted-foreground mt-1">
              {itemDescription}
              {itemAmount !== undefined && (
                <span className="font-medium ml-1">${itemAmount.toFixed(2)}</span>
              )}
            </p>
          )}
        </div>

        {/* Player list */}
        <div className="p-4">
          <p className="text-sm text-muted-foreground mb-3">
            Select the player to receive this charge:
          </p>

          <div className="space-y-2 max-h-64 overflow-y-auto">
            {players.map(player => (
              <button
                key={player.id}
                type="button"
                onClick={() => setSelectedPlayerId(player.id)}
                disabled={isProcessing}
                className={cn(
                  'w-full flex items-center gap-3 p-3 rounded-lg border transition-all text-left',
                  selectedPlayerId === player.id
                    ? 'border-primary bg-primary/5 ring-2 ring-primary'
                    : 'border-border hover:border-primary/50 hover:bg-muted/50',
                  isProcessing && 'opacity-50 cursor-not-allowed'
                )}
              >
                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                  <User className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium truncate">{player.name}</span>
                    <PlayerTypeBadge type={normalizePlayerType(player.type)} />
                  </div>
                </div>
                {selectedPlayerId === player.id && (
                  <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                    <Check className="h-4 w-4 text-white" />
                  </div>
                )}
              </button>
            ))}
          </div>

          {players.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No other players available to transfer to.
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isProcessing}
            className="px-4 py-2 text-sm font-medium hover:bg-muted rounded-lg transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={!selectedPlayerId || isProcessing}
            className={cn(
              'flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors',
              selectedPlayerId && !isProcessing
                ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                : 'bg-muted text-muted-foreground cursor-not-allowed'
            )}
          >
            {isProcessing ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Transferring...
              </>
            ) : (
              <>
                <ArrowRight className="h-4 w-4" />
                Transfer
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
