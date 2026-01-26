'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { cn } from '@clubvantage/ui'
import { Checkbox } from '@clubvantage/ui'
import { AgingBadge, type AgingStatus } from './aging-badge'

export interface AllocationInvoice {
  /** Invoice ID for navigation */
  id: string
  /** Invoice number (e.g., INV-2024-0001) */
  invoiceNumber: string
  /** Invoice date */
  date: Date | string
  /** Due date */
  dueDate: Date | string
  /** Original invoice amount */
  amount: number
  /** Outstanding balance */
  balance: number
  /** Aging status */
  agingStatus: AgingStatus
}

interface AllocationTableRowProps {
  /** Invoice data */
  invoice: AllocationInvoice
  /** Whether the row is selected */
  isSelected: boolean
  /** Current allocation amount */
  allocationAmount: number
  /** Callback when selection changes */
  onSelectionChange: (selected: boolean) => void
  /** Callback when allocation amount changes */
  onAllocationChange: (amount: number) => void
  /** Additional class names */
  className?: string
}

function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: '2-digit',
  })
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('th-TH', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

function parseCurrencyInput(value: string): number {
  // Remove non-numeric characters except decimal point
  const cleaned = value.replace(/[^0-9.]/g, '')
  const parsed = parseFloat(cleaned)
  return isNaN(parsed) ? 0 : parsed
}

export function AllocationTableRow({
  invoice,
  isSelected,
  allocationAmount,
  onSelectionChange,
  onAllocationChange,
  className,
}: AllocationTableRowProps) {
  const [inputValue, setInputValue] = useState<string>(
    allocationAmount > 0 ? formatCurrency(allocationAmount) : ''
  )
  const [isInvalid, setIsInvalid] = useState(false)

  // Sync input value when allocation amount changes externally
  useEffect(() => {
    if (isSelected && allocationAmount > 0) {
      setInputValue(formatCurrency(allocationAmount))
    } else if (!isSelected) {
      setInputValue('')
    }
  }, [allocationAmount, isSelected])

  // Validate allocation against balance
  useEffect(() => {
    const numericValue = parseCurrencyInput(inputValue)
    setIsInvalid(numericValue > invoice.balance)
  }, [inputValue, invoice.balance])

  const handleCheckboxChange = (checked: boolean) => {
    onSelectionChange(checked)
    if (checked) {
      // Auto-fill with balance when selected
      setInputValue(formatCurrency(invoice.balance))
      onAllocationChange(invoice.balance)
    } else {
      // Clear allocation when deselected
      setInputValue('')
      onAllocationChange(0)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setInputValue(value)

    const numericValue = parseCurrencyInput(value)
    // Cap at balance
    const cappedValue = Math.min(numericValue, invoice.balance)
    onAllocationChange(cappedValue)
  }

  const handleInputBlur = () => {
    // Format the value on blur
    const numericValue = parseCurrencyInput(inputValue)
    const cappedValue = Math.min(numericValue, invoice.balance)
    if (cappedValue > 0) {
      setInputValue(formatCurrency(cappedValue))
      onAllocationChange(cappedValue)
    } else if (!isSelected) {
      setInputValue('')
    }
  }

  return (
    <tr
      className={cn(
        'border-b border-border transition-colors',
        isSelected ? 'bg-amber-50/50' : 'hover:bg-muted/50',
        className
      )}
    >
      {/* Checkbox */}
      <td className="w-12 p-3">
        <Checkbox
          checked={isSelected}
          onCheckedChange={handleCheckboxChange}
          className="h-[18px] w-[18px]"
        />
      </td>

      {/* Invoice # */}
      <td className="p-3">
        <Link
          href={`/billing/invoices/${invoice.id}`}
          target="_blank"
          rel="noopener noreferrer"
          className="font-mono text-sm text-foreground hover:text-amber-600 hover:underline"
        >
          {invoice.invoiceNumber}
        </Link>
      </td>

      {/* Date */}
      <td className="p-3 text-sm text-muted-foreground">
        {formatDate(invoice.date)}
      </td>

      {/* Due */}
      <td className="p-3 text-sm text-muted-foreground">
        {formatDate(invoice.dueDate)}
      </td>

      {/* Amount */}
      <td className="p-3 text-right text-sm text-muted-foreground">
        ฿{formatCurrency(invoice.amount)}
      </td>

      {/* Balance */}
      <td className="p-3 text-right text-sm font-medium text-foreground">
        ฿{formatCurrency(invoice.balance)}
      </td>

      {/* Aging */}
      <td className="p-3">
        <AgingBadge status={invoice.agingStatus} />
      </td>

      {/* Allocate */}
      <td className="p-3">
        <div className="relative">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
            ฿
          </span>
          <input
            type="text"
            inputMode="numeric"
            value={inputValue}
            onChange={handleInputChange}
            onBlur={handleInputBlur}
            disabled={!isSelected}
            placeholder={isSelected ? '0' : ''}
            title={isInvalid ? `Cannot exceed balance of ฿${formatCurrency(invoice.balance)}` : undefined}
            className={cn(
              'w-[120px] rounded-lg border py-1.5 pl-7 pr-3 text-right text-sm transition-colors',
              'focus:outline-none focus:ring-2',
              isSelected
                ? 'border-border bg-card focus:ring-amber-500/30'
                : 'cursor-not-allowed border-border bg-muted text-muted-foreground',
              isInvalid && isSelected && 'border-red-500 focus:ring-red-500/30'
            )}
          />
        </div>
      </td>
    </tr>
  )
}
