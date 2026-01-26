'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  MoreHorizontal,
  Eye,
  Mail,
  Printer,
  CreditCard,
  ArrowUpDown,
  ChevronDown,
} from 'lucide-react';

import {
  Button,
  Badge,
  Checkbox,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@clubvantage/ui';

interface Invoice {
  id: string;
  invoiceNumber: string;
  memberId: string;
  memberName: string;
  issueDate: string;
  dueDate: string;
  amount: number;
  paidAmount: number;
  status: 'draft' | 'sent' | 'paid' | 'partial' | 'overdue' | 'cancelled';
  items: number;
}

// Mock invoice data
const mockInvoices: Invoice[] = [
  {
    id: '1',
    invoiceNumber: 'INV-2024-0001',
    memberId: 'M-0001',
    memberName: 'Somchai Wongsakul',
    issueDate: '2024-03-01',
    dueDate: '2024-03-15',
    amount: 25000,
    paidAmount: 25000,
    status: 'paid',
    items: 3,
  },
  {
    id: '2',
    invoiceNumber: 'INV-2024-0002',
    memberId: 'M-0003',
    memberName: 'Prasert Chaiyasit',
    issueDate: '2024-03-01',
    dueDate: '2024-03-15',
    amount: 45000,
    paidAmount: 0,
    status: 'overdue',
    items: 5,
  },
  {
    id: '3',
    invoiceNumber: 'INV-2024-0003',
    memberId: 'M-0005',
    memberName: 'Apinya Sukcharoen',
    issueDate: '2024-03-05',
    dueDate: '2024-03-20',
    amount: 18500,
    paidAmount: 10000,
    status: 'partial',
    items: 2,
  },
  {
    id: '4',
    invoiceNumber: 'INV-2024-0004',
    memberId: 'M-0008',
    memberName: 'Wichai Prommin',
    issueDate: '2024-03-10',
    dueDate: '2024-03-25',
    amount: 32000,
    paidAmount: 0,
    status: 'sent',
    items: 4,
  },
  {
    id: '5',
    invoiceNumber: 'INV-2024-0005',
    memberId: 'M-0012',
    memberName: 'Narong Tangtrakul',
    issueDate: '2024-03-12',
    dueDate: '2024-03-27',
    amount: 15000,
    paidAmount: 0,
    status: 'draft',
    items: 1,
  },
];

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('th-TH', {
    style: 'currency',
    currency: 'THB',
    minimumFractionDigits: 0,
  }).format(amount);
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function getStatusColor(status: Invoice['status']) {
  switch (status) {
    case 'paid':
      return 'default';
    case 'sent':
      return 'secondary';
    case 'partial':
      return 'outline';
    case 'overdue':
      return 'destructive';
    case 'draft':
      return 'outline';
    case 'cancelled':
      return 'secondary';
    default:
      return 'secondary';
  }
}

export function InvoicesTable() {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [sortField, setSortField] = useState<keyof Invoice>('issueDate');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(mockInvoices.map((inv) => inv.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedIds([...selectedIds, id]);
    } else {
      setSelectedIds(selectedIds.filter((i) => i !== id));
    }
  };

  const sortedInvoices = [...mockInvoices].sort((a, b) => {
    const aVal = a[sortField];
    const bVal = b[sortField];
    if (typeof aVal === 'string' && typeof bVal === 'string') {
      return sortDirection === 'asc'
        ? aVal.localeCompare(bVal)
        : bVal.localeCompare(aVal);
    }
    if (typeof aVal === 'number' && typeof bVal === 'number') {
      return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
    }
    return 0;
  });

  const toggleSort = (field: keyof Invoice) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  return (
    <div className="rounded-md border">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="h-12 px-4 w-12">
                <Checkbox
                  checked={selectedIds.length === mockInvoices.length}
                  onCheckedChange={handleSelectAll}
                />
              </th>
              <th className="h-12 px-4 text-left">
                <Button
                  variant="ghost"
                  size="sm"
                  className="-ml-3 h-8"
                  onClick={() => toggleSort('invoiceNumber')}
                >
                  Invoice
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </th>
              <th className="h-12 px-4 text-left">
                <Button
                  variant="ghost"
                  size="sm"
                  className="-ml-3 h-8"
                  onClick={() => toggleSort('memberName')}
                >
                  Member
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </th>
              <th className="h-12 px-4 text-left">
                <Button
                  variant="ghost"
                  size="sm"
                  className="-ml-3 h-8"
                  onClick={() => toggleSort('issueDate')}
                >
                  Issue Date
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </th>
              <th className="h-12 px-4 text-left">
                <Button
                  variant="ghost"
                  size="sm"
                  className="-ml-3 h-8"
                  onClick={() => toggleSort('dueDate')}
                >
                  Due Date
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </th>
              <th className="h-12 px-4 text-right">
                <Button
                  variant="ghost"
                  size="sm"
                  className="-ml-3 h-8"
                  onClick={() => toggleSort('amount')}
                >
                  Amount
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </th>
              <th className="h-12 px-4 text-center">Status</th>
              <th className="h-12 px-4 w-12"></th>
            </tr>
          </thead>
          <tbody>
            {sortedInvoices.map((invoice) => (
              <tr key={invoice.id} className="border-b hover:bg-muted/50">
                <td className="p-4">
                  <Checkbox
                    checked={selectedIds.includes(invoice.id)}
                    onCheckedChange={(checked) =>
                      handleSelectOne(invoice.id, checked as boolean)
                    }
                  />
                </td>
                <td className="p-4">
                  <Link
                    href={`/billing/invoices/${invoice.id}`}
                    className="font-medium hover:underline"
                  >
                    {invoice.invoiceNumber}
                  </Link>
                  <p className="text-sm text-muted-foreground">
                    {invoice.items} item{invoice.items !== 1 ? 's' : ''}
                  </p>
                </td>
                <td className="p-4">
                  <Link
                    href={`/members/${invoice.memberId.replace('M-', '')}`}
                    className="hover:underline"
                  >
                    {invoice.memberName}
                  </Link>
                  <p className="text-sm text-muted-foreground">
                    {invoice.memberId}
                  </p>
                </td>
                <td className="p-4 text-sm">{formatDate(invoice.issueDate)}</td>
                <td className="p-4 text-sm">{formatDate(invoice.dueDate)}</td>
                <td className="p-4 text-right">
                  <p className="font-medium">{formatCurrency(invoice.amount)}</p>
                  {invoice.status === 'partial' && (
                    <p className="text-sm text-muted-foreground">
                      Paid: {formatCurrency(invoice.paidAmount)}
                    </p>
                  )}
                </td>
                <td className="p-4 text-center">
                  <Badge variant={getStatusColor(invoice.status)}>
                    {invoice.status}
                  </Badge>
                </td>
                <td className="p-4">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link href={`/billing/invoices/${invoice.id}`}>
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Printer className="mr-2 h-4 w-4" />
                        Print
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Mail className="mr-2 h-4 w-4" />
                        Send Email
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      {invoice.status !== 'paid' && invoice.status !== 'cancelled' && (
                        <DropdownMenuItem>
                          <CreditCard className="mr-2 h-4 w-4" />
                          Record Payment
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
