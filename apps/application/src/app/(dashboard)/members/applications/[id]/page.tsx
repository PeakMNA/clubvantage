'use client';

import { useMemo, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  FileText,
  Check,
  X,
  Clock,
  AlertCircle,
  Download,
  Send,
  UserPlus,
  MessageSquare,
} from 'lucide-react';

import {
  PageHeader,
  Button,
  Badge,
  Avatar,
  AvatarFallback,
} from '@clubvantage/ui';

// Direct imports to optimize bundle size (avoid barrel imports)
import { mockApplications } from '@/components/members/mock-data';
import { ApplicationTimeline } from '@/components/members/application-timeline';
import { ConfirmationDialog } from '@/components/members/confirmation-dialog';
import type { MembershipApplication, ApplicationStatus, DocumentStatus } from '@/components/members/types';

// Document status configuration
const docStatusConfig: Record<
  DocumentStatus,
  { label: string; icon: React.ComponentType<{ className?: string }>; className: string }
> = {
  PENDING: { label: 'Pending', icon: Clock, className: 'text-stone-500' },
  VERIFIED: { label: 'Verified', icon: Check, className: 'text-emerald-600' },
  REJECTED: { label: 'Rejected', icon: X, className: 'text-red-600' },
};

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatDateTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

function getInitials(firstName: string, lastName: string): string {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}

// Helper to get application by ID
function getApplicationById(id: string): MembershipApplication | undefined {
  return mockApplications.find((app) => app.id === id);
}

