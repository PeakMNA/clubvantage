import type { Metadata } from 'next'
import { getOpenInvoices } from '@/lib/data/wht'
import { WHTUploadForm } from './wht-upload-form'

export const metadata: Metadata = {
  title: 'Upload WHT Certificate | Member Portal',
}

export default async function WHTUploadPage() {
  const invoices = await getOpenInvoices()

  return (
    <div className="min-h-screen bg-white">
      <div className="px-5 py-6 pb-36">
        <WHTUploadForm
          invoices={invoices.map((inv) => ({
            id: inv.id,
            invoiceNumber: inv.invoiceNumber,
            amount: Number(inv.totalAmount),
            dueDate: inv.dueDate.toISOString(),
          }))}
        />
      </div>
    </div>
  )
}
