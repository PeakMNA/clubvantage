'use client'

import { useState } from 'react'
import Link from 'next/link'
import { cn } from '@clubvantage/ui'
import { Button } from '@clubvantage/ui'
import { X, ZoomIn, ZoomOut, RotateCcw, ExternalLink, FileText, CheckCircle } from 'lucide-react'
import { WhtStatusBadge, type WhtStatus } from './wht-status-badge'

export interface WhtCertificateDetail {
  id: string
  certificateNumber: string
  amount: number
  rate: string
  date: Date | string
  memberId: string
  memberName: string
  receiptId: string
  receiptNumber: string
  status: WhtStatus
  documentUrl?: string
  verifiedBy?: string
  verifiedAt?: Date | string
  rejectionReason?: string
}

interface WhtVerificationPanelProps {
  /** Certificate data to display */
  certificate: WhtCertificateDetail
  /** Whether panel is open */
  isOpen: boolean
  /** Current user name for verification */
  currentUserName: string
  /** Loading state for actions */
  isSubmitting?: boolean
  /** Callback when panel should close */
  onClose: () => void
  /** Callback when certificate is verified */
  onVerify: (certificateId: string, notes?: string) => void
  /** Callback when certificate is rejected */
  onReject: (certificateId: string, reason: string) => void
  /** Additional class names */
  className?: string
}

