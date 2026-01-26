'use client';

import * as React from 'react';
import { Check, ChevronsUpDown, Search, User } from 'lucide-react';
import { Command as CommandPrimitive } from 'cmdk';

import { cn } from '../lib/utils';
import { Button } from '../primitives/button';
import { Avatar, AvatarFallback, AvatarImage } from '../primitives/avatar';

export interface MemberOption {
  id: string;
  memberId: string;
  firstName: string;
  lastName: string;
  email?: string;
  avatarUrl?: string;
  status?: string;
}

export interface MemberComboboxProps {
  /** Available members to select from */
  members: MemberOption[];
  /** Currently selected member ID */
  value?: string;
  /** Callback when selection changes */
  onValueChange?: (memberId: string | undefined) => void;
  /** Placeholder text */
  placeholder?: string;
  /** Search placeholder text */
  searchPlaceholder?: string;
  /** Empty state message */
  emptyMessage?: string;
  /** Whether the combobox is disabled */
  disabled?: boolean;
  /** Additional class names */
  className?: string;
  /** Loading state */
  isLoading?: boolean;
  /** Async search callback */
  onSearch?: (query: string) => void;
}

function getInitials(firstName: string, lastName: string): string {
  return `${firstName[0] || ''}${lastName[0] || ''}`.toUpperCase();
}

export function MemberCombobox({
  members,
  value,
  onValueChange,
  placeholder = 'Select member...',
  searchPlaceholder = 'Search members...',
  emptyMessage = 'No members found.',
  disabled = false,
  className,
  isLoading = false,
  onSearch,
}: MemberComboboxProps) {
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState('');

  const selectedMember = members.find((m) => m.id === value);

  const handleSearch = React.useCallback(
    (query: string) => {
      setSearch(query);
      onSearch?.(query);
    },
    [onSearch]
  );

  const filteredMembers = React.useMemo(() => {
    if (onSearch) return members; // External filtering
    if (!search) return members;

    const lowerSearch = search.toLowerCase();
    return members.filter(
      (m) =>
        m.firstName.toLowerCase().includes(lowerSearch) ||
        m.lastName.toLowerCase().includes(lowerSearch) ||
        m.memberId.toLowerCase().includes(lowerSearch) ||
        m.email?.toLowerCase().includes(lowerSearch)
    );
  }, [members, search, onSearch]);

  return (
    <div className={cn('relative', className)}>
      <Button
        variant="outline"
        role="combobox"
        aria-expanded={open}
        aria-haspopup="listbox"
        disabled={disabled}
        onClick={() => setOpen(!open)}
        className="w-full justify-between"
      >
        {selectedMember ? (
          <div className="flex items-center gap-2">
            <Avatar className="h-6 w-6">
              <AvatarImage src={selectedMember.avatarUrl} />
              <AvatarFallback className="text-xs">
                {getInitials(selectedMember.firstName, selectedMember.lastName)}
              </AvatarFallback>
            </Avatar>
            <span>
              {selectedMember.firstName} {selectedMember.lastName}
            </span>
            <span className="text-muted-foreground">({selectedMember.memberId})</span>
          </div>
        ) : (
          <span className="text-muted-foreground">{placeholder}</span>
        )}
        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
      </Button>

      {open && (
        <div className="absolute z-50 mt-1 w-full rounded-md border bg-popover p-0 shadow-md animate-in fade-in-0 zoom-in-95">
          <CommandPrimitive className="overflow-hidden rounded-md">
            <div className="flex items-center border-b px-3">
              <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
              <input
                value={search}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder={searchPlaceholder}
                className="flex h-10 w-full bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
            <div className="max-h-[300px] overflow-y-auto p-1">
              {isLoading ? (
                <div className="py-6 text-center text-sm text-muted-foreground">Loading...</div>
              ) : filteredMembers.length === 0 ? (
                <div className="py-6 text-center text-sm text-muted-foreground">{emptyMessage}</div>
              ) : (
                filteredMembers.map((member) => (
                  <button
                    key={member.id}
                    onClick={() => {
                      onValueChange?.(member.id === value ? undefined : member.id);
                      setOpen(false);
                    }}
                    className={cn(
                      'relative flex w-full cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground',
                      value === member.id && 'bg-accent text-accent-foreground'
                    )}
                  >
                    <Avatar className="mr-2 h-8 w-8">
                      <AvatarImage src={member.avatarUrl} />
                      <AvatarFallback>
                        {getInitials(member.firstName, member.lastName)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col items-start">
                      <span className="font-medium">
                        {member.firstName} {member.lastName}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {member.memberId}
                        {member.email && ` · ${member.email}`}
                      </span>
                    </div>
                    {value === member.id && <Check className="ml-auto h-4 w-4" />}
                  </button>
                ))
              )}
            </div>
          </CommandPrimitive>
        </div>
      )}
    </div>
  );
}
