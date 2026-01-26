'use client';

import * as React from 'react';
import { Search, Download, FileText, CheckCircle, Clock, AlertCircle } from 'lucide-react';

// Mock data
const invoices = [
  { id: 'INV-2026-0012', date: 'Jan 1, 2026', amount: 300000, currency: 'THB', status: 'paid', paidDate: 'Jan 5, 2026' },
  { id: 'INV-2025-0011', date: 'Jan 1, 2025', amount: 275000, currency: 'THB', status: 'paid', paidDate: 'Jan 3, 2025' },
  { id: 'INV-2024-0010', date: 'Jan 1, 2024', amount: 250000, currency: 'THB', status: 'paid', paidDate: 'Jan 2, 2024' },
  { id: 'INV-2023-0009', date: 'Jan 1, 2023', amount: 250000, currency: 'THB', status: 'paid', paidDate: 'Jan 4, 2023' },
  { id: 'INV-2022-0008', date: 'Jan 1, 2022', amount: 200000, currency: 'THB', status: 'paid', paidDate: 'Jan 3, 2022' },
];

const statusConfig: Record<string, { icon: React.ElementType; color: string; bgColor: string; label: string }> = {
  paid: { icon: CheckCircle, color: 'text-emerald-600', bgColor: 'bg-emerald-100', label: 'Paid' },
  pending: { icon: Clock, color: 'text-amber-600', bgColor: 'bg-amber-100', label: 'Pending' },
  overdue: { icon: AlertCircle, color: 'text-red-600', bgColor: 'bg-red-100', label: 'Overdue' },
};

function formatCurrency(amount: number, currency: string) {
  return new Intl.NumberFormat('th-TH', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
  }).format(amount);
}

export default function InvoicesPage() {
  const [searchQuery, setSearchQuery] = React.useState('');

  const filteredInvoices = invoices.filter(invoice =>
    invoice.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Invoice History</h1>
        <p className="text-slate-500 mt-1">View and download your past invoices</p>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search invoices..."
          className="w-full h-10 pl-9 pr-4 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Invoice Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50">
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Invoice</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Date</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Amount</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Status</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Paid Date</th>
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
                  <td className="px-4 py-4 text-slate-600">{invoice.date}</td>
                  <td className="px-4 py-4 font-semibold text-slate-900">
                    {formatCurrency(invoice.amount, invoice.currency)}
                  </td>
                  <td className="px-4 py-4">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${status.bgColor} ${status.color}`}>
                      <StatusIcon className="h-3 w-3" />
                      {status.label}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-slate-600">{invoice.paidDate || '-'}</td>
                  <td className="px-4 py-4 text-right">
                    <button className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                      <Download className="h-4 w-4" />
                      PDF
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {filteredInvoices.length === 0 && (
          <div className="text-center py-12">
            <FileText className="h-12 w-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 mb-1">No invoices found</h3>
            <p className="text-slate-500">
              {searchQuery ? 'Try adjusting your search' : 'Your invoices will appear here'}
            </p>
          </div>
        )}
      </div>

      {/* Summary */}
      <div className="bg-slate-50 rounded-lg p-4">
        <p className="text-sm text-slate-600">
          Showing {filteredInvoices.length} of {invoices.length} invoices.
          Total paid: {formatCurrency(invoices.filter(i => i.status === 'paid').reduce((sum, i) => sum + i.amount, 0), 'THB')}
        </p>
      </div>
    </div>
  );
}
