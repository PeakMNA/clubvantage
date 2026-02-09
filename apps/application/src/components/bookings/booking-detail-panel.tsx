'use client';

import { useEffect, useState, useCallback } from 'react';
import { cn, Button, Badge } from '@clubvantage/ui';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@clubvantage/ui';
import {
  ArrowLeft,
  MoreVertical,
  Calendar,
  Clock,
  User,
  MapPin,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  AlertCircle,
  X,
  Sparkles,
  Copy,
  Check,
  CreditCard,
  Wallet,
  FileText,
  History,
  MessageSquare,
  Plus,
  Loader2,
  Phone,
  Mail,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@clubvantage/ui';
import { BookingStatusBadge } from './booking-status-badge';
import { DeleteConfirmDialog } from './delete-confirm-dialog';
import type { BookingStatus } from './types';

interface PriceModifier {
  label: string;
  amount: number;
}

interface MemberRecentBooking {
  id: string;
  serviceName: string;
  date: Date;
  status: 'COMPLETED' | 'CANCELLED' | 'NO_SHOW';
}

interface BookingMember {
  name: string;
  number: string;
  photoUrl?: string;
  status: 'ACTIVE' | 'SUSPENDED';
  email?: string;
  phone?: string;
  balance?: number;
  totalBookings?: number;
  noShowCount?: number;
  recentBookings?: MemberRecentBooking[];
}

export interface BookingPayment {
  method?: 'credit_card' | 'account' | 'cash' | 'transfer';
  status: 'pending' | 'paid' | 'partial' | 'refunded';
  amountPaid?: number;
  lastFour?: string; // Last 4 digits of card if applicable
}

export interface BookingNote {
  id: string;
  text: string;
  createdAt: Date;
  createdBy: string;
}

interface BookingService {
  name: string;
  duration: number;
}

interface BookingPricing {
  base: number;
  modifiers: PriceModifier[];
  total: number;
}

interface BookingDetail {
  id: string;
  member: BookingMember;
  service: BookingService;
  date: Date;
  startTime: string;
  endTime: string;
  staff?: { name: string };
  facility?: { name: string };
  pricing: BookingPricing;
  payment?: BookingPayment;
  notes?: BookingNote[];
  status: BookingStatus;
  createdAt: Date;
  createdBy: string;
}

export interface BookingDetailPanelProps {
  booking: BookingDetail | null;
  isOpen: boolean;
  onClose: () => void;
  onCheckIn?: () => void;
  onModify?: () => void;
  onCancel?: () => Promise<void>;
  onEdit?: () => void;
  onAddNote?: (note: string) => Promise<void>;
  onViewMemberHistory?: (memberId: string) => void;
  className?: string;
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('th-TH', {
    style: 'currency',
    currency: 'THB',
    minimumFractionDigits: 0,
  }).format(amount);
}

function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatTimestamp(date: Date): string {
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

/**
 * BookingDetailPanel
 *
 * Slide-out panel showing complete booking information and actions.
 * Slides in from the right on desktop, appears as bottom sheet on mobile.
 */
export function BookingDetailPanel({
  booking,
  isOpen,
  onClose,
  onCheckIn,
  onModify,
  onCancel,
  onEdit,
  onAddNote,
  onViewMemberHistory,
  className,
}: BookingDetailPanelProps) {
  const [isPriceExpanded, setIsPriceExpanded] = useState(false);
  const [isNotesExpanded, setIsNotesExpanded] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [copiedId, setCopiedId] = useState(false);

  // Copy booking ID to clipboard
  const handleCopyId = useCallback(async () => {
    if (!booking?.id) return;
    try {
      await navigator.clipboard.writeText(booking.id);
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  }, [booking?.id]);

  // Handle cancel with confirmation
  const handleCancelConfirm = useCallback(async () => {
    if (onCancel) {
      await onCancel();
    }
    setShowCancelConfirm(false);
  }, [onCancel]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Prevent body scroll when panel is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleBackdropClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) {
        onClose();
      }
    },
    [onClose]
  );

  if (!booking) return null;

  const isMemberSuspended = booking.member.status === 'SUSPENDED';
  const canCheckIn =
    booking.status === 'CONFIRMED' && !isMemberSuspended;

  return (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          'fixed inset-0 z-40 bg-black/50 transition-opacity duration-300',
          isOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
        )}
        onClick={handleBackdropClick}
        aria-hidden="true"
      />

      {/* Panel - Desktop: right slide, Mobile: bottom sheet */}
      <div
        className={cn(
          'fixed z-50 bg-card shadow-xl transition-transform duration-300 ease-out',
          // Desktop: right panel
          'right-0 top-0 hidden h-full w-[400px] border-l border-border md:block',
          isOpen ? 'translate-x-0' : 'translate-x-full',
          // Mobile: bottom sheet
          'md:translate-y-0',
          className
        )}
        role="dialog"
        aria-modal="true"
        aria-label="Booking details"
      >
        <PanelContent
          booking={booking}
          onClose={onClose}
          onCheckIn={onCheckIn}
          onModify={onModify}
          onCancelClick={() => setShowCancelConfirm(true)}
          onEdit={onEdit}
          onAddNote={onAddNote}
          onViewMemberHistory={onViewMemberHistory}
          onCopyId={handleCopyId}
          copiedId={copiedId}
          isPriceExpanded={isPriceExpanded}
          setIsPriceExpanded={setIsPriceExpanded}
          isNotesExpanded={isNotesExpanded}
          setIsNotesExpanded={setIsNotesExpanded}
          canCheckIn={canCheckIn}
          isMemberSuspended={isMemberSuspended}
        />
      </div>

      {/* Mobile: Bottom Sheet */}
      <div
        className={cn(
          'fixed inset-x-0 bottom-0 z-50 max-h-[90vh] overflow-hidden rounded-t-2xl bg-card shadow-xl transition-transform duration-300 ease-out md:hidden',
          isOpen ? 'translate-y-0' : 'translate-y-full'
        )}
        role="dialog"
        aria-modal="true"
        aria-label="Booking details"
      >
        {/* Drag handle */}
        <div className="flex justify-center py-2">
          <div className="h-1.5 w-12 rounded-full bg-muted" />
        </div>
        <PanelContent
          booking={booking}
          onClose={onClose}
          onCheckIn={onCheckIn}
          onModify={onModify}
          onCancelClick={() => setShowCancelConfirm(true)}
          onEdit={onEdit}
          onAddNote={onAddNote}
          onViewMemberHistory={onViewMemberHistory}
          onCopyId={handleCopyId}
          copiedId={copiedId}
          isPriceExpanded={isPriceExpanded}
          setIsPriceExpanded={setIsPriceExpanded}
          isNotesExpanded={isNotesExpanded}
          setIsNotesExpanded={setIsNotesExpanded}
          canCheckIn={canCheckIn}
          isMemberSuspended={isMemberSuspended}
          isMobile
        />
      </div>

      {/* Cancel Confirmation Dialog */}
      <DeleteConfirmDialog
        isOpen={showCancelConfirm}
        onClose={() => setShowCancelConfirm(false)}
        onConfirm={handleCancelConfirm}
        title="Cancel Booking?"
        itemName={booking?.service.name}
        itemType="booking"
        warningMessage={`This will cancel the booking for ${booking?.member.name} on ${booking ? formatDate(booking.date) : ''}.`}
      />
    </>
  );
}

