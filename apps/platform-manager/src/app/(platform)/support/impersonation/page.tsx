'use client';

import * as React from 'react';
import { Search, UserCog, Clock, Shield, AlertTriangle, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

// Mock data for active sessions
const activeSessions = [
  {
    id: '1',
    impersonator: 'support@clubvantage.com',
    targetUser: 'somchai@greenvalley.com',
    targetTenant: 'Green Valley CC',
    reason: 'TICKET-1234 - Member import issue',
    startTime: '14:32:15',
    remainingTime: '28:45',
  },
];

// Mock data for recent sessions
const recentSessions = [
  {
    id: '1',
    impersonator: 'support@clubvantage.com',
    targetUser: 'marcus@sentosa.com',
    targetTenant: 'Sentosa Golf',
    reason: 'TICKET-1230 - Billing question',
    startTime: 'Jan 20, 11:15',
    endTime: 'Jan 20, 11:32',
    duration: '17 minutes',
  },
  {
    id: '2',
    impersonator: 'admin@clubvantage.com',
    targetUser: 'napat@bangkok.com',
    targetTenant: 'Bangkok Sports',
    reason: 'TICKET-1228 - Feature demo',
    startTime: 'Jan 19, 16:45',
    endTime: 'Jan 19, 17:02',
    duration: '17 minutes',
  },
  {
    id: '3',
    impersonator: 'support@clubvantage.com',
    targetUser: 'siriporn@riverside.com',
    targetTenant: 'Riverside CC',
    reason: 'TICKET-1225 - Report issue',
    startTime: 'Jan 19, 14:20',
    endTime: 'Jan 19, 14:35',
    duration: '15 minutes',
  },
];

// Mock tenants for starting a session
const tenants = [
  { id: '1', name: 'Green Valley CC', subdomain: 'greenvalley' },
  { id: '2', name: 'Sentosa Golf Club', subdomain: 'sentosa' },
  { id: '3', name: 'Bangkok Sports Club', subdomain: 'bangkok' },
];

export default function ImpersonationPage() {
  const [selectedTenant, setSelectedTenant] = React.useState('');
  const [selectedUser, setSelectedUser] = React.useState('');
  const [reason, setReason] = React.useState('');
  const [showStartModal, setShowStartModal] = React.useState(false);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">User Impersonation</h1>
        <p className="text-slate-500 mt-1">Access the platform as a specific user for support purposes</p>
      </div>

      {/* Warning Banner */}
      <Card className="border-amber-200 bg-amber-50">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <h3 className="font-semibold text-amber-900">Important Guidelines</h3>
              <ul className="mt-2 text-sm text-amber-800 space-y-1">
                <li>• All impersonation sessions are logged and monitored</li>
                <li>• Sessions are limited to 30 minutes maximum</li>
                <li>• Certain actions (payment changes, password resets) are blocked</li>
                <li>• A valid ticket number or reason is required</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Active Sessions */}
      {activeSessions.length > 0 && (
        <Card className="border-red-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <Shield className="h-5 w-5" />
              Active Sessions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {activeSessions.map((session) => (
                <div
                  key={session.id}
                  className="flex items-center justify-between p-4 rounded-lg bg-red-50 border border-red-200"
                >
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center">
                      <UserCog className="h-5 w-5 text-red-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">
                        {session.impersonator} → {session.targetUser}
                      </p>
                      <p className="text-sm text-slate-600">{session.targetTenant}</p>
                      <p className="text-sm text-slate-500">{session.reason}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1 text-red-600 font-mono">
                      <Clock className="h-4 w-4" />
                      {session.remainingTime} remaining
                    </div>
                    <Button variant="destructive" size="sm" className="mt-2">
                      End Session
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Start New Session */}
      <Card>
        <CardHeader>
          <CardTitle>Start New Session</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Select Tenant
                </label>
                <select
                  value={selectedTenant}
                  onChange={(e) => setSelectedTenant(e.target.value)}
                  className="w-full h-10 px-3 rounded-md border border-slate-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Choose a tenant...</option>
                  {tenants.map((tenant) => (
                    <option key={tenant.id} value={tenant.id}>
                      {tenant.name} ({tenant.subdomain}.clubvantage.io)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Select User
                </label>
                <select
                  value={selectedUser}
                  onChange={(e) => setSelectedUser(e.target.value)}
                  className="w-full h-10 px-3 rounded-md border border-slate-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={!selectedTenant}
                >
                  <option value="">Choose a user...</option>
                  <option value="admin">Somchai Prasert (somchai@...) - Admin</option>
                  <option value="manager">Napat Wongsa (napat@...) - Manager</option>
                  <option value="staff">Siriporn Chai (siriporn@...) - Staff</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Reason / Ticket Number *
                </label>
                <Input
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="e.g., TICKET-1234 - Member import issue"
                />
              </div>

              <Button
                className="w-full"
                disabled={!selectedTenant || !selectedUser || !reason}
              >
                <UserCog className="h-4 w-4 mr-2" />
                Start Impersonation Session
              </Button>
            </div>

            <div className="bg-slate-50 rounded-lg p-4">
              <h4 className="font-semibold text-slate-900 mb-2">What happens next:</h4>
              <ol className="text-sm text-slate-600 space-y-2">
                <li>1. A new browser tab will open with the target application</li>
                <li>2. You'll be logged in as the selected user</li>
                <li>3. A red banner will indicate the active impersonation</li>
                <li>4. The session will automatically end after 30 minutes</li>
                <li>5. All actions will be logged with your admin ID</li>
              </ol>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Sessions */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Sessions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentSessions.map((session) => (
              <div
                key={session.id}
                className="flex items-center justify-between p-4 rounded-lg border border-slate-200"
              >
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center">
                    <UserCog className="h-5 w-5 text-slate-500" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">
                      {session.impersonator} → {session.targetUser}
                    </p>
                    <p className="text-sm text-slate-600">{session.targetTenant}</p>
                    <p className="text-sm text-slate-500">{session.reason}</p>
                  </div>
                </div>
                <div className="text-right text-sm">
                  <p className="text-slate-900">{session.startTime} - {session.endTime}</p>
                  <p className="text-slate-500">Duration: {session.duration}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
