'use client';

import Link from 'next/link';
import { MoreHorizontal, ChevronRight } from 'lucide-react';
import {
  Avatar,
  AvatarFallback,
  Badge,
  Button,
  StatusBadge,
} from '@clubvantage/ui';

// Mock data
const members = [
  {
    id: '1',
    memberId: 'M-0001',
    firstName: 'Somchai',
    lastName: 'Prasert',
    email: 'somchai@example.com',
    phone: '+66 81 234 5678',
    membershipType: 'Full Member',
    status: 'ACTIVE' as const,
    balance: 0,
    joinDate: '2024-01-15',
  },
  {
    id: '2',
    memberId: 'M-0002',
    firstName: 'Nattaya',
    lastName: 'Wong',
    email: 'nattaya@example.com',
    phone: '+66 89 876 5432',
    membershipType: 'Golf Member',
    status: 'ACTIVE' as const,
    balance: 15000,
    joinDate: '2024-02-20',
  },
  {
    id: '3',
    memberId: 'M-0003',
    firstName: 'John',
    lastName: 'Smith',
    email: 'john.smith@example.com',
    phone: '+66 82 111 2222',
    membershipType: 'Social Member',
    status: 'SUSPENDED' as const,
    balance: 45000,
    joinDate: '2023-06-10',
  },
  {
    id: '4',
    memberId: 'M-0004',
    firstName: 'Siriporn',
    lastName: 'Chen',
    email: 'siriporn@example.com',
    phone: '+66 83 333 4444',
    membershipType: 'Full Member',
    status: 'ACTIVE' as const,
    balance: 0,
    joinDate: '2023-09-01',
  },
  {
    id: '5',
    memberId: 'M-0005',
    firstName: 'David',
    lastName: 'Lee',
    email: 'david.lee@example.com',
    phone: '+66 84 555 6666',
    membershipType: 'Junior Member',
    status: 'LAPSED' as const,
    balance: 30000,
    joinDate: '2024-03-15',
  },
];

function getInitials(firstName: string, lastName: string) {
  return `${firstName[0]}${lastName[0]}`.toUpperCase();
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('th-TH', {
    style: 'currency',
    currency: 'THB',
    minimumFractionDigits: 0,
  }).format(amount);
}

export function MembersTable() {
  return (
    <div className="rounded-md border">
      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b bg-muted/50">
            <tr>
              <th className="h-12 px-4 text-left font-medium text-muted-foreground">
                <input type="checkbox" className="h-4 w-4 rounded border-border" />
              </th>
              <th className="h-12 px-4 text-left font-medium text-muted-foreground">
                Member ID
              </th>
              <th className="h-12 px-4 text-left font-medium text-muted-foreground">
                Name
              </th>
              <th className="h-12 px-4 text-left font-medium text-muted-foreground hidden lg:table-cell">
                Type
              </th>
              <th className="h-12 px-4 text-left font-medium text-muted-foreground">
                Status
              </th>
              <th className="h-12 px-4 text-right font-medium text-muted-foreground hidden lg:table-cell">
                Balance
              </th>
              <th className="h-12 px-4 text-right font-medium text-muted-foreground">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {members.map((member) => (
              <tr
                key={member.id}
                className="border-b transition-colors hover:bg-muted/50"
              >
                <td className="px-4 py-3">
                  <input type="checkbox" className="h-4 w-4 rounded border-border" />
                </td>
                <td className="px-4 py-3">
                  <span className="font-mono text-xs">{member.memberId}</span>
                </td>
                <td className="px-4 py-3">
                  <Link
                    href={`/members/${member.id}`}
                    className="flex items-center gap-3 hover:underline"
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>
                        {getInitials(member.firstName, member.lastName)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">
                        {member.firstName} {member.lastName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {member.email}
                      </p>
                    </div>
                  </Link>
                </td>
                <td className="px-4 py-3 hidden lg:table-cell">
                  <Badge variant="outline">{member.membershipType}</Badge>
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={member.status} showDot />
                </td>
                <td className="px-4 py-3 text-right hidden lg:table-cell">
                  <span className={member.balance > 0 ? 'text-red-600 font-medium' : ''}>
                    {member.balance > 0 ? formatCurrency(member.balance) : '-'}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="relative inline-block">
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden divide-y">
        {members.map((member) => (
          <Link
            key={member.id}
            href={`/members/${member.id}`}
            className="flex items-center gap-3 p-4 hover:bg-muted/50 transition-colors"
          >
            <Avatar className="h-10 w-10 shrink-0">
              <AvatarFallback className="text-sm">
                {getInitials(member.firstName, member.lastName)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <p className="font-medium truncate">
                  {member.firstName} {member.lastName}
                </p>
                <StatusBadge status={member.status} showDot />
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="font-mono">{member.memberId}</span>
                <span>•</span>
                <span className="truncate">{member.membershipType}</span>
              </div>
              {member.balance > 0 && (
                <p className="text-xs text-red-600 font-medium mt-1">
                  {formatCurrency(member.balance)} outstanding
                </p>
              )}
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0" />
          </Link>
        ))}
      </div>

      {/* Pagination */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 border-t">
        <p className="text-sm text-muted-foreground order-2 sm:order-1">
          Showing 1-5 of 1,247 members
        </p>
        <div className="flex items-center gap-2 order-1 sm:order-2">
          <Button variant="outline" size="sm" disabled>
            Previous
          </Button>
          <Button variant="outline" size="sm">
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
