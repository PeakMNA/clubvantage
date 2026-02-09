import { cache } from 'react'
import { prisma, getMemberId } from '@/lib/db'

export interface StatementTransactionRow {
  date: string
  description: string
  reference?: string
  debit?: number
  credit?: number
  balance?: number
  category?: string
}

export const getAccountBalance = cache(async () => {
  const memberId = await getMemberId()

  const [member, nextInvoice, arProfile] = await Promise.all([
    prisma.member.findUnique({
      where: { id: memberId },
      select: { outstandingBalance: true },
    }),
    prisma.invoice.findFirst({
      where: {
        memberId,
        status: { in: ['SENT', 'DRAFT'] },
      },
      orderBy: { dueDate: 'asc' },
      select: { dueDate: true },
    }),
    prisma.aRProfile.findFirst({
      where: { memberId },
      select: { lastStatementDate: true },
    }),
  ])

  // Calculate unbilled charges since last statement
  const sinceDate = arProfile?.lastStatementDate ?? null
  let unbilledTotal = 0

  if (sinceDate) {
    const [chargeAgg, paymentAgg] = await Promise.all([
      prisma.invoiceLineItem.aggregate({
        _sum: { lineTotal: true },
        where: {
          invoice: {
            memberId,
            status: { notIn: ['DRAFT', 'VOID', 'CANCELLED'] },
            createdAt: { gt: sinceDate },
          },
        },
      }),
      prisma.payment.aggregate({
        _sum: { amount: true },
        where: {
          memberId,
          paymentDate: { gt: sinceDate },
        },
      }),
    ])
    unbilledTotal = Number(chargeAgg._sum.lineTotal ?? 0) - Number(paymentAgg._sum.amount ?? 0)
  }

  return {
    balance: Number(member?.outstandingBalance ?? 0),
    dueDate: nextInvoice?.dueDate ?? null,
    unbilledTotal,
  }
})

export const getRecentTransactions = cache(async () => {
  const memberId = await getMemberId()

  const [invoices, payments] = await Promise.all([
    prisma.invoice.findMany({
      where: { memberId },
      orderBy: { dueDate: 'desc' },
      take: 10,
      include: {
        lineItems: {
          orderBy: { sortOrder: 'asc' },
          take: 5,
        },
      },
    }),
    prisma.payment.findMany({
      where: { memberId },
      orderBy: { paymentDate: 'desc' },
      take: 5,
    }),
  ])

  const transactions = [
    ...invoices.flatMap((inv) =>
      inv.lineItems.map((li) => ({
        id: li.id,
        type: 'charge' as const,
        description: li.description,
        date: inv.dueDate,
        amount: -Number(li.lineTotal),
      }))
    ),
    ...payments.map((p) => ({
      id: p.id,
      type: 'payment' as const,
      description: 'Payment Received',
      date: p.paymentDate,
      amount: Number(p.amount),
    })),
  ]
    .sort((a, b) => b.date.getTime() - a.date.getTime())
    .slice(0, 8)

  return transactions
})

export const getStatements = cache(async (limit = 3) => {
  const memberId = await getMemberId()
  const arProfile = await prisma.aRProfile.findFirst({
    where: { memberId },
  })

  if (!arProfile) return []

  const statements = await prisma.statement.findMany({
    where: { arProfileId: arProfile.id, statementNumber: { not: null } },
    orderBy: { periodEnd: 'desc' },
    take: limit,
  })

  return statements.map((s) => ({
    id: s.id,
    statementNumber: s.statementNumber,
    periodStart: s.periodStart,
    periodEnd: s.periodEnd,
    dueDate: s.dueDate,
    openingBalance: Number(s.openingBalance),
    closingBalance: Number(s.closingBalance),
    totalDebits: Number(s.totalDebits),
    totalCredits: Number(s.totalCredits),
    pdfUrl: s.pdfUrl,
  }))
})

export interface UnbilledCategory {
  name: string
  subtotal: number
  items: {
    id: string
    description: string
    amount: number
    date: Date
    invoiceNumber: string | null
  }[]
}

export interface UnbilledActivityData {
  sinceDate: Date | null
  categories: UnbilledCategory[]
  payments: {
    id: string
    description: string
    amount: number
    date: Date
  }[]
  netUnbilled: number
}

