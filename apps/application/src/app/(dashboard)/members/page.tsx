'use client';

import { useState, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  UserPlus,
  MoreHorizontal,
  Mail,
  Pause,
  Play,
  XCircle,
  FileText,
  ClipboardList,
} from 'lucide-react';

import {
  PageHeader,
  Button,
  Avatar,
  AvatarFallback,
  AvatarImage,
  Badge,
  Checkbox,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@clubvantage/ui';

import {
  FilterBar,
  AdvancedFiltersPanel,
  StatusBadge,
  AddMemberModal,
  BulkSelectionBar,
  MemberListNoResults,
  MemberListEmpty,
  MemberListSkeleton,
  StatusChangeDialog,
  BulkActionDialog,
  type MemberStatus,
  type MemberFilters,
  type Member,
  type QuickFilterOption,
  type AddMemberFormData,
  type SelectedMember,
} from '@/components/members';

import { useMembers, useMemberMutations, filterMembersLocal } from '@/hooks/use-members';
import { useMembershipTypes } from '@/hooks/use-membership-types';

// Fallback membership types when API is unavailable
const fallbackMembershipTypes = [
  { id: 'mt-001', name: 'Individual', description: 'Single member', billingCycle: 'MONTHLY' as const, monthlyFee: 15000, entryFee: 50000, maxDependents: 0 },
  { id: 'mt-002', name: 'Family', description: 'Family membership', billingCycle: 'MONTHLY' as const, monthlyFee: 25000, entryFee: 75000, maxDependents: 4 },
  { id: 'mt-003', name: 'Corporate', description: 'Corporate membership', billingCycle: 'QUARTERLY' as const, monthlyFee: 45000, entryFee: 150000, maxDependents: 3 },
];

function getInitials(firstName: string, lastName: string) {
  return `${firstName[0]}${lastName[0]}`.toUpperCase();
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'THB',
    minimumFractionDigits: 0,
  }).format(amount);
}

function getBalanceColor(member: Member): string {
  if (member.balance <= 0) return 'text-muted-foreground';
  if (member.status === 'SUSPENDED') return 'text-red-600 dark:text-red-400';
  if (member.agingBucket === '91+') return 'text-red-600 dark:text-red-400';
  return 'text-amber-600 dark:text-amber-400';
}

const statusMap: Record<MemberStatus, 'active' | 'pending' | 'suspended' | 'inactive' | 'cancelled'> = {
  ACTIVE: 'active',
  PENDING: 'pending',
  SUSPENDED: 'suspended',
  INACTIVE: 'inactive',
  CANCELLED: 'cancelled',
};

