import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth/session'
import { prisma } from '@/lib/db'
import { stripe } from '@/lib/stripe/server'

export async function POST(request: Request) {
  try {
    const session = await getSession()
    if (!session.isLoggedIn || !session.memberId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { amount, statementId } = await request.json()

    if (!amount || amount <= 0) {
      return NextResponse.json({ error: 'Invalid amount' }, { status: 400 })
    }

    // Verify member exists
    const member = await prisma.member.findUnique({
      where: { id: session.memberId },
      select: { id: true, firstName: true, lastName: true, clubId: true },
    })

    if (!member) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 })
    }

    // Create Stripe PaymentIntent (amount in smallest currency unit — satang for THB)
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency: 'thb',
      metadata: {
        memberId: session.memberId,
        clubId: member.clubId,
        ...(statementId ? { statementId } : {}),
      },
      description: `Payment from ${member.firstName} ${member.lastName}`,
    })

    // Record pending payment in database
    await prisma.payment.create({
      data: {
        clubId: member.clubId,
        memberId: session.memberId,
        receiptNumber: `PAY-${Date.now()}`, // Temporary, updated on success
        amount,
        paymentDate: new Date(),
        method: 'CREDIT_CARD',
        status: 'PENDING',
        referenceNumber: paymentIntent.id,
      },
    })

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    })
  } catch (error) {
    console.error('Payment intent creation failed:', error)
    return NextResponse.json(
      { error: 'Failed to create payment' },
      { status: 500 }
    )
  }
}
