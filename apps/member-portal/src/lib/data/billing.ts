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
  const member = await prisma.member.findUnique({
    where: { id: memberId },
    select: { outstandingBalance: true },
  })

  const nextInvoice = await prisma.invoice.findFirst({
    where: {
      memberId,
      status: { in: ['SENT', 'DRAFT'] },
    },
    orderBy: { dueDate: 'asc' },
    select: { dueDate: true },
  })

  return {
    balance: Number(member?.outstandingBalance ?? 0),
    dueDate: nextInvoice?.dueDate ?? null,
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

export const getStatements = cache(async () => {
  const memberId = await getMemberId()
  const arProfile = await prisma.aRProfile.findFirst({
    where: { memberId },
  })

  if (!arProfile) return []

  const statements = await prisma.statement.findMany({
    where: { arProfileId: arProfile.id },
    orderBy: { periodEnd: 'desc' },
    take: 12,
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

export const getStatementById = cache(async (id: string) => {
  const memberId = await getMemberId()
  const statement = await prisma.statement.findUnique({
    where: { id },
    include: {
      arProfile: {
        select: {
          accountNumber: true,
          memberId: true,
          member: {
            select: {
              firstName: true,
              lastName: true,
              memberId: true,
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
  }
})
