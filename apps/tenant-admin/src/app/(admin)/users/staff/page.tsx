'use client';

import * as React from 'react';
import { Plus, Search, MoreVertical, User, Mail, Shield, Ban, RotateCcw, X } from 'lucide-react';
import { PageHeader, Section } from '@/components/layout';
import { cn } from '@/lib/utils';

// Mock staff data
interface StaffUser {
  id: string;
  name: string;
  email: string;
  role: 'owner' | 'admin' | 'manager' | 'staff';
  status: 'active' | 'invited' | 'deactivated';
  avatarUrl?: string;
  invitedAt?: string;
}

const mockStaff: StaffUser[] = [
  {
    id: '1',
    name: 'Somchai Prasert',
    email: 'somchai@greenvalley.com',
    role: 'owner',
    status: 'active',
  },
  {
    id: '2',
    name: 'Napat Wongsa',
    email: 'napat@greenvalley.com',
    role: 'admin',
    status: 'active',
  },
  {
    id: '3',
    name: 'Siriporn Chai',
    email: 'siriporn@greenvalley.com',
    role: 'manager',
    status: 'active',
  },
  {
    id: '4',
    name: 'Pending User',
    email: 'new@greenvalley.com',
    role: 'staff',
    status: 'invited',
    invitedAt: '2025-01-10',
  },
];

const roleDescriptions: Record<string, string> = {
  owner: 'Full access, cannot be changed',
  admin: 'Full access to all settings and features',
  manager: 'Manage members and operations, no billing/user access',
  staff: 'Day-to-day operations only',
};

const roleColors: Record<string, string> = {
  owner: 'bg-purple-100 text-purple-800',
  admin: 'bg-blue-100 text-blue-800',
  manager: 'bg-emerald-100 text-emerald-800',
  staff: 'bg-slate-100 text-slate-800',
};

const statusColors: Record<string, string> = {
  active: 'bg-emerald-100 text-emerald-800',
  invited: 'bg-amber-100 text-amber-800',
  deactivated: 'bg-slate-100 text-slate-500',
};

