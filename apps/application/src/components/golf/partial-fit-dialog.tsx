'use client'

import { useState } from 'react'
import { cn } from '@clubvantage/ui'
import { AlertTriangle, X } from 'lucide-react'

interface Player {
  id: string
  name: string
}

interface PartialFitDialogProps {
  isOpen: boolean
  action: 'move' | 'copy'
  players: Player[]
  canFit: number
  targetTime: string
  sourceTime: string
  onConfirm: (selectedPlayerIds: string[]) => void
  onCancel: () => void
}

export function PartialFitDialog({
  isOpen,
  action,
  players,
  canFit,
  targetTime,
  sourceTime,
  onConfirm,
  onCancel,
}: PartialFitDialogProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>(() =>
    players.slice(0, canFit).map((p) => p.id)
  )

  if (!isOpen) return null

  const togglePlayer = (id: string) => {
    setSelectedIds((prev) => {
      if (prev.includes(id)) {
        return prev.filter((pid) => pid !== id)
      }
      if (prev.length < canFit) {
        return [...prev, id]
      }
      // At max, swap last selected with new one
      return [...prev.slice(0, -1), id]
    })
  }

  const handleConfirm = () => {
    onConfirm(selectedIds)
  }

  const actionVerb = action === 'move' ? 'Move' : 'Copy'
  const remainingCount = players.length - canFit

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onCancel}
        onKeyDown={(e) => e.key === 'Escape' && onCancel()}
        role="button"
        tabIndex={0}
        aria-label="Close dialog"
      />

      {/* Dialog */}
      <div className="relative w-full max-w-md mx-4 bg-white dark:bg-stone-900 rounded-2xl shadow-2xl">
        {/* Header */}
        <div className="flex items-start justify-between p-4 border-b border-stone-200 dark:border-stone-700">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/30">
              <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-stone-900 dark:text-stone-100">
                Partial {actionVerb}
              </h2>
              <p className="text-sm text-stone-500 dark:text-stone-400">
                Only {canFit} of {players.length} players can fit
              </p>
            </div>
          </div>
          <button
            onClick={onCancel}
            className="p-1 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
          >
            <X className="h-5 w-5 text-stone-500" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 space-y-4">
          <p className="text-sm text-stone-600 dark:text-stone-400">
            {actionVerb} {canFit} player{canFit !== 1 ? 's' : ''} to {targetTime}
            {action === 'move' && (
              <>
                {' '}
                and leave {remainingCount} player
                {remainingCount !== 1 ? 's' : ''} at {sourceTime}
              </>
            )}
            ?
          </p>

          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400">
              Select players to {action} ({selectedIds.length}/{canFit})
            </label>
            <div className="space-y-1">
              {players.map((player) => {
                const isSelected = selectedIds.includes(player.id)
                const willStay = !isSelected && action === 'move'

                return (
                  <button
                    key={player.id}
                    onClick={() => togglePlayer(player.id)}
                    className={cn(
                      'w-full flex items-center justify-between px-3 py-2 rounded-lg border transition-colors text-left',
                      isSelected
                        ? 'border-emerald-300 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-900/30'
                        : 'border-stone-200 dark:border-stone-700 hover:bg-stone-50 dark:hover:bg-stone-800'
                    )}
                  >
                    <span
                      className={cn(
                        'text-sm font-medium',
                        isSelected
                          ? 'text-emerald-700 dark:text-emerald-300'
                          : 'text-stone-700 dark:text-stone-300'
                      )}
                    >
                      {player.name}
                    </span>
                    <span
                      className={cn(
                        'text-xs px-2 py-0.5 rounded-full',
                        isSelected
                          ? 'bg-emerald-100 dark:bg-emerald-800 text-emerald-700 dark:text-emerald-300'
                          : willStay
                            ? 'bg-stone-100 dark:bg-stone-700 text-stone-500 dark:text-stone-400'
                            : 'bg-transparent'
                      )}
                    >
                      {isSelected
                        ? `${actionVerb}s to ${targetTime}`
                        : willStay
                          ? `Stays at ${sourceTime}`
                          : ''}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 p-4 border-t border-stone-200 dark:border-stone-700">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={selectedIds.length === 0}
            className="px-4 py-2 text-sm font-medium bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {actionVerb} {selectedIds.length} Player
            {selectedIds.length !== 1 ? 's' : ''}
          </button>
        </div>
      </div>
    </div>
  )
}
