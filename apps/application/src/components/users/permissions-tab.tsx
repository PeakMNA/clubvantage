'use client'

import { useState, useMemo } from 'react'
import { Search, ChevronDown, ChevronRight, Info } from 'lucide-react'
import { Input } from '@clubvantage/ui'
import { Badge } from '@clubvantage/ui'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@clubvantage/ui'
import { mockPermissionSections, mockRoles } from './mock-data'

export function PermissionsTab() {
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(mockPermissionSections.map((s) => s.id))
  )

  const filteredSections = useMemo(() => {
    if (!searchQuery) return mockPermissionSections
    return mockPermissionSections
      .map((section) => ({
        ...section,
        permissions: section.permissions.filter(
          (p) =>
            p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.description.toLowerCase().includes(searchQuery.toLowerCase())
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

  const getRolesWithPermission = (code: string) => {
    return mockRoles.filter(
      (role) =>
        role.permissions.includes(code) || role.permissions.includes('*')
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">
            Reference catalog of all available permissions in the system.
            Permissions are assigned to roles, not directly to users.
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search permissions..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Permission Sections */}
      <div className="border rounded-lg divide-y">
        {filteredSections.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-muted-foreground">No permissions match your search</p>
          </div>
        ) : (
          filteredSections.map((section) => {
            const isExpanded = expandedSections.has(section.id)

            return (
              <div key={section.id}>
                <button
                  type="button"
                  onClick={() => toggleSection(section.id)}
                  className="flex items-center justify-between w-full px-4 py-3 hover:bg-muted/50"
                >
                  <div className="flex items-center gap-2">
                    {isExpanded ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                    <span className="font-medium">{section.name} Section</span>
                  </div>
                  <Badge variant="secondary">
                    {section.permissions.length} permissions
                  </Badge>
                </button>

                {isExpanded && (
                  <div className="px-4 pb-4 space-y-3">
                    {section.permissions.map((permission) => {
                      const rolesWithPermission = getRolesWithPermission(permission.code)

                      return (
                        <div
                          key={permission.code}
                          className="border rounded-lg p-4 bg-muted/20"
                        >
                          <div className="flex items-start justify-between">
                            <div className="space-y-1">
                              <code className="text-xs text-muted-foreground font-mono">
                                {permission.code}
                              </code>
                              <h4 className="font-medium">{permission.name}</h4>
                              <p className="text-sm text-muted-foreground">
                                {permission.description}
                              </p>
                            </div>
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <div className="flex items-center gap-1 text-sm text-muted-foreground cursor-help">
                                    <Info className="h-3.5 w-3.5" />
                                    <span>
                                      {rolesWithPermission.length} role
                                      {rolesWithPermission.length !== 1 ? 's' : ''}
                                    </span>
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent side="left" className="max-w-xs">
                                  <p className="font-medium mb-1">Roles with this permission:</p>
                                  <ul className="text-sm space-y-0.5">
                                    {rolesWithPermission.length === 0 ? (
                                      <li className="text-muted-foreground">None</li>
                                    ) : (
                                      rolesWithPermission.map((role) => (
                                        <li key={role.id}>{role.name}</li>
                                      ))
                                    )}
                                  </ul>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
