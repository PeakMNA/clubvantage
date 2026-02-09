'use client'

import { useState } from 'react'
import { cn } from '@clubvantage/ui'
import { Plus, Car, Wrench, Settings, Battery } from 'lucide-react'
import type { Cart } from './types'

interface CartsTabProps {
  carts: Cart[]
  isLoading?: boolean
  onAddCart: () => void
  onEditCart: (cart: Cart) => void
  onScheduleMaintenance: (cart: Cart) => void
}

type FilterStatus = 'all' | 'AVAILABLE' | 'IN_USE' | 'MAINTENANCE'

function CartStatusBadge({ status }: { status: Cart['status'] }) {
  const config = {
    AVAILABLE: { bg: 'bg-emerald-50 dark:bg-emerald-500/20 border-emerald-200/60 dark:border-emerald-500/30', text: 'text-emerald-700 dark:text-emerald-400', label: 'Available' },
    IN_USE: { bg: 'bg-blue-50 dark:bg-blue-500/20 border-blue-200/60 dark:border-blue-500/30', text: 'text-blue-700 dark:text-blue-400', label: 'In Use' },
    MAINTENANCE: { bg: 'bg-amber-50 dark:bg-amber-500/20 border-amber-200/60 dark:border-amber-500/30', text: 'text-amber-700 dark:text-amber-400', label: 'Maintenance' },
    OUT_OF_SERVICE: { bg: 'bg-red-50 dark:bg-red-500/20 border-red-200/60 dark:border-red-500/30', text: 'text-red-700 dark:text-red-400', label: 'Out of Service' },
  }[status]

  return (
    <span className={cn('px-2.5 py-1 rounded-full text-xs font-medium border', config.bg, config.text)}>
      {config.label}
    </span>
  )
}

