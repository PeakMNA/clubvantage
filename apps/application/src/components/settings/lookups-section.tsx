'use client'

import { useState } from 'react'
import { Plus, Edit, Trash2, GripVertical } from 'lucide-react'
import { Button } from '@clubvantage/ui'
import { Badge } from '@clubvantage/ui'
import { Checkbox } from '@clubvantage/ui'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@clubvantage/ui'
import { Input } from '@clubvantage/ui'
import { Label } from '@clubvantage/ui'
import { cn } from '@clubvantage/ui'
import {
  mockMembershipTypes,
  mockContractTemplates,
  mockTitleLookups,
  mockRelationshipLookups,
  mockPaymentMethodLookups,
} from './mock-data'
import type { LookupTab, MembershipType, ContractTemplate, LookupValue } from './types'
import { useInterestCategories, useEngagementMutations } from '@/hooks/use-engagement'
import type { InterestCategory } from '@/components/members/engagement/types'

interface LookupsSectionProps {
  id: string
}

const tabs: Array<{ id: LookupTab; label: string }> = [
  { id: 'membership-types', label: 'Membership Types' },
  { id: 'contract-templates', label: 'Contract Templates' },
  { id: 'member-lookups', label: 'Member Lookups' },
  { id: 'billing-lookups', label: 'Billing Lookups' },
  { id: 'facility-types', label: 'Facility Types' },
  { id: 'interest-categories', label: 'Interest Categories' },
]

