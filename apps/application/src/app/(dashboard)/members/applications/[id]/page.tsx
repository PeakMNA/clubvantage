'use client';

import { useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft,
  FileText,
  Check,
  X,
  AlertCircle,
  Send,
  UserPlus,
  MessageSquare,
  Loader2,
} from 'lucide-react';

import {
  PageHeader,
  Button,
  Badge,
} from '@clubvantage/ui';

import {
  useGetApplicationQuery,
  useChangeApplicationStatusMutation,
  type ApplicationStatus,
} from '@clubvantage/api-client';

import { ApplicationTimeline } from '@/components/members/application-timeline';
import { ConfirmationDialog } from '@/components/members/confirmation-dialog';

// Status badge configuration
const statusConfig: Record<
  ApplicationStatus,
  { label: string; className: string }
> = {
  SUBMITTED: { label: 'Submitted', className: 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-500/20 dark:text-blue-400 dark:border-blue-500/30' },
  UNDER_REVIEW: { label: 'Under Review', className: 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-500/20 dark:text-amber-400 dark:border-amber-500/30' },
  PENDING_BOARD: { label: 'Pending Board', className: 'bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-500/20 dark:text-purple-400 dark:border-purple-500/30' },
  APPROVED: { label: 'Approved', className: 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-400 dark:border-emerald-500/30' },
  REJECTED: { label: 'Rejected', className: 'bg-red-100 text-red-700 border-red-200 dark:bg-red-500/20 dark:text-red-400 dark:border-red-500/30' },
  WITHDRAWN: { label: 'Withdrawn', className: 'bg-stone-100 text-stone-600 border-stone-200 dark:bg-stone-800 dark:text-stone-400 dark:border-stone-700' },
};

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export default function ApplicationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const applicationId = params.id as string;

  const [noteText, setNoteText] = useState('');

  // Fetch application from API
  const { data, isLoading, error } = useGetApplicationQuery(
    { id: applicationId },
    { staleTime: 30000 }
  );
  const application = data?.application;

  // Status change mutation
  const { mutateAsync: changeStatus, isPending: isChangingStatus } = useChangeApplicationStatusMutation();

  // Confirmation dialog state
  const [confirmationDialog, setConfirmationDialog] = useState<{
    open: boolean;
    action: 'beginReview' | 'submitToBoard' | 'approve' | 'reject' | null;
  }>({ open: false, action: null });

  // Handlers
  const handleBeginReview = useCallback(() => {
    setConfirmationDialog({ open: true, action: 'beginReview' });
  }, []);

  const handleRequestInfo = useCallback(() => {
    // TODO: Open a modal to compose request message
    console.log('Request info for:', applicationId);
  }, [applicationId]);

  const handleSubmitToBoard = useCallback(() => {
    setConfirmationDialog({ open: true, action: 'submitToBoard' });
  }, []);

  const handleApprove = useCallback(() => {
    setConfirmationDialog({ open: true, action: 'approve' });
  }, []);

  const handleReject = useCallback(() => {
    setConfirmationDialog({ open: true, action: 'reject' });
  }, []);

  const handleCreateMember = useCallback(() => {
    router.push(`/members/new?from=${applicationId}`);
  }, [router, applicationId]);

  const handleAddNote = useCallback(() => {
    if (noteText.trim()) {
      // TODO: Call API to add note
      console.log('Add note:', noteText);
      setNoteText('');
    }
  }, [noteText]);

  const handleConfirmAction = useCallback(async () => {
    const { action } = confirmationDialog;
    if (!action) return;

    const statusMap: Record<string, ApplicationStatus> = {
      beginReview: 'UNDER_REVIEW',
      submitToBoard: 'PENDING_BOARD',
      approve: 'APPROVED',
      reject: 'REJECTED',
    };

    const newStatus = statusMap[action];
    if (!newStatus) return;

    await changeStatus({
      id: applicationId,
      input: { status: newStatus },
    });

    // Invalidate queries to refresh data
    queryClient.invalidateQueries({ queryKey: ['GetApplication'] });
    queryClient.invalidateQueries({ queryKey: ['GetApplications'] });
    queryClient.invalidateQueries({ queryKey: ['GetApplicationStats'] });
  }, [confirmationDialog, applicationId, changeStatus, queryClient]);

  // Get confirmation dialog content based on action
  const getConfirmationContent = useCallback(() => {
    const { action } = confirmationDialog;
    const name = application ? `${application.firstName} ${application.lastName}` : '';

    switch (action) {
      case 'beginReview':
        return {
          title: 'Begin Review',
          description: `Are you sure you want to begin reviewing ${name}'s application? This will change the status to "Under Review".`,
          variant: 'info' as const,
          confirmLabel: 'Begin Review',
        };
      case 'submitToBoard':
        return {
          title: 'Submit to Board',
          description: `Are you sure you want to submit ${name}'s application to the board for approval?`,
          variant: 'warning' as const,
          confirmLabel: 'Submit to Board',
        };
      case 'approve':
        return {
          title: 'Approve Application',
          description: `Are you sure you want to approve ${name}'s membership application? They will be able to become a member.`,
          variant: 'success' as const,
          confirmLabel: 'Approve',
        };
      case 'reject':
        return {
          title: 'Reject Application',
          description: `Are you sure you want to reject ${name}'s membership application? This action cannot be undone.`,
          variant: 'danger' as const,
          confirmLabel: 'Reject',
        };
      default:
        return {
          title: '',
          description: '',
          variant: 'info' as const,
          confirmLabel: 'Confirm',
        };
    }
  }, [confirmationDialog, application]);

  // Action bar based on status
  const renderActionBar = () => {
    if (!application) return null;

    const status = application.status as ApplicationStatus;

    if (status === 'SUBMITTED') {
      return (
        <Button onClick={handleBeginReview}>
          <FileText className="mr-2 h-4 w-4" />
          Begin Review
        </Button>
      );
    }
    if (status === 'UNDER_REVIEW') {
      return (
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleRequestInfo}>
            <MessageSquare className="mr-2 h-4 w-4" />
            Request Info
          </Button>
          <Button onClick={handleSubmitToBoard}>
            <Send className="mr-2 h-4 w-4" />
            Submit to Board
          </Button>
        </div>
      );
    }
    if (status === 'PENDING_BOARD') {
      return (
        <div className="flex gap-2">
          <Button
            variant="default"
            className="bg-emerald-600 hover:bg-emerald-700"
            onClick={handleApprove}
          >
            <Check className="mr-2 h-4 w-4" />
            Approve
          </Button>
          <Button variant="destructive" onClick={handleReject}>
            <X className="mr-2 h-4 w-4" />
            Reject
          </Button>
        </div>
      );
    }
    if (status === 'APPROVED') {
      return (
        <Button onClick={handleCreateMember}>
          <UserPlus className="mr-2 h-4 w-4" />
          Create Member
        </Button>
      );
    }
    return null;
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
        <span className="ml-3 text-muted-foreground">Loading application...</span>
      </div>
    );
  }

  // Error or not found
  if (error || !application) {
    return (
      <div className="p-6">
        <div className="rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 p-12 text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-stone-300 dark:text-stone-600" />
          <p className="mt-2 text-stone-500 dark:text-stone-400">Application not found</p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => router.push('/members/applications')}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Applications
          </Button>
        </div>
      </div>
    );
  }

  const sponsorName = application.sponsor
    ? `${application.sponsor.firstName} ${application.sponsor.lastName}`
    : null;

  return (
    <div className="space-y-6 p-6">
      <PageHeader
        title=""
        breadcrumbs={[
          { label: 'Members', href: '/members' },
          { label: 'Applications', href: '/members/applications' },
          { label: `${application.firstName} ${application.lastName}` },
        ]}
        actions={
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={() => router.push('/members/applications')}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            {renderActionBar()}
          </div>
        }
      />

      {/* Application Timeline */}
      <div className="rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 p-6">
        <h3 className="mb-4 text-sm font-medium text-stone-700 dark:text-stone-300">Application Progress</h3>
        <ApplicationTimeline
          applicationStatus={application.status as ApplicationStatus}
          submittedDate={application.submittedAt}
          underReviewDate={application.reviewedAt ?? undefined}
          approvedDate={application.approvedAt ?? undefined}
          rejectedDate={application.rejectedAt ?? undefined}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Applicant Information */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 p-6">
            <h3 className="mb-4 text-base font-semibold text-stone-900 dark:text-stone-100">Applicant Information</h3>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="text-sm text-stone-500 dark:text-stone-400">Full Name</label>
                <p className="font-medium text-stone-900 dark:text-stone-100">
                  {application.firstName} {application.lastName}
                </p>
              </div>
              <div>
                <label className="text-sm text-stone-500 dark:text-stone-400">Email</label>
                <p className="font-medium text-stone-900 dark:text-stone-100">{application.email}</p>
              </div>
              <div>
                <label className="text-sm text-stone-500 dark:text-stone-400">Phone</label>
                <p className="font-medium text-stone-900 dark:text-stone-100">{application.phone || '—'}</p>
              </div>
              <div>
                <label className="text-sm text-stone-500 dark:text-stone-400">Requested Membership</label>
                <Badge variant="outline" className="mt-1">
                  {application.membershipType.name}
                </Badge>
              </div>
              <div>
                <label className="text-sm text-stone-500 dark:text-stone-400">Sponsor</label>
                <p className="font-medium text-stone-900 dark:text-stone-100">
                  {sponsorName || '—'}
                </p>
              </div>
              <div>
                <label className="text-sm text-stone-500 dark:text-stone-400">Submitted Date</label>
                <p className="font-medium text-stone-900 dark:text-stone-100">
                  {formatDate(application.submittedAt)}
                </p>
              </div>
              <div>
                <label className="text-sm text-stone-500 dark:text-stone-400">Application Number</label>
                <p className="font-medium text-stone-900 dark:text-stone-100">{application.applicationNumber}</p>
              </div>
              <div>
                <label className="text-sm text-stone-500 dark:text-stone-400">Status</label>
                <div className="mt-1">
                  <Badge className={statusConfig[application.status as ApplicationStatus]?.className}>
                    {statusConfig[application.status as ApplicationStatus]?.label || application.status}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Notes & Review History */}
        <div className="space-y-6">
          {/* Review Notes */}
          {application.reviewNotes && (
            <div className="rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 p-6">
              <h3 className="mb-4 text-base font-semibold text-stone-900 dark:text-stone-100">Review Notes</h3>
              <p className="text-sm text-stone-600 dark:text-stone-400">{application.reviewNotes}</p>
            </div>
          )}

          {/* Add Note Form */}
          <div className="rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 p-6">
            <h3 className="mb-4 text-base font-semibold text-stone-900 dark:text-stone-100">Notes</h3>
            <textarea
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder="Add a note..."
              rows={3}
              className="w-full rounded-md border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 px-3 py-2 text-sm text-stone-900 dark:text-stone-100 placeholder:text-stone-400 dark:placeholder:text-stone-500 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
            />
            <div className="mt-2 flex justify-end">
              <Button size="sm" onClick={handleAddNote} disabled={!noteText.trim()}>
                Add Note
              </Button>
            </div>
          </div>

          {/* Review History */}
          {(application.reviewedBy || application.approvedBy || application.rejectionReason) && (
            <div className="rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 p-6">
              <h3 className="mb-4 text-base font-semibold text-stone-900 dark:text-stone-100">Review History</h3>
              <div className="space-y-3 text-sm">
                {application.reviewedBy && (
                  <div>
                    <label className="text-stone-500 dark:text-stone-400">Reviewed By</label>
                    <p className="font-medium text-stone-900 dark:text-stone-100">{application.reviewedBy}</p>
                    {application.reviewedAt && (
                      <p className="text-stone-500 dark:text-stone-400">{formatDate(application.reviewedAt)}</p>
                    )}
                  </div>
                )}
                {application.approvedBy && (
                  <div>
                    <label className="text-stone-500 dark:text-stone-400">Approved By</label>
                    <p className="font-medium text-stone-900 dark:text-stone-100">{application.approvedBy}</p>
                    {application.approvedAt && (
                      <p className="text-stone-500 dark:text-stone-400">{formatDate(application.approvedAt)}</p>
                    )}
                  </div>
                )}
                {application.rejectionReason && (
                  <div>
                    <label className="text-stone-500 dark:text-stone-400">Rejection Reason</label>
                    <p className="font-medium text-red-600 dark:text-red-400">{application.rejectionReason}</p>
                    {application.rejectedAt && (
                      <p className="text-stone-500 dark:text-stone-400">{formatDate(application.rejectedAt)}</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Confirmation Dialog */}
      {confirmationDialog.action && (
        <ConfirmationDialog
          open={confirmationDialog.open}
          onOpenChange={(open) => setConfirmationDialog((prev) => ({ ...prev, open }))}
          title={getConfirmationContent().title}
          description={getConfirmationContent().description}
          variant={getConfirmationContent().variant}
          confirmLabel={getConfirmationContent().confirmLabel}
          onConfirm={handleConfirmAction}
          isLoading={isChangingStatus}
          requireReason={confirmationDialog.action === 'reject'}
          reasonLabel="Rejection Reason"
          reasonPlaceholder="Please provide a reason for rejecting this application..."
        />
      )}
    </div>
  );
}
