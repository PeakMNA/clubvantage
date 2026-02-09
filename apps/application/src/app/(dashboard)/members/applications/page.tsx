'use client';

import { useState, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { MoreHorizontal, Eye, ClipboardCheck, Send, UserPlus, XCircle, Loader2 } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';

import {
  PageHeader,
  Button,
  Badge,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@clubvantage/ui';

import {
  useGetApplicationsQuery,
  useGetApplicationStatsQuery,
  useChangeApplicationStatusMutation,
  type ApplicationStatus,
  type MembershipApplicationType,
} from '@clubvantage/api-client';

import { ApplicationsEmpty } from '@/components/members/empty-states';

// Status badge configuration
const statusConfig: Record<
  ApplicationStatus,
  { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline'; className: string }
> = {
  SUBMITTED: { label: 'Submitted', variant: 'default', className: 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-500/20 dark:text-blue-400 dark:border-blue-500/30' },
  UNDER_REVIEW: { label: 'Under Review', variant: 'default', className: 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-500/20 dark:text-amber-400 dark:border-amber-500/30' },
  PENDING_BOARD: { label: 'Pending Board', variant: 'default', className: 'bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-500/20 dark:text-purple-400 dark:border-purple-500/30' },
  APPROVED: { label: 'Approved', variant: 'default', className: 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-400 dark:border-emerald-500/30' },
  REJECTED: { label: 'Rejected', variant: 'destructive', className: 'bg-red-100 text-red-700 border-red-200 dark:bg-red-500/20 dark:text-red-400 dark:border-red-500/30' },
  WITHDRAWN: { label: 'Withdrawn', variant: 'secondary', className: 'bg-stone-100 text-stone-600 border-stone-200 dark:bg-stone-800 dark:text-stone-400 dark:border-stone-700' },
};

// Filter tabs
const statusFilters: { value: ApplicationStatus | 'ALL'; label: string }[] = [
  { value: 'ALL', label: 'All' },
  { value: 'SUBMITTED', label: 'Submitted' },
  { value: 'UNDER_REVIEW', label: 'Under Review' },
  { value: 'PENDING_BOARD', label: 'Pending Board' },
  { value: 'APPROVED', label: 'Approved' },
  { value: 'REJECTED', label: 'Rejected' },
];

function formatDate(dateString: string | Date): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function ApplicationStatusBadge({ status }: { status: ApplicationStatus }) {
  const config = statusConfig[status];
  return (
    <Badge variant="outline" className={config.className}>
      {config.label}
    </Badge>
  );
}

export default function ApplicationsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [activeFilter, setActiveFilter] = useState<ApplicationStatus | 'ALL'>('ALL');

  // Fetch applications
  const { data, isLoading, error } = useGetApplicationsQuery(
    activeFilter === 'ALL' ? {} : { status: activeFilter },
    { staleTime: 30000 }
  );

  // Fetch stats for counts
  const { data: statsData } = useGetApplicationStatsQuery({}, { staleTime: 30000 });

  // Change status mutation
  const changeStatusMutation = useChangeApplicationStatusMutation({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['GetApplications'] });
      queryClient.invalidateQueries({ queryKey: ['GetApplicationStats'] });
    },
  });

  const applications = useMemo(() => {
    return data?.applications?.edges?.map((edge) => edge.node) ?? [];
  }, [data]);

  // Calculate counts for filter tabs
  const statusCounts = useMemo((): Record<ApplicationStatus | 'ALL', number> => {
    const stats = statsData?.applicationStats;
    if (!stats) {
      return {
        ALL: 0,
        SUBMITTED: 0,
        UNDER_REVIEW: 0,
        PENDING_BOARD: 0,
        APPROVED: 0,
        REJECTED: 0,
        WITHDRAWN: 0,
      };
    }
    return {
      ALL: stats.total,
      SUBMITTED: stats.submitted,
      UNDER_REVIEW: stats.underReview,
      PENDING_BOARD: stats.pendingBoard,
      APPROVED: stats.approved,
      REJECTED: stats.rejected,
      WITHDRAWN: 0, // Stats don't include withdrawn
    };
  }, [statsData]);

  // Action handlers
  const handleReview = useCallback((app: MembershipApplicationType) => {
    router.push(`/members/applications/${app.id}`);
  }, [router]);

  const handleSubmitToBoard = useCallback((app: MembershipApplicationType) => {
    changeStatusMutation.mutate({
      id: app.id,
      input: { status: 'PENDING_BOARD' },
    });
  }, [changeStatusMutation]);

  const handleApprove = useCallback((app: MembershipApplicationType) => {
    changeStatusMutation.mutate({
      id: app.id,
      input: { status: 'APPROVED' },
    });
  }, [changeStatusMutation]);

  const handleReject = useCallback((app: MembershipApplicationType) => {
    changeStatusMutation.mutate({
      id: app.id,
      input: { status: 'REJECTED', rejectionReason: 'Rejected by administrator' },
    });
  }, [changeStatusMutation]);

  const handleWithdraw = useCallback((app: MembershipApplicationType) => {
    changeStatusMutation.mutate({
      id: app.id,
      input: { status: 'WITHDRAWN' },
    });
  }, [changeStatusMutation]);

  const handleCreateMember = useCallback((app: MembershipApplicationType) => {
    // Redirect to member creation with pre-filled data from application
    router.push(`/members/new?fromApplication=${app.id}`);
  }, [router]);

  const handleView = useCallback((app: MembershipApplicationType) => {
    router.push(`/members/applications/${app.id}`);
  }, [router]);

  // Get action button based on status
  const getActionButton = (app: MembershipApplicationType) => {
    const isPending = changeStatusMutation.isPending;

    switch (app.status) {
      case 'SUBMITTED':
        return (
          <Button size="sm" variant="outline" onClick={() => handleReview(app)}>
            <ClipboardCheck className="mr-1 h-4 w-4" />
            Review
          </Button>
        );
      case 'UNDER_REVIEW':
        return (
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleSubmitToBoard(app)}
            disabled={isPending}
          >
            {isPending ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : <Send className="mr-1 h-4 w-4" />}
            Submit to Board
          </Button>
        );
      case 'PENDING_BOARD':
        return (
          <div className="flex gap-1">
            <Button
              size="sm"
              variant="default"
              className="bg-emerald-600 hover:bg-emerald-700"
              onClick={() => handleApprove(app)}
              disabled={isPending}
            >
              Approve
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={() => handleReject(app)}
              disabled={isPending}
            >
              Reject
            </Button>
          </div>
        );
      case 'APPROVED':
        return (
          <Button size="sm" variant="default" onClick={() => handleCreateMember(app)}>
            <UserPlus className="mr-1 h-4 w-4" />
            Create Member
          </Button>
        );
      default:
        return (
          <Button size="sm" variant="ghost" onClick={() => handleView(app)}>
            <Eye className="mr-1 h-4 w-4" />
            View
          </Button>
        );
    }
  };

  if (error) {
    return (
      <div className="space-y-6 p-6">
        <PageHeader
          title="Membership Applications"
          description="Review and manage membership applications"
          breadcrumbs={[
            { label: 'Members', href: '/members' },
            { label: 'Applications' },
          ]}
        />
        <div className="rounded-lg border border-red-200 dark:border-red-500/30 bg-red-50 dark:bg-red-500/10 p-6 text-center">
          <p className="text-red-600 dark:text-red-400">Failed to load applications. Please try again.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <PageHeader
        title="Membership Applications"
        description="Review and manage membership applications"
        breadcrumbs={[
          { label: 'Members', href: '/members' },
          { label: 'Applications' },
        ]}
      />

      {/* Status Filter Tabs */}
      <div className="flex gap-2 border-b border-stone-200 dark:border-stone-700">
        {statusFilters.map((filter) => (
          <button
            key={filter.value}
            onClick={() => setActiveFilter(filter.value)}
            className={`
              relative px-4 py-2 text-sm font-medium transition-colors
              ${
                activeFilter === filter.value
                  ? 'text-amber-600'
                  : 'text-stone-500 dark:text-stone-400 hover:text-stone-700 dark:hover:text-stone-300'
              }
            `}
          >
            <span className="flex items-center gap-2">
              {filter.label}
              {statusCounts[filter.value] !== undefined && (
                <span
                  className={`
                    rounded-full px-2 py-0.5 text-xs
                    ${
                      activeFilter === filter.value
                        ? 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400'
                        : 'bg-stone-100 text-stone-600 dark:bg-stone-800 dark:text-stone-400'
                    }
                  `}
                >
                  {statusCounts[filter.value]}
                </span>
              )}
            </span>
            {activeFilter === filter.value && (
              <span className="absolute inset-x-0 -bottom-px h-0.5 bg-amber-600" />
            )}
          </button>
        ))}
      </div>

      {/* Applications Table */}
      <div className="rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b dark:border-stone-700 bg-stone-50 dark:bg-stone-800">
              <tr>
                <th className="h-12 px-4 text-left font-medium text-stone-500 dark:text-stone-400">
                  Applicant Name
                </th>
                <th className="h-12 w-32 px-4 text-left font-medium text-stone-500 dark:text-stone-400">
                  Type
                </th>
                <th className="h-12 w-28 px-4 text-left font-medium text-stone-500 dark:text-stone-400">
                  Submitted
                </th>
                <th className="h-12 w-40 px-4 text-left font-medium text-stone-500 dark:text-stone-400">
                  Sponsor
                </th>
                <th className="h-12 w-32 px-4 text-left font-medium text-stone-500 dark:text-stone-400">
                  Status
                </th>
                <th className="h-12 w-44 px-4 text-right font-medium text-stone-500 dark:text-stone-400">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center">
                    <Loader2 className="mx-auto h-6 w-6 animate-spin text-amber-600" />
                    <p className="mt-2 text-sm text-stone-500 dark:text-stone-400">Loading applications...</p>
                  </td>
                </tr>
              ) : applications.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-0">
                    <ApplicationsEmpty />
                  </td>
                </tr>
              ) : (
                applications.map((app) => (
                  <tr
                    key={app.id}
                    className="border-b border-stone-100 dark:border-stone-700 transition-colors hover:bg-stone-50 dark:hover:bg-stone-800"
                  >
                    <td className="px-4 py-3">
                      <Link
                        href={`/members/applications/${app.id}`}
                        className="font-medium text-stone-900 dark:text-stone-100 hover:text-amber-600 hover:underline"
                      >
                        {app.firstName} {app.lastName}
                      </Link>
                      <p className="text-xs text-stone-500 dark:text-stone-400">{app.email}</p>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant="outline" className="text-xs">
                        {app.membershipType.name}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-stone-600 dark:text-stone-400">
                      {formatDate(app.submittedAt)}
                    </td>
                    <td className="px-4 py-3 text-stone-600 dark:text-stone-400">
                      {app.sponsor ? `${app.sponsor.firstName} ${app.sponsor.lastName}` : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <ApplicationStatusBadge status={app.status} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        {getActionButton(app)}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleView(app)}>
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                            {app.status !== 'WITHDRAWN' && app.status !== 'REJECTED' && app.status !== 'APPROVED' && (
                              <DropdownMenuItem
                                onClick={() => handleWithdraw(app)}
                                className="text-red-600"
                              >
                                <XCircle className="mr-2 h-4 w-4" />
                                Withdraw
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {applications.length > 0 && (
          <div className="flex items-center justify-between border-t border-stone-100 dark:border-stone-700 px-4 py-3">
            <p className="text-sm text-stone-500 dark:text-stone-400">
              Showing {applications.length} of {data?.applications?.totalCount ?? 0} applications
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={!data?.applications?.pageInfo?.hasPreviousPage}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={!data?.applications?.pageInfo?.hasNextPage}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