export default function ApplicationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const applicationId = params.id as string;

  const [noteText, setNoteText] = useState('');

  // Confirmation dialog state
  const [confirmationDialog, setConfirmationDialog] = useState<{
    open: boolean;
    action: 'beginReview' | 'submitToBoard' | 'approve' | 'reject' | 'verifyDoc' | 'rejectDoc' | null;
    docId?: string;
  }>({ open: false, action: null });

  const application = useMemo(() => getApplicationById(applicationId), [applicationId]);

  // Mock notes data
  const notes = [
    {
      id: '1',
      author: 'Sarah Johnson',
      date: '2024-01-14T10:30:00',
      content: 'Documents received. Beginning initial review.',
    },
    {
      id: '2',
      author: 'Michael Chen',
      date: '2024-01-15T14:15:00',
      content: 'ID verified against provided documents. All information matches.',
    },
  ];

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

  const handleVerifyDocument = useCallback((docId: string) => {
    setConfirmationDialog({ open: true, action: 'verifyDoc', docId });
  }, []);

  const handleRejectDocument = useCallback((docId: string) => {
    setConfirmationDialog({ open: true, action: 'rejectDoc', docId });
  }, []);

  const handleAddNote = useCallback(() => {
    if (noteText.trim()) {
      // TODO: Call API to add note
      console.log('Add note:', noteText);
      setNoteText('');
    }
  }, [noteText]);

  const handleConfirmAction = useCallback(async () => {
    const { action, docId } = confirmationDialog;

    switch (action) {
      case 'beginReview':
        // TODO: Call API to begin review
        console.log('Beginning review for:', applicationId);
        break;
      case 'submitToBoard':
        // TODO: Call API to submit to board
        console.log('Submitting to board:', applicationId);
        break;
      case 'approve':
        // TODO: Call API to approve application
        console.log('Approving application:', applicationId);
        break;
      case 'reject':
        // TODO: Call API to reject application
        console.log('Rejecting application:', applicationId);
        break;
      case 'verifyDoc':
        // TODO: Call API to verify document
        console.log('Verifying document:', docId);
        break;
      case 'rejectDoc':
        // TODO: Call API to reject document
        console.log('Rejecting document:', docId);
        break;
    }
    // Refresh data after action
  }, [confirmationDialog, applicationId]);

  // Get confirmation dialog content based on action
  const getConfirmationContent = useCallback(() => {
    const { action } = confirmationDialog;
    const name = application ? `${application.applicantFirstName} ${application.applicantLastName}` : '';

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
      case 'verifyDoc':
        return {
          title: 'Verify Document',
          description: 'Are you sure you want to mark this document as verified?',
          variant: 'success' as const,
          confirmLabel: 'Verify',
        };
      case 'rejectDoc':
        return {
          title: 'Reject Document',
          description: 'Are you sure you want to reject this document? The applicant may need to upload a new one.',
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

    const actions: Record<ApplicationStatus, React.ReactNode> = {
      SUBMITTED: (
        <Button onClick={handleBeginReview}>
          <FileText className="mr-2 h-4 w-4" />
          Begin Review
        </Button>
      ),
      UNDER_REVIEW: (
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
      ),
      PENDING_BOARD: (
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
      ),
      APPROVED: (
        <Button onClick={handleCreateMember}>
          <UserPlus className="mr-2 h-4 w-4" />
          Create Member
        </Button>
      ),
      REJECTED: null,
      WITHDRAWN: null,
    };

    return actions[application.status];
  };

  if (!application) {
    return (
      <div className="p-6">
        <div className="rounded-lg border border-stone-200 bg-white p-12 text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-stone-300" />
          <p className="mt-2 text-stone-500">Application not found</p>
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

  return (
    <div className="space-y-6 p-6">
      <PageHeader
        title=""
        breadcrumbs={[
          { label: 'Members', href: '/members' },
          { label: 'Applications', href: '/members/applications' },
          { label: `${application.applicantFirstName} ${application.applicantLastName}` },
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
      <div className="rounded-lg border border-stone-200 bg-white p-6">
        <h3 className="mb-4 text-sm font-medium text-stone-700">Application Progress</h3>
        <ApplicationTimeline applicationStatus={application.status} submittedDate={application.submittedDate} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Applicant Information */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-lg border border-stone-200 bg-white p-6">
            <h3 className="mb-4 text-base font-semibold text-stone-900">Applicant Information</h3>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="text-sm text-stone-500">Full Name</label>
                <p className="font-medium text-stone-900">
                  {application.applicantFirstName} {application.applicantLastName}
                </p>
              </div>
              <div>
                <label className="text-sm text-stone-500">Email</label>
                <p className="font-medium text-stone-900">{application.email}</p>
              </div>
              <div>
                <label className="text-sm text-stone-500">Phone</label>
                <p className="font-medium text-stone-900">{application.phone}</p>
              </div>
              <div>
                <label className="text-sm text-stone-500">Requested Membership</label>
                <Badge variant="outline" className="mt-1">
                  {application.requestedMembershipTypeName}
                </Badge>
              </div>
              <div>
                <label className="text-sm text-stone-500">Sponsor</label>
                <p className="font-medium text-stone-900">
                  {application.sponsorName || '—'}
                </p>
              </div>
              <div>
                <label className="text-sm text-stone-500">Submitted Date</label>
                <p className="font-medium text-stone-900">
                  {formatDate(application.submittedDate)}
                </p>
              </div>
            </div>
          </div>

          {/* Documents Section */}
          <div className="rounded-lg border border-stone-200 bg-white p-6">
            <h3 className="mb-4 text-base font-semibold text-stone-900">Documents</h3>
            {application.documents.length === 0 ? (
              <div className="py-8 text-center">
                <FileText className="mx-auto h-10 w-10 text-stone-300" />
                <p className="mt-2 text-sm text-stone-500">No documents uploaded</p>
              </div>
            ) : (
              <div className="divide-y divide-stone-100">
                {application.documents.map((doc) => {
                  const StatusIcon = docStatusConfig[doc.status].icon;
                  return (
                    <div
                      key={doc.id}
                      className="flex items-center justify-between py-3"
                    >
                      <div className="flex items-center gap-3">
                        <FileText className="h-8 w-8 text-stone-400" />
                        <div>
                          <p className="font-medium text-stone-900">{doc.fileName}</p>
                          <p className="text-sm text-stone-500">
                            {doc.type} • Uploaded {formatDate(doc.uploadedDate)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className={`flex items-center gap-1 ${docStatusConfig[doc.status].className}`}>
                          <StatusIcon className="h-4 w-4" />
                          <span className="text-sm">{docStatusConfig[doc.status].label}</span>
                        </div>
                        {doc.status === 'PENDING' && (
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-8 text-emerald-600 hover:text-emerald-700"
                              onClick={() => handleVerifyDocument(doc.id)}
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-8 text-red-600 hover:text-red-700"
                              onClick={() => handleRejectDocument(doc.id)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                        <Button size="sm" variant="ghost" className="h-8">
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Notes/Comments Section */}
        <div className="space-y-6">
          <div className="rounded-lg border border-stone-200 bg-white p-6">
            <h3 className="mb-4 text-base font-semibold text-stone-900">Notes & Comments</h3>
            <div className="space-y-4">
              {notes.length === 0 ? (
                <p className="py-4 text-center text-sm text-stone-500">No notes yet</p>
              ) : (
                notes.map((note) => (
                  <div key={note.id} className="rounded-lg bg-stone-50 p-3">
                    <div className="flex items-start gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-stone-200 text-xs">
                          {note.author.split(' ').map((n) => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-stone-900">
                            {note.author}
                          </span>
                          <span className="text-xs text-stone-500">
                            {formatDateTime(note.date)}
                          </span>
                        </div>
                        <p className="mt-1 text-sm text-stone-600">{note.content}</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Add Note Form */}
            <div className="mt-4 border-t border-stone-100 pt-4">
              <textarea
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                placeholder="Add a note..."
                rows={3}
                className="w-full rounded-md border border-stone-200 px-3 py-2 text-sm placeholder:text-stone-400 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
              <div className="mt-2 flex justify-end">
                <Button size="sm" onClick={handleAddNote} disabled={!noteText.trim()}>
                  Add Note
                </Button>
              </div>
            </div>
          </div>

          {/* Review Information */}
          {(application.reviewedBy || application.approvedBy || application.rejectedReason) && (
            <div className="rounded-lg border border-stone-200 bg-white p-6">
              <h3 className="mb-4 text-base font-semibold text-stone-900">Review History</h3>
              <div className="space-y-3 text-sm">
                {application.reviewedBy && (
                  <div>
                    <label className="text-stone-500">Reviewed By</label>
                    <p className="font-medium text-stone-900">{application.reviewedBy}</p>
                    {application.reviewedDate && (
                      <p className="text-stone-500">{formatDate(application.reviewedDate)}</p>
                    )}
                  </div>
                )}
                {application.approvedBy && (
                  <div>
                    <label className="text-stone-500">Approved By</label>
                    <p className="font-medium text-stone-900">{application.approvedBy}</p>
                    {application.approvedDate && (
                      <p className="text-stone-500">{formatDate(application.approvedDate)}</p>
                    )}
                  </div>
                )}
                {application.rejectedReason && (
                  <div>
                    <label className="text-stone-500">Rejection Reason</label>
                    <p className="font-medium text-red-600">{application.rejectedReason}</p>
                    {application.rejectedDate && (
                      <p className="text-stone-500">{formatDate(application.rejectedDate)}</p>
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
          requireReason={confirmationDialog.action === 'reject'}
          reasonLabel="Rejection Reason"
          reasonPlaceholder="Please provide a reason for rejecting this application..."
        />
      )}
    </div>
  );
}
