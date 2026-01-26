'use client'

import { useState, useMemo } from 'react'
import { Search, ChevronDown, ChevronRight, Loader2, Lock } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@clubvantage/ui'
import { Button } from '@clubvantage/ui'
import { Input } from '@clubvantage/ui'
import { Label } from '@clubvantage/ui'
import { Checkbox } from '@clubvantage/ui'
import { Badge } from '@clubvantage/ui'
import { mockPermissionSections } from './mock-data'
import type { Role } from './types'

interface RoleEditorModalProps {
  role: Role | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (role: Partial<Role>) => void
  mode: 'add' | 'edit' | 'clone'
}

export function RoleEditorModal({
  role,
  open,
  onOpenChange,
  onSave,
  mode,
}: RoleEditorModalProps) {
  const [name, setName] = useState(
    mode === 'clone' ? `Clone of ${role?.name || ''}` : role?.name || ''
  )
  const [description, setDescription] = useState(role?.description || '')
  const [selectedPermissions, setSelectedPermissions] = useState<Set<string>>(
    new Set(role?.permissions || [])
  )
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(mockPermissionSections.map((s) => s.id))
  )
  const [isSaving, setIsSaving] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const filteredSections = useMemo(() => {
    if (!searchQuery) return mockPermissionSections
    return mockPermissionSections
      .map((section) => ({
        ...section,
        permissions: section.permissions.filter(
          (p) =>
            p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.code.toLowerCase().includes(searchQuery.toLowerCase())
        ),
      }))
      .filter((section) => section.permissions.length > 0)
  }, [searchQuery])

  const toggleSection = (sectionId: string) => {
    const newExpanded = new Set(expandedSections)
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId)
    } else {
      newExpanded.add(sectionId)
    }
    setExpandedSections(newExpanded)
  }

  const togglePermission = (code: string) => {
    const newSelected = new Set(selectedPermissions)
    if (newSelected.has(code)) {
      newSelected.delete(code)
    } else {
      newSelected.add(code)
    }
    setSelectedPermissions(newSelected)
  }

  const toggleAllInSection = (sectionId: string) => {
    const section = mockPermissionSections.find((s) => s.id === sectionId)
    if (!section) return

    const allSelected = section.permissions.every((p) =>
      selectedPermissions.has(p.code)
    )
    const newSelected = new Set(selectedPermissions)

    if (allSelected) {
      section.permissions.forEach((p) => newSelected.delete(p.code))
    } else {
      section.permissions.forEach((p) => newSelected.add(p.code))
    }
    setSelectedPermissions(newSelected)
  }

  const getSectionStats = (sectionId: string) => {
    const section = mockPermissionSections.find((s) => s.id === sectionId)
    if (!section) return { selected: 0, total: 0 }
    const selected = section.permissions.filter((p) =>
      selectedPermissions.has(p.code)
    ).length
    return { selected, total: section.permissions.length }
  }

  const validate = () => {
    const newErrors: Record<string, string> = {}
    if (!name.trim()) newErrors.name = 'Role name is required'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSave = async () => {
    if (!validate()) return
    setIsSaving(true)
    await new Promise((resolve) => setTimeout(resolve, 1000))
    onSave({
      id: mode === 'add' || mode === 'clone' ? `custom-${Date.now()}` : role?.id,
      name,
      description,
      permissions: Array.from(selectedPermissions),
      permissionCount: selectedPermissions.size,
      isSystem: false,
    })
    setIsSaving(false)
    onOpenChange(false)
  }

  const title =
    mode === 'add'
      ? 'Add Role'
      : mode === 'clone'
      ? 'Clone Role'
      : `Edit Role: ${role?.name}`

  const isSystemRole = role?.isSystem && mode === 'edit'

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {title}
            {isSystemRole && <Lock className="h-4 w-4 text-muted-foreground" />}
          </DialogTitle>
        </DialogHeader>

        {isSystemRole && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-800">
            System roles cannot be modified. You can clone this role to create a
            custom version.
          </div>
        )}

        <div className="flex-1 overflow-y-auto space-y-6 py-4">
          {/* Basic Info */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="role-name">Role Name *</Label>
              <Input
                id="role-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isSystemRole}
                className={errors.name ? 'border-red-500' : ''}
              />
              {errors.name && (
                <p className="text-xs text-red-500 mt-1">{errors.name}</p>
              )}
            </div>
            <div>
              <Label htmlFor="role-description">Description</Label>
              <Input
                id="role-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={isSystemRole}
                placeholder="Brief description of this role"
              />
            </div>
          </div>

          {/* Permission Picker */}
          <div className="space-y-4 pt-4 border-t">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Permissions</h4>
              <Badge variant="secondary">
                {selectedPermissions.size} selected
              </Badge>
            </div>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search permissions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
                disabled={isSystemRole}
              />
            </div>

            <div className="border rounded-lg divide-y max-h-80 overflow-y-auto">
              {filteredSections.map((section) => {
                const stats = getSectionStats(section.id)
                const isExpanded = expandedSections.has(section.id)
                const allSelected = stats.selected === stats.total
                const someSelected = stats.selected > 0 && stats.selected < stats.total

                return (
                  <div key={section.id}>
                    <button
                      type="button"
                      onClick={() => toggleSection(section.id)}
                      className="flex items-center justify-between w-full px-4 py-3 hover:bg-muted/50"
                      disabled={isSystemRole}
                    >
                      <div className="flex items-center gap-2">
                        {isExpanded ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                        <span className="font-medium">{section.name}</span>
                        <span className="text-sm text-muted-foreground">
                          ({stats.selected} of {stats.total})
                        </span>
                      </div>
                      {!isSystemRole && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            toggleAllInSection(section.id)
                          }}
                        >
                          {allSelected ? 'Deselect All' : 'Select All'}
                        </Button>
                      )}
                    </button>

                    {isExpanded && (
                      <div className="px-4 pb-3 space-y-1">
                        {section.permissions.map((permission) => (
                          <label
                            key={permission.code}
                            className="flex items-start gap-3 px-6 py-2 rounded hover:bg-muted/30 cursor-pointer"
                          >
                            <Checkbox
                              checked={selectedPermissions.has(permission.code)}
                              onCheckedChange={() =>
                                togglePermission(permission.code)
                              }
                              disabled={isSystemRole}
                              className="mt-0.5"
                            />
                            <div>
                              <span className="text-sm">{permission.name}</span>
                              <p className="text-xs text-muted-foreground">
                                {permission.code}
                              </p>
                            </div>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Footer Info */}
          {role && mode === 'edit' && (
            <div className="text-sm text-muted-foreground">
              {role.userCount} users have this role
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          {!isSystemRole && (
            <Button
              onClick={handleSave}
              disabled={isSaving}
              className="bg-gradient-to-br from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700"
            >
              {isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {mode === 'add' ? 'Create Role' : 'Save Changes'}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
