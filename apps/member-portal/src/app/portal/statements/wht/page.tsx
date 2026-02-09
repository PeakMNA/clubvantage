import type { Metadata } from 'next'
import Link from 'next/link'
import { format } from 'date-fns'
import {
  ArrowLeft,
  FileText,
  Plus,
  CheckCircle2,
  Clock,
  XCircle,
} from 'lucide-react'
import { getWHTCertificates } from '@/lib/data/wht'

export const metadata: Metadata = {
  title: 'WHT Certificates | Member Portal',
}

const statusConfig = {
  SUBMITTED: {
    label: 'Submitted',
    icon: Clock,
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    badge: 'bg-blue-100 text-blue-700',
  },
  VERIFIED: {
    label: 'Verified',
    icon: CheckCircle2,
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    badge: 'bg-emerald-100 text-emerald-700',
  },
  REJECTED: {
    label: 'Rejected',
    icon: XCircle,
    bg: 'bg-red-50',
    text: 'text-red-700',
    badge: 'bg-red-100 text-red-700',
  },
} as const

export default async function WHTCertificatesPage() {
  const certificates = await getWHTCertificates()

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-sm border-b border-stone-100">
        <div className="flex items-center justify-between px-5 py-3 pt-safe">
          <Link
            href="/portal/statements"
            className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-stone-50 -ml-1"
          >
            <ArrowLeft className="h-5 w-5 text-stone-700" />
          </Link>
          <h1 className="text-base font-semibold text-stone-900">WHT Certificates</h1>
          <div className="w-9" />
        </div>
      </div>

      <div className="px-5 py-6 pb-36">
        {/* Intro */}
        <div className="flex items-center gap-3 mb-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-stone-900 flex-shrink-0">
            <FileText className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-stone-900">Withholding Tax</h2>
            <p className="text-sm text-stone-500">Submit and track WHT certificates</p>
          </div>
        </div>

        {/* Upload CTA */}
        <Link
          href="/portal/statements/wht/upload"
          className="flex items-center justify-center gap-2 w-full py-3 mb-6 rounded-xl bg-amber-600 text-sm font-semibold text-white active:bg-amber-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Upload Certificate
        </Link>

        {/* Certificate List */}
        {certificates.length === 0 ? (
          <div className="text-center py-12">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-stone-50 mx-auto mb-4">
              <FileText className="h-8 w-8 text-stone-300" />
            </div>
            <p className="text-[15px] font-medium text-stone-900 mb-1">No certificates submitted</p>
            <p className="text-sm text-stone-500 max-w-xs mx-auto">
              Upload a WHT certificate to apply tax withholding to your account.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {certificates.map((cert) => {
              const config = statusConfig[cert.status]
              const StatusIcon = config.icon
              return (
                <div
                  key={cert.id}
                  className={`rounded-xl border border-stone-100 p-4 ${config.bg}`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <p className="text-[15px] font-medium text-stone-900">
                      {cert.certificateNumber}
                    </p>
                    <span className={`flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full ${config.badge}`}>
                      <StatusIcon className="h-3 w-3" />
                      {config.label}
                    </span>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-stone-500">
                      Amount: <span className="font-medium text-stone-700">฿{cert.amount.toLocaleString()}</span>
                    </p>
                    <p className="text-xs text-stone-500">
                      Date: {format(cert.certificateDate, 'd MMM yyyy')}
                    </p>
                    {cert.invoiceNumber && (
                      <p className="text-xs text-stone-500">
                        Applied to: {cert.invoiceNumber}
                      </p>
                    )}
                    {cert.status === 'REJECTED' && cert.rejectionReason && (
                      <p className="text-xs text-red-600 mt-2">
                        Reason: {cert.rejectionReason}
                      </p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
