'use client';

import * as React from 'react';
import { Search, AlertTriangle, User } from 'lucide-react';
import { Button, Input, Card, CardContent } from '@/components/ui';
import { cn } from '@/lib/utils';

interface TenantUser {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface ImpersonationModalProps {
  isOpen: boolean;
  onClose: () => void;
  tenantName: string;
  users: TenantUser[];
  onStartSession: (userId: string, reason: string) => void;
}

export function ImpersonationModal({
  isOpen,
  onClose,
  tenantName,
  users,
  onStartSession,
}: ImpersonationModalProps) {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [selectedUser, setSelectedUser] = React.useState<TenantUser | null>(null);
  const [reason, setReason] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');

  // Filter users
  const filteredUsers = React.useMemo(() => {
    if (!searchQuery) return users;
    const query = searchQuery.toLowerCase();
    return users.filter(
      (u) =>
        u.name.toLowerCase().includes(query) ||
        u.email.toLowerCase().includes(query)
    );
  }, [users, searchQuery]);

  const handleSubmit = async () => {
    if (!selectedUser) {
      setError('Please select a user to impersonate');
      return;
    }
    if (!reason.trim()) {
      setError('Please provide a reason or ticket number');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await onStartSession(selectedUser.id, reason);
    } catch (err) {
      setError('Failed to start impersonation session');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg">
        <Card className="shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-slate-200">
            <h2 className="text-lg font-semibold text-slate-900">
              Impersonate User
            </h2>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600"
            >
              ×
            </button>
          </div>

          {/* Body */}
          <CardContent className="p-6 space-y-6">
            {/* Tenant Name */}
            <div>
              <span className="text-sm text-slate-500">Tenant:</span>
              <p className="font-medium text-slate-900">{tenantName}</p>
            </div>

            {/* User Search */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Select User
              </label>
              <div className="relative mb-2">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  type="search"
                  placeholder="Search users..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* User List */}
              <div className="max-h-48 overflow-y-auto border border-slate-200 rounded-lg">
                {filteredUsers.map((user) => (
                  <button
                    key={user.id}
                    onClick={() => setSelectedUser(user)}
                    className={cn(
                      'flex items-center gap-3 w-full p-3 text-left border-b border-slate-100 last:border-0',
                      'hover:bg-slate-50 transition-colors',
                      selectedUser?.id === user.id && 'bg-blue-50'
                    )}
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100">
                      <User className="h-4 w-4 text-slate-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900">
                        {user.name}
                      </p>
                      <p className="text-xs text-slate-500 truncate">
                        {user.email}
                      </p>
                    </div>
                    <span className="text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                      {user.role}
                    </span>
                  </button>
                ))}
                {filteredUsers.length === 0 && (
                  <p className="p-4 text-center text-sm text-slate-500">
                    No users found
                  </p>
                )}
              </div>
            </div>

            {/* Reason Input */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Reason / Ticket Number <span className="text-red-500">*</span>
              </label>
              <Input
                placeholder="TICKET-1234"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
            </div>

            {/* Warning */}
            <div className="flex items-start gap-3 p-3 rounded-lg bg-amber-50 border border-amber-200">
              <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-amber-800">
                This session will be logged and limited to 30 minutes.
              </p>
            </div>

            {/* Error */}
            {error && (
              <p className="text-sm text-red-600">{error}</p>
            )}
          </CardContent>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 p-6 border-t border-slate-200 bg-slate-50">
            <Button variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={loading}>
              {loading ? 'Starting...' : 'Start Session →'}
            </Button>
          </div>
        </Card>
      </div>
    </>
  );
}
