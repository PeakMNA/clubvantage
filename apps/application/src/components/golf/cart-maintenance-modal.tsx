'use client'

import { useState } from 'react'
import { cn } from '@clubvantage/ui'
import { Loader2, Plus, Check, X, Calendar } from 'lucide-react'
import { Modal } from './modal'
import type { Cart } from './types'

type MaintenanceType = 'routine' | 'repair' | 'inspection' | 'battery' | 'tire' | 'cleaning'
type Priority = 'low' | 'medium' | 'high' | 'urgent'
type Recurrence = 'one-time' | 'weekly' | 'bi-weekly' | 'monthly' | 'quarterly'
type MaintenanceStatus = 'scheduled' | 'in-progress' | 'completed' | 'cancelled'

interface MaintenanceItem {
  id: string
  type: MaintenanceType
  priority: Priority
  scheduledDate: string
  recurrence: Recurrence
  notes?: string
  status: MaintenanceStatus
  completedDate?: string
  technician?: string
  cost?: number
}

export interface CartMaintenanceModalProps {
  isOpen: boolean
  onClose: () => void
  cart: Cart
  upcomingMaintenance: MaintenanceItem[]
  maintenanceHistory: MaintenanceItem[]
  onSchedule: (data: {
    type: MaintenanceType
    priority: Priority
    scheduledDate: string
    recurrence: Recurrence
    notes: string
  }) => Promise<void>
  onMarkComplete: (id: string) => Promise<void>
  onCancel: (id: string) => Promise<void>
}

function CartStatusBadge({ status }: { status: Cart['status'] }) {
  const config = {
    available: { bg: 'bg-emerald-100', text: 'text-emerald-700', label: 'Available' },
    'in-use': { bg: 'bg-blue-100', text: 'text-blue-700', label: 'In Use' },
    maintenance: { bg: 'bg-amber-100', text: 'text-amber-700', label: 'Maintenance' },
    'out-of-service': { bg: 'bg-red-100', text: 'text-red-700', label: 'Out of Service' },
  }[status]

  return (
    <span className={cn('px-2 py-0.5 rounded-full text-xs font-medium', config.bg, config.text)}>
      {config.label}
    </span>
  )
}

function PriorityBadge({ priority }: { priority: Priority }) {
  const config = {
    low: { bg: 'bg-muted', text: 'text-muted-foreground' },
    medium: { bg: 'bg-blue-100', text: 'text-blue-700' },
    high: { bg: 'bg-amber-100', text: 'text-amber-700' },
    urgent: { bg: 'bg-red-100', text: 'text-red-700' },
  }[priority]

  return (
    <span className={cn('px-2 py-0.5 rounded text-xs font-medium capitalize', config.bg, config.text)}>
      {priority}
    </span>
  )
}

const MAINTENANCE_TYPES: { id: MaintenanceType; label: string }[] = [
  { id: 'routine', label: 'Routine Check' },
  { id: 'repair', label: 'Repair' },
  { id: 'inspection', label: 'Inspection' },
  { id: 'battery', label: 'Battery Service' },
  { id: 'tire', label: 'Tire Service' },
  { id: 'cleaning', label: 'Deep Cleaning' },
]

const PRIORITIES: Priority[] = ['low', 'medium', 'high', 'urgent']

const RECURRENCE_OPTIONS: { id: Recurrence; label: string }[] = [
  { id: 'one-time', label: 'One-time' },
  { id: 'weekly', label: 'Weekly' },
  { id: 'bi-weekly', label: 'Every 2 Weeks' },
  { id: 'monthly', label: 'Monthly' },
  { id: 'quarterly', label: 'Quarterly' },
]

