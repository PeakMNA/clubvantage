'use client';

import * as React from 'react';
import { Search, Download, Filter, FileText, CheckCircle, Clock, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

// Mock data
const invoices = [
  { id: 'INV-2026-0047', tenant: 'Green Valley CC', amount: 2500, date: 'Jan 15, 2026', dueDate: 'Jan 30, 2026', status: 'paid' },
  { id: 'INV-2026-0046', tenant: 'Sentosa Golf', amount: 3200, date: 'Jan 15, 2026', dueDate: 'Jan 30, 2026', status: 'paid' },
  { id: 'INV-2026-0045', tenant: 'Bangkok Sports', amount: 800, date: 'Jan 14, 2026', dueDate: 'Jan 29, 2026', status: 'pending' },
  { id: 'INV-2026-0044', tenant: 'Riverside CC', amount: 450, date: 'Jan 10, 2026', dueDate: 'Jan 25, 2026', status: 'overdue' },
  { id: 'INV-2026-0043', tenant: 'Laguna Golf', amount: 750, date: 'Jan 8, 2026', dueDate: 'Jan 23, 2026', status: 'paid' },
  { id: 'INV-2026-0042', tenant: 'KL Royal Golf', amount: 1200, date: 'Jan 5, 2026', dueDate: 'Jan 20, 2026', status: 'paid' },
  { id: 'INV-2026-0041', tenant: 'Thai Wellness Spa', amount: 320, date: 'Jan 3, 2026', dueDate: 'Jan 18, 2026', status: 'paid' },
  { id: 'INV-2025-0040', tenant: 'Phuket Golf Resort', amount: 1500, date: 'Dec 28, 2025', dueDate: 'Jan 12, 2026', status: 'paid' },
];

const statusConfig: Record<string, { icon: React.ElementType; color: string; bgColor: string; label: string }> = {
  paid: { icon: CheckCircle, color: 'text-emerald-600', bgColor: 'bg-emerald-100', label: 'Paid' },
  pending: { icon: Clock, color: 'text-amber-600', bgColor: 'bg-amber-100', label: 'Pending' },
  overdue: { icon: XCircle, color: 'text-red-600', bgColor: 'bg-red-100', label: 'Overdue' },
};

export default function InvoicesPage() {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState('all');

  const filteredInvoices = invoices.filter((invoice) => {
    const matchesSearch = invoice.tenant.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         invoice.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: invoices.length,
    paid: invoices.filter(i => i.status === 'paid').length,
    pending: invoices.filter(i => i.status === 'pending').length,
    overdue: invoices.filter(i => i.status === 'overdue').length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Invoices</h1>
          <p className="text-slate-500 mt-1">Manage and track all platform invoices</p>
        </div>
        <Button variant="secondary">
          <Download className="h-4 w-4 mr-2" />
          Export All
        </Button>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-slate-500">Total Invoices</p>
            <p className="text-2xl font-bold text-slate-900">{stats.total}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-slate-500">Paid</p>
            <p className="text-2xl font-bold text-emerald-600">{stats.paid}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-slate-500">Pending</p>
            <p className="text-2xl font-bold text-amber-600">{stats.pending}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-slate-500">Overdue</p>
            <p className="text-2xl font-bold text-red-600">{stats.overdue}</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search invoices..."
            className="pl-9"
          />
        </div>
        <div className="flex items-center gap-2">
          {['all', 'paid', 'pending', 'overdue'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                statusFilter === status
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {status === 'all' ? 'All' : statusConfig[status]?.label}
            </button>
          ))}
        </div>
      </div>

      {/* Invoice Table */}
      <Card>
        <CardContent className="p-0">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Invoice</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Tenant</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Amount</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Date</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Due Date</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Status</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredInvoices.map((invoice) => {
                const status = statusConfig[invoice.status as keyof typeof statusConfig]!;
                const StatusIcon = status.icon;
                return (
                  <tr key={invoice.id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-slate-400" />
                        <span className="font-medium text-slate-900">{invoice.id}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-slate-600">{invoice.tenant}</td>
                    <td className="px-4 py-4 font-semibold text-slate-900">${invoice.amount.toLocaleString()}</td>
                    <td className="px-4 py-4 text-slate-600">{invoice.date}</td>
                    <td className="px-4 py-4 text-slate-600">{invoice.dueDate}</td>
                    <td className="px-4 py-4">
                      <Badge variant={invoice.status === 'paid' ? 'success' : invoice.status === 'overdue' ? 'destructive' : 'warning'}>
                        {status.label}
                      </Badge>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <Button variant="ghost" size="sm">
                        <Download className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
