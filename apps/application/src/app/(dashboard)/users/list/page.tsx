'use client'

import { useState, useCallback } from 'react'
import {
  UsersTab,
  UserDetailModal,
  AddUserModal,
} from '@/components/users'
import type { User, AddUserFormData } from '@/components/users'

export default function UsersListPage() {
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [isUserDetailModalOpen, setIsUserDetailModalOpen] = useState(false)

  const handleAddUser = useCallback(() => {
    setIsAddUserModalOpen(true)
  }, [])

  const handleEditUser = useCallback((user: User) => {
    setSelectedUser(user)
    setIsUserDetailModalOpen(true)
  }, [])

  const handleViewActivity = useCallback((userId: string) => {
    // Navigate to activity page with user filter
    window.location.href = `/users/activity?userId=${userId}`
  }, [])

  const handleSaveUser = useCallback((user: User) => {
    console.log('Saving user:', user)
  }, [])

  const handleCreateUser = useCallback((data: AddUserFormData) => {
    console.log('Creating user:', data)
  }, [])

  return (
    <>
      <UsersTab
        onAddUser={handleAddUser}
        onEditUser={handleEditUser}
        onViewActivity={handleViewActivity}
      />

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
    </>
  )
}
