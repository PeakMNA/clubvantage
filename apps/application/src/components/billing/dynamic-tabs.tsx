'use client'

import dynamic from 'next/dynamic'

/**
 * Loading skeleton for tab content
 * Shows while the tab component is being loaded
 */
function TabLoadingSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      {/* Summary cards skeleton */}
      <div className="grid grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="rounded-xl border border-stone-200 bg-white p-4">
            <div className="h-3 w-20 rounded bg-stone-200" />
            <div className="mt-3 h-8 w-28 rounded bg-stone-200" />
          </div>
        ))}
      </div>

      {/* Filter bar skeleton */}
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-8 w-16 rounded-lg bg-stone-200" />
          ))}
        </div>
        <div className="flex gap-2">
          <div className="h-8 w-24 rounded-lg bg-stone-200" />
          <div className="h-8 w-24 rounded-lg bg-stone-200" />
        </div>
      </div>

      {/* Table skeleton */}
      <div className="rounded-xl border border-stone-200 bg-white">
        {/* Table header */}
        <div className="border-b border-stone-200 px-4 py-3">
          <div className="flex gap-4">
            {[120, 80, 100, 80, 60, 80].map((w, i) => (
              <div key={i} className="h-4 rounded bg-stone-200" style={{ width: w }} />
            ))}
          </div>
        </div>
        {/* Table rows */}
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <div key={i} className="border-b border-stone-100 px-4 py-4 last:border-b-0">
            <div className="flex gap-4">
              {[120, 80, 100, 80, 60, 80].map((w, j) => (
                <div key={j} className="h-4 rounded bg-stone-100" style={{ width: w }} />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Pagination skeleton */}
      <div className="flex items-center justify-between">
        <div className="h-4 w-32 rounded bg-stone-200" />
        <div className="flex gap-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-8 w-8 rounded bg-stone-200" />
          ))}
        </div>
      </div>
    </div>
  )
}

/**
 * Aging dashboard has a different layout - uses cards grid instead of table
 */
function AgingLoadingSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      {/* Aging buckets skeleton */}
      <div className="grid grid-cols-5 gap-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="rounded-xl border border-stone-200 bg-white p-4">
            <div className="h-3 w-16 rounded bg-stone-200" />
            <div className="mt-2 h-8 w-24 rounded bg-stone-200" />
            <div className="mt-2 h-3 w-12 rounded bg-stone-200" />
          </div>
        ))}
      </div>

      {/* Member list skeleton */}
      <div className="rounded-xl border border-stone-200 bg-white">
        <div className="border-b border-stone-200 px-4 py-3">
          <div className="h-5 w-32 rounded bg-stone-200" />
        </div>
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="border-b border-stone-100 px-4 py-4 last:border-b-0">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-full bg-stone-200" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-32 rounded bg-stone-200" />
                <div className="h-3 w-24 rounded bg-stone-100" />
              </div>
              <div className="h-6 w-20 rounded bg-stone-200" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

/**
 * Dynamically imported InvoiceRegister component
 * Only loaded when the Invoices tab is active
 */
export const DynamicInvoiceRegister = dynamic(
  () => import('./invoice-register').then((mod) => mod.InvoiceRegister),
  { loading: () => <TabLoadingSkeleton />, ssr: false }
)

/**
 * Dynamically imported ReceiptRegister component
 * Only loaded when the Receipts tab is active
 */
export const DynamicReceiptRegister = dynamic(
  () => import('./receipt-register').then((mod) => mod.ReceiptRegister),
  { loading: () => <TabLoadingSkeleton />, ssr: false }
)

/**
 * Dynamically imported WhtCertificatesTab component
 * Only loaded when the WHT Certificates tab is active
 */
export const DynamicWhtCertificatesTab = dynamic(
  () => import('./wht-certificates-tab').then((mod) => mod.WhtCertificatesTab),
  { loading: () => <TabLoadingSkeleton />, ssr: false }
)

/**
 * Dynamically imported AgingDashboardTab component
 * Only loaded when the Aging tab is active
 */
export const DynamicAgingDashboardTab = dynamic(
  () => import('./aging-dashboard-tab').then((mod) => mod.AgingDashboardTab),
  { loading: () => <AgingLoadingSkeleton />, ssr: false }
)

/**
 * Dynamically imported CreditNoteList component
 * Only loaded when the Credit Notes tab is active
 */
export const DynamicCreditNoteList = dynamic(
  () => import('./credit-note-list').then((mod) => mod.CreditNoteList),
  { loading: () => <TabLoadingSkeleton />, ssr: false }
)

/**
 * Dynamically imported StatementRegister component
 * Only loaded when the Statements tab is active
 */
export const DynamicStatementRegister = dynamic(
  () => import('./statement-register').then((mod) => mod.StatementRegister),
  { loading: () => <TabLoadingSkeleton />, ssr: false }
)
