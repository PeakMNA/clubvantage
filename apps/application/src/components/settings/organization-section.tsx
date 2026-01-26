'use client'

import { useState } from 'react'
import { Plus, Edit, Trash2, Loader2, Check } from 'lucide-react'
import { Button } from '@clubvantage/ui'
import { Input } from '@clubvantage/ui'
import { Label } from '@clubvantage/ui'
import { Badge } from '@clubvantage/ui'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@clubvantage/ui'
import { Checkbox, cn } from '@clubvantage/ui'
import { mockOutlets, mockRevenueCenters, mockCostCenters, mockProfitCenters } from './mock-data'
import type { OrganizationTab, Outlet, RevenueCenter, CostCenter, ProfitCenter } from './types'

interface OrganizationSectionProps {
  id: string
}

type TabData = {
  outlets: Outlet[]
  revenueCenters: RevenueCenter[]
  costCenters: CostCenter[]
  profitCenters: ProfitCenter[]
}

const tabs: Array<{ id: OrganizationTab; label: string }> = [
  { id: 'outlets', label: 'Outlets' },
  { id: 'revenue-centers', label: 'Revenue Centers' },
  { id: 'cost-centers', label: 'Cost Centers' },
  { id: 'profit-centers', label: 'Profit Centers' },
]

export function OrganizationSection({ id }: OrganizationSectionProps) {
  const [activeTab, setActiveTab] = useState<OrganizationTab>('outlets')
  const [data] = useState<TabData>({
    outlets: mockOutlets,
    revenueCenters: mockRevenueCenters,
    costCenters: mockCostCenters,
    profitCenters: mockProfitCenters,
  })
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<Outlet | RevenueCenter | CostCenter | ProfitCenter | null>(null)

  const handleAdd = () => {
    setEditingItem(null)
    setIsModalOpen(true)
  }

  const handleEdit = (item: Outlet | RevenueCenter | CostCenter | ProfitCenter) => {
    setEditingItem(item)
    setIsModalOpen(true)
  }

  const renderTable = () => {
    switch (activeTab) {
      case 'outlets':
        return (
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Code</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Name</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Location</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Phone</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Status</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.outlets.map((outlet) => (
                <tr key={outlet.id} className="border-t hover:bg-muted/30">
                  <td className="px-4 py-3 font-mono text-sm">{outlet.code}</td>
                  <td className="px-4 py-3 font-medium">{outlet.name}</td>
                  <td className="px-4 py-3 text-muted-foreground">{outlet.location || '-'}</td>
                  <td className="px-4 py-3 text-muted-foreground">{outlet.phone || '-'}</td>
                  <td className="px-4 py-3">
                    <Badge variant={outlet.status === 'active' ? 'default' : 'secondary'} className={outlet.status === 'active' ? 'bg-emerald-500' : ''}>
                      {outlet.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button variant="ghost" size="sm" onClick={() => handleEdit(outlet)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="text-red-600">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )
      case 'revenue-centers':
        return (
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Code</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Name</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Description</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Default Outlet</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Status</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.revenueCenters.map((rc) => (
                <tr key={rc.id} className="border-t hover:bg-muted/30">
                  <td className="px-4 py-3 font-mono text-sm">{rc.code}</td>
                  <td className="px-4 py-3 font-medium">{rc.name}</td>
                  <td className="px-4 py-3 text-muted-foreground">{rc.description || '-'}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {data.outlets.find((o) => o.id === rc.defaultOutletId)?.name || '-'}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={rc.status === 'active' ? 'default' : 'secondary'} className={rc.status === 'active' ? 'bg-emerald-500' : ''}>
                      {rc.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button variant="ghost" size="sm" onClick={() => handleEdit(rc)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="text-red-600">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )
      case 'cost-centers':
        return (
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Code</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Name</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Description</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Status</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.costCenters.map((cc) => (
                <tr key={cc.id} className="border-t hover:bg-muted/30">
                  <td className="px-4 py-3 font-mono text-sm">{cc.code}</td>
                  <td className="px-4 py-3 font-medium">{cc.name}</td>
                  <td className="px-4 py-3 text-muted-foreground">{cc.description || '-'}</td>
                  <td className="px-4 py-3">
                    <Badge variant={cc.status === 'active' ? 'default' : 'secondary'} className={cc.status === 'active' ? 'bg-emerald-500' : ''}>
                      {cc.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button variant="ghost" size="sm" onClick={() => handleEdit(cc)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="text-red-600">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )
      case 'profit-centers':
        return (
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Code</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Name</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Revenue Centers</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Cost Centers</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Status</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.profitCenters.map((pc) => (
                <tr key={pc.id} className="border-t hover:bg-muted/30">
                  <td className="px-4 py-3 font-mono text-sm">{pc.code}</td>
                  <td className="px-4 py-3 font-medium">{pc.name}</td>
                  <td className="px-4 py-3">
                    <Badge variant="outline">{pc.revenueCenterIds.length}</Badge>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant="outline">{pc.costCenterIds.length}</Badge>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={pc.status === 'active' ? 'default' : 'secondary'} className={pc.status === 'active' ? 'bg-emerald-500' : ''}>
                      {pc.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button variant="ghost" size="sm" onClick={() => handleEdit(pc)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="text-red-600">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )
    }
  }

  return (
    <section id={id} className="border rounded-lg p-6 space-y-6 scroll-mt-24">
      <div>
        <h2 className="text-xl font-semibold">Organization</h2>
        <p className="text-sm text-muted-foreground">Configure outlets and financial centers</p>
      </div>

      {/* Sub-tabs */}
      <div className="flex gap-1 border-b">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              'px-4 py-2 text-sm font-medium transition-colors relative',
              activeTab === tab.id
                ? 'text-amber-600'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            {tab.label}
            {activeTab === tab.id && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-500" />
            )}
          </button>
        ))}
      </div>

      {/* Add button */}
      <div className="flex justify-end">
        <Button onClick={handleAdd} className="bg-gradient-to-br from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700">
          <Plus className="h-4 w-4 mr-2" />
          Add {tabs.find((t) => t.id === activeTab)?.label.replace(/s$/, '')}
        </Button>
      </div>

      {/* Table */}
      <div className="border rounded-lg overflow-hidden">
        {renderTable()}
      </div>

      {/* Modal (simplified) */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingItem ? 'Edit' : 'Add'} {tabs.find((t) => t.id === activeTab)?.label.replace(/s$/, '')}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>Code</Label>
              <Input placeholder="Enter code" defaultValue={(editingItem as any)?.code} />
            </div>
            <div>
              <Label>Name</Label>
              <Input placeholder="Enter name" defaultValue={(editingItem as any)?.name} />
            </div>
            <div>
              <Label>Description</Label>
              <Input placeholder="Enter description" defaultValue={(editingItem as any)?.description} />
            </div>
            <label className="flex items-center gap-2">
              <Checkbox defaultChecked={(editingItem as any)?.status === 'active'} />
              <span className="text-sm">Active</span>
            </label>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button className="bg-gradient-to-br from-amber-500 to-amber-600">Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  )
}