export const getUnbilledActivity = cache(async (): Promise<UnbilledActivityData> => {
  const memberId = await getMemberId()

  const arProfile = await prisma.aRProfile.findFirst({
    where: { memberId },
    select: { lastStatementDate: true },
  })

  const sinceDate = arProfile?.lastStatementDate ?? null
  const sinceFilter = sinceDate ? { gt: sinceDate } : undefined

  const [lineItems, payments] = await Promise.all([
    prisma.invoiceLineItem.findMany({
      where: {
        invoice: {
          memberId,
          status: { notIn: ['DRAFT', 'VOID', 'CANCELLED'] },
          ...(sinceFilter ? { createdAt: sinceFilter } : {}),
        },
      },
      include: {
        chargeType: { select: { name: true, category: true } },
        invoice: { select: { invoiceNumber: true, createdAt: true } },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.payment.findMany({
      where: {
        memberId,
        ...(sinceFilter ? { paymentDate: sinceFilter } : {}),
      },
      orderBy: { paymentDate: 'desc' },
    }),
  ])

  // Group line items by category
  const categoryMap = new Map<string, UnbilledCategory>()
  let totalCharges = 0

  for (const li of lineItems) {
    const categoryName = li.chargeType?.category ?? 'Other'
    const amount = Number(li.lineTotal)
    totalCharges += amount

    if (!categoryMap.has(categoryName)) {
      categoryMap.set(categoryName, { name: categoryName, subtotal: 0, items: [] })
    }
    const cat = categoryMap.get(categoryName)!
    cat.subtotal += amount
    cat.items.push({
      id: li.id,
      description: li.description,
      amount,
      date: li.invoice.createdAt,
      invoiceNumber: li.invoice.invoiceNumber,
    })
  }

  // Sort categories by subtotal descending
  const categories = Array.from(categoryMap.values()).sort((a, b) => b.subtotal - a.subtotal)

  const paymentsList = payments.map((p) => ({
    id: p.id,
    description: `Payment — ${p.receiptNumber}`,
    amount: Number(p.amount),
    date: p.paymentDate,
  }))

  const totalPayments = paymentsList.reduce((sum, p) => sum + p.amount, 0)

  return {
    sinceDate,
    categories,
    payments: paymentsList,
    netUnbilled: totalCharges - totalPayments,
  }
})

export const getStatementById = cache(async (id: string) => {
  const memberId = await getMemberId()
  const statement = await prisma.statement.findUnique({
    where: { id },
    include: {
      arProfile: {
        select: {
          accountNumber: true,
          memberId: true,
          club: {
            select: {
              billingSettings: {
                select: { billingCycleMode: true },
              },
            },
          },
          member: {
            select: {
              firstName: true,
              lastName: true,
              memberId: true,
              joinDate: true,
              membershipType: { select: { name: true } },
            },
          },
        },
      },
    },
  })

  if (!statement || statement.arProfile.memberId !== memberId) return null

  // Parse transactions JSON
  const transactions: StatementTransactionRow[] = Array.isArray(statement.transactions)
    ? (statement.transactions as unknown as StatementTransactionRow[])
    : []

  // Determine cycle mode
  const cycleMode = statement.arProfile.club?.billingSettings?.billingCycleMode ?? 'CLUB_CYCLE'

  // Check if this is a partial period (first statement after member joined)
  const memberJoinDate = statement.arProfile.member?.joinDate
  const isPartialPeriod = memberJoinDate
    ? memberJoinDate > statement.periodStart && memberJoinDate <= statement.periodEnd
    : false

  return {
    id: statement.id,
    statementNumber: statement.statementNumber,
    periodStart: statement.periodStart,
    periodEnd: statement.periodEnd,
    dueDate: statement.dueDate,
    openingBalance: Number(statement.openingBalance),
    totalDebits: Number(statement.totalDebits),
    totalCredits: Number(statement.totalCredits),
    closingBalance: Number(statement.closingBalance),
    agingCurrent: Number(statement.agingCurrent),
    aging1to30: Number(statement.aging1to30),
    aging31to60: Number(statement.aging31to60),
    aging61to90: Number(statement.aging61to90),
    aging90Plus: Number(statement.aging90Plus),
    transactionCount: statement.transactionCount,
    transactions,
    pdfUrl: statement.pdfUrl,
    memberName: statement.arProfile.member
      ? `${statement.arProfile.member.firstName} ${statement.arProfile.member.lastName}`
      : null,
    memberDisplayId: statement.arProfile.member?.memberId ?? null,
    membershipType: statement.arProfile.member?.membershipType.name ?? null,
    accountNumber: statement.arProfile.accountNumber,
    cycleMode,
    isPartialPeriod,
  }
})
