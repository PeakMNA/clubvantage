'use client';

import { MoreVertical, Phone, Calendar, Hash, Mail } from 'lucide-react';
import { cn } from '@clubvantage/ui';
import { Avatar, AvatarFallback, AvatarImage } from '@clubvantage/ui';
import { Badge } from '@clubvantage/ui';
import { Button } from '@clubvantage/ui';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@clubvantage/ui';
import { StatusBadge } from './status-badge';
import type { Dependent, DependentRelationship } from './types';

interface DependentCardProps {
  dependent: Dependent;
  onEdit?: (dependent: Dependent) => void;
  onToggleStatus?: (dependent: Dependent) => void;
  onRemove?: (dependent: Dependent) => void;
  className?: string;
}

const relationshipColors: Record<DependentRelationship, string> = {
  SPOUSE: 'bg-muted text-foreground border',
  CHILD: 'bg-blue-50 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400 border-blue-200/60 dark:border-blue-500/30',
  PARENT: 'bg-purple-50 dark:bg-purple-500/20 text-purple-700 dark:text-purple-400 border-purple-200/60 dark:border-purple-500/30',
  SIBLING: 'bg-amber-50 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400 border-amber-200/60 dark:border-amber-500/30',
};

const relationshipLabels: Record<DependentRelationship, string> = {
  SPOUSE: 'Spouse',
  CHILD: 'Child',
  PARENT: 'Parent',
  SIBLING: 'Sibling',
};

function getInitials(firstName: string, lastName: string): string {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}

function calculateAge(dateOfBirth: string): number {
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
}

function formatDob(dateOfBirth: string): string {
  const date = new Date(dateOfBirth);
  const options: Intl.DateTimeFormatOptions = {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  };
  return date.toLocaleDateString('en-US', options);
}

export function DependentCard({
  dependent,
  onEdit,
  onToggleStatus,
  onRemove,
  className,
}: DependentCardProps) {
  const age = calculateAge(dependent.dateOfBirth);
  const formattedDob = formatDob(dependent.dateOfBirth);
  const isInactive = dependent.status === 'INACTIVE';

  const handleCardClick = (e: React.MouseEvent) => {
    // Prevent triggering edit when clicking on the dropdown menu
    const target = e.target as HTMLElement;
    if (target.closest('[data-dropdown-trigger]') || target.closest('[role="menu"]')) {
      return;
    }
    onEdit?.(dependent);
  };

  return (
    <div
      onClick={handleCardClick}
      className={cn(
        'group relative cursor-pointer overflow-hidden rounded-xl border border/60 bg-white/80 dark:bg-stone-900/80 shadow-sm backdrop-blur-sm transition-all duration-300 hover:shadow-md',
        isInactive && 'opacity-70',
        className
      )}
    >
      {/* Subtle gradient on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-muted/30 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />

      <div className="relative flex flex-col gap-4 p-4 sm:flex-row sm:items-start sm:gap-5 sm:p-5">
        {/* Photo */}
        <div className="relative shrink-0">
          <div className="absolute -inset-0.5 rounded-full bg-gradient-to-br from-border to-muted opacity-50" />
          <Avatar className="relative h-16 w-16 border-2 border-white shadow-md sm:h-18 sm:w-18">
            <AvatarImage
              src={dependent.photoUrl}
              alt={`${dependent.firstName} ${dependent.lastName}`}
              className="object-cover"
            />
            <AvatarFallback className="bg-gradient-to-br from-muted to-muted text-base font-semibold text-muted-foreground sm:text-lg">
              {getInitials(dependent.firstName, dependent.lastName)}
            </AvatarFallback>
          </Avatar>
        </div>

        {/* Info Section */}
        <div className="min-w-0 flex-1">
          {/* Name & Relationship */}
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="truncate text-base font-semibold text-foreground sm:text-lg">
              {dependent.firstName} {dependent.lastName}
            </h3>
            <Badge className={cn('text-[10px] font-medium', relationshipColors[dependent.relationship])}>
              {relationshipLabels[dependent.relationship]}
            </Badge>
          </div>

          {/* Member # */}
          <div className="mt-1.5 flex items-center gap-1.5">
            <Hash className="h-3 w-3 text-muted-foreground" />
            <span className="font-mono text-xs text-muted-foreground">{dependent.memberNumber}</span>
          </div>

          {/* DOB + Age */}
          <div className="mt-2 flex items-center gap-1.5 text-sm text-muted-foreground">
            <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
            <span>{formattedDob}</span>
            <span className="rounded-md bg-muted px-1.5 py-0.5 text-xs font-medium text-muted-foreground">
              {age} yrs
            </span>
          </div>

          {/* Email */}
          {dependent.email && (
            <div className="mt-1.5 flex items-center gap-1.5 text-sm text-muted-foreground">
              <Mail className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="truncate">{dependent.email}</span>
            </div>
          )}

          {/* Phone */}
          {dependent.phone && (
            <div className="mt-1.5 flex items-center gap-1.5 text-sm text-muted-foreground">
              <Phone className="h-3.5 w-3.5 text-muted-foreground" />
              <span>{dependent.phone}</span>
            </div>
          )}
        </div>

        {/* Right Section */}
        <div className="flex items-center justify-between gap-3 sm:flex-col sm:items-end">
          {/* Status Badge */}
          <StatusBadge
            status={dependent.status.toLowerCase() as 'active' | 'inactive'}
            size="sm"
          />

          {/* Three-dot menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                data-dropdown-trigger
                className="h-8 w-8 rounded-lg text-muted-foreground transition-all hover:bg-muted hover:text-muted-foreground sm:opacity-0 sm:group-hover:opacity-100"
              >
                <MoreVertical className="h-4 w-4" />
                <span className="sr-only">Open menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="backdrop-blur-sm">
              <DropdownMenuItem className="cursor-pointer" onClick={() => onEdit?.(dependent)}>
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer" onClick={() => onToggleStatus?.(dependent)}>
                {isInactive ? 'Activate' : 'Deactivate'}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => onRemove?.(dependent)}
                className="cursor-pointer text-red-600 dark:text-red-400 focus:text-red-600 dark:focus:text-red-400"
              >
                Remove
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}