interface PanelContentProps {
  booking: BookingDetail;
  onClose: () => void;
  onCheckIn?: () => void;
  onModify?: () => void;
  onCancelClick: () => void;
  onEdit?: () => void;
  onAddNote?: (note: string) => Promise<void>;
  onViewMemberHistory?: (memberId: string) => void;
  onCopyId: () => void;
  copiedId: boolean;
  isPriceExpanded: boolean;
  setIsPriceExpanded: (expanded: boolean) => void;
  isNotesExpanded: boolean;
  setIsNotesExpanded: (expanded: boolean) => void;
  canCheckIn: boolean;
  isMemberSuspended: boolean;
  isMobile?: boolean;
}

function PanelContent({
  booking,
  onClose,
  onCheckIn,
  onModify,
  onCancelClick,
  onEdit,
  onAddNote,
  onViewMemberHistory,
  onCopyId,
  copiedId,
  isPriceExpanded,
  setIsPriceExpanded,
  isNotesExpanded,
  setIsNotesExpanded,
  canCheckIn,
  isMemberSuspended,
  isMobile = false,
}: PanelContentProps) {
  const [newNote, setNewNote] = useState('');
  const [isAddingNote, setIsAddingNote] = useState(false);

  const handleAddNote = async () => {
    if (!newNote.trim() || !onAddNote) return;
    setIsAddingNote(true);
    try {
      await onAddNote(newNote.trim());
      setNewNote('');
    } finally {
      setIsAddingNote(false);
    }
  };

  const getPaymentMethodIcon = (method?: BookingPayment['method']) => {
    switch (method) {
      case 'credit_card':
        return <CreditCard className="h-4 w-4" />;
      case 'account':
        return <Wallet className="h-4 w-4" />;
      default:
        return <CreditCard className="h-4 w-4" />;
    }
  };

  const getPaymentStatusColor = (status: BookingPayment['status']) => {
    switch (status) {
      case 'paid':
        return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400';
      case 'pending':
        return 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400';
      case 'partial':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400';
      case 'refunded':
        return 'bg-stone-100 text-stone-700 dark:bg-stone-500/20 dark:text-stone-400';
      default:
        return 'bg-stone-100 text-stone-700';
    }
  };

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex shrink-0 items-center justify-between border-b border-border px-4 py-3">
        <button
          type="button"
          onClick={onClose}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          aria-label="Close panel"
        >
          {isMobile ? (
            <X className="h-5 w-5" />
          ) : (
            <ArrowLeft className="h-5 w-5" />
          )}
        </button>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={onEdit}>
            Edit
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-9 w-9">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onModify}>
                Reschedule
              </DropdownMenuItem>
              <DropdownMenuItem>Send Reminder</DropdownMenuItem>
              <DropdownMenuItem>View History</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Booking ID */}
      <div className="flex items-center justify-between border-b border-border px-4 py-2 bg-muted/30">
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Booking ID:</span>
          <code className="font-mono text-sm text-foreground">{booking.id}</code>
        </div>
        <button
          type="button"
          onClick={onCopyId}
          className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          aria-label="Copy booking ID"
        >
          {copiedId ? (
            <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          ) : (
            <Copy className="h-4 w-4" />
          )}
        </button>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto">
        {/* Suspended member warning */}
        {isMemberSuspended && (
          <div className="mx-4 mt-4 flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2 dark:bg-red-500/10">
            <AlertTriangle className="h-4 w-4 shrink-0 text-red-600 dark:text-red-400" />
            <p className="text-sm text-red-700 dark:text-red-400">
              Member account is suspended. Check-in disabled.
            </p>
          </div>
        )}

        {/* Member Section */}
        <div className="border-b border-border p-4">
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12">
              <AvatarImage
                src={booking.member.photoUrl}
                alt={booking.member.name}
              />
              <AvatarFallback className="bg-muted text-muted-foreground">
                {getInitials(booking.member.name)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h3 className="truncate text-base font-semibold text-foreground">
                  {booking.member.name}
                </h3>
                <Badge
                  className={cn(
                    'shrink-0 text-xs',
                    booking.member.status === 'ACTIVE'
                      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400'
                      : 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400'
                  )}
                >
                  {booking.member.status}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                {booking.member.number}
              </p>
              {/* Contact info */}
              {(booking.member.email || booking.member.phone) && (
                <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
                  {booking.member.email && (
                    <a
                      href={`mailto:${booking.member.email}`}
                      className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                    >
                      <Mail className="h-3 w-3" />
                      {booking.member.email}
                    </a>
                  )}
                  {booking.member.phone && (
                    <a
                      href={`tel:${booking.member.phone}`}
                      className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                    >
                      <Phone className="h-3 w-3" />
                      {booking.member.phone}
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Member Stats */}
          {(booking.member.balance !== undefined || booking.member.totalBookings !== undefined || booking.member.noShowCount !== undefined) && (
            <div className="mt-3 flex items-center justify-between rounded-lg bg-muted/50 px-3 py-2">
              <div className="flex items-center gap-4">
                {booking.member.balance !== undefined && (
                  <div>
                    <p className="text-xs text-muted-foreground">Balance</p>
                    <p className={cn(
                      'text-sm font-medium',
                      booking.member.balance < 0
                        ? 'text-red-600 dark:text-red-400'
                        : 'text-foreground'
                    )}>
                      {formatCurrency(booking.member.balance)}
                    </p>
                  </div>
                )}
                {booking.member.totalBookings !== undefined && (
                  <div>
                    <p className="text-xs text-muted-foreground">Total Bookings</p>
                    <p className="text-sm font-medium text-foreground">
                      {booking.member.totalBookings}
                    </p>
                  </div>
                )}
                {booking.member.noShowCount !== undefined && booking.member.noShowCount > 0 && (
                  <div>
                    <p className="text-xs text-muted-foreground">No-shows</p>
                    <p className="flex items-center gap-1 text-sm font-medium text-red-600 dark:text-red-400">
                      <AlertCircle className="h-3 w-3" />
                      {booking.member.noShowCount}
                    </p>
                  </div>
                )}
              </div>
              {onViewMemberHistory && (
                <button
                  type="button"
                  onClick={() => onViewMemberHistory(booking.member.number)}
                  className="flex items-center gap-1 text-xs text-amber-600 hover:text-amber-700 dark:text-amber-400 dark:hover:text-amber-300"
                >
                  <History className="h-3.5 w-3.5" />
                  History
                </button>
              )}
            </div>
          )}

          {/* Recent Bookings */}
          {booking.member.recentBookings && booking.member.recentBookings.length > 0 && (
            <div className="mt-3">
              <p className="mb-2 text-xs font-medium text-muted-foreground">Last 5 Bookings</p>
              <div className="space-y-1.5">
                {booking.member.recentBookings.slice(0, 5).map((recent) => (
                  <div
                    key={recent.id}
                    className="flex items-center justify-between rounded bg-muted/30 px-2 py-1.5 text-xs"
                  >
                    <span className="truncate text-foreground">{recent.serviceName}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">
                        {formatDate(recent.date)}
                      </span>
                      <span
                        className={cn(
                          'capitalize',
                          recent.status === 'COMPLETED' && 'text-emerald-600 dark:text-emerald-400',
                          recent.status === 'CANCELLED' && 'text-muted-foreground',
                          recent.status === 'NO_SHOW' && 'text-red-600 dark:text-red-400'
                        )}
                      >
                        {recent.status === 'NO_SHOW' ? 'No-show' : recent.status === 'COMPLETED' ? 'Completed' : recent.status === 'CANCELLED' ? 'Cancelled' : recent.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Booking Details Section */}
        <div className="border-b border-border p-4">
          <h4 className="mb-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Booking Details
          </h4>
          <div className="space-y-3">
            <DetailRow
              icon={<Sparkles className="h-4 w-4" />}
              label="Service"
              value={`${booking.service.name} (${booking.service.duration} min)`}
            />
            <DetailRow
              icon={<Calendar className="h-4 w-4" />}
              label="Date"
              value={formatDate(booking.date)}
            />
            <DetailRow
              icon={<Clock className="h-4 w-4" />}
              label="Time"
              value={`${booking.startTime} - ${booking.endTime}`}
            />
            {booking.staff && (
              <DetailRow
                icon={<User className="h-4 w-4" />}
                label="Staff"
                value={booking.staff.name}
              />
            )}
            {booking.facility && (
              <DetailRow
                icon={<MapPin className="h-4 w-4" />}
                label="Location"
                value={booking.facility.name}
              />
            )}
          </div>
        </div>

        {/* Price Breakdown Section */}
        <div className="border-b border-border">
          <button
            type="button"
            onClick={() => setIsPriceExpanded(!isPriceExpanded)}
            className="flex w-full items-center justify-between p-4 text-left transition-colors hover:bg-muted/50"
          >
            <div>
              <h4 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Price Breakdown
              </h4>
              {!isPriceExpanded && (
                <p className="mt-1 text-lg font-semibold text-foreground">
                  {formatCurrency(booking.pricing.total)}
                </p>
              )}
            </div>
            {isPriceExpanded ? (
              <ChevronUp className="h-5 w-5 text-muted-foreground" />
            ) : (
              <ChevronDown className="h-5 w-5 text-muted-foreground" />
            )}
          </button>

          {isPriceExpanded && (
            <div className="px-4 pb-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Base price</span>
                  <span className="text-foreground">
                    {formatCurrency(booking.pricing.base)}
                  </span>
                </div>
                {booking.pricing.modifiers.map((modifier, index) => (
                  <div key={index} className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      {modifier.label}
                    </span>
                    <span
                      className={cn(
                        modifier.amount < 0
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : 'text-foreground'
                      )}
                    >
                      {modifier.amount < 0 ? '' : '+'}
                      {formatCurrency(modifier.amount)}
                    </span>
                  </div>
                ))}
                <div className="my-2 border-t border-border" />
                <div className="flex justify-between">
                  <span className="font-semibold text-foreground">Total</span>
                  <span className="text-lg font-semibold text-foreground">
                    {formatCurrency(booking.pricing.total)}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Payment Section */}
        {booking.payment && (
          <div className="border-b border-border p-4">
            <h4 className="mb-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Payment
            </h4>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {getPaymentMethodIcon(booking.payment.method)}
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {booking.payment.method === 'credit_card' && booking.payment.lastFour
                      ? `Card ending in ${booking.payment.lastFour}`
                      : booking.payment.method === 'account'
                        ? 'Charge to Account'
                        : booking.payment.method === 'cash'
                          ? 'Cash'
                          : booking.payment.method === 'transfer'
                            ? 'Bank Transfer'
                            : 'Payment Method'}
                  </p>
                  {booking.payment.amountPaid !== undefined && booking.payment.status === 'partial' && (
                    <p className="text-xs text-muted-foreground">
                      {formatCurrency(booking.payment.amountPaid)} of {formatCurrency(booking.pricing.total)} paid
                    </p>
                  )}
                </div>
              </div>
              <Badge className={cn('text-xs capitalize', getPaymentStatusColor(booking.payment.status))}>
                {booking.payment.status}
              </Badge>
            </div>
          </div>
        )}

        {/* Notes Section */}
        <div className="border-b border-border">
          <button
            type="button"
            onClick={() => setIsNotesExpanded(!isNotesExpanded)}
            className="flex w-full items-center justify-between p-4 text-left transition-colors hover:bg-muted/50"
          >
            <div className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
              <h4 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Notes
              </h4>
              {booking.notes && booking.notes.length > 0 && (
                <Badge variant="secondary" className="text-xs">
                  {booking.notes.length}
                </Badge>
              )}
            </div>
            {isNotesExpanded ? (
              <ChevronUp className="h-5 w-5 text-muted-foreground" />
            ) : (
              <ChevronDown className="h-5 w-5 text-muted-foreground" />
            )}
          </button>

          {isNotesExpanded && (
            <div className="px-4 pb-4">
              {/* Existing notes */}
              {booking.notes && booking.notes.length > 0 ? (
                <div className="mb-3 space-y-2">
                  {booking.notes.map((note) => (
                    <div
                      key={note.id}
                      className="rounded-lg bg-muted/50 p-3"
                    >
                      <p className="text-sm text-foreground">{note.text}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {formatTimestamp(note.createdAt)} by {note.createdBy}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mb-3 text-sm text-muted-foreground">No notes yet</p>
              )}

              {/* Add new note */}
              {onAddNote && (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    placeholder="Add a note..."
                    className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-1"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleAddNote();
                      }
                    }}
                  />
                  <Button
                    size="sm"
                    onClick={handleAddNote}
                    disabled={!newNote.trim() || isAddingNote}
                  >
                    {isAddingNote ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Plus className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Status Section */}
        <div className="p-4">
          <h4 className="mb-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Status
          </h4>
          <div className="flex items-center justify-between">
            <BookingStatusBadge status={booking.status} size="md" />
            <p className="text-xs text-muted-foreground">
              {formatTimestamp(booking.createdAt)} by {booking.createdBy}
            </p>
          </div>
        </div>
      </div>

      {/* Actions Footer */}
      <div className="shrink-0 border-t border-border bg-card p-4">
        <div className="space-y-3">
          {/* Primary action */}
          <Button
            className="w-full"
            size="lg"
            onClick={onCheckIn}
            disabled={!canCheckIn}
          >
            Check In
          </Button>

          {/* Secondary actions */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={onModify}
            >
              Modify
            </Button>
            <Button
              variant="outline"
              className="flex-1 text-red-600 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-500/10 dark:hover:text-red-300"
              onClick={onCancelClick}
            >
              Cancel Booking
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

interface DetailRowProps {
  icon: React.ReactNode;
  label: string;
  value: string;
}

function DetailRow({ icon, label, value }: DetailRowProps) {
  return (
    <div className="flex items-start gap-3">
      <span className="mt-0.5 text-muted-foreground">{icon}</span>
      <div className="min-w-0 flex-1">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-medium text-foreground">{value}</p>
      </div>
    </div>
  );
}

/**
 * BookingDetailPanelSkeleton
 *
 * Loading skeleton for the booking detail panel.
 */
export function BookingDetailPanelSkeleton() {
  return (
    <div className="flex h-full flex-col">
      {/* Header skeleton */}
      <div className="flex shrink-0 items-center justify-between border-b border-border px-4 py-3">
        <div className="h-9 w-9 animate-pulse rounded-lg bg-muted" />
        <div className="flex items-center gap-2">
          <div className="h-9 w-16 animate-pulse rounded-lg bg-muted" />
          <div className="h-9 w-9 animate-pulse rounded-lg bg-muted" />
        </div>
      </div>

      {/* Content skeleton */}
      <div className="flex-1 overflow-hidden">
        {/* Member section */}
        <div className="border-b border-border p-4">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 animate-pulse rounded-full bg-muted" />
            <div className="flex-1 space-y-2">
              <div className="h-5 w-32 animate-pulse rounded bg-muted" />
              <div className="h-4 w-20 animate-pulse rounded bg-muted" />
            </div>
          </div>
        </div>

        {/* Details section */}
        <div className="border-b border-border p-4">
          <div className="mb-3 h-3 w-24 animate-pulse rounded bg-muted" />
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="h-4 w-4 animate-pulse rounded bg-muted" />
                <div className="flex-1 space-y-1">
                  <div className="h-3 w-12 animate-pulse rounded bg-muted" />
                  <div className="h-4 w-32 animate-pulse rounded bg-muted" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Actions skeleton */}
      <div className="shrink-0 border-t border-border p-4">
        <div className="h-11 w-full animate-pulse rounded-xl bg-muted" />
        <div className="mt-3 flex gap-2">
          <div className="h-10 flex-1 animate-pulse rounded-xl bg-muted" />
          <div className="h-10 flex-1 animate-pulse rounded-xl bg-muted" />
        </div>
      </div>
    </div>
  );
}
