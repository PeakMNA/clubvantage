'use client'

import { cn } from '@clubvantage/ui'
import { Loader2 } from 'lucide-react'
import type { BookingStatus } from './types'

export interface BookingActionsProps {
  status: BookingStatus
  isProcessing?: boolean
  processingAction?: string
  onCheckIn: () => void
  onMarkOnCourse: () => void
  onMarkFinished: () => void
  onSettle: () => void
  onMove: () => void
  onCopy: () => void
  onEdit: () => void
  onCancel: () => void
  onViewReceipt: () => void
  onOverridePenalty: () => void
  onResendConfirmation?: () => void
}

type ActionButton = {
  label: string
  action: string
  onClick: () => void
  variant: 'primary' | 'secondary' | 'danger'
}

const buttonStyles = {
  primary: cn(
    'bg-gradient-to-br from-emerald-500 to-emerald-600 text-white',
    'shadow-lg hover:shadow-xl',
    'rounded-xl py-2.5 px-4',
    'text-sm font-medium',
    'transition-all duration-200',
    'disabled:opacity-50 disabled:cursor-not-allowed'
  ),
  secondary: cn(
    'border border-stone-300 text-stone-700',
    'hover:bg-stone-50',
    'rounded-xl py-2.5 px-4',
    'text-sm font-medium',
    'transition-all duration-200',
    'disabled:opacity-50 disabled:cursor-not-allowed'
  ),
  danger: cn(
    'border border-red-200 text-red-600',
    'hover:bg-red-50',
    'rounded-xl py-2.5 px-4',
    'text-sm font-medium',
    'transition-all duration-200',
    'disabled:opacity-50 disabled:cursor-not-allowed'
  ),
}

function getActionsForStatus(
  status: BookingStatus,
  handlers: BookingActionsProps
): ActionButton[] {
  const actions: ActionButton[] = []

  switch (status) {
    case 'BOOKED':
      // [Check In - Primary] [Move] [Copy] [Edit] [Cancel - Danger]
      actions.push({
        label: 'Check In',
        action: 'checkIn',
        onClick: handlers.onCheckIn,
        variant: 'primary',
      })
      actions.push({
        label: 'Move',
        action: 'move',
        onClick: handlers.onMove,
        variant: 'secondary',
      })
      actions.push({
        label: 'Copy',
        action: 'copy',
        onClick: handlers.onCopy,
        variant: 'secondary',
      })
      actions.push({
        label: 'Edit',
        action: 'edit',
        onClick: handlers.onEdit,
        variant: 'secondary',
      })
      actions.push({
        label: 'Cancel',
        action: 'cancel',
        onClick: handlers.onCancel,
        variant: 'danger',
      })
      break

    case 'CHECKED_IN':
      // [Mark On Course - Primary] [Settle] [Move] [Edit] [Cancel - Danger]
      actions.push({
        label: 'Mark On Course',
        action: 'markOnCourse',
        onClick: handlers.onMarkOnCourse,
        variant: 'primary',
      })
      actions.push({
        label: 'Settle',
        action: 'settle',
        onClick: handlers.onSettle,
        variant: 'secondary',
      })
      actions.push({
        label: 'Move',
        action: 'move',
        onClick: handlers.onMove,
        variant: 'secondary',
      })
      actions.push({
        label: 'Edit',
        action: 'edit',
        onClick: handlers.onEdit,
        variant: 'secondary',
      })
      actions.push({
        label: 'Cancel',
        action: 'cancel',
        onClick: handlers.onCancel,
        variant: 'danger',
      })
      break

    case 'STARTED':
      // [Mark Finished - Primary] [Settle] [Edit]
      actions.push({
        label: 'Mark Finished',
        action: 'markFinished',
        onClick: handlers.onMarkFinished,
        variant: 'primary',
      })
      actions.push({
        label: 'Settle',
        action: 'settle',
        onClick: handlers.onSettle,
        variant: 'secondary',
      })
      actions.push({
        label: 'Edit',
        action: 'edit',
        onClick: handlers.onEdit,
        variant: 'secondary',
      })
      break

    case 'COMPLETED':
      // [View Receipt] [Copy]
      actions.push({
        label: 'View Receipt',
        action: 'viewReceipt',
        onClick: handlers.onViewReceipt,
        variant: 'secondary',
      })
      actions.push({
        label: 'Copy',
        action: 'copy',
        onClick: handlers.onCopy,
        variant: 'secondary',
      })
      break

    case 'CANCELLED':
      // [View Details]
      // Note: View Details is typically handled by the modal itself being open
      // This is a placeholder that could open an expanded view
      actions.push({
        label: 'View Details',
        action: 'viewDetails',
        onClick: () => {}, // No-op as modal is already showing details
        variant: 'secondary',
      })
      break

    case 'NO_SHOW':
      // [Override Penalty] [View Details]
      actions.push({
        label: 'Override Penalty',
        action: 'overridePenalty',
        onClick: handlers.onOverridePenalty,
        variant: 'secondary',
      })
      actions.push({
        label: 'View Details',
        action: 'viewDetails',
        onClick: () => {}, // No-op as modal is already showing details
        variant: 'secondary',
      })
      break

    default:
      break
  }

  return actions
}

export function BookingActions({
  status,
  isProcessing = false,
  processingAction,
  onCheckIn,
  onMarkOnCourse,
  onMarkFinished,
  onSettle,
  onMove,
  onCopy,
  onEdit,
  onCancel,
  onViewReceipt,
  onOverridePenalty,
  onResendConfirmation,
}: BookingActionsProps) {
  const actions = getActionsForStatus(status, {
    status,
    onCheckIn,
    onMarkOnCourse,
    onMarkFinished,
    onSettle,
    onMove,
    onCopy,
    onEdit,
    onCancel,
    onViewReceipt,
    onOverridePenalty,
    onResendConfirmation,
  })

  if (actions.length === 0) {
    return null
  }

  return (
    <div className="flex gap-3">
      {actions.map((action) => {
        const isButtonProcessing = isProcessing && processingAction === action.action

        return (
          <button
            key={action.action}
            onClick={action.onClick}
            disabled={isProcessing}
            className={cn(
              buttonStyles[action.variant],
              'flex items-center gap-2'
            )}
          >
            {isButtonProcessing && (
              <Loader2 className="h-4 w-4 animate-spin" />
            )}
            {action.label}
          </button>
        )
      })}
    </div>
  )
}
