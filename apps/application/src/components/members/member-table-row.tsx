'use client';

import { MoreVertical } from 'lucide-react';
import { cn } from '@clubvantage/ui';
import { Avatar, AvatarFallback, AvatarImage } from '@clubvantage/ui';
import { Checkbox } from '@clubvantage/ui';
import { Button } from '@clubvantage/ui';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@clubvantage/ui';
import { StatusBadge } from './status-badge';
import type { Member, MemberStatus } from './types';

interface MemberTableRowProps {
  member: Member;
  isSelected?: boolean;
  onSelect?: (selected: boolean) => void;
  onClick?: () => void;
  onEdit?: () => void;
  onChangeStatus?: (status: MemberStatus) => void;
  onDelete?: () => void;
}

function getInitials(firstName: string, lastName: string): string {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'THB',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

function getBalanceColor(member: Member): string {
  if (member.balance <= 0) return 'text-foreground';
  if (member.status === 'SUSPENDED') return 'text-red-600';
  if (member.agingBucket === 'DAYS_91_PLUS') return 'text-red-600';
  return 'text-amber-600';
}

const statusMap: Record<MemberStatus, string> = {
  PROSPECT: 'prospect',
  LEAD: 'lead',
  APPLICANT: 'applicant',
  ACTIVE: 'active',
  SUSPENDED: 'suspended',
  LAPSED: 'lapsed',
  RESIGNED: 'resigned',
  TERMINATED: 'terminated',
  REACTIVATED: 'reactivated',
};

export function MemberTableRow({
  member,
  isSelected = false,
  onSelect,
  onClick,
  onEdit,
  onChangeStatus,
  onDelete,
}: MemberTableRowProps) {
  const isCancelled = member.status === 'TERMINATED' || member.status === 'RESIGNED';

  const handleRowClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    // Don't trigger row click for checkbox or dropdown
    if (target.closest('[data-checkbox]') || target.closest('[data-dropdown]')) {
      return;
    }
    onClick?.();
  };

  return (
    <tr
      onClick={handleRowClick}
      className={cn(
        'h-[52px] cursor-pointer border-b border-border transition-colors',
        'hover:bg-muted/50',
        isSelected && 'bg-amber-50',
        isCancelled && 'opacity-50'
      )}
    >
      {/* Checkbox */}
      <td className="w-10 px-4" data-checkbox>
        <Checkbox
          checked={isSelected}
          onCheckedChange={(checked) => onSelect?.(checked as boolean)}
        />
      </td>

      {/* Name + Avatar */}
      <td className="min-w-[150px] px-4">
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={member.photoUrl} alt={`${member.firstName} ${member.lastName}`} />
            <AvatarFallback className="bg-muted text-xs text-muted-foreground">
              {getInitials(member.firstName, member.lastName)}
            </AvatarFallback>
          </Avatar>
          <span className="text-sm font-semibold text-foreground">
            {member.firstName} {member.lastName}
          </span>
        </div>
      </td>

      {/* Member # */}
      <td className="w-[140px] px-4">
        <span className="font-mono text-sm text-muted-foreground">
          {member.memberNumber}
        </span>
      </td>

      {/* Email */}
      <td className="w-[200px] px-4">
        <span className="truncate text-sm text-muted-foreground" title={member.email}>
          {member.email}
        </span>
      </td>

      {/* Type */}
      <td className="w-[100px] px-4">
        <span className="text-sm text-muted-foreground">{member.membershipTypeName}</span>
      </td>

      {/* Status */}
      <td className="w-[100px] px-4">
        <StatusBadge status={statusMap[member.status]} size="sm" />
      </td>

      {/* Balance */}
      <td className="w-[100px] px-4 text-right">
        <span className={cn('text-sm font-medium', getBalanceColor(member))}>
          {formatCurrency(member.balance)}
        </span>
      </td>

      {/* Actions */}
      <td className="w-[60px] px-4" data-dropdown>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreVertical className="h-4 w-4" />
              <span className="sr-only">Open menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onClick}>View Details</DropdownMenuItem>
            <DropdownMenuItem onClick={onEdit}>Edit</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onChangeStatus?.('ACTIVE')}>
              Set Active
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onChangeStatus?.('SUSPENDED')}>
              Suspend
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={onDelete}
              className="text-red-600 focus:text-red-600"
            >
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </td>
    </tr>
  );
}
