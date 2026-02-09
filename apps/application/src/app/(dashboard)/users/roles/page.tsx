'use client'

import { useState, useCallback } from 'react'
import { RolesTab, RoleEditorModal } from '@/components/users'
import type { Role } from '@/components/users'

export default function UsersRolesPage() {
  const [isRoleEditorModalOpen, setIsRoleEditorModalOpen] = useState(false)
  const [selectedRole, setSelectedRole] = useState<Role | null>(null)
  const [roleEditorMode, setRoleEditorMode] = useState<'add' | 'edit' | 'clone'>('add')

  const handleAddRole = useCallback(() => {
    setSelectedRole(null)
    setRoleEditorMode('add')
    setIsRoleEditorModalOpen(true)
  }, [])

  const handleEditRole = useCallback((role: Role) => {
    setSelectedRole(role)
    setRoleEditorMode('edit')
    setIsRoleEditorModalOpen(true)
  }, [])

  const handleCloneRole = useCallback((role: Role) => {
    setSelectedRole(role)
    setRoleEditorMode('clone')
    setIsRoleEditorModalOpen(true)
  }, [])

  const handleDeleteRole = useCallback((role: Role) => {
    if (confirm(`Are you sure you want to delete the role "${role.name}"? This action cannot be undone.`)) {
      console.log('Deleting role:', role)
    }
  }, [])

  const handleSaveRole = useCallback((role: Partial<Role>) => {
    console.log('Saving role:', role)
  }, [])

  return (
    <>
      <RolesTab
        onAddRole={handleAddRole}
        onEditRole={handleEditRole}
        onCloneRole={handleCloneRole}
        onDeleteRole={handleDeleteRole}
      />

      <RoleEditorModal
        role={selectedRole}
        open={isRoleEditorModalOpen}
        onOpenChange={setIsRoleEditorModalOpen}
        onSave={handleSaveRole}
        mode={roleEditorMode}
      />
    </>
  )
}
