'use client'

import { useState, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { cn } from '@clubvantage/ui'
import {
  ArrowLeft,
  Upload,
  FileText,
  Loader2,
  CheckCircle2,
  X,
} from 'lucide-react'

interface Invoice {
  id: string
  invoiceNumber: string
  amount: number
  dueDate: string
}

interface WHTUploadFormProps {
  invoices: Invoice[]
}

const ACCEPTED_TYPES = ['application/pdf', 'image/jpeg', 'image/png']
const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

export function WHTUploadForm({ invoices }: WHTUploadFormProps) {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [certificateNumber, setCertificateNumber] = useState('')
  const [certificateDate, setCertificateDate] = useState('')
  const [amount, setAmount] = useState<number | ''>('')
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(null)
  const [file, setFile] = useState<File | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0]
    if (!selected) return

    if (!ACCEPTED_TYPES.includes(selected.type)) {
      setError('Please upload a PDF, JPG, or PNG file.')
      return
    }
    if (selected.size > MAX_FILE_SIZE) {
      setError('File size must be under 10MB.')
      return
    }

    setFile(selected)
    setError(null)
  }, [])

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!certificateNumber.trim()) {
      setError('Certificate number is required.')
      return
    }
    if (!certificateDate) {
      setError('Certificate date is required.')
      return
    }
    if (!amount || amount <= 0) {
      setError('WHT amount must be greater than zero.')
      return
    }
    if (!file) {
      setError('Please upload the certificate document.')
      return
    }

    setIsSubmitting(true)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('certificateNumber', certificateNumber.trim())
      formData.append('certificateDate', certificateDate)
      formData.append('amount', String(amount))
      if (selectedInvoiceId) {
        const inv = invoices.find((i) => i.id === selectedInvoiceId)
        if (inv) {
          formData.append('invoiceId', inv.id)
          formData.append('invoiceNumber', inv.invoiceNumber)
        }
      }

      const res = await fetch('/api/wht/upload', {
        method: 'POST',
        body: formData,
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Upload failed')
      }

      setIsSuccess(true)
      setTimeout(() => router.push('/portal/statements/wht'), 1500)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }, [certificateNumber, certificateDate, amount, file, selectedInvoiceId, invoices, router])

  if (isSuccess) {
    return (
      <div className="flex flex-col items-center text-center py-16 space-y-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50">
          <CheckCircle2 className="h-8 w-8 text-emerald-600" />
        </div>
        <p className="text-lg font-semibold text-stone-900">Certificate Submitted</p>
        <p className="text-sm text-stone-500">Your WHT certificate is being reviewed.</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          href="/portal/statements/wht"
          className="flex h-9 w-9 items-center justify-center rounded-full bg-stone-100 active:bg-stone-200 transition-colors"
        >
          <ArrowLeft className="h-5 w-5 text-stone-600" />
        </Link>
        <h1 className="text-[22px] font-semibold text-stone-900">Upload WHT Certificate</h1>
      </div>

      {/* Certificate Number */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-stone-700">Certificate Number</label>
        <input
          type="text"
          value={certificateNumber}
          onChange={(e) => setCertificateNumber(e.target.value)}
          placeholder="e.g. WHT-2026-001"
          className="w-full rounded-xl border border-stone-200 bg-white py-3 px-4 text-[15px] text-stone-900 placeholder:text-stone-400 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
        />
      </div>

      {/* Certificate Date */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-stone-700">Certificate Date</label>
        <input
          type="date"
          value={certificateDate}
          onChange={(e) => setCertificateDate(e.target.value)}
          className="w-full rounded-xl border border-stone-200 bg-white py-3 px-4 text-[15px] text-stone-900 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
        />
      </div>

      {/* WHT Amount */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-stone-700">WHT Amount</label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-medium text-stone-500">
            ฿
          </span>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value ? Number(e.target.value) : '')}
            min={1}
            step={0.01}
            placeholder="0.00"
            className="w-full rounded-xl border border-stone-200 bg-white py-3 pl-8 pr-4 text-lg font-semibold text-stone-900 placeholder:text-stone-400 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
          />
        </div>
      </div>

      {/* File Upload */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-stone-700">Document</label>
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.jpg,.jpeg,.png"
          onChange={handleFileChange}
          className="hidden"
        />
        {file ? (
          <div className="flex items-center gap-3 rounded-xl border border-stone-200 bg-stone-50 p-3">
            <FileText className="h-5 w-5 text-stone-500 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-stone-900 truncate">{file.name}</p>
              <p className="text-xs text-stone-500">{(file.size / 1024).toFixed(0)} KB</p>
            </div>
            <button
              type="button"
              onClick={() => { setFile(null); if (fileInputRef.current) fileInputRef.current.value = '' }}
              className="flex h-7 w-7 items-center justify-center rounded-full hover:bg-stone-200"
            >
              <X className="h-4 w-4 text-stone-500" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex flex-col items-center gap-2 w-full py-6 rounded-xl border-2 border-dashed border-stone-200 text-stone-500 active:bg-stone-50 transition-colors"
          >
            <Upload className="h-6 w-6" />
            <span className="text-sm font-medium">Browse or Drag & Drop</span>
            <span className="text-xs text-stone-400">PDF, JPG, PNG (max 10MB)</span>
          </button>
        )}
      </div>

      {/* Apply to Invoice */}
      {invoices.length > 0 && (
        <div className="space-y-2">
          <label className="text-sm font-medium text-stone-700">Apply to Invoice (optional)</label>
          <div className="space-y-2">
            {invoices.map((inv) => (
              <button
                key={inv.id}
                type="button"
                onClick={() => setSelectedInvoiceId(selectedInvoiceId === inv.id ? null : inv.id)}
                className={cn(
                  'flex items-center justify-between w-full rounded-xl border p-3 text-left transition-colors',
                  selectedInvoiceId === inv.id
                    ? 'border-amber-500 bg-amber-50'
                    : 'border-stone-200 bg-white active:bg-stone-50'
                )}
              >
                <div>
                  <p className="text-sm font-medium text-stone-900">{inv.invoiceNumber}</p>
                  <p className="text-xs text-stone-500">
                    Due: {new Date(inv.dueDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                </div>
                <p className="text-sm font-semibold text-stone-900">
                  ฿{inv.amount.toLocaleString()}
                </p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="rounded-xl bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={isSubmitting}
        className={cn(
          'w-full rounded-xl px-5 py-3.5 text-sm font-semibold text-white transition-colors',
          isSubmitting
            ? 'bg-stone-400 cursor-not-allowed'
            : 'bg-amber-600 active:bg-amber-700'
        )}
      >
        {isSubmitting ? (
          <span className="flex items-center justify-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            Uploading...
          </span>
        ) : (
          'Submit Certificate'
        )}
      </button>
    </form>
  )
}