export default function MembersPage() {
  // Fetch members from API
  const membersResult = useMembers({ pageSize: 100 });
  const { members: apiMembers, totalCount, isLoading: isMembersLoading, refetch, error: membersError } = membersResult;

  // Debug: Log members fetch state
  console.log('[MembersPage] Members fetch state:', {
    membersCount: apiMembers.length,
    totalCount,
    isLoading: isMembersLoading,
    error: membersError?.message || 'none',
    rawResult: membersResult
  });

  // Fetch membership types from API with fallback
  const { membershipTypes: apiMembershipTypes } = useMembershipTypes();
  const membershipTypes = apiMembershipTypes.length > 0 ? apiMembershipTypes : fallbackMembershipTypes;

  // Mutations
  const { createMember, isCreating } = useMemberMutations();

  // Get potential sponsors (active members from API)
  const potentialSponsors = useMemo(() =>
    apiMembers
      .filter((m: Member) => m.status === 'ACTIVE')
      .map((m: Member) => ({
        id: m.id,
        firstName: m.firstName,
        lastName: m.lastName,
        memberNumber: m.memberNumber,
      })),
    [apiMembers]
  );
  const router = useRouter();

  // State
  const [searchQuery, setSearchQuery] = useState('');
  const [quickFilter, setQuickFilter] = useState<QuickFilterOption>('ALL');
  const [advancedFilters, setAdvancedFilters] = useState<MemberFilters>({});
  const [isAdvancedFiltersOpen, setIsAdvancedFiltersOpen] = useState(false);
  const [selectedMemberIds, setSelectedMemberIds] = useState<Set<string>>(new Set());
  const [isSearching, setIsSearching] = useState(false);
  const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bulkActionLoading, setBulkActionLoading] = useState<{
    sendInvoice?: boolean;
    export?: boolean;
    changeStatus?: boolean;
    delete?: boolean;
  }>({});

  // Confirmation dialog states
  const [statusChangeDialog, setStatusChangeDialog] = useState<{
    open: boolean;
    member: Member | null;
    newStatus: MemberStatus | null;
  }>({ open: false, member: null, newStatus: null });

  const [bulkActionDialog, setBulkActionDialog] = useState<{
    open: boolean;
    action: 'delete' | 'changeStatus' | null;
    newStatus?: MemberStatus;
  }>({ open: false, action: null });

  const [isStatusChanging, setIsStatusChanging] = useState(false);

  // Filter members using API data
  const filteredMembers = useMemo(() => {
    const filters: MemberFilters = {
      ...advancedFilters,
      search: searchQuery,
      statuses: quickFilter === 'ALL' ? undefined : [quickFilter as MemberStatus],
    };
    return filterMembersLocal(apiMembers, filters);
  }, [apiMembers, searchQuery, quickFilter, advancedFilters]);

  // Calculate active filter count
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (advancedFilters.statuses?.length) count += advancedFilters.statuses.length;
    if (advancedFilters.membershipTypes?.length) count += advancedFilters.membershipTypes.length;
    if (advancedFilters.agingBuckets?.length) count += advancedFilters.agingBuckets.length;
    if (advancedFilters.joinDateFrom) count += 1;
    if (advancedFilters.joinDateTo) count += 1;
    if (advancedFilters.balanceMin !== undefined) count += 1;
    if (advancedFilters.balanceMax !== undefined) count += 1;
    if (advancedFilters.phone) count += 1;
    return count;
  }, [advancedFilters]);

  // Build selected members array for BulkSelectionBar
  const selectedMembers: SelectedMember[] = useMemo(() => {
    return filteredMembers
      .filter((m) => selectedMemberIds.has(m.id))
      .map((m) => ({
        id: m.id,
        memberNumber: m.memberNumber,
        name: `${m.firstName} ${m.lastName}`,
        status: m.status,
      }));
  }, [filteredMembers, selectedMemberIds]);

  // Handlers
  const handleSearchChange = useCallback((query: string) => {
    setIsSearching(true);
    setSearchQuery(query);
    // Simulate search delay
    setTimeout(() => setIsSearching(false), 300);
  }, []);

  const handleSelectAll = useCallback(
    (checked: boolean) => {
      if (checked) {
        setSelectedMemberIds(new Set(filteredMembers.map((m) => m.id)));
      } else {
        setSelectedMemberIds(new Set());
      }
    },
    [filteredMembers]
  );

  const handleSelectMember = useCallback((memberId: string, checked: boolean) => {
    setSelectedMemberIds((prev) => {
      const next = new Set(prev);
      if (checked) {
        next.add(memberId);
      } else {
        next.delete(memberId);
      }
      return next;
    });
  }, []);

  const handleClearSelection = useCallback(() => {
    setSelectedMemberIds(new Set());
  }, []);

  // Add Member handler - now uses real API
  const handleAddMember = useCallback(async (data: AddMemberFormData) => {
    setIsSubmitting(true);
    try {
      await createMember({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        membershipTypeId: data.membershipTypeId,
      });
      setIsAddMemberModalOpen(false);
      // Refetch member list to show new member
      refetch();
    } catch (error) {
      console.error('Failed to add member:', error);
    } finally {
      setIsSubmitting(false);
    }
  }, [createMember, refetch]);

  // Row action handlers
  const handleSendEmail = useCallback((member: Member) => {
    // Open email client with member's email
    window.location.href = `mailto:${member.email}`;
  }, []);

  const handleSuspendMember = useCallback((member: Member) => {
    setStatusChangeDialog({
      open: true,
      member,
      newStatus: 'SUSPENDED',
    });
  }, []);

  const handleReactivateMember = useCallback((member: Member) => {
    setStatusChangeDialog({
      open: true,
      member,
      newStatus: 'ACTIVE',
    });
  }, []);

  const handleCancelMembership = useCallback((member: Member) => {
    setStatusChangeDialog({
      open: true,
      member,
      newStatus: 'CANCELLED',
    });
  }, []);

  const handleViewStatement = useCallback((member: Member) => {
    router.push(`/members/${member.id}?tab=ar-history`);
  }, [router]);

  // Status change confirmation handler
  const handleConfirmStatusChange = useCallback(async (reason?: string) => {
    if (!statusChangeDialog.member || !statusChangeDialog.newStatus) return;

    setIsStatusChanging(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // In real app, would call API to update member status
      console.log('Status changed:', {
        memberId: statusChangeDialog.member.id,
        newStatus: statusChangeDialog.newStatus,
        reason,
      });

      // Close dialog
      setStatusChangeDialog({ open: false, member: null, newStatus: null });

      // TODO: Refresh member list or update local state
    } catch (error) {
      console.error('Failed to change status:', error);
    } finally {
      setIsStatusChanging(false);
    }
  }, [statusChangeDialog.member, statusChangeDialog.newStatus]);

  // Bulk action handlers for BulkSelectionBar
  const handleBulkSendInvoice = useCallback(async (memberIds: string[]) => {
    setBulkActionLoading((prev) => ({ ...prev, sendInvoice: true }));
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      console.log('Send invoice to:', memberIds);
      handleClearSelection();
    } finally {
      setBulkActionLoading((prev) => ({ ...prev, sendInvoice: false }));
    }
  }, [handleClearSelection]);

  const handleBulkExport = useCallback(async (memberIds: string[]) => {
    setBulkActionLoading((prev) => ({ ...prev, export: true }));
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      console.log('Export members:', memberIds);
      // In real app, would trigger CSV/Excel download
    } finally {
      setBulkActionLoading((prev) => ({ ...prev, export: false }));
    }
  }, []);

  const handleBulkChangeStatus = useCallback((memberIds: string[], newStatus: MemberStatus) => {
    setBulkActionDialog({
      open: true,
      action: 'changeStatus',
      newStatus,
    });
  }, []);

  const handleBulkDelete = useCallback((memberIds: string[]) => {
    setBulkActionDialog({
      open: true,
      action: 'delete',
    });
  }, []);

  // Bulk action confirmation handler
  const handleConfirmBulkAction = useCallback(async () => {
    const memberIds = Array.from(selectedMemberIds);

    if (bulkActionDialog.action === 'delete') {
      setBulkActionLoading((prev) => ({ ...prev, delete: true }));
      try {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        console.log('Deleted members:', memberIds);
        handleClearSelection();
        setBulkActionDialog({ open: false, action: null });
      } finally {
        setBulkActionLoading((prev) => ({ ...prev, delete: false }));
      }
    } else if (bulkActionDialog.action === 'changeStatus' && bulkActionDialog.newStatus) {
      setBulkActionLoading((prev) => ({ ...prev, changeStatus: true }));
      try {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        console.log('Changed status to', bulkActionDialog.newStatus, 'for:', memberIds);
        handleClearSelection();
        setBulkActionDialog({ open: false, action: null });
      } finally {
        setBulkActionLoading((prev) => ({ ...prev, changeStatus: false }));
      }
    }
  }, [bulkActionDialog.action, bulkActionDialog.newStatus, selectedMemberIds, handleClearSelection]);

  return (
    <div className="space-y-6 p-6">
      <PageHeader
        title="Members"
        description="Manage club members and their information"
        breadcrumbs={[{ label: 'Members' }]}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => router.push('/members/applications')}>
              <ClipboardList className="mr-2 h-4 w-4" />
              Applications
            </Button>
            <Button onClick={() => setIsAddMemberModalOpen(true)}>
              <UserPlus className="mr-2 h-4 w-4" />
              New Member
            </Button>
          </div>
        }
      />

      {/* Filter Bar */}
      <FilterBar
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
        quickFilter={quickFilter}
        onQuickFilterChange={setQuickFilter}
        activeFiltersCount={activeFilterCount}
        onOpenAdvancedFilters={() => setIsAdvancedFiltersOpen(true)}
        isSearching={isSearching}
      />

      {/* Loading State */}
      {isMembersLoading && <MemberListSkeleton />}

      {/* Members Table */}
      {!isMembersLoading && (
        <div className="rounded-lg border border-border bg-card">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b bg-muted/50">
                <tr>
                  <th className="h-12 w-10 px-4 text-left">
                    <Checkbox
                      checked={
                        filteredMembers.length > 0 &&
                        selectedMemberIds.size === filteredMembers.length
                      }
                      onCheckedChange={handleSelectAll}
                      aria-label="Select all"
                    />
                  </th>
                  <th className="h-12 px-4 text-left font-medium text-muted-foreground">
                    Name
                  </th>
                  <th className="h-12 w-36 px-4 text-left font-medium text-muted-foreground">
                    Member #
                  </th>
                  <th className="h-12 w-28 px-4 text-left font-medium text-muted-foreground">
                    Type
                  </th>
                  <th className="h-12 w-28 px-4 text-left font-medium text-muted-foreground">
                    Status
                  </th>
                  <th className="h-12 w-28 px-4 text-right font-medium text-muted-foreground">
                    Balance
                  </th>
                  <th className="h-12 w-16 px-4"></th>
                </tr>
              </thead>
              <tbody>
                {filteredMembers.length === 0 ? (
                  <tr>
                    <td colSpan={7}>
                      {searchQuery || quickFilter !== 'ALL' || activeFilterCount > 0 ? (
                        <MemberListNoResults
                          onClearFilters={() => {
                            setSearchQuery('');
                            setQuickFilter('ALL');
                            setAdvancedFilters({});
                          }}
                        />
                      ) : (
                        <MemberListEmpty onAddMember={() => setIsAddMemberModalOpen(true)} />
                      )}
                    </td>
                  </tr>
                ) : (
                filteredMembers.map((member) => (
                  <tr
                    key={member.id}
                    className="border-b border-border transition-colors hover:bg-muted/50"
                  >
                    <td className="px-4 py-3">
                      <Checkbox
                        checked={selectedMemberIds.has(member.id)}
                        onCheckedChange={(checked) =>
                          handleSelectMember(member.id, checked as boolean)
                        }
                        aria-label={`Select ${member.firstName} ${member.lastName}`}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/members/${member.id}`}
                        className="flex items-center gap-3 hover:underline"
                      >
                        <Avatar className="h-9 w-9">
                          <AvatarImage src={member.photoUrl} />
                          <AvatarFallback className="bg-muted text-sm text-muted-foreground">
                            {getInitials(member.firstName, member.lastName)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium text-foreground">
                          {member.firstName} {member.lastName}
                        </span>
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-mono text-xs text-muted-foreground">
                        {member.memberNumber}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant="outline" className="text-xs">
                        {member.membershipTypeName}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={statusMap[member.status]} size="sm" />
                    </td>
                    <td className={`px-4 py-3 text-right font-medium ${getBalanceColor(member)}`}>
                      {member.balance > 0 ? formatCurrency(member.balance) : '-'}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => router.push(`/members/${member.id}`)}
                          >
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => router.push(`/members/${member.id}?edit=true`)}
                          >
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleSendEmail(member)}>
                            <Mail className="mr-2 h-4 w-4" />
                            Send Email
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleViewStatement(member)}>
                            <FileText className="mr-2 h-4 w-4" />
                            View Statement
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          {member.status === 'ACTIVE' && (
                            <DropdownMenuItem
                              onClick={() => handleSuspendMember(member)}
                              className="text-amber-600"
                            >
                              <Pause className="mr-2 h-4 w-4" />
                              Suspend
                            </DropdownMenuItem>
                          )}
                          {(member.status === 'SUSPENDED' || member.status === 'INACTIVE') && (
                            <DropdownMenuItem
                              onClick={() => handleReactivateMember(member)}
                              className="text-green-600"
                            >
                              <Play className="mr-2 h-4 w-4" />
                              Reactivate
                            </DropdownMenuItem>
                          )}
                          {member.status !== 'CANCELLED' && (
                            <DropdownMenuItem
                              onClick={() => handleCancelMembership(member)}
                              className="text-red-600"
                            >
                              <XCircle className="mr-2 h-4 w-4" />
                              Cancel Membership
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

          {/* Pagination */}
          <div className="flex items-center justify-between border-t border-border px-4 py-3">
            <p className="text-sm text-muted-foreground">
              Showing {filteredMembers.length} of {totalCount || apiMembers.length} members
            </p>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" disabled>
                Previous
              </Button>
              <Button variant="outline" size="sm" disabled>
                Next
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Advanced Filters Panel */}
      <AdvancedFiltersPanel
        open={isAdvancedFiltersOpen}
        onOpenChange={setIsAdvancedFiltersOpen}
        filters={advancedFilters}
        onApply={setAdvancedFilters}
      />

      {/* Add Member Modal */}
      <AddMemberModal
        open={isAddMemberModalOpen}
        onOpenChange={setIsAddMemberModalOpen}
        membershipTypes={membershipTypes}
        sponsors={potentialSponsors}
        onSubmit={handleAddMember}
        isLoading={isSubmitting || isCreating}
      />

      {/* Bulk Selection Bar (fixed at bottom when members selected) */}
      <BulkSelectionBar
        selectedMembers={selectedMembers}
        onClearSelection={handleClearSelection}
        onSendInvoice={handleBulkSendInvoice}
        onExport={handleBulkExport}
        onChangeStatus={handleBulkChangeStatus}
        onDelete={handleBulkDelete}
        isActionLoading={bulkActionLoading}
      />

      {/* Status Change Confirmation Dialog */}
      {statusChangeDialog.member && statusChangeDialog.newStatus && (
        <StatusChangeDialog
          open={statusChangeDialog.open}
          onOpenChange={(open) => {
            if (!open) {
              setStatusChangeDialog({ open: false, member: null, newStatus: null });
            }
          }}
          memberName={`${statusChangeDialog.member.firstName} ${statusChangeDialog.member.lastName}`}
          currentStatus={statusChangeDialog.member.status}
          newStatus={statusChangeDialog.newStatus}
          onConfirm={handleConfirmStatusChange}
          isLoading={isStatusChanging}
        />
      )}

      {/* Bulk Action Confirmation Dialog */}
      {bulkActionDialog.action && (
        <BulkActionDialog
          open={bulkActionDialog.open}
          onOpenChange={(open) => {
            if (!open) {
              setBulkActionDialog({ open: false, action: null });
            }
          }}
          action={bulkActionDialog.action === 'delete' ? 'Delete' : `Change to ${bulkActionDialog.newStatus}`}
          count={selectedMemberIds.size}
          itemType="member"
          onConfirm={handleConfirmBulkAction}
          isLoading={bulkActionLoading.delete || bulkActionLoading.changeStatus}
          variant={bulkActionDialog.action === 'delete' ? 'danger' : 'warning'}
        />
      )}
    </div>
  );
}
