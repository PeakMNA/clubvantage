import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { prisma } from '@/lib/db'
import { stripe } from '@/lib/stripe/server'
import type Stripe from 'stripe'

export async function POST(request: Request) {
  const body = await request.text()
  const headersList = await headers()
  const sig = headersList.get('stripe-signature')

  if (!sig || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET)
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  switch (event.type) {
    case 'payment_intent.succeeded': {
      const paymentIntent = event.data.object as Stripe.PaymentIntent
      const { memberId, clubId } = paymentIntent.metadata

      if (!memberId || !clubId) break

      // Update payment status
      await prisma.payment.updateMany({
        where: { referenceNumber: paymentIntent.id },
        data: { status: 'COMPLETED' },
      })

      // Update member outstanding balance
      const paidAmount = paymentIntent.amount / 100
      await prisma.member.update({
        where: { id: memberId },
        data: {
          outstandingBalance: { decrement: paidAmount },
        },
      })

      // Create notification
      await prisma.notification.create({
        data: {
          clubId,
          memberId,
          type: 'PAYMENT',
          title: 'Payment Received',
          message: `Your payment of ฿${paidAmount.toLocaleString()} has been received.`,
          channel: 'IN_APP',
        },
      })

      break
    }

    case 'payment_intent.payment_failed': {
      const paymentIntent = event.data.object as Stripe.PaymentIntent
      const { memberId, clubId } = paymentIntent.metadata

      if (!memberId || !clubId) break

      await prisma.payment.updateMany({
        where: { referenceNumber: paymentIntent.id },
        data: { status: 'FAILED' },
      })

      await prisma.notification.create({
        data: {
          clubId,
          memberId,
          type: 'PAYMENT',
          title: 'Payment Failed',
          message: 'Your payment could not be processed. Please try again or use a different payment method.',
          channel: 'IN_APP',
        },
      })

      break
    }
  }

  return NextResponse.json({ received: true })
}
