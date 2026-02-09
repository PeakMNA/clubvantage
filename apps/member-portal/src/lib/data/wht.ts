import { cache } from 'react'
import { prisma, getMemberId } from '@/lib/db'

export interface WHTCertificate {
  id: string
  certificateNumber: string
  certificateDate: Date
  amount: number
  status: 'SUBMITTED' | 'VERIFIED' | 'REJECTED'
  rejectionReason: string | null
  fileUrl: string
  fileName: string
  invoiceNumber: string | null
  createdAt: Date
}

/**
 * WHT certificates are stored as MemberDocuments with name prefixed "WHT:"
 * and metadata stored as JSON in the description field.
 */
const WHT_PREFIX = 'WHT:'

interface WHTMeta {
  certificateNumber: string
  certificateDate: string
  amount: number
  status: 'SUBMITTED' | 'VERIFIED' | 'REJECTED'
  rejectionReason?: string
  invoiceNumber?: string
}

function parseWHTMeta(description: string | null): WHTMeta | null {
  if (!description) return null
  try {
    return JSON.parse(description) as WHTMeta
  } catch {
    return null
  }
}

export const getWHTCertificates = cache(async (): Promise<WHTCertificate[]> => {
  const memberId = await getMemberId()

  const docs = await prisma.memberDocument.findMany({
    where: {
      memberId,
      name: { startsWith: WHT_PREFIX },
      deletedAt: null,
    },
    orderBy: { createdAt: 'desc' },
  })

  return docs
    .map((doc) => {
      const meta = parseWHTMeta(doc.description)
      if (!meta) return null
      return {
        id: doc.id,
        certificateNumber: meta.certificateNumber,
        certificateDate: new Date(meta.certificateDate),
        amount: meta.amount,
        status: meta.status,
        rejectionReason: meta.rejectionReason ?? null,
        fileUrl: doc.fileUrl,
        fileName: doc.fileName,
        invoiceNumber: meta.invoiceNumber ?? null,
        createdAt: doc.createdAt,
      }
    })
    .filter((c): c is WHTCertificate => c !== null)
})

export const getOpenInvoices = cache(async () => {
  const memberId = await getMemberId()

  return prisma.invoice.findMany({
    where: {
      memberId,
      status: { in: ['SENT', 'PARTIALLY_PAID', 'OVERDUE'] },
    },
    orderBy: { dueDate: 'asc' },
    select: {
      id: true,
      invoiceNumber: true,
      totalAmount: true,
      dueDate: true,
    },
  })
})
