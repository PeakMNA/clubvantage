'use client'

import { useState, useCallback } from 'react'
import {
  UsersTabsLayout,
  UsersTab,
  UserDetailModal,
  AddUserModal,
  RolesTab,
  RoleEditorModal,
  PermissionsTab,
  SecurityTab,
  ActivityTab,
} from '@/components/users'
import type { User, UserTab, Role, AddUserFormData } from '@/components/users'

export default function UsersPage() {
  // Tab state
  const [activeTab, setActiveTab] = useState<UserTab>('users')

  // Modal states
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [isUserDetailModalOpen, setIsUserDetailModalOpen] = useState(false)

  const [isRoleEditorModalOpen, setIsRoleEditorModalOpen] = useState(false)
  const [selectedRole, setSelectedRole] = useState<Role | null>(null)
  const [roleEditorMode, setRoleEditorMode] = useState<'add' | 'edit' | 'clone'>('add')

  // Activity filter state (for when navigating from user detail)
  const [activityUserFilter, setActivityUserFilter] = useState<string | undefined>()

  // User handlers
  const handleAddUser = useCallback(() => {
    setIsAddUserModalOpen(true)
  }, [])

  const handleEditUser = useCallback((user: User) => {
    setSelectedUser(user)
    setIsUserDetailModalOpen(true)
  }, [])

  const handleViewActivity = useCallback((userId: string) => {
    setActivityUserFilter(userId)
    setActiveTab('activity')
  }, [])

  const handleSaveUser = useCallback((user: User) => {
    console.log('Saving user:', user)
    // In real app, would call API here
  }, [])

  const handleCreateUser = useCallback((data: AddUserFormData) => {
    console.log('Creating user:', data)
    // In real app, would call API here
  }, [])

  // Role handlers
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
      // In real app, would call API here
    }
  }, [])

  const handleSaveRole = useCallback((role: Partial<Role>) => {
    console.log('Saving role:', role)
    // In real app, would call API here
  }, [])

  // Tab change handler
  const handleTabChange = useCallback((tab: UserTab) => {
    setActiveTab(tab)
    // Clear activity filter when switching away from activity tab
    if (tab !== 'activity') {
      setActivityUserFilter(undefined)
    }
  }, [])

  // Render tab content
  const renderTabContent = () => {
    switch (activeTab) {
      case 'users':
        return (
          <UsersTab
            onAddUser={handleAddUser}
            onEditUser={handleEditUser}
            onViewActivity={handleViewActivity}
          />
        )
      case 'roles':
        return (
          <RolesTab
            onAddRole={handleAddRole}
            onEditRole={handleEditRole}
            onCloneRole={handleCloneRole}
            onDeleteRole={handleDeleteRole}
          />
        )
      case 'permissions':
        return <PermissionsTab />
      case 'security':
        return <SecurityTab />
      case 'activity':
        return <ActivityTab userIdFilter={activityUserFilter} />
      default:
        return null
    }
  }

  return (
    <>
      <UsersTabsLayout activeTab={activeTab} onTabChange={handleTabChange}>
        {renderTabContent()}
      </UsersTabsLayout>

      {/* User Modals */}
      <AddUserModal
        open={isAddUserModalOpen}
        onOpenChange={setIsAddUserModalOpen}
        onSubmit={handleCreateUser}
      />

      <UserDetailModal
        user={selectedUser}
        open={isUserDetailModalOpen}
        onOpenChange={setIsUserDetailModalOpen}
        onSave={handleSaveUser}
      />

      {/* Role Modal */}
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