export default function StaffPage() {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [selectedRole, setSelectedRole] = React.useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = React.useState<string | null>(null);
  const [inviteModalOpen, setInviteModalOpen] = React.useState(false);
  const [openActionsId, setOpenActionsId] = React.useState<string | null>(null);

  // Filter staff
  const filteredStaff = React.useMemo(() => {
    return mockStaff.filter((user) => {
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        if (
          !user.name.toLowerCase().includes(query) &&
          !user.email.toLowerCase().includes(query)
        ) {
          return false;
        }
      }
      if (selectedRole && user.role !== selectedRole) return false;
      if (selectedStatus && user.status !== selectedStatus) return false;
      return true;
    });
  }, [searchQuery, selectedRole, selectedStatus]);

  return (
    <div>
      <PageHeader
        title="Staff Users"
        description="Manage your team members and their access"
        actions={
          <button
            onClick={() => setInviteModalOpen(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Invite User
          </button>
        }
      />

      {/* Search and Filters */}
      <Section className="mb-6">
        <div className="flex flex-wrap items-center gap-4">
          <div className="relative flex-1 min-w-[200px] max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="search"
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <select
            value={selectedRole || ''}
            onChange={(e) => setSelectedRole(e.target.value || null)}
            className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Roles</option>
            <option value="owner">Owner</option>
            <option value="admin">Admin</option>
            <option value="manager">Manager</option>
            <option value="staff">Staff</option>
          </select>

          <select
            value={selectedStatus || ''}
            onChange={(e) => setSelectedStatus(e.target.value || null)}
            className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="invited">Invited</option>
            <option value="deactivated">Deactivated</option>
          </select>
        </div>
      </Section>

      {/* Staff Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-slate-600">
                User
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-slate-600">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-slate-600">
                Role
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-slate-600">
                Status
              </th>
              <th className="px-6 py-3 w-12"></th>
            </tr>
          </thead>
          <tbody>
            {filteredStaff.map((user) => (
              <tr
                key={user.id}
                className="border-b border-slate-100 last:border-0 hover:bg-slate-50"
              >
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    {user.avatarUrl ? (
                      <img
                        src={user.avatarUrl}
                        alt={user.name}
                        className="h-8 w-8 rounded-full object-cover"
                      />
                    ) : (
                      <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center">
                        <span className="text-sm font-medium text-slate-600">
                          {user.name
                            .split(' ')
                            .map((n) => n[0])
                            .join('')}
                        </span>
                      </div>
                    )}
                    <span className="font-medium text-slate-900">{user.name}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-slate-600">{user.email}</td>
                <td className="px-6 py-4">
                  <span
                    className={cn(
                      'inline-flex px-2 py-0.5 rounded-full text-xs font-medium capitalize',
                      roleColors[user.role]
                    )}
                  >
                    {user.role}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span
                    className={cn(
                      'inline-flex px-2 py-0.5 rounded-full text-xs font-medium capitalize',
                      statusColors[user.status]
                    )}
                  >
                    {user.status}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="relative">
                    <button
                      onClick={() =>
                        setOpenActionsId(openActionsId === user.id ? null : user.id)
                      }
                      className="p-1.5 rounded hover:bg-slate-100"
                    >
                      <MoreVertical className="h-4 w-4 text-slate-500" />
                    </button>

                    {openActionsId === user.id && (
                      <>
                        <div
                          className="fixed inset-0 z-40"
                          onClick={() => setOpenActionsId(null)}
                        />
                        <div className="absolute right-0 top-full mt-1 z-50 w-40 bg-white rounded-lg shadow-lg border border-slate-200 py-1">
                          <button className="flex w-full items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50">
                            <Shield className="h-4 w-4" />
                            Edit Role
                          </button>
                          <button className="flex w-full items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50">
                            <User className="h-4 w-4" />
                            View Activity
                          </button>
                          {user.status === 'invited' && (
                            <button className="flex w-full items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50">
                              <RotateCcw className="h-4 w-4" />
                              Resend Invite
                            </button>
                          )}
                          {user.role !== 'owner' && (
                            <button className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50">
                              <Ban className="h-4 w-4" />
                              Deactivate
                            </button>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-100 text-sm text-slate-500">
          Showing {filteredStaff.length} users
        </div>
      </div>

      {/* Invite Modal */}
      {inviteModalOpen && (
        <InviteModal onClose={() => setInviteModalOpen(false)} />
      )}
    </div>
  );
}

// Invite Modal Component
function InviteModal({ onClose }: { onClose: () => void }) {
  const [email, setEmail] = React.useState('');
  const [role, setRole] = React.useState<string>('manager');
  const [sending, setSending] = React.useState(false);

  const handleSubmit = async () => {
    setSending(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setSending(false);
    onClose();
  };

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/50" onClick={onClose} />
      <div className="fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2 w-full max-w-md">
        <div className="bg-white rounded-xl shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-slate-200">
            <h2 className="text-lg font-semibold text-slate-900">Invite New User</h2>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Email Address <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Role <span className="text-red-500">*</span>
              </label>
              <div className="space-y-2">
                {['admin', 'manager', 'staff'].map((r) => (
                  <label
                    key={r}
                    className={cn(
                      'flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors',
                      role === r
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-slate-200 hover:bg-slate-50'
                    )}
                  >
                    <input
                      type="radio"
                      name="role"
                      value={r}
                      checked={role === r}
                      onChange={(e) => setRole(e.target.value)}
                      className="mt-0.5"
                    />
                    <div>
                      <p className="text-sm font-medium text-slate-900 capitalize">
                        {r}
                        {r === 'manager' && (
                          <span className="ml-2 text-xs text-blue-600">(Recommended)</span>
                        )}
                      </p>
                      <p className="text-xs text-slate-500">{roleDescriptions[r]}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 p-6 border-t border-slate-200 bg-slate-50">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={!email || sending}
              className={cn(
                'px-4 py-2 text-sm font-medium rounded-lg transition-colors',
                email
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-slate-100 text-slate-400 cursor-not-allowed'
              )}
            >
              {sending ? 'Sending...' : 'Send Invitation →'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
