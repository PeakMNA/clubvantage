'use client'

import { useState, useRef, useEffect } from 'react'
import { Minus, Plus } from 'lucide-react'
import { cn } from '@clubvantage/ui'

interface QuantityStepperProps {
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
  disabled?: boolean
  size?: 'sm' | 'md'
}

export function QuantityStepper({
  value,
  onChange,
  min = 1,
  max = 99,
  disabled = false,
  size = 'sm',
}: QuantityStepperProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState(String(value))
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.select()
    }
  }, [isEditing])

  const handleDecrement = () => {
    if (value > min) {
      onChange(value - 1)
    } else if (value === min && min === 1) {
      // Signal that we want to go below 1 (triggers remove confirmation)
      onChange(0)
    }
  }

  const handleIncrement = () => {
    if (value < max) {
      onChange(value + 1)
    }
  }

  const handleEditStart = () => {
    if (disabled) return
    setEditValue(String(value))
    setIsEditing(true)
  }

  const handleEditConfirm = () => {
    const newValue = parseInt(editValue, 10)
    if (!isNaN(newValue) && newValue >= min && newValue <= max) {
      onChange(newValue)
    } else if (!isNaN(newValue) && newValue < min) {
      onChange(0) // Signal remove
    }
    setIsEditing(false)
  }

  const handleEditCancel = () => {
    setEditValue(String(value))
    setIsEditing(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleEditConfirm()
    } else if (e.key === 'Escape') {
      handleEditCancel()
    }
  }

  const buttonClass = cn(
    'flex items-center justify-center rounded transition-colors',
    size === 'sm' ? 'w-6 h-6' : 'w-8 h-8',
    disabled
      ? 'text-muted-foreground/30 cursor-not-allowed'
      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
  )

  return (
    <div className="flex items-center gap-1">
      <button
        type="button"
        onClick={handleDecrement}
        disabled={disabled}
        className={buttonClass}
        title="Decrease quantity"
      >
        <Minus className={size === 'sm' ? 'h-3 w-3' : 'h-4 w-4'} />
      </button>

      {isEditing ? (
        <input
          ref={inputRef}
          type="number"
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={handleEditConfirm}
          onKeyDown={handleKeyDown}
          min={min}
          max={max}
          className={cn(
            'text-center border rounded focus:outline-none focus:ring-1 focus:ring-primary',
            size === 'sm' ? 'w-8 h-6 text-xs' : 'w-10 h-8 text-sm'
          )}
        />
      ) : (
        <button
          type="button"
          onClick={handleEditStart}
          disabled={disabled}
          className={cn(
            'font-medium tabular-nums',
            size === 'sm' ? 'w-8 text-xs' : 'w-10 text-sm',
            disabled ? 'cursor-not-allowed' : 'cursor-text hover:bg-muted rounded px-1'
          )}
          title="Click to edit quantity"
        >
          {value}
        </button>
      )}

      <button
        type="button"
        onClick={handleIncrement}
        disabled={disabled || value >= max}
        className={buttonClass}
        title="Increase quantity"
      >
        <Plus className={size === 'sm' ? 'h-3 w-3' : 'h-4 w-4'} />
      </button>
    </div>
  )
}