function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('th-TH', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function WhtVerificationPanel({
  certificate,
  isOpen,
  currentUserName,
  isSubmitting = false,
  onClose,
  onVerify,
  onReject,
  className,
}: WhtVerificationPanelProps) {
  const [notes, setNotes] = useState('')
  const [isRejecting, setIsRejecting] = useState(false)
  const [rejectionReason, setRejectionReason] = useState('')
  const [zoomLevel, setZoomLevel] = useState(100)
  const [showSuccess, setShowSuccess] = useState(false)

  const isPending = certificate.status === 'pending'
  const isVerified = certificate.status === 'verified'
  const isRejected = certificate.status === 'rejected'

  const handleZoomIn = () => setZoomLevel((z) => Math.min(z + 25, 200))
  const handleZoomOut = () => setZoomLevel((z) => Math.max(z - 25, 50))
  const handleZoomReset = () => setZoomLevel(100)

  const handleVerify = () => {
    onVerify(certificate.id, notes)
    setShowSuccess(true)
    setTimeout(() => {
      setShowSuccess(false)
      onClose()
    }, 1500)
  }

  const handleReject = () => {
    if (!isRejecting) {
      setIsRejecting(true)
      return
    }
    if (!rejectionReason.trim()) return
    onReject(certificate.id, rejectionReason)
    setShowSuccess(true)
    setTimeout(() => {
      setShowSuccess(false)
      onClose()
    }, 1500)
  }

  const handleCancelReject = () => {
    setIsRejecting(false)
    setRejectionReason('')
  }

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/50"
        onClick={onClose}
      />

      {/* Panel */}
      <div
        className={cn(
          'fixed right-0 top-0 z-50 flex h-full w-full flex-col bg-card shadow-xl md:w-[480px]',
          className
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border p-4">
          <h2 className="text-lg font-semibold text-foreground">
            {isPending ? 'Verify Certificate' : 'Certificate Details'}
          </h2>
          <button
            onClick={onClose}
            className="rounded-lg p-2 hover:bg-muted"
          >
            <X className="h-5 w-5 text-muted-foreground" />
          </button>
        </div>

        {/* Success state overlay */}
        {showSuccess && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-card">
            <CheckCircle className="h-16 w-16 text-emerald-500" />
            <p className="mt-4 text-lg font-medium text-foreground">
              {isRejecting ? 'Certificate Rejected' : 'Certificate Verified'}
            </p>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {/* Certificate Info Section */}
          <section className="mb-6 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Certificate #</span>
              <span className="font-mono text-lg font-semibold text-foreground">
                {certificate.certificateNumber}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Amount</span>
              <span className="text-lg font-semibold text-foreground">
                ฿{formatCurrency(certificate.amount)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Rate</span>
              <span className="text-foreground">{certificate.rate}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Date</span>
              <span className="text-foreground">{formatDate(certificate.date)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Member</span>
              <Link
                href={`/members/${certificate.memberId}`}
                className="text-foreground hover:text-amber-600 hover:underline"
              >
                {certificate.memberName}
              </Link>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Receipt #</span>
              <Link
                href={`/billing/receipts/${certificate.receiptId}`}
                className="font-mono text-foreground hover:text-amber-600 hover:underline"
              >
                {certificate.receiptNumber}
              </Link>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Status</span>
              <WhtStatusBadge status={certificate.status} />
            </div>
          </section>

          {/* Document Preview Section */}
          <section className="mb-6">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-medium text-foreground">Document</span>
              <div className="flex items-center gap-1">
                <button
                  onClick={handleZoomOut}
                  className="rounded p-1 hover:bg-muted"
                  title="Zoom out"
                >
                  <ZoomOut className="h-4 w-4 text-muted-foreground" />
                </button>
                <span className="min-w-[3rem] text-center text-xs text-muted-foreground">
                  {zoomLevel}%
                </span>
                <button
                  onClick={handleZoomIn}
                  className="rounded p-1 hover:bg-muted"
                  title="Zoom in"
                >
                  <ZoomIn className="h-4 w-4 text-muted-foreground" />
                </button>
                <button
                  onClick={handleZoomReset}
                  className="rounded p-1 hover:bg-muted"
                  title="Reset zoom"
                >
                  <RotateCcw className="h-4 w-4 text-muted-foreground" />
                </button>
                {certificate.documentUrl && (
                  <a
                    href={certificate.documentUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-2 flex items-center gap-1 text-xs text-amber-600 hover:underline"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    Open in new tab
                  </a>
                )}
              </div>
            </div>
            <div className="flex min-h-[300px] items-center justify-center overflow-hidden rounded-lg bg-muted">
              {certificate.documentUrl ? (
                <iframe
                  src={certificate.documentUrl}
                  className="h-[300px] w-full border-0"
                  style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'top center' }}
                  title="WHT Certificate Document"
                />
              ) : (
                <div className="flex flex-col items-center py-8">
                  <FileText className="h-12 w-12 text-muted-foreground" />
                  <p className="mt-3 text-sm text-muted-foreground">No document uploaded</p>
                </div>
              )}
            </div>
          </section>

          {/* Verification Section */}
          {isPending && (
            <section className="mb-6">
              <label className="mb-1.5 block text-sm font-medium text-foreground">
                Notes (Optional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add any verification notes..."
                rows={3}
                className="w-full rounded-lg border border-border px-3 py-2 text-sm transition-colors focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/30"
              />
              <div className="mt-3 flex items-center justify-between rounded-lg bg-muted px-3 py-2">
                <span className="text-sm text-muted-foreground">Verified by</span>
                <span className="text-sm font-medium text-foreground">{currentUserName}</span>
              </div>
            </section>
          )}

          {/* Rejection reason input */}
          {isRejecting && (
            <section className="mb-6">
              <label className="mb-1.5 block text-sm font-medium text-red-700">
                Rejection Reason (Required)
              </label>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Please provide a reason for rejection..."
                rows={3}
                className="w-full rounded-lg border border-red-300 px-3 py-2 text-sm transition-colors focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/30"
                autoFocus
              />
            </section>
          )}

          {/* Verified/Rejected info for non-pending */}
          {isVerified && certificate.verifiedBy && (
            <section className="mb-6 rounded-lg bg-emerald-50 p-4">
              <p className="text-sm text-emerald-800">
                <span className="font-medium">Verified by:</span> {certificate.verifiedBy}
              </p>
              {certificate.verifiedAt && (
                <p className="mt-1 text-sm text-emerald-600">
                  {formatDate(certificate.verifiedAt)}
                </p>
              )}
            </section>
          )}

          {isRejected && certificate.rejectionReason && (
            <section className="mb-6 rounded-lg bg-red-50 p-4">
              <p className="text-sm font-medium text-red-800">Rejection Reason:</p>
              <p className="mt-1 text-sm text-red-700">{certificate.rejectionReason}</p>
            </section>
          )}
        </div>

        {/* Action buttons */}
        {isPending && (
          <div className="flex gap-3 border-t border p-4">
            {isRejecting ? (
              <>
                <Button
                  variant="ghost"
                  onClick={handleCancelReject}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleReject}
                  disabled={!rejectionReason.trim() || isSubmitting}
                  className="flex-1 bg-red-500 text-white hover:bg-red-600"
                >
                  Confirm Reject
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="outline"
                  onClick={handleReject}
                  disabled={isSubmitting}
                  className="flex-1 border-red-300 text-red-600 hover:bg-red-50"
                >
                  Reject
                </Button>
                <Button
                  onClick={handleVerify}
                  disabled={isSubmitting}
                  className="flex-1 bg-gradient-to-br from-emerald-500 to-emerald-600 text-white"
                >
                  Verify
                </Button>
              </>
            )}
          </div>
        )}
      </div>
    </>
  )
}
