import { prisma } from '@/lib/db'

/**
 * Billing notification helpers.
 * These create Notification records for billing events.
 * In production, a cron job would call the reminder functions daily.
 */

interface NotificationParams {
  clubId: string
  memberId: string
  title: string
  message: string
  type: string
  channel?: string
}

async function createNotification({
  clubId,
  memberId,
  title,
  message,
  type,
  channel = 'IN_APP',
}: NotificationParams) {
  return prisma.notification.create({
    data: { clubId, memberId, type, title, message, channel },
  })
}

/** Notify member when a new invoice is generated */
export async function notifyInvoiceGenerated(
  clubId: string,
  memberId: string,
  invoiceNumber: string,
  amount: number
) {
  return createNotification({
    clubId,
    memberId,
    type: 'INVOICE',
    title: 'New Invoice',
    message: `Invoice ${invoiceNumber} for ฿${amount.toLocaleString()} has been generated.`,
  })
}

/** Notify member when a payment is received */
export async function notifyPaymentReceived(
  clubId: string,
  memberId: string,
  amount: number,
  receiptNumber: string
) {
  return createNotification({
    clubId,
    memberId,
    type: 'PAYMENT',
    title: 'Payment Received',
    message: `Your payment of ฿${amount.toLocaleString()} (${receiptNumber}) has been received.`,
  })
}

/** Notify member when payment fails */
export async function notifyPaymentFailed(
  clubId: string,
  memberId: string
) {
  return createNotification({
    clubId,
    memberId,
    type: 'PAYMENT',
    title: 'Payment Failed',
    message: 'Your payment could not be processed. Please try again or use a different payment method.',
  })
}

/** Notify member when a statement is generated */
export async function notifyStatementGenerated(
  clubId: string,
  memberId: string,
  statementNumber: string,
  closingBalance: number
) {
  return createNotification({
    clubId,
    memberId,
    type: 'STATEMENT',
    title: 'Statement Ready',
    message: `Statement ${statementNumber} is ready. Closing balance: ฿${closingBalance.toLocaleString()}.`,
  })
}

/** Notify member when WHT certificate is verified */
export async function notifyWHTVerified(
  clubId: string,
  memberId: string,
  certificateNumber: string,
  amount: number
) {
  return createNotification({
    clubId,
    memberId,
    type: 'BILLING',
    title: 'WHT Certificate Verified',
    message: `Your WHT certificate ${certificateNumber} for ฿${amount.toLocaleString()} has been verified and applied.`,
  })
}

/** Notify member when WHT certificate is rejected */
export async function notifyWHTRejected(
  clubId: string,
  memberId: string,
  certificateNumber: string,
  reason: string
) {
  return createNotification({
    clubId,
    memberId,
    type: 'BILLING',
    title: 'WHT Certificate Rejected',
    message: `Your WHT certificate ${certificateNumber} was rejected: ${reason}`,
  })
}

/** Notify member about approaching payment due date */
export async function notifyPaymentDueReminder(
  clubId: string,
  memberId: string,
  daysUntilDue: number,
  amount: number
) {
  const urgency = daysUntilDue <= 1 ? 'tomorrow' : `in ${daysUntilDue} days`
  return createNotification({
    clubId,
    memberId,
    type: 'BILLING',
    title: 'Payment Reminder',
    message: `Your payment of ฿${amount.toLocaleString()} is due ${urgency}.`,
    channel: daysUntilDue <= 7 ? 'IN_APP' : 'IN_APP',
  })
}

/** Notify member about suspension warning (60 days overdue) */
export async function notifySuspensionWarning(
  clubId: string,
  memberId: string,
  amount: number
) {
  return createNotification({
    clubId,
    memberId,
    type: 'BILLING',
    title: 'Account Suspension Warning',
    message: `Your account has an overdue balance of ฿${amount.toLocaleString()}. Please make payment to avoid suspension.`,
  })
}

/** Notify member about account suspension (91+ days overdue) */
export async function notifyAccountSuspended(
  clubId: string,
  memberId: string
) {
  return createNotification({
    clubId,
    memberId,
    type: 'BILLING',
    title: 'Account Suspended',
    message: 'Your account has been suspended due to overdue payments. Please contact the Membership Office.',
  })
}

/**
 * Process payment due reminders for all members.
 * Intended to be called by a daily cron job / scheduled function.
 */
export async function processPaymentDueReminders() {
  const now = new Date()
  const reminderDays = [60, 30, 7, 1]

  for (const days of reminderDays) {
    const targetDate = new Date(now)
    targetDate.setDate(targetDate.getDate() + days)
    const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0))
    const endOfDay = new Date(targetDate.setHours(23, 59, 59, 999))

    const invoicesDue = await prisma.invoice.findMany({
      where: {
        status: { in: ['SENT', 'PARTIALLY_PAID'] },
        dueDate: { gte: startOfDay, lte: endOfDay },
        memberId: { not: null },
      },
      select: {
        memberId: true,
        clubId: true,
        totalAmount: true,
      },
    })

    for (const inv of invoicesDue) {
      if (!inv.memberId) continue
      await notifyPaymentDueReminder(inv.clubId, inv.memberId, days, Number(inv.totalAmount))
    }
  }
}
