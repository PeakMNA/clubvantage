import { cache } from 'react'
import { prisma, getClubId, getMemberId } from '@/lib/db'

export const getSpendingSummary = cache(async () => {
  const [clubId, memberId] = await Promise.all([getClubId(), getMemberId()])

  const now = new Date()
  const currentYear = now.getFullYear()
  const startOfYear = new Date(currentYear, 0, 1)

  const baseWhere = {
    clubId,
    memberId,
    invoiceDate: { gte: startOfYear },
    status: { notIn: ['DRAFT' as const, 'VOID' as const, 'CANCELLED' as const] },
  }

  // Run all queries in parallel
  const [categoryAgg, monthlyAgg, recentLineItems] = await Promise.all([
    // Category breakdown via groupBy on line items
    prisma.invoiceLineItem.groupBy({
      by: ['chargeTypeId'],
      where: { invoice: baseWhere },
      _sum: { lineTotal: true },
    }),

    // Monthly breakdown via groupBy on invoices
    prisma.invoice.groupBy({
      by: ['invoiceDate'],
      where: baseWhere,
      _sum: { totalAmount: true },
    }),

    // Recent line items (last 10)
    prisma.invoiceLineItem.findMany({
      where: { invoice: baseWhere },
      orderBy: { invoice: { invoiceDate: 'desc' } },
      take: 10,
      select: {
        id: true,
        description: true,
        lineTotal: true,
        chargeType: { select: { category: true } },
        invoice: { select: { invoiceDate: true } },
      },
    }),
  ])

  // Resolve charge type categories for the grouped results
  const chargeTypeIds = categoryAgg.map((c) => c.chargeTypeId).filter(Boolean) as string[]
  const chargeTypes = chargeTypeIds.length > 0
    ? await prisma.chargeType.findMany({
        where: { id: { in: chargeTypeIds } },
        select: { id: true, category: true },
      })
    : []
  const chargeTypeMap = new Map(chargeTypes.map((ct) => [ct.id, ct.category ?? 'Other']))

  // Build category breakdown
  const categoryMap = new Map<string, number>()
  for (const row of categoryAgg) {
    const category = (row.chargeTypeId ? chargeTypeMap.get(row.chargeTypeId) : null) ?? 'Other'
    const current = categoryMap.get(category) ?? 0
    categoryMap.set(category, current + Number(row._sum.lineTotal ?? 0))
  }

  const categories = Array.from(categoryMap.entries())
    .map(([name, total]) => ({ name, total }))
    .sort((a, b) => b.total - a.total)

  // Build monthly breakdown
  const monthMap = new Map<string, number>()
  for (const row of monthlyAgg) {
    const month = row.invoiceDate.toISOString().slice(0, 7)
    const current = monthMap.get(month) ?? 0
    monthMap.set(month, current + Number(row._sum.totalAmount ?? 0))
  }

  const months = Array.from(monthMap.entries())
    .map(([month, total]) => ({ month, total }))
    .sort((a, b) => a.month.localeCompare(b.month))

  const totalSpent = categories.reduce((sum, c) => sum + c.total, 0)

  const recentItems = recentLineItems.map((item) => ({
    id: item.id,
    description: item.description,
    amount: Number(item.lineTotal),
    category: item.chargeType?.category ?? 'Other',
    date: item.invoice.invoiceDate,
  }))

  return {
    totalSpent,
    categories,
    months,
    recentItems,
    year: currentYear,
  }
})
