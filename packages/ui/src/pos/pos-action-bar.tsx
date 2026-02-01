'use client'

import * as React from 'react'
import { cn } from '../lib/utils'
import { POSButton } from './pos-button'

export interface ActionBarButton {
  position: [number, number]  // [row, col]
  buttonId: string
  span?: number   // column span, default 1
}

export interface ActionBarConfig {
  rows: number      // e.g., 2
  columns: number   // e.g., 6
  buttons: ActionBarButton[]
}

export interface ButtonState {
  visible: boolean
  enabled: boolean
  requiresApproval: boolean
}

export interface ButtonDefinition {
  id: string
  label: string
  icon: string
  color: string  // 'primary' | 'success' | 'warning' | 'danger' | 'neutral'
  shortcut?: string
}

export interface POSActionBarProps {
  className?: string
  actionBarConfig?: ActionBarConfig
  buttonStates?: Map<string, ButtonState>
  buttonRegistry?: Record<string, ButtonDefinition>
  onButtonClick?: (buttonId: string) => void
}

export function POSActionBar({
  className,
  actionBarConfig,
  buttonStates,
  buttonRegistry,
  onButtonClick
}: POSActionBarProps) {
  const { rows = 2, columns = 6, buttons = [] } = actionBarConfig || {}

  // Create grid cells
  const grid: (ActionBarButton | null)[][] = Array(rows)
    .fill(null)
    .map(() => Array(columns).fill(null))

  // Place buttons in grid
  buttons.forEach(btn => {
    const [row, col] = btn.position
    if (row < rows && col < columns) {
      grid[row][col] = btn
    }
  })

  return (
    <div
      className={cn(
        'grid gap-2 p-3 border-t bg-stone-50',
        className
      )}
      style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
    >
      {grid.flat().map((cell, idx) => {
        if (!cell) return <div key={idx} className="h-12" />

        const buttonDef = buttonRegistry?.[cell.buttonId]
        const state = buttonStates?.get(cell.buttonId)

        if (!buttonDef || !state?.visible) return <div key={idx} className="h-12" />

        return (
          <POSButton
            key={cell.buttonId}
            buttonId={cell.buttonId}
            label={buttonDef.label}
            icon={buttonDef.icon}
            color={buttonDef.color as 'primary' | 'success' | 'warning' | 'danger' | 'neutral'}
            size="large"
            shortcut={buttonDef.shortcut}
            enabled={state.enabled}
            requiresApproval={state.requiresApproval}
            span={cell.span}
            onClick={() => onButtonClick?.(cell.buttonId)}
            style={cell.span ? { gridColumn: `span ${cell.span}` } : undefined}
          />
        )
      })}
    </div>
  )
}
