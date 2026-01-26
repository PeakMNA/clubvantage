'use client';

import { cn } from '@clubvantage/ui';
import { AlertTriangle, User, ExternalLink } from 'lucide-react';
import { Button } from '@clubvantage/ui/primitives/button';

export interface SuspendedMemberWarningProps {
  /** Member information */
  member: {
    name: string;
    number: string;
    photoUrl?: string;
    suspensionReason: string;
  };
  /** Callback when "View Member Profile" is clicked */
  onViewProfile: () => void;
  /** Additional class names */
  className?: string;
}

/**
 * SuspendedMemberWarning
 *
 * Warning card shown when a suspended member is found during check-in
 * or booking creation. Member cannot proceed with booking or check-in
 * until account is resolved.
 *
 * Features:
 * - High-visibility red styling
 * - Member photo and details
 * - Clear explanation of restriction
 * - Link to member profile for resolution
 */
export function SuspendedMemberWarning({
  member,
  onViewProfile,
  className,
}: SuspendedMemberWarningProps) {
  return (
    <div
      className={cn(
        'w-full rounded-lg border-2 border-red-500 bg-red-50 p-6 dark:bg-red-500/10',
        className
      )}
      role="alert"
      aria-live="assertive"
    >
      {/* Header */}
      <div className="flex items-center gap-2">
        <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
        <h3 className="text-sm font-bold uppercase tracking-wide text-red-600 dark:text-red-400">
          MEMBER SUSPENDED
        </h3>
      </div>

      {/* Member Info */}
      <div className="mt-4 flex items-center gap-4">
        {/* Avatar */}
        {member.photoUrl ? (
          <img
            src={member.photoUrl}
            alt=""
            className="h-16 w-16 rounded-full object-cover ring-2 ring-red-300 dark:ring-red-500/50"
          />
        ) : (
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100 ring-2 ring-red-300 dark:bg-red-500/20 dark:ring-red-500/50">
            <User className="h-8 w-8 text-red-500 dark:text-red-400" />
          </div>
        )}

        {/* Details */}
        <div>
          <p className="text-lg font-semibold text-red-900 dark:text-red-100">
            {member.name}
          </p>
          <p className="text-sm text-red-700 dark:text-red-300">
            {member.number}
          </p>
          <p className="mt-1 text-sm font-medium text-red-600 dark:text-red-400">
            Reason: {member.suspensionReason}
          </p>
        </div>
      </div>

      {/* Message */}
      <div className="mt-4 rounded-md bg-red-100 p-3 dark:bg-red-500/20">
        <p className="text-sm text-red-800 dark:text-red-200">
          This member cannot check in or make new bookings until their account
          is resolved. Please direct them to the membership office or resolve
          the issue in their profile.
        </p>
      </div>

      {/* Action */}
      <div className="mt-4">
        <Button
          variant="outline"
          onClick={onViewProfile}
          className="border-red-300 text-red-700 hover:bg-red-100 dark:border-red-500/50 dark:text-red-300 dark:hover:bg-red-500/20"
        >
          <ExternalLink className="mr-2 h-4 w-4" />
          View Member Profile
        </Button>
      </div>
    </div>
  );
}

/**
 * SuspendedMemberBanner
 *
 * A smaller banner version for inline use within forms or panels.
 */
export function SuspendedMemberBanner({
  memberName,
  reason,
  className,
}: {
  memberName: string;
  reason: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'flex items-center gap-3 rounded-lg border border-red-300 bg-red-50 px-4 py-3 dark:border-red-500/30 dark:bg-red-500/10',
        className
      )}
      role="alert"
    >
      <AlertTriangle className="h-5 w-5 shrink-0 text-red-500 dark:text-red-400" />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-red-800 dark:text-red-200">
          {memberName} is suspended
        </p>
        <p className="text-xs text-red-600 dark:text-red-400">{reason}</p>
      </div>
    </div>
  );
}

/**
 * SuspendedMemberInlineAlert
 *
 * A minimal inline alert for tight spaces.
 */
export function SuspendedMemberInlineAlert({
  className,
}: {
  className?: string;
}) {
  return (
    <div
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-700 dark:bg-red-500/20 dark:text-red-300',
        className
      )}
      role="alert"
    >
      <AlertTriangle className="h-3 w-3" />
      <span>Account Suspended</span>
    </div>
  );
}