export function LookupsSection({ id }: LookupsSectionProps) {
  const [activeTab, setActiveTab] = useState<LookupTab>('membership-types')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<MembershipType | ContractTemplate | LookupValue | InterestCategory | null>(null)

  // Interest categories data
  const { categories: interestCategories, isLoading: categoriesLoading } = useInterestCategories({ isActive: undefined })

  const handleAdd = () => {
    setEditingItem(null)
    setIsModalOpen(true)
  }

  const handleEdit = (item: MembershipType | ContractTemplate | LookupValue) => {
    setEditingItem(item)
    setIsModalOpen(true)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('th-TH', {
      style: 'currency',
      currency: 'THB',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'membership-types':
        return (
          <div className="border rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Code</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Name</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Monthly</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Entry Fee</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Billing</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Status</th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {mockMembershipTypes.map((type) => (
                  <tr key={type.id} className="border-t hover:bg-muted/30">
                    <td className="px-4 py-3 font-mono text-sm">{type.code}</td>
                    <td className="px-4 py-3 font-medium">
                      {type.name}
                      {type.requiresBoardApproval && (
                        <Badge variant="outline" className="ml-2 text-xs">Board Approval</Badge>
                      )}
                      {type.allowsDependents && (
                        <Badge variant="outline" className="ml-2 text-xs">Dependents</Badge>
                      )}
                    </td>
                    <td className="px-4 py-3">{formatCurrency(type.monthlyFee)}</td>
                    <td className="px-4 py-3">{formatCurrency(type.entryFee)}</td>
                    <td className="px-4 py-3 capitalize">{type.billingCycle}</td>
                    <td className="px-4 py-3">
                      <Badge variant={type.status === 'active' ? 'default' : 'secondary'} className={type.status === 'active' ? 'bg-emerald-500' : ''}>
                        {type.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button variant="ghost" size="sm" onClick={() => handleEdit(type)}>
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
          </div>
        )

      case 'contract-templates':
        return (
          <div className="border rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Code</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Name</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Duration</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Auto-renew</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Status</th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {mockContractTemplates.map((template) => (
                  <tr key={template.id} className="border-t hover:bg-muted/30">
                    <td className="px-4 py-3 font-mono text-sm">{template.code}</td>
                    <td className="px-4 py-3 font-medium">{template.name}</td>
                    <td className="px-4 py-3">{template.durationMonths} months</td>
                    <td className="px-4 py-3">
                      {template.autoRenewal ? (
                        <Badge variant="outline" className="bg-emerald-50 text-emerald-700">Yes</Badge>
                      ) : (
                        <Badge variant="outline">No</Badge>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={template.status === 'active' ? 'default' : 'secondary'} className={template.status === 'active' ? 'bg-emerald-500' : ''}>
                        {template.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button variant="ghost" size="sm" onClick={() => handleEdit(template)}>
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
          </div>
        )

      case 'member-lookups':
        return (
          <div className="space-y-6">
            <LookupTable title="Titles" items={mockTitleLookups} onEdit={handleEdit} />
            <LookupTable title="Relationship Types" items={mockRelationshipLookups} onEdit={handleEdit} />
          </div>
        )

      case 'billing-lookups':
        return (
          <div className="space-y-6">
            <LookupTable title="Payment Methods" items={mockPaymentMethodLookups} onEdit={handleEdit} />
          </div>
        )

      case 'facility-types':
        return (
          <div className="text-center py-12 text-muted-foreground">
            Facility types configuration coming soon
          </div>
        )

      case 'interest-categories':
        if (categoriesLoading) {
          return (
            <div className="text-center py-12 text-muted-foreground">
              Loading interest categories...
            </div>
          )
        }
        return (
          <div className="border rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Code</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Name</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Icon</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Color</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Status</th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {interestCategories?.map((category: InterestCategory) => (
                  <tr key={category.id} className="border-t hover:bg-muted/30">
                    <td className="px-4 py-3 font-mono text-sm">{category.code}</td>
                    <td className="px-4 py-3 font-medium">{category.name}</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">{category.icon || '-'}</td>
                    <td className="px-4 py-3">
                      {category.color ? (
                        <div className="flex items-center gap-2">
                          <div
                            className="w-4 h-4 rounded-full border"
                            style={{ backgroundColor: category.color }}
                          />
                          <span className="text-sm font-mono">{category.color}</span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <Badge
                        variant={category.isActive ? 'default' : 'secondary'}
                        className={category.isActive ? 'bg-emerald-500' : ''}
                      >
                        {category.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button variant="ghost" size="sm" onClick={() => handleEdit(category as any)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="text-red-600">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
                {(!interestCategories || interestCategories.length === 0) && (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                      No interest categories configured. Click Add to create one.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )
    }
  }

  return (
    <section id={id} className="border rounded-lg p-6 space-y-6 scroll-mt-24">
      <div>
        <h2 className="text-xl font-semibold">Lookups</h2>
        <p className="text-sm text-muted-foreground">Manage reference data and lookup values</p>
      </div>

      {/* Sub-tabs */}
      <div className="flex gap-1 border-b overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              'px-4 py-2 text-sm font-medium transition-colors relative whitespace-nowrap',
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
          Add
        </Button>
      </div>

      {/* Content */}
      {renderContent()}

      {/* Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingItem ? 'Edit' : 'Add'} Item</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>Code</Label>
              <Input placeholder="Enter code" defaultValue={(editingItem as any)?.code} />
            </div>
            <div>
              <Label>Name</Label>
              <Input placeholder="Enter name" defaultValue={(editingItem as any)?.name || (editingItem as any)?.label} />
            </div>
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

function LookupTable({
  title,
  items,
  onEdit,
}: {
  title: string
  items: LookupValue[]
  onEdit: (item: LookupValue) => void
}) {
  return (
    <div className="border rounded-lg">
      <div className="px-4 py-3 border-b bg-muted/30 font-medium">{title}</div>
      <div className="divide-y">
        {items.map((item) => (
          <div key={item.id} className="flex items-center gap-3 px-4 py-2 hover:bg-muted/30">
            <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
            <span className="flex-1">{item.label}</span>
            <Checkbox checked={item.status === 'active'} />
            <Button variant="ghost" size="sm" onClick={() => onEdit(item)}>
              <Edit className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" className="text-red-600">
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
        <button className="w-full px-4 py-2 text-sm text-muted-foreground hover:bg-muted/30 text-left">
          <Plus className="h-4 w-4 inline mr-2" />
          Add {title.replace(/s$/, '')}...
        </button>
      </div>
    </div>
  )
}