function CartCard({
  cart,
  onEdit,
  onScheduleMaintenance,
}: {
  cart: Cart
  onEdit: () => void
  onScheduleMaintenance: () => void
}) {
  return (
    <div className="relative overflow-hidden rounded-xl sm:rounded-2xl border border/60 bg-card/80 shadow-lg shadow-slate-200/30 dark:shadow-black/20 backdrop-blur-sm transition-all duration-300 hover:shadow-xl hover:shadow-slate-200/50 dark:hover:shadow-black/30 group">
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-muted/50 to-transparent pointer-events-none" />

      {/* Accent line - color based on status */}
      <div className={cn(
        'absolute left-0 top-0 h-1 w-full',
        cart.status === 'AVAILABLE' && 'bg-gradient-to-r from-emerald-300 via-emerald-500 to-emerald-300',
        cart.status === 'IN_USE' && 'bg-gradient-to-r from-blue-300 via-blue-500 to-blue-300',
        cart.status === 'MAINTENANCE' && 'bg-gradient-to-r from-amber-300 via-amber-500 to-amber-300',
        cart.status === 'OUT_OF_SERVICE' && 'bg-gradient-to-r from-red-300 via-red-500 to-red-300'
      )} />

      <div className="relative p-4 sm:p-5">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={cn(
              'flex h-10 w-10 items-center justify-center rounded-xl shadow-inner',
              cart.status === 'AVAILABLE' && 'bg-gradient-to-br from-emerald-100 to-emerald-200/50',
              cart.status === 'IN_USE' && 'bg-gradient-to-br from-blue-100 to-blue-200/50',
              cart.status === 'MAINTENANCE' && 'bg-gradient-to-br from-amber-100 to-amber-200/50',
              cart.status === 'OUT_OF_SERVICE' && 'bg-gradient-to-br from-red-100 to-red-200/50'
            )}>
              <Car className={cn(
                'h-5 w-5',
                cart.status === 'AVAILABLE' && 'text-emerald-600',
                cart.status === 'IN_USE' && 'text-blue-600',
                cart.status === 'MAINTENANCE' && 'text-amber-600',
                cart.status === 'OUT_OF_SERVICE' && 'text-red-600'
              )} />
            </div>
            <h3 className="text-lg font-bold tracking-tight text-foreground">Cart #{cart.number}</h3>
          </div>
          <CartStatusBadge status={cart.status} />
        </div>

        {/* Details */}
        <div className="space-y-3 mb-4">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-muted/80 rounded-lg border border-border text-sm text-muted-foreground">
            <Battery className="h-4 w-4 text-muted-foreground" />
            {cart.type}
          </div>

          {cart.status === 'IN_USE' && cart.currentAssignment && (
            <p className="text-sm text-blue-600 dark:text-blue-400 font-medium bg-blue-50/80 dark:bg-blue-500/10 px-3 py-2 rounded-lg border border-blue-100 dark:border-blue-500/30">
              Flight: {cart.currentAssignment}
            </p>
          )}

          {cart.conditionNotes && (
            <p className="text-sm text-muted-foreground line-clamp-2 p-3 bg-muted/80 rounded-lg border border-border">
              {cart.conditionNotes}
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-4 border-t border-border">
          <button
            onClick={onScheduleMaintenance}
            className="flex-1 py-2.5 text-sm text-muted-foreground hover:text-foreground hover:bg-muted rounded-xl transition-all duration-200 font-medium flex items-center justify-center gap-1.5"
          >
            <Wrench className="h-4 w-4" />
            Maintenance
          </button>
          <button
            onClick={onEdit}
            className="flex-1 py-2.5 text-sm text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 rounded-xl transition-all duration-200 font-semibold"
          >
            Edit
          </button>
        </div>
      </div>
    </div>
  )
}

function SkeletonCard() {
  return (
    <div className="relative overflow-hidden rounded-xl sm:rounded-2xl border border/60 bg-card/80 p-4 sm:p-5 animate-pulse">
      <div className="absolute left-0 top-0 h-1 w-full bg-muted" />
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 bg-muted rounded-xl" />
          <div className="h-5 w-24 bg-muted rounded" />
        </div>
        <div className="h-6 w-16 bg-muted rounded-full" />
      </div>
      <div className="h-8 w-20 bg-muted rounded-lg mb-4" />
      <div className="h-12 bg-muted rounded-xl" />
    </div>
  )
}

export function CartsTab({
  carts,
  isLoading,
  onAddCart,
  onEditCart,
  onScheduleMaintenance,
}: CartsTabProps) {
  const [filter, setFilter] = useState<FilterStatus>('all')

  const filteredCarts = carts.filter((cart) => {
    if (filter === 'all') return true
    return cart.status === filter
  })

  const availableCount = carts.filter((c) => c.status === 'AVAILABLE').length
  const statusCounts = {
    all: carts.length,
    AVAILABLE: carts.filter((c) => c.status === 'AVAILABLE').length,
    IN_USE: carts.filter((c) => c.status === 'IN_USE').length,
    MAINTENANCE: carts.filter((c) => c.status === 'MAINTENANCE').length,
  }

  const filters: { id: FilterStatus; label: string }[] = [
    { id: 'all', label: 'All' },
    { id: 'AVAILABLE', label: 'Available' },
    { id: 'IN_USE', label: 'In Use' },
    { id: 'MAINTENANCE', label: 'Maintenance' },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-foreground">Carts</h2>
          <p className="text-sm text-muted-foreground">
            {carts.length} cart{carts.length !== 1 ? 's' : ''} ({availableCount} available)
          </p>
        </div>
        <button
          onClick={onAddCart}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-br from-slate-800 to-slate-900 text-white rounded-xl font-medium shadow-lg shadow-slate-900/20 hover:shadow-xl transition-all duration-300"
        >
          <Plus className="h-4 w-4" />
          Add Cart
        </button>
      </div>

      {/* Filter Bar */}
      <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
        {filters.map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={cn(
              'px-4 py-2 text-sm rounded-full border transition-all duration-200 whitespace-nowrap font-medium',
              filter === f.id
                ? 'bg-gradient-to-br from-slate-800 to-slate-900 text-white border-slate-800 shadow-lg shadow-slate-900/20'
                : 'border text-muted-foreground hover:border-slate-300 hover:bg-muted'
            )}
          >
            {f.label} ({statusCounts[f.id]})
          </button>
        ))}
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : filteredCarts.length === 0 ? (
        <div className="relative overflow-hidden rounded-2xl border border/60 bg-card/80 shadow-lg shadow-slate-200/30 dark:shadow-black/20 backdrop-blur-sm">
          <div className="absolute inset-0 bg-gradient-to-br from-muted/50 to-transparent pointer-events-none" />
          <div className="absolute left-0 top-0 h-1 w-full bg-gradient-to-r from-border via-muted-foreground to-muted" />
          <div className="relative flex flex-col items-center justify-center py-12 sm:py-16 px-4">
            {filter === 'all' ? (
              <>
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted">
                  <Settings className="h-7 w-7 text-muted-foreground" />
                </div>
                <h3 className="mt-4 text-lg font-bold tracking-tight text-foreground">
                  No carts configured
                </h3>
                <p className="mt-2 text-sm text-muted-foreground text-center max-w-sm">
                  Add carts to your fleet to start assigning them to flights.
                </p>
                <button
                  onClick={onAddCart}
                  className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-br from-slate-800 to-slate-900 text-white rounded-xl font-medium shadow-lg shadow-slate-900/20 hover:shadow-xl transition-all duration-300"
                >
                  <Plus className="h-4 w-4" />
                  Add Cart
                </button>
              </>
            ) : (
              <>
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted">
                  <Car className="h-7 w-7 text-muted-foreground" />
                </div>
                <h3 className="mt-4 text-lg font-bold tracking-tight text-foreground">
                  No carts match filter
                </h3>
                <button
                  onClick={() => setFilter('all')}
                  className="mt-4 text-emerald-600 hover:text-emerald-700 font-medium transition-colors"
                >
                  Clear filter
                </button>
              </>
            )}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {filteredCarts.map((cart) => (
            <CartCard
              key={cart.id}
              cart={cart}
              onEdit={() => onEditCart(cart)}
              onScheduleMaintenance={() => onScheduleMaintenance(cart)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
