'use client'

import { useState, useCallback, useMemo } from 'react'
import {
  useUsers,
  useCreateUser,
  useUpdateUser,
} from '@/hooks/use-users'
import { transformApiUser } from '@/lib/api-transformers'
import type { UserRole } from '@clubvantage/api-client'
import {
  UsersTab,
  UserDetailModal,
  AddUserModal,
  mockUsers,
} from '@/components/users'
import type { User, AddUserFormData } from '@/components/users'

export default function UsersListPage() {
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [isUserDetailModalOpen, setIsUserDetailModalOpen] = useState(false)

  // Fetch real user data
  const { data, isLoading } = useUsers({ limit: 100 })
  const { createUser } = useCreateUser()
  const { updateUser } = useUpdateUser()

  // Transform API data → component shape, fallback to mock
  const users = useMemo(() => {
    const apiUsers = data?.users?.data
    if (!apiUsers || apiUsers.length === 0) return mockUsers
    return apiUsers.map(transformApiUser)
  }, [data])

  const handleAddUser = useCallback(() => {
    setIsAddUserModalOpen(true)
  }, [])

  const handleEditUser = useCallback((user: User) => {
    setSelectedUser(user)
    setIsUserDetailModalOpen(true)
  }, [])

  const handleViewActivity = useCallback((userId: string) => {
    window.location.href = `/users/activity?userId=${userId}`
  }, [])

  const handleSaveUser = useCallback(
    async (user: User) => {
      const [firstName, ...rest] = user.name.split(' ')
      const lastName = rest.join(' ')
      await updateUser(user.id, {
        firstName,
        lastName,
        phone: user.phone,
        isActive: user.status === 'active',
      })
    },
    [updateUser],
  )

  const handleCreateUser = useCallback(
    async (formData: AddUserFormData) => {
      const [firstName, ...rest] = formData.name.split(' ')
      const lastName = rest.join(' ')
      await createUser({
        email: formData.email,
        firstName: firstName || '',
        lastName: lastName || '',
        password: formData.autoGeneratePassword ? crypto.randomUUID().slice(0, 16) : formData.password,
        role: (formData.roles[0] || 'STAFF') as UserRole,
        phone: formData.phone || undefined,
        permissions: [],
      })
    },
    [createUser],
  )

  return (
    <>
      <UsersTab
        users={users}
        isLoading={isLoading}
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
