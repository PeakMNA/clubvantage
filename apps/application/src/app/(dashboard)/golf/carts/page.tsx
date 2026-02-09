'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { PageHeader, Button } from '@clubvantage/ui'
import { CartsTab } from '@/components/golf/carts-tab'
import {
  DynamicCartModal as CartModal,
  DynamicCartMaintenanceModal as CartMaintenanceModal,
} from '@/components/golf/dynamic-modals'
import type { Cart } from '@/components/golf/types'

// Mock carts data
const initialCarts: Cart[] = [
  { id: 'a0000001-0000-0000-0000-000000000001', number: '01', type: '2-seater', status: 'AVAILABLE' },
  { id: 'a0000001-0000-0000-0000-000000000002', number: '02', type: '2-seater', status: 'IN_USE', currentAssignment: '7:00 AM' },
  { id: 'a0000001-0000-0000-0000-000000000003', number: '03', type: '4-seater', status: 'AVAILABLE' },
  { id: 'a0000001-0000-0000-0000-000000000004', number: '04', type: '4-seater', status: 'MAINTENANCE', conditionNotes: 'Battery replacement needed' },
  { id: 'a0000001-0000-0000-0000-000000000005', number: '05', type: '2-seater', status: 'AVAILABLE' },
  { id: 'a0000001-0000-0000-0000-000000000006', number: '06', type: '2-seater', status: 'IN_USE', currentAssignment: '7:08 AM' },
]

export default function GolfCartsPage() {
  const [carts, setCarts] = useState(initialCarts)
  const [showCartModal, setShowCartModal] = useState(false)
  const [editingCart, setEditingCart] = useState<Cart | null>(null)
  const [showCartMaintenanceModal, setShowCartMaintenanceModal] = useState(false)
  const [maintenanceCart, setMaintenanceCart] = useState<Cart | null>(null)

  const handleSaveCart = async (data: Omit<Cart, 'id'>) => {
    if (editingCart) {
      setCarts(carts.map(c => c.id === editingCart.id ? { ...data, id: editingCart.id } : c))
    } else {
      setCarts([...carts, { ...data, id: `cart-${Date.now()}` }])
    }
  }

  const handleDeleteCart = async () => {
    if (editingCart) {
      setCarts(carts.filter(c => c.id !== editingCart.id))
    }
  }

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title="Golf Management"
        description="Manage golf carts"
        breadcrumbs={[{ label: 'Golf' }, { label: 'Carts' }]}
        actions={
          <Button onClick={() => { setEditingCart(null); setShowCartModal(true) }}>
            <Plus className="mr-2 h-4 w-4" />
            Add Cart
          </Button>
        }
      />

      <CartsTab
        carts={carts}
        onAddCart={() => {
          setEditingCart(null)
          setShowCartModal(true)
        }}
        onEditCart={(cart: Cart) => {
          setEditingCart(cart)
          setShowCartModal(true)
        }}
        onScheduleMaintenance={(cart: Cart) => {
          setMaintenanceCart(cart)
          setShowCartMaintenanceModal(true)
        }}
      />

      <CartModal
        isOpen={showCartModal}
        onClose={() => {
          setShowCartModal(false)
          setEditingCart(null)
        }}
        cart={editingCart}
        onSave={handleSaveCart}
        onDelete={editingCart ? handleDeleteCart : undefined}
      />

      {maintenanceCart && (
        <CartMaintenanceModal
          isOpen={showCartMaintenanceModal}
          onClose={() => {
            setShowCartMaintenanceModal(false)
            setMaintenanceCart(null)
          }}
          cart={maintenanceCart}
          upcomingMaintenance={[]}
          maintenanceHistory={[]}
          onSchedule={async (data) => {
            console.log('Schedule maintenance:', data)
          }}
          onMarkComplete={async (id) => {
            console.log('Mark complete:', id)
          }}
          onCancel={async (id) => {
            console.log('Cancel maintenance:', id)
          }}
        />
      )}
    </div>
  )
}