export function CartMaintenanceModal({
  isOpen,
  onClose,
  cart,
  upcomingMaintenance,
  maintenanceHistory,
  onSchedule,
  onMarkComplete,
  onCancel,
}: CartMaintenanceModalProps) {
  const [showScheduleForm, setShowScheduleForm] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    type: 'routine' as MaintenanceType,
    priority: 'medium' as Priority,
    scheduledDate: '',
    recurrence: 'one-time' as Recurrence,
    notes: '',
  })

  const handleSchedule = async () => {
    if (!formData.scheduledDate) return

    setIsSubmitting(true)
    try {
      await onSchedule(formData)
      setShowScheduleForm(false)
      setFormData({
        type: 'routine',
        priority: 'medium',
        scheduledDate: '',
        recurrence: 'one-time',
        notes: '',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Cart #${cart.number}`}
      subtitle={cart.type}
      size="lg"
      footer={
        <button
          onClick={onClose}
          className="px-4 py-2 border border-border rounded-md font-medium hover:bg-muted/50 transition-colors"
        >
          Close
        </button>
      }
    >
      <div className="space-y-6">
        {/* Cart Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="p-3 bg-muted/50 rounded-lg">
            <div className="text-sm text-muted-foreground">Last Maintenance</div>
            <div className="font-medium">
              {cart.lastMaintenance || 'Never'}
            </div>
          </div>
          <div className="p-3 bg-muted/50 rounded-lg">
            <div className="text-sm text-muted-foreground">Next Scheduled</div>
            <div className="font-medium">
              {upcomingMaintenance[0]?.scheduledDate || 'None'}
            </div>
          </div>
          <div className="p-3 bg-muted/50 rounded-lg">
            <div className="text-sm text-muted-foreground">Current Status</div>
            <div className="mt-1">
              <CartStatusBadge status={cart.status} />
            </div>
          </div>
        </div>

        {/* Schedule New Maintenance */}
        <div>
          {showScheduleForm ? (
            <div className="border rounded-lg p-4 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">Schedule Maintenance</h3>
                <button
                  onClick={() => setShowScheduleForm(false)}
                  className="p-1 hover:bg-muted rounded"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">
                  Maintenance Type
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {MAINTENANCE_TYPES.map((type) => (
                    <button
                      key={type.id}
                      onClick={() =>
                        setFormData({ ...formData, type: type.id })
                      }
                      className={cn(
                        'py-2 px-3 text-sm rounded border transition-colors',
                        formData.type === type.id
                          ? 'bg-primary text-primary-foreground border-primary'
                          : 'hover:border-border'
                      )}
                    >
                      {type.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">
                  Priority
                </label>
                <div className="flex gap-2">
                  {PRIORITIES.map((priority) => (
                    <button
                      key={priority}
                      onClick={() => setFormData({ ...formData, priority })}
                      className={cn(
                        'flex-1 py-2 text-sm rounded border transition-colors capitalize',
                        formData.priority === priority
                          ? 'bg-primary text-primary-foreground border-primary'
                          : 'hover:border-border'
                      )}
                    >
                      {priority}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">
                    Scheduled Date
                  </label>
                  <input
                    type="date"
                    value={formData.scheduledDate}
                    onChange={(e) =>
                      setFormData({ ...formData, scheduledDate: e.target.value })
                    }
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">
                    Recurrence
                  </label>
                  <select
                    value={formData.recurrence}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        recurrence: e.target.value as Recurrence,
                      })
                    }
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    {RECURRENCE_OPTIONS.map((option) => (
                      <option key={option.id} value={option.id}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">
                  Notes
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                  rows={2}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                />
              </div>

              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setShowScheduleForm(false)}
                  className="px-4 py-2 border rounded-md hover:bg-muted/50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSchedule}
                  disabled={!formData.scheduledDate || isSubmitting}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50 flex items-center gap-2"
                >
                  {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                  Save
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowScheduleForm(true)}
              className="w-full py-3 border-2 border-dashed border-border rounded-lg text-sm font-medium text-muted-foreground hover:border-primary hover:text-primary transition-colors flex items-center justify-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Schedule Maintenance
            </button>
          )}
        </div>

        {/* Upcoming Maintenance */}
        <div>
          <h3 className="font-medium mb-3">Upcoming Maintenance</h3>
          {upcomingMaintenance.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">
              No scheduled maintenance
            </p>
          ) : (
            <div className="space-y-2">
              {upcomingMaintenance.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{item.scheduledDate}</span>
                      <span className="text-muted-foreground capitalize">
                        {item.type.replace('-', ' ')}
                      </span>
                      <PriorityBadge priority={item.priority} />
                    </div>
                    {item.notes && (
                      <p className="text-sm text-muted-foreground mt-1 ml-6">
                        {item.notes}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => onMarkComplete(item.id)}
                      className="px-3 py-1 text-sm text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 rounded transition-colors"
                    >
                      Mark Complete
                    </button>
                    <button
                      onClick={() => onCancel(item.id)}
                      className="px-3 py-1 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 rounded transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Maintenance History */}
        <div>
          <h3 className="font-medium mb-3">Maintenance History</h3>
          {maintenanceHistory.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">
              No maintenance history
            </p>
          ) : (
            <div className="space-y-2">
              {maintenanceHistory.map((item) => (
                <div
                  key={item.id}
                  className="p-3 bg-muted/50 rounded-lg"
                >
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-emerald-500" />
                    <span className="font-medium">{item.completedDate}</span>
                    <span className="text-muted-foreground capitalize">
                      {item.type.replace('-', ' ')}
                    </span>
                  </div>
                  {(item.technician || item.cost) && (
                    <p className="text-sm text-muted-foreground mt-1 ml-6">
                      {item.technician && `Technician: ${item.technician}`}
                      {item.technician && item.cost && ' • '}
                      {item.cost && `Cost: ฿${item.cost.toLocaleString()}`}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Modal>
  )
}
