'use client';

import { cn } from '@clubvantage/ui';
import { Avatar, AvatarFallback, AvatarImage } from '@clubvantage/ui';
import { StatusBadge } from './status-badge';
import { PersonTypeBadge } from './person-type-badge';
import type { PersonSearchResult } from './types';

interface PersonSearchResultCardProps {
  person: PersonSearchResult;
  isSelected?: boolean;
  isFocused?: boolean;
  onClick?: () => void;
  className?: string;
}

function getInitials(firstName: string, lastName: string): string {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}

function getContextLine(person: PersonSearchResult): string {
  switch (person.personType) {
    case 'MEMBER':
      return person.memberNumber || '';
    case 'DEPENDENT':
      return person.parentMemberName
        ? `Dependent of ${person.parentMemberName}`
        : 'Dependent';
    case 'GUEST':
      return person.sponsorMemberName
        ? `Guest of ${person.sponsorMemberName}`
        : 'Guest';
    default:
      return '';
  }
}

export function PersonSearchResultCard({
  person,
  isSelected = false,
  isFocused = false,
  onClick,
  className,
}: PersonSearchResultCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex w-full items-center gap-3 border-b border-border p-3 text-left transition-colors',
        'hover:bg-muted/50',
        isSelected && 'bg-amber-50',
        isFocused && 'outline outline-2 outline-amber-500',
        className
      )}
    >
      {/* Photo */}
      <Avatar className="h-12 w-12 shrink-0">
        <AvatarImage src={person.photoUrl} alt={person.displayName} />
        <AvatarFallback className="bg-muted text-muted-foreground">
          {getInitials(person.firstName, person.lastName)}
        </AvatarFallback>
      </Avatar>

      {/* Info Section */}
      <div className="min-w-0 flex-1">
        {/* Line 1: Name + Status */}
        <div className="flex items-center gap-2">
          <span className="truncate text-base font-semibold text-foreground">
            {person.displayName}
          </span>
          <StatusBadge
            status={person.status === 'ACTIVE' ? 'active' : person.status === 'SUSPENDED' ? 'suspended' : person.status === 'PENDING' ? 'pending' : 'inactive'}
            variant="member"
            size="sm"
          />
        </div>

        {/* Line 2: Member # or relationship context */}
        <div className="mt-0.5 text-sm font-mono text-muted-foreground">
          {getContextLine(person)}
        </div>

        {/* Line 3: Phone + Email */}
        <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
          {person.phone && <span>{person.phone}</span>}
          {person.phone && person.email && <span>•</span>}
          {person.email && <span className="truncate">{person.email}</span>}
        </div>
      </div>

      {/* Type Badge */}
      <PersonTypeBadge type={person.personType} className="shrink-0" />
    </button>
  );
}
